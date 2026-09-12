import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAppBaseUrl, getStripe } from '@/lib/stripe';
import { ensureStripePlanPrice, getOrCreateStripeCustomer } from '@/lib/stripe-meal-prep';
import { resolveCheckoutWeek } from '@/lib/meal-prep-week';
import { linkMealPrepOneTimeOrder } from '@/lib/fulfill-meal-prep-one-time';
import type Stripe from 'stripe';

type CheckoutMode = 'one_time' | 'subscription';

type AddressInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
};

function normalizeAddress(input: AddressInput | null | undefined, email: string) {
  if (!input) return {};
  return {
    firstName: String(input.firstName || '').trim(),
    lastName: String(input.lastName || '').trim(),
    email,
    phone: String(input.phone || '').trim(),
    address: String(input.address || '').trim(),
    city: String(input.city || 'Calgary').trim(),
    region: String(input.region || 'AB').trim(),
    postalCode: String(input.postalCode || '').trim(),
    country: 'Canada',
  };
}

export async function POST(req: Request) {
  try {
    const clientId = getClientIdentifier(req);
    const rateLimitResult = checkRateLimit(`subscription:${clientId}`, RATE_LIMITS.payment);
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, message: 'Too many requests.' }, { status: 429 });
    }

    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, message: 'Please sign in to continue.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      planId,
      weekId,
      deliveryMethod = 'pickup',
      shippingAddress,
      mode = 'subscription',
    } = body as {
      planId?: string;
      weekId?: string;
      deliveryMethod?: string;
      shippingAddress?: AddressInput;
      mode?: CheckoutMode;
    };

    if (!planId || typeof planId !== 'string') {
      return NextResponse.json({ success: false, message: 'Missing planId' }, { status: 400 });
    }

    if (mode !== 'one_time' && mode !== 'subscription') {
      return NextResponse.json({ success: false, message: 'Invalid checkout mode' }, { status: 400 });
    }

    if (deliveryMethod !== 'pickup' && deliveryMethod !== 'doorstep') {
      return NextResponse.json({ success: false, message: 'Choose pickup or doorstep delivery.' }, { status: 400 });
    }

    const address = normalizeAddress(shippingAddress, auth.user.email || '');
    if (deliveryMethod === 'doorstep' && (!address.address || !address.firstName || !address.phone)) {
      return NextResponse.json(
        { success: false, message: 'Please enter your name, phone, and Calgary address for doorstep delivery.' },
        { status: 400 }
      );
    }

    const catalog = await resolveCheckoutWeek(weekId);
    if (!catalog.week || catalog.reason !== 'ok') {
      return NextResponse.json(
        {
          success: false,
          message:
            catalog.reason === 'no_dishes'
              ? 'This week’s menu has no dishes yet. Please check back shortly.'
              : 'The weekly menu is not available for purchase right now.',
        },
        { status: 400 }
      );
    }

    const sellableWeek = catalog.week;

    if (mode === 'subscription') {
      const { data: existing } = await supabaseAdmin
        .from('meal_prep_subscriptions')
        .select('id, status')
        .eq('user_id', auth.user.id)
        .in('status', ['active', 'trialing', 'past_due', 'paused'])
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { success: false, message: 'You already have an active meal-prep subscription.' },
          { status: 400 }
        );
      }
    }

    const { data: plan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('status', 'active')
      .single();

    if (planError || !plan) {
      return NextResponse.json({ success: false, message: 'Plan not found' }, { status: 404 });
    }

    const doorstepFeeCents = deliveryMethod === 'doorstep' ? catalog.doorstepFeeCents : 0;
    const oneTimeCents = Number(plan.one_time_price_cents) > 0
      ? Number(plan.one_time_price_cents)
      : Number(plan.price_cents);
    const customerId = await getOrCreateStripeCustomer(
      auth.user.id,
      auth.user.email || '',
      auth.user.user_metadata?.full_name
    );
    const baseUrl = getAppBaseUrl(new URL(req.url).origin);
    const stripe = getStripe();
    const currency = (plan.currency || 'cad').toLowerCase();

    if (mode === 'one_time') {
      const orderNumber = `MP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const mealDollars = oneTimeCents / 100;
      const shipDollars = doorstepFeeCents / 100;
      const total = mealDollars + shipDollars;

      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: auth.user.id,
          email: auth.user.email || '',
          phone: address.phone || null,
          status: 'pending',
          payment_status: 'pending',
          currency: (plan.currency || 'CAD').toUpperCase(),
          subtotal: mealDollars,
          tax_total: 0,
          shipping_total: shipDollars,
          discount_total: 0,
          total,
          shipping_method: deliveryMethod,
          delivery_type: deliveryMethod === 'doorstep' ? 'delivery' : 'pickup',
          estimated_delivery_at: `${sellableWeek.deliveryDate}T12:00:00`,
          payment_method: 'stripe',
          shipping_address: deliveryMethod === 'doorstep' ? address : {},
          billing_address: deliveryMethod === 'doorstep' ? address : {},
          notes: `${plan.name} — week of ${sellableWeek.deliveryLabel}`,
          metadata: {
            type: 'meal_prep_one_time',
            week_id: sellableWeek.id,
            plan_id: plan.id,
            plan_name: plan.name,
            meals_per_week: plan.meals_per_week,
            delivery_method: deliveryMethod,
            substituted_week: catalog.substituted,
          },
        })
        .select('id')
        .single();

      if (orderError || !order) {
        throw orderError || new Error('Could not create order');
      }

      await supabaseAdmin.from('order_items').insert({
        order_id: order.id,
        product_name: `${plan.name} · ${sellableWeek.deliveryLabel}`,
        quantity: 1,
        unit_price: mealDollars,
        total_price: mealDollars,
        metadata: { type: 'meal_prep_one_time', week_id: sellableWeek.id, plan_id: plan.id },
      });

      await linkMealPrepOneTimeOrder({
        orderId: order.id,
        weekId: sellableWeek.id,
        userId: auth.user.id,
        planId: plan.id,
      });

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        {
          price_data: {
            currency,
            unit_amount: oneTimeCents,
            product_data: {
              name: `${plan.name} — this week only`,
              description: `${plan.meals_per_week} meals · delivery ${sellableWeek.deliveryLabel}`,
            },
          },
          quantity: 1,
        },
      ];

      if (doorstepFeeCents > 0) {
        lineItems.push({
          price_data: {
            currency,
            unit_amount: doorstepFeeCents,
            product_data: { name: 'Saturday doorstep delivery' },
          },
          quantity: 1,
        });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer: customerId,
        line_items: lineItems,
        metadata: {
          type: 'meal_prep_one_time',
          order_number: orderNumber,
          user_id: auth.user.id,
          plan_id: plan.id,
          week_id: sellableWeek.id,
          delivery_method: deliveryMethod,
        },
        payment_intent_data: {
          metadata: {
            type: 'meal_prep_one_time',
            order_number: orderNumber,
            week_id: sellableWeek.id,
          },
        },
        success_url: `${baseUrl}/meal-prep/success?mode=one_time&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/meal-prep?canceled=1`,
      });

      if (!session.url) {
        return NextResponse.json({ success: false, message: 'Failed to start checkout' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        url: session.url,
        weekId: sellableWeek.id,
        substituted: catalog.substituted,
      });
    }

    let stripe_price_id = plan.stripe_price_id as string | null;
    if (!stripe_price_id) {
      try {
        const synced = await ensureStripePlanPrice(plan);
        stripe_price_id = synced.stripe_price_id;
      } catch (syncErr: unknown) {
        const message = syncErr instanceof Error ? syncErr.message : 'Stripe sync failed';
        console.error('[subscriptions/create-checkout] Stripe plan sync failed:', message);
        return NextResponse.json(
          { success: false, message: 'This plan is not available for checkout yet. Please try again later.' },
          { status: 400 }
        );
      }
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: stripe_price_id, quantity: 1 },
    ];

    if (doorstepFeeCents > 0) {
      lineItems.push({
        price_data: {
          currency,
          unit_amount: doorstepFeeCents,
          product_data: { name: 'Saturday doorstep delivery (first week)' },
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: lineItems,
      metadata: {
        type: 'meal_prep',
        user_id: auth.user.id,
        plan_id: plan.id,
        week_id: sellableWeek.id,
        delivery_method: deliveryMethod,
        shipping_address: JSON.stringify(address),
      },
      subscription_data: {
        metadata: {
          type: 'meal_prep',
          user_id: auth.user.id,
          plan_id: plan.id,
          week_id: sellableWeek.id,
          delivery_method: deliveryMethod,
        },
      },
      success_url: `${baseUrl}/meal-prep/success?mode=subscription&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/meal-prep?canceled=1`,
    });

    if (!session.url) {
      return NextResponse.json({ success: false, message: 'Failed to start checkout' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: session.url,
      weekId: sellableWeek.id,
      substituted: catalog.substituted,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[Subscription Checkout]', message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

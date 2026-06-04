import { supabaseAdmin } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/stripe';
import { upsertMealPrepSubscription } from '@/lib/stripe-meal-prep';
import Stripe from 'stripe';

export async function fulfillSubscriptionCheckout(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const planId = session.metadata?.plan_id;

  if (!userId || !planId) {
    console.warn('[Subscription] checkout.session.completed missing user_id or plan_id');
    return;
  }

  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

  if (!subscriptionId) {
    console.warn('[Subscription] No subscription id on checkout session', session.id);
    return;
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

  if (!customerId) return;

  await supabaseAdmin
    .from('profiles')
    .update({ stripe_customer_id: customerId })
    .eq('id', userId);

  await upsertMealPrepSubscription({
    userId,
    planId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodStart: subscription.current_period_start,
    currentPeriodEnd: subscription.current_period_end,
    deliveryMethod: session.metadata?.delivery_method || 'pickup',
  });
}

export async function syncSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const { data: local } = await supabaseAdmin
    .from('meal_prep_subscriptions')
    .select('id, user_id, plan_id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle();

  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

  const planId = subscription.metadata?.plan_id || local?.plan_id;
  const userId = subscription.metadata?.user_id || local?.user_id;

  if (!userId || !planId) {
    console.warn('[Subscription] Cannot sync subscription without user/plan', subscription.id);
    return;
  }

  await upsertMealPrepSubscription({
    userId,
    planId,
    stripeCustomerId: customerId || '',
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodStart: subscription.current_period_start,
    currentPeriodEnd: subscription.current_period_end,
    pendingCancelAt: subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000).toISOString()
      : null,
  });
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  if (typeof invoice.subscription === 'string') return invoice.subscription;
  if (invoice.subscription && typeof invoice.subscription === 'object') {
    return invoice.subscription.id;
  }
  const parent = invoice.parent as { subscription_details?: { subscription?: string } } | null;
  if (typeof parent?.subscription_details?.subscription === 'string') {
    return parent.subscription_details.subscription;
  }
  return null;
}

export async function handleSubscriptionInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = getInvoiceSubscriptionId(invoice);

  if (!subscriptionId) return;

  const { data: sub } = await supabaseAdmin
    .from('meal_prep_subscriptions')
    .select('id, user_id, plan_id')
    .eq('stripe_subscription_id', subscriptionId)
    .maybeSingle();

  if (!sub) return;

  const { data: pendingSelections } = await supabaseAdmin
    .from('meal_prep_selections')
    .select('id, week_id')
    .eq('subscription_id', sub.id)
    .eq('status', 'pending');

  if (pendingSelections?.length) {
    await supabaseAdmin
      .from('meal_prep_selections')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('subscription_id', sub.id)
      .eq('status', 'pending');
  }

  const { data: plan } = await supabaseAdmin
    .from('subscription_plans')
    .select('name, price_cents, currency')
    .eq('id', sub.plan_id)
    .single();

  const orderNumber = `SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('email, full_name')
    .eq('id', sub.user_id)
    .maybeSingle();

  const { data: localSub } = await supabaseAdmin
    .from('meal_prep_subscriptions')
    .select('delivery_method, shipping_address')
    .eq('id', sub.id)
    .single();

  await supabaseAdmin.from('orders').insert({
    order_number: orderNumber,
    user_id: sub.user_id,
    email: profile?.email || invoice.customer_email || '',
    status: 'processing',
    payment_status: 'paid',
    currency: (plan?.currency || 'CAD').toUpperCase(),
    subtotal: (plan?.price_cents || invoice.amount_paid) / 100,
    tax_total: 0,
    shipping_total: 0,
    discount_total: 0,
    total: (plan?.price_cents || invoice.amount_paid) / 100,
    payment_method: 'stripe',
    shipping_method: localSub?.delivery_method || 'pickup',
    delivery_type: localSub?.delivery_method === 'doorstep' ? 'delivery' : 'pickup',
    shipping_address: localSub?.shipping_address || {},
    billing_address: localSub?.shipping_address || {},
    metadata: {
      type: 'meal_prep_subscription',
      subscription_id: sub.id,
      stripe_subscription_id: subscriptionId,
      stripe_invoice_id: invoice.id,
      week_id: pendingSelections?.[0]?.week_id || null,
    },
  });
}

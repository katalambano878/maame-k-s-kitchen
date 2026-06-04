import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/stripe';
import { getCancelEligibility } from '@/lib/subscription-dates';

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { data: sub } = await supabaseAdmin
      .from('meal_prep_subscriptions')
      .select(`
        id,
        stripe_subscription_id,
        status,
        subscription_plans ( cancel_notice_days, delivery_day, name )
      `)
      .eq('user_id', auth.user.id)
      .in('status', ['active', 'trialing', 'past_due'])
      .maybeSingle();

    if (!sub?.stripe_subscription_id) {
      return NextResponse.json({ success: false, message: 'No active subscription found' }, { status: 404 });
    }

    const plan = sub.subscription_plans as {
      cancel_notice_days: number;
      delivery_day: string;
      name: string;
    } | null;

    const noticeDays = plan?.cancel_notice_days ?? 3;
    const deliveryDay = plan?.delivery_day ?? 'saturday';
    const eligibility = getCancelEligibility(noticeDays, deliveryDay);

    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);

    if (eligibility.beforeDeadline) {
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: true,
      });

      await supabaseAdmin
        .from('meal_prep_subscriptions')
        .update({
          cancel_at_period_end: true,
          pending_cancel_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sub.id);

      return NextResponse.json({
        success: true,
        message: eligibility.message,
        effective: 'end_of_period',
        periodEnd: subscription.current_period_end,
      });
    }

    const nextPeriodEnd = subscription.current_period_end + 7 * 24 * 60 * 60;

    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at: nextPeriodEnd,
    });

    await supabaseAdmin
      .from('meal_prep_subscriptions')
      .update({
        cancel_at_period_end: false,
        pending_cancel_at: new Date(nextPeriodEnd * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    return NextResponse.json({
      success: true,
      message: eligibility.message,
      effective: 'after_next_delivery',
      cancelAt: nextPeriodEnd,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[Subscription Cancel]', message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

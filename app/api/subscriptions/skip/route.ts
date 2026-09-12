import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/stripe';
import { getSellableMealPrepWeek } from '@/lib/meal-prep-week';
import { getSubscriptionPeriod } from '@/lib/stripe-subscription-helpers';

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { data: sub } = await supabaseAdmin
      .from('meal_prep_subscriptions')
      .select('id, stripe_subscription_id, status, metadata')
      .eq('user_id', auth.user.id)
      .in('status', ['active', 'trialing', 'past_due'])
      .maybeSingle();

    if (!sub?.stripe_subscription_id) {
      return NextResponse.json({ success: false, message: 'No active subscription found' }, { status: 404 });
    }

    const { week } = await getSellableMealPrepWeek();
    if (!week) {
      return NextResponse.json({ success: false, message: 'There is no upcoming week to skip.' }, { status: 400 });
    }

    const metadata = (sub.metadata || {}) as { skipped_week_ids?: string[] };
    const skipped = new Set(metadata.skipped_week_ids || []);
    if (skipped.has(week.id)) {
      return NextResponse.json({ success: true, message: 'That week is already skipped.' });
    }
    skipped.add(week.id);

    await supabaseAdmin
      .from('meal_prep_selections')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('subscription_id', sub.id)
      .eq('week_id', week.id);

    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
    const period = getSubscriptionPeriod(subscription);
    const resumesAt = (period.currentPeriodEnd || Math.floor(Date.now() / 1000)) + 7 * 24 * 60 * 60;

    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      pause_collection: { behavior: 'void', resumes_at: resumesAt },
      metadata: {
        ...subscription.metadata,
        skipped_week_id: week.id,
      },
    });

    await supabaseAdmin
      .from('meal_prep_subscriptions')
      .update({
        metadata: { ...metadata, skipped_week_ids: Array.from(skipped) },
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    return NextResponse.json({
      success: true,
      message: `Next box (${week.deliveryLabel}) is skipped. Billing resumes automatically after that week.`,
      weekId: week.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[Subscription Skip]', message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

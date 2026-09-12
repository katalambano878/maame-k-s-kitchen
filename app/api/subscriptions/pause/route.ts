import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const resume = Boolean(body?.resume);

    const { data: sub } = await supabaseAdmin
      .from('meal_prep_subscriptions')
      .select('id, stripe_subscription_id, status')
      .eq('user_id', auth.user.id)
      .in('status', ['active', 'trialing', 'past_due', 'paused'])
      .maybeSingle();

    if (!sub?.stripe_subscription_id) {
      return NextResponse.json({ success: false, message: 'No subscription found' }, { status: 404 });
    }

    const stripe = getStripe();

    if (resume) {
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        pause_collection: '',
      });
      await supabaseAdmin
        .from('meal_prep_subscriptions')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', sub.id);

      return NextResponse.json({ success: true, message: 'Your weekly subscription has been resumed.' });
    }

    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      pause_collection: { behavior: 'void' },
    });
    await supabaseAdmin
      .from('meal_prep_subscriptions')
      .update({ status: 'paused', updated_at: new Date().toISOString() })
      .eq('id', sub.id);

    return NextResponse.json({
      success: true,
      message: 'Your subscription is paused. You will not be charged until you resume.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[Subscription Pause]', message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

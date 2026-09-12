import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getMealPrepWeekPayload } from '@/lib/meal-prep-week';
import { getPaidOneTimeOrderForWeek } from '@/lib/fulfill-meal-prep-one-time';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const catalog = await getMealPrepWeekPayload();

    const { data: subscription } = await supabaseAdmin
      .from('meal_prep_subscriptions')
      .select(`
        id,
        status,
        cancel_at_period_end,
        current_period_start,
        current_period_end,
        pending_cancel_at,
        delivery_method,
        shipping_address,
        metadata,
        subscription_plans (
          name,
          meals_per_week,
          price_cents,
          one_time_price_cents,
          cancel_notice_days,
          delivery_day
        )
      `)
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const oneTime = catalog.week
      ? await getPaidOneTimeOrderForWeek(auth.user.id, catalog.week.id)
      : null;

    let selections: { product_id: string; quantity: number }[] = [];
    if (subscription?.id && catalog.week) {
      const { data } = await supabaseAdmin
        .from('meal_prep_selections')
        .select('product_id, quantity, status')
        .eq('subscription_id', subscription.id)
        .eq('week_id', catalog.week.id)
        .neq('status', 'canceled');
      selections = (data || []).map((row: { product_id: string; quantity: number }) => ({
        product_id: row.product_id,
        quantity: row.quantity,
      }));
    } else if (oneTime?.selections && Array.isArray(oneTime.selections)) {
      selections = oneTime.selections as { product_id: string; quantity: number }[];
    }

    const metadata = (subscription?.metadata || {}) as {
      skipped_week_ids?: string[];
    };

    return NextResponse.json({
      catalog,
      subscription,
      oneTime: oneTime
        ? await (async () => {
            const { data: otPlan } = await supabaseAdmin
              .from('subscription_plans')
              .select('meals_per_week, name')
              .eq('id', oneTime.plan_id)
              .maybeSingle();
            return {
              id: oneTime.id,
              orderId: oneTime.order_id,
              weekId: oneTime.week_id,
              planId: oneTime.plan_id,
              mealsPerWeek: otPlan?.meals_per_week ?? 5,
              planName: otPlan?.name || null,
            };
          })()
        : null,
      selections,
      skippedWeekIds: metadata.skipped_week_ids || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load account';
    console.error('[meal-prep/account]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

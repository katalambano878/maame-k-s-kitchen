import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { normalizeJoinedPlan } from '@/lib/stripe-subscription-helpers';
import { getPaidOneTimeOrderForWeek } from '@/lib/fulfill-meal-prep-one-time';

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { weekId, selections } = body as {
      weekId: string;
      selections: { productId: string; quantity: number }[];
    };

    if (!weekId || !Array.isArray(selections)) {
      return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }

    const { data: week } = await supabaseAdmin
      .from('meal_prep_weeks')
      .select('id, selection_deadline, status')
      .eq('id', weekId)
      .eq('status', 'published')
      .single();

    if (!week) {
      return NextResponse.json({ success: false, message: 'Weekly menu not available' }, { status: 404 });
    }

    if (new Date() > new Date(week.selection_deadline)) {
      return NextResponse.json(
        { success: false, message: 'The deadline to choose meals for this week has passed.' },
        { status: 400 }
      );
    }

    const { data: sub } = await supabaseAdmin
      .from('meal_prep_subscriptions')
      .select(`
        id,
        status,
        metadata,
        subscription_plans ( meals_per_week )
      `)
      .eq('user_id', auth.user.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle();

    const oneTime = sub ? null : await getPaidOneTimeOrderForWeek(auth.user.id, weekId);

    if (!sub && !oneTime) {
      return NextResponse.json(
        { success: false, message: 'Buy this week or subscribe to save your meal picks.' },
        { status: 404 }
      );
    }

    if (sub) {
      const skipped = ((sub.metadata as { skipped_week_ids?: string[] } | null)?.skipped_week_ids) || [];
      if (skipped.includes(weekId)) {
        return NextResponse.json(
          { success: false, message: 'This week is skipped on your subscription.' },
          { status: 400 }
        );
      }
    }

    let mealsPerWeek = 5;
    if (sub) {
      const plan = normalizeJoinedPlan<{ meals_per_week: number }>(sub.subscription_plans);
      mealsPerWeek = plan?.meals_per_week ?? 5;
    } else if (oneTime?.plan_id) {
      const { data: plan } = await supabaseAdmin
        .from('subscription_plans')
        .select('meals_per_week')
        .eq('id', oneTime.plan_id)
        .maybeSingle();
      mealsPerWeek = plan?.meals_per_week ?? 5;
    }

    const totalQty = selections.reduce((sum, s) => sum + (s.quantity || 0), 0);

    if (totalQty === 0) {
      return NextResponse.json({ success: false, message: 'Please select at least one meal' }, { status: 400 });
    }

    if (totalQty > mealsPerWeek) {
      return NextResponse.json(
        { success: false, message: `Your plan includes ${mealsPerWeek} meals per week.` },
        { status: 400 }
      );
    }

    const { data: allowedItems } = await supabaseAdmin
      .from('meal_prep_week_items')
      .select('product_id')
      .eq('week_id', weekId);

    const allowedIds = new Set((allowedItems || []).map((i: { product_id: string }) => i.product_id));

    for (const sel of selections) {
      if (!allowedIds.has(sel.productId)) {
        return NextResponse.json({ success: false, message: 'Invalid dish selected' }, { status: 400 });
      }
    }

    const cleaned = selections
      .filter((s) => s.quantity > 0)
      .map((s) => ({ product_id: s.productId, quantity: s.quantity }));

    if (sub) {
      await supabaseAdmin
        .from('meal_prep_selections')
        .delete()
        .eq('subscription_id', sub.id)
        .eq('week_id', weekId);

      const rows = cleaned.map((s) => ({
        subscription_id: sub.id,
        week_id: weekId,
        product_id: s.product_id,
        quantity: s.quantity,
        status: 'pending',
      }));

      if (rows.length) {
        const { error } = await supabaseAdmin.from('meal_prep_selections').insert(rows);
        if (error) throw error;
      }
    } else if (oneTime) {
      const { error } = await supabaseAdmin
        .from('meal_prep_one_time_orders')
        .update({ selections: cleaned, updated_at: new Date().toISOString() })
        .eq('id', oneTime.id);
      if (error) throw error;

      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('metadata')
        .eq('id', oneTime.order_id)
        .maybeSingle();

      await supabaseAdmin
        .from('orders')
        .update({
          metadata: {
            ...((order?.metadata as Record<string, unknown>) || {}),
            type: 'meal_prep_one_time',
            week_id: weekId,
            plan_id: oneTime.plan_id,
            selections: cleaned,
          },
        })
        .eq('id', oneTime.order_id);
    }

    return NextResponse.json({ success: true, message: 'Your meals for this week have been saved.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[Subscription Selections]', message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

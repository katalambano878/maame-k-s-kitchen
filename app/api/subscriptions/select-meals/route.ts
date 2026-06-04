import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

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

    const { data: sub } = await supabaseAdmin
      .from('meal_prep_subscriptions')
      .select(`
        id,
        status,
        subscription_plans ( meals_per_week )
      `)
      .eq('user_id', auth.user.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle();

    if (!sub) {
      return NextResponse.json({ success: false, message: 'No active subscription' }, { status: 404 });
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

    const mealsPerWeek = (sub.subscription_plans as { meals_per_week: number })?.meals_per_week ?? 5;
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

    const allowedIds = new Set((allowedItems || []).map((i) => i.product_id));

    for (const sel of selections) {
      if (!allowedIds.has(sel.productId)) {
        return NextResponse.json({ success: false, message: 'Invalid dish selected' }, { status: 400 });
      }
    }

    await supabaseAdmin
      .from('meal_prep_selections')
      .delete()
      .eq('subscription_id', sub.id)
      .eq('week_id', weekId);

    const rows = selections
      .filter((s) => s.quantity > 0)
      .map((s) => ({
        subscription_id: sub.id,
        week_id: weekId,
        product_id: s.productId,
        quantity: s.quantity,
        status: 'pending',
      }));

    if (rows.length) {
      const { error } = await supabaseAdmin.from('meal_prep_selections').insert(rows);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, message: 'Your meals for this week have been saved.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[Subscription Selections]', message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

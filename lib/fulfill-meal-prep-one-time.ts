import { supabaseAdmin } from '@/lib/supabase-admin';

export async function linkMealPrepOneTimeOrder(params: {
  orderId: string;
  weekId: string;
  userId: string;
  planId: string;
}) {
  const { data: existing } = await supabaseAdmin
    .from('meal_prep_one_time_orders')
    .select('id')
    .eq('order_id', params.orderId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabaseAdmin
    .from('meal_prep_one_time_orders')
    .insert({
      order_id: params.orderId,
      week_id: params.weekId,
      user_id: params.userId,
      plan_id: params.planId,
      selections: [],
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getPaidOneTimeOrderForWeek(userId: string, weekId: string) {
  const { data: links } = await supabaseAdmin
    .from('meal_prep_one_time_orders')
    .select('id, order_id, week_id, plan_id, selections')
    .eq('user_id', userId)
    .eq('week_id', weekId)
    .order('created_at', { ascending: false });

  type LinkRow = {
    id: string;
    order_id: string;
    week_id: string;
    plan_id: string;
    selections: { product_id: string; quantity: number }[] | null;
  };
  type OrderRow = { id: string; payment_status: string; order_number: string };

  if (!links?.length) return null;

  const typedLinks = links as LinkRow[];
  const orderIds = typedLinks.map((l) => l.order_id);
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('id, payment_status, order_number')
    .in('id', orderIds);

  const paid = new Set(
    ((orders || []) as OrderRow[]).filter((o) => o.payment_status === 'paid').map((o) => o.id)
  );
  return typedLinks.find((l) => paid.has(l.order_id)) || null;
}

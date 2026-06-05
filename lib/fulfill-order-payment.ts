import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendOrderConfirmation } from '@/lib/notifications';

async function redeemCouponFromOrderMetadata(orderNumber: string) {
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('metadata')
    .eq('order_number', orderNumber)
    .maybeSingle();

  const couponId = (order?.metadata as { coupon_id?: string } | null)?.coupon_id;
  if (!couponId) return;

  const { data: coupon } = await supabaseAdmin
    .from('coupons')
    .select('id, usage_count, usage_limit')
    .eq('id', couponId)
    .maybeSingle();

  if (!coupon) return;
  if (coupon.usage_limit != null && (coupon.usage_count ?? 0) >= coupon.usage_limit) return;

  await supabaseAdmin
    .from('coupons')
    .update({
      usage_count: (coupon.usage_count ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', couponId);
}

export async function fulfillOrderPayment(orderNumber: string, paymentRef: string) {
  const { data: orderJson, error: updateError } = await supabaseAdmin.rpc('mark_order_paid', {
    order_ref: orderNumber,
    moolre_ref: paymentRef,
  });

  if (updateError) {
    throw new Error(updateError.message || 'Failed to mark order as paid');
  }

  try {
    await redeemCouponFromOrderMetadata(orderNumber);
  } catch (couponError: unknown) {
    const message = couponError instanceof Error ? couponError.message : String(couponError);
    console.error('[Payment] Coupon redeem failed:', message);
  }

  if (orderJson?.email) {
    try {
      await supabaseAdmin.rpc('update_customer_stats', {
        p_customer_email: orderJson.email,
        p_order_total: orderJson.total,
      });
    } catch (statsError: unknown) {
      const message = statsError instanceof Error ? statsError.message : String(statsError);
      console.error('[Payment] Customer stats update failed:', message);
    }
  }

  if (orderJson) {
    try {
      await sendOrderConfirmation(orderJson);
    } catch (notifyError: unknown) {
      const message = notifyError instanceof Error ? notifyError.message : String(notifyError);
      console.error('[Payment] Notification failed:', message);
    }
  }

  return orderJson;
}

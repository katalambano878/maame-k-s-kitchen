import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendOrderConfirmation } from '@/lib/notifications';

export async function fulfillOrderPayment(orderNumber: string, paymentRef: string) {
  const { data: orderJson, error: updateError } = await supabaseAdmin.rpc('mark_order_paid', {
    order_ref: orderNumber,
    moolre_ref: paymentRef,
  });

  if (updateError) {
    throw new Error(updateError.message || 'Failed to mark order as paid');
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

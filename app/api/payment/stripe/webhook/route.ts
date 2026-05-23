import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { fulfillOrderPayment } from '@/lib/fulfill-order-payment';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event;

  try {
    const stripe = getStripe();
    const payload = await req.text();
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid webhook payload';
    console.error('[Stripe Webhook] Signature verification failed:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderNumber = session.metadata?.order_number;

      if (!orderNumber) {
        console.warn('[Stripe Webhook] checkout.session.completed without order_number metadata');
        return NextResponse.json({ received: true });
      }

      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('payment_status')
        .eq('order_number', orderNumber)
        .maybeSingle();

      if (order?.payment_status === 'paid') {
        return NextResponse.json({ received: true });
      }

      if (session.payment_status !== 'paid') {
        console.warn('[Stripe Webhook] Session completed but payment_status is not paid:', session.id);
        return NextResponse.json({ received: true });
      }

      const paymentRef =
        (typeof session.payment_intent === 'string' && session.payment_intent) ||
        session.id;

      await fulfillOrderPayment(orderNumber, paymentRef);
      console.log('[Stripe Webhook] Order fulfilled:', orderNumber);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook handler failed';
    console.error('[Stripe Webhook] Handler error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

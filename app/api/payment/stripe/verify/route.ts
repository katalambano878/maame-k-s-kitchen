import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { fulfillOrderPayment } from '@/lib/fulfill-order-payment';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { getStripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const clientId = getClientIdentifier(req);
    const rateLimitResult = checkRateLimit(`verify:${clientId}`, RATE_LIMITS.payment);

    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
    }

    const { orderNumber, sessionId } = await req.json();

    if (!orderNumber || typeof orderNumber !== 'string') {
      return NextResponse.json({ success: false, message: 'Missing or invalid orderNumber' }, { status: 400 });
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ success: false, message: 'Missing or invalid sessionId' }, { status: 400 });
    }

    if (!/^ORD-\d+-\d+$/.test(orderNumber)) {
      return NextResponse.json({ success: false, message: 'Invalid order number format' }, { status: 400 });
    }

    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, payment_status, status, total, metadata')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (fetchError || !order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        status: order.status,
        payment_status: order.payment_status,
        message: 'Order already paid',
      });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.order_number !== orderNumber) {
      return NextResponse.json({ success: false, message: 'Payment session does not match this order' }, { status: 400 });
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        success: false,
        status: order.status,
        payment_status: order.payment_status,
        message: 'Payment not yet confirmed by Stripe',
      });
    }

    const expectedAmount = Math.round(Number(order.total) * 100);
    if (session.amount_total != null && session.amount_total !== expectedAmount) {
      console.error('[Stripe Verify] Amount mismatch:', expectedAmount, session.amount_total);
      return NextResponse.json({ success: false, message: 'Payment amount mismatch' }, { status: 400 });
    }

    const paymentRef =
      (typeof session.payment_intent === 'string' && session.payment_intent) ||
      session.id;

    await fulfillOrderPayment(orderNumber, paymentRef);

    return NextResponse.json({
      success: true,
      status: 'processing',
      payment_status: 'paid',
      message: 'Payment verified and order updated',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    console.error('[Stripe Verify] Error:', message);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}

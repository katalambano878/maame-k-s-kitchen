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
    const deliveryMethod = body.deliveryMethod === 'doorstep' ? 'doorstep' : 'pickup';
    const incoming = body.shippingAddress || {};
    const shippingAddress =
      deliveryMethod === 'doorstep'
        ? {
            firstName: String(incoming.firstName || '').trim(),
            lastName: String(incoming.lastName || '').trim(),
            phone: String(incoming.phone || '').trim(),
            address: String(incoming.address || '').trim(),
            city: String(incoming.city || 'Calgary').trim(),
            region: String(incoming.region || 'AB').trim(),
            postalCode: String(incoming.postalCode || '').trim(),
            country: 'Canada',
          }
        : {};

    if (deliveryMethod === 'doorstep' && (!shippingAddress.address || !shippingAddress.firstName)) {
      return NextResponse.json(
        { success: false, message: 'Please enter your name and Calgary address.' },
        { status: 400 }
      );
    }

    const { data: sub } = await supabaseAdmin
      .from('meal_prep_subscriptions')
      .select('id')
      .eq('user_id', auth.user.id)
      .in('status', ['active', 'trialing', 'past_due', 'paused'])
      .maybeSingle();

    if (!sub) {
      return NextResponse.json({ success: false, message: 'No subscription found' }, { status: 404 });
    }

    await supabaseAdmin
      .from('meal_prep_subscriptions')
      .update({
        delivery_method: deliveryMethod,
        shipping_address: shippingAddress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    return NextResponse.json({ success: true, message: 'Delivery details saved.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[Subscription Address]', message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

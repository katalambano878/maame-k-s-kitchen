import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { couponId, orderNumber } = await req.json();
    if (!couponId || !orderNumber) {
      return NextResponse.json({ success: false, message: 'Missing couponId or orderNumber' }, { status: 400 });
    }

    const { data: coupon, error: fetchError } = await supabaseAdmin
      .from('coupons')
      .select('id, usage_count, usage_limit')
      .eq('id', couponId)
      .single();

    if (fetchError || !coupon) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    }

    if (coupon.usage_limit != null && (coupon.usage_count ?? 0) >= coupon.usage_limit) {
      return NextResponse.json({ success: false, message: 'Coupon usage limit reached' }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('coupons')
      .update({
        usage_count: (coupon.usage_count ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', couponId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, orderNumber });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Redeem failed';
    console.error('[Coupon Redeem]', message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

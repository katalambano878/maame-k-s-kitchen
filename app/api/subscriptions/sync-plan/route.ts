import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ensureStripePlanPrice } from '@/lib/stripe-meal-prep';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, token } = body;

    const auth = await verifyAdminToken(token);
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!planId) {
      return NextResponse.json({ success: false, message: 'Missing planId' }, { status: 400 });
    }

    const { data: plan, error } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error || !plan) {
      return NextResponse.json({ success: false, message: 'Plan not found' }, { status: 404 });
    }

    const ids = await ensureStripePlanPrice(plan);

    return NextResponse.json({ success: true, ...ids });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[Sync Stripe Plan]', message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

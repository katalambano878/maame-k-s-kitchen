import { getStripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

export type SubscriptionPlanRow = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  currency: string;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
};

export async function ensureStripePlanPrice(plan: SubscriptionPlanRow): Promise<{
  stripe_product_id: string;
  stripe_price_id: string;
}> {
  const stripe = getStripe();
  let productId = plan.stripe_product_id;
  let priceId = plan.stripe_price_id;

  if (!productId) {
    const product = await stripe.products.create({
      name: plan.name,
      metadata: { plan_id: plan.id, slug: plan.slug, type: 'meal_prep' },
    });
    productId = product.id;
  }

  if (!priceId) {
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: plan.price_cents,
      currency: (plan.currency || 'cad').toLowerCase(),
      recurring: { interval: 'week' },
      metadata: { plan_id: plan.id },
    });
    priceId = price.id;
  }

  await supabaseAdmin
    .from('subscription_plans')
    .update({
      stripe_product_id: productId,
      stripe_price_id: priceId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', plan.id);

  return { stripe_product_id: productId, stripe_price_id: priceId };
}

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stripe_customer_id, full_name, email')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  const stripe = getStripe();
  const displayName = name || profile?.full_name || undefined;

  const customer = await stripe.customers.create({
    email,
    name: displayName,
    metadata: { user_id: userId },
  });

  await supabaseAdmin
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  return customer.id;
}

export function mapStripeSubscriptionStatus(status: string): string {
  const allowed = ['active', 'past_due', 'canceled', 'incomplete', 'trialing', 'paused'];
  return allowed.includes(status) ? status : 'incomplete';
}

export async function upsertMealPrepSubscription(params: {
  userId: string;
  planId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart?: number | null;
  currentPeriodEnd?: number | null;
  pendingCancelAt?: string | null;
  deliveryMethod?: string;
}) {
  const row = {
    user_id: params.userId,
    plan_id: params.planId,
    stripe_customer_id: params.stripeCustomerId,
    stripe_subscription_id: params.stripeSubscriptionId,
    status: mapStripeSubscriptionStatus(params.status),
    cancel_at_period_end: params.cancelAtPeriodEnd ?? false,
    current_period_start: params.currentPeriodStart
      ? new Date(params.currentPeriodStart * 1000).toISOString()
      : null,
    current_period_end: params.currentPeriodEnd
      ? new Date(params.currentPeriodEnd * 1000).toISOString()
      : null,
    pending_cancel_at: params.pendingCancelAt ?? null,
    delivery_method: params.deliveryMethod || 'pickup',
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabaseAdmin
    .from('meal_prep_subscriptions')
    .select('id')
    .eq('stripe_subscription_id', params.stripeSubscriptionId)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin.from('meal_prep_subscriptions').update(row).eq('id', existing.id);
    return existing.id;
  }

  const { data, error } = await supabaseAdmin
    .from('meal_prep_subscriptions')
    .insert(row)
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

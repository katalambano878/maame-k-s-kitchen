import Stripe from 'stripe';

/** Stripe API 2025+ exposes billing periods on subscription items, not the root subscription. */
export function getSubscriptionPeriod(subscription: Stripe.Subscription): {
  currentPeriodStart: number | null;
  currentPeriodEnd: number | null;
} {
  const item = subscription.items?.data?.[0];
  if (item?.current_period_start != null && item?.current_period_end != null) {
    return {
      currentPeriodStart: item.current_period_start,
      currentPeriodEnd: item.current_period_end,
    };
  }

  const legacy = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };
  return {
    currentPeriodStart: legacy.current_period_start ?? null,
    currentPeriodEnd: legacy.current_period_end ?? null,
  };
}

export function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const inv = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
  };

  if (typeof inv.subscription === 'string') return inv.subscription;
  if (inv.subscription && typeof inv.subscription === 'object' && 'id' in inv.subscription) {
    return inv.subscription.id;
  }

  const parent = inv.parent as { subscription_details?: { subscription?: string } } | null | undefined;
  if (typeof parent?.subscription_details?.subscription === 'string') {
    return parent.subscription_details.subscription;
  }

  return null;
}

export function normalizeJoinedPlan<T extends Record<string, unknown>>(raw: unknown): T | null {
  if (!raw) return null;
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row || typeof row !== 'object') return null;
  return row as T;
}

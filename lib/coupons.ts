import { supabase } from '@/lib/supabase';

export type CouponType = 'percentage' | 'fixed_amount' | 'free_shipping';

export type AppliedCoupon = {
  id: string;
  code: string;
  type: CouponType;
  discount: number;
  maxDiscount?: number;
  minPurchase: number;
  description: string;
};

export type DbCoupon = {
  id: string;
  code: string;
  description: string | null;
  type: CouponType;
  value: number;
  minimum_purchase: number | null;
  maximum_discount: number | null;
  usage_limit: number | null;
  usage_count: number | null;
  per_user_limit: number | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean | null;
};

const STORAGE_KEY = 'mk_applied_coupon';

export function mapDbCouponToApplied(row: DbCoupon): AppliedCoupon {
  const typeLabels: Record<CouponType, string> = {
    percentage: 'percentage',
    fixed_amount: 'fixed',
    free_shipping: 'fixed',
  };
  const desc =
    row.description ||
    (row.type === 'percentage'
      ? `${row.value}% off`
      : row.type === 'fixed_amount'
        ? `CA$${row.value} off`
        : 'Free delivery');

  return {
    id: row.id,
    code: row.code,
    type: row.type,
    discount: Number(row.value),
    maxDiscount: row.maximum_discount != null ? Number(row.maximum_discount) : undefined,
    minPurchase: Number(row.minimum_purchase || 0),
    description: desc,
    // cart legacy field
    ...(row.type === 'fixed_amount' ? {} : {}),
  };
}

/** Shape used by cart / checkout discount math */
export function toCartCoupon(applied: AppliedCoupon) {
  return {
    id: applied.id,
    code: applied.code,
    type: (applied.type === 'percentage' ? 'percentage' : 'fixed') as 'percentage' | 'fixed',
    discount: applied.discount,
    maxDiscount: applied.maxDiscount,
    minPurchase: applied.minPurchase,
    description: applied.description,
    isFreeShipping: applied.type === 'free_shipping',
  };
}

export type CartCoupon = ReturnType<typeof toCartCoupon>;

export function calculateCouponDiscount(
  subtotal: number,
  coupon: AppliedCoupon | ReturnType<typeof toCartCoupon>,
  deliveryFee = 0
): number {
  const c = 'isFreeShipping' in coupon ? coupon : toCartCoupon(coupon as AppliedCoupon);
  if (c.isFreeShipping) return deliveryFee;
  if (c.type === 'percentage') {
    let amount = subtotal * (c.discount / 100);
    if (c.maxDiscount != null) amount = Math.min(amount, c.maxDiscount);
    return Math.min(amount, subtotal);
  }
  return Math.min(c.discount, subtotal);
}

export function isCouponValidNow(row: DbCoupon): string | null {
  if (!row.is_active) return 'This coupon is no longer active';
  const now = new Date();
  if (row.start_date && new Date(row.start_date) > now) return 'This coupon is not active yet';
  if (row.end_date && new Date(row.end_date) < now) return 'This coupon has expired';
  if (row.usage_limit != null && (row.usage_count ?? 0) >= row.usage_limit) {
    return 'This coupon has reached its usage limit';
  }
  return null;
}

export async function fetchActiveCoupons(): Promise<AppliedCoupon[]> {
  const { data, error } = await supabase.from('coupons').select('*').eq('is_active', true);
  if (error || !data) return [];
  return (data as DbCoupon[])
    .filter((c) => isCouponValidNow(c) === null)
    .map(mapDbCouponToApplied);
}

export async function validateCouponCode(
  code: string,
  subtotal: number
): Promise<{ coupon: AppliedCoupon | null; error: string | null }> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { coupon: null, error: 'Enter a coupon code' };

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .ilike('code', normalized)
    .maybeSingle();

  if (error || !data) return { coupon: null, error: 'Invalid coupon code' };

  const row = data as DbCoupon;
  const validity = isCouponValidNow(row);
  if (validity) return { coupon: null, error: validity };

  const applied = mapDbCouponToApplied(row);
  if (applied.minPurchase > 0 && subtotal < applied.minPurchase) {
    return {
      coupon: null,
      error: `Minimum purchase of CA$${applied.minPurchase.toFixed(2)} required`,
    };
  }

  return { coupon: applied, error: null };
}

export function saveAppliedCouponToSession(coupon: AppliedCoupon | null) {
  if (typeof window === 'undefined') return;
  if (coupon) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(coupon));
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

export function loadAppliedCouponFromSession(): AppliedCoupon | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppliedCoupon;
  } catch {
    return null;
  }
}

export function formatCouponTypeLabel(type: CouponType): string {
  if (type === 'percentage') return 'Percentage';
  if (type === 'fixed_amount') return 'Fixed Amount';
  return 'Free Shipping';
}

export function formatCouponValue(type: CouponType, value: number): string {
  if (type === 'percentage') return `${value}%`;
  if (type === 'fixed_amount') return `CA$${value.toFixed(2)}`;
  return 'Free delivery';
}

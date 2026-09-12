import { supabaseAdmin } from '@/lib/supabase-admin';
import { formatCalgaryDate } from '@/lib/subscription-dates';

export type MealPrepDish = {
  productId: string;
  name: string;
  description: string | null;
  photo: string | null;
  ingredients: string[];
  allergens: string[];
  portion: string | null;
};

export type SellableMealPrepWeek = {
  id: string;
  weekStart: string;
  deliveryDate: string;
  selectionDeadline: string;
  notes: string | null;
  afterDeadline: boolean;
  deliveryLabel: string;
  deadlineLabel: string;
};

export type MealPrepWeekPayload = {
  week: SellableMealPrepWeek | null;
  dishes: MealPrepDish[];
  deliveryArea: string;
  doorstepFeeCents: number;
  reason: 'ok' | 'no_published_week' | 'no_dishes';
  draftWeeks: number;
};

const FALLBACK_DOORSTEP_CENTS = 1000;
const DELIVERY_AREA = 'Calgary and nearby neighbourhoods · Saturday delivery';

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value.split(/[,;]/).map((v) => v.trim()).filter(Boolean);
  }
  return [];
}

export async function getDoorstepFeeCents(): Promise<number> {
  const { data } = await supabaseAdmin
    .from('delivery_zones')
    .select('delivery_fee')
    .eq('is_active', true)
    .order('delivery_fee', { ascending: true })
    .limit(1)
    .maybeSingle();

  const fee = Number(data?.delivery_fee);
  if (Number.isFinite(fee) && fee >= 0) return Math.round(fee * 100);
  return FALLBACK_DOORSTEP_CENTS;
}

export async function getSellableMealPrepWeek(): Promise<{
  week: SellableMealPrepWeek | null;
  afterDeadline: boolean;
  draftWeeks: number;
}> {
  const [publishedRes, draftRes] = await Promise.all([
    supabaseAdmin
      .from('meal_prep_weeks')
      .select('id, week_start, delivery_date, selection_deadline, notes, status')
      .eq('status', 'published')
      .order('week_start', { ascending: true }),
    supabaseAdmin
      .from('meal_prep_weeks')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'draft'),
  ]);
  if (publishedRes.error) throw publishedRes.error;
  const published = publishedRes.data;
  const draftWeeks = draftRes.count;

  type WeekRow = {
    id: string;
    week_start: string;
    delivery_date: string;
    selection_deadline: string;
    notes: string | null;
    status: string;
  };
  const weeks = (published || []) as WeekRow[];
  const now = Date.now();
  const open = weeks.filter((w: WeekRow) => new Date(w.selection_deadline).getTime() >= now);
  const row = open[0] || null;
  const afterDeadline = Boolean(
    weeks.length &&
      (!row || weeks.some((w: WeekRow) => new Date(w.selection_deadline).getTime() < now))
  );

  if (!row) {
    return { week: null, afterDeadline, draftWeeks: draftWeeks || 0 };
  }

  return {
    afterDeadline,
    draftWeeks: draftWeeks || 0,
    week: {
      id: row.id,
      weekStart: row.week_start,
      deliveryDate: row.delivery_date,
      selectionDeadline: row.selection_deadline,
      notes: row.notes,
      afterDeadline,
      deliveryLabel: formatCalgaryDate(row.delivery_date, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
      deadlineLabel: formatCalgaryDate(row.selection_deadline, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    },
  };
}

export async function getWeekDishes(weekId: string): Promise<MealPrepDish[]> {
  const { data: items } = await supabaseAdmin
    .from('meal_prep_week_items')
    .select('product_id, sort_order')
    .eq('week_id', weekId)
    .order('sort_order');

  const productIds = (items || [])
    .map((i: { product_id: string }) => i.product_id)
    .filter(Boolean);
  if (!productIds.length) return [];

  type ProductRow = {
    id: string;
    name: string;
    description: string | null;
    ingredients: unknown;
    allergens: unknown;
  };
  type ImageRow = { product_id: string; url: string | null; position: number };
  type VariantRow = { product_id: string; name: string | null; option1: string | null };

  const [{ data: products }, { data: images }, { data: variants }] = await Promise.all([
    supabaseAdmin
      .from('products')
      .select('id, name, description, ingredients, allergens')
      .in('id', productIds),
    supabaseAdmin
      .from('product_images')
      .select('product_id, url, position')
      .in('product_id', productIds)
      .order('position'),
    supabaseAdmin
      .from('product_variants')
      .select('product_id, name, option1')
      .in('product_id', productIds),
  ]);

  const productById = new Map<string, ProductRow>(
    ((products || []) as ProductRow[]).map((p) => [p.id, p])
  );
  const imageById = new Map<string, string>();
  for (const img of (images || []) as ImageRow[]) {
    if (!imageById.has(img.product_id) && img.url) imageById.set(img.product_id, img.url);
  }
  const portionById = new Map<string, string>();
  for (const v of (variants || []) as VariantRow[]) {
    const label = (v.option1 || v.name || '').trim();
    if (label && !portionById.has(v.product_id)) portionById.set(v.product_id, label);
  }

  return productIds.map((id: string) => {
    const product = productById.get(id);
    return {
      productId: id,
      name: product?.name || 'Dish',
      description: product?.description || null,
      photo: imageById.get(id) || null,
      ingredients: asStringArray(product?.ingredients),
      allergens: asStringArray(product?.allergens),
      portion: portionById.get(id) || 'Regular portion',
    };
  });
}

export async function getMealPrepWeekPayload(): Promise<MealPrepWeekPayload> {
  const [{ week, afterDeadline, draftWeeks }, doorstepFeeCents] = await Promise.all([
    getSellableMealPrepWeek(),
    getDoorstepFeeCents(),
  ]);

  if (!week) {
    return {
      week: null,
      dishes: [],
      deliveryArea: DELIVERY_AREA,
      doorstepFeeCents,
      reason: 'no_published_week',
      draftWeeks,
    };
  }

  const dishes = await getWeekDishes(week.id);
  return {
    week: { ...week, afterDeadline },
    dishes,
    deliveryArea: DELIVERY_AREA,
    doorstepFeeCents,
    reason: dishes.length ? 'ok' : 'no_dishes',
    draftWeeks,
  };
}

export async function resolveCheckoutWeek(requestedWeekId?: string | null) {
  const catalog = await getMealPrepWeekPayload();
  if (!catalog.week) {
    return { ...catalog, substituted: false };
  }

  if (!requestedWeekId || requestedWeekId === catalog.week.id) {
    return { ...catalog, substituted: false };
  }

  const { data: requested } = await supabaseAdmin
    .from('meal_prep_weeks')
    .select('id, selection_deadline, status')
    .eq('id', requestedWeekId)
    .maybeSingle();

  const stillOpen =
    requested?.status === 'published' &&
    new Date(requested.selection_deadline).getTime() >= Date.now();

  if (stillOpen && requestedWeekId === catalog.week.id) {
    return { ...catalog, substituted: false };
  }

  return { ...catalog, substituted: true };
}

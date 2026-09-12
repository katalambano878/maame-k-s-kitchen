-- One-time meal-prep purchase price + fulfillment link

ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS one_time_price_cents integer
  CHECK (one_time_price_cents IS NULL OR one_time_price_cents > 0);

CREATE TABLE IF NOT EXISTS public.meal_prep_one_time_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  week_id uuid NOT NULL REFERENCES public.meal_prep_weeks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  selections jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meal_prep_one_time_user_week
  ON public.meal_prep_one_time_orders (user_id, week_id);

ALTER TABLE public.meal_prep_one_time_orders ENABLE ROW LEVEL SECURITY;

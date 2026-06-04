-- Weekly meal-prep subscriptions (Stripe recurring + weekly menu selections)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  meals_per_week integer NOT NULL DEFAULT 5 CHECK (meals_per_week > 0),
  price_cents integer NOT NULL CHECK (price_cents > 0),
  currency text NOT NULL DEFAULT 'cad',
  stripe_product_id text,
  stripe_price_id text,
  delivery_day text NOT NULL DEFAULT 'saturday',
  billing_day text NOT NULL DEFAULT 'wednesday',
  cancel_notice_days integer NOT NULL DEFAULT 3 CHECK (cancel_notice_days >= 1),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meal_prep_weeks (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  week_start date NOT NULL UNIQUE,
  delivery_date date NOT NULL,
  selection_deadline timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meal_prep_week_items (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  week_id uuid NOT NULL REFERENCES public.meal_prep_weeks(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  max_per_subscriber integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (week_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.meal_prep_subscriptions (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'incomplete'
    CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing', 'paused')),
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  pending_cancel_at timestamptz,
  delivery_method text DEFAULT 'pickup' CHECK (delivery_method IN ('pickup', 'doorstep')),
  shipping_address jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_prep_one_active_sub_per_user
  ON public.meal_prep_subscriptions (user_id)
  WHERE status IN ('active', 'trialing', 'past_due');

CREATE TABLE IF NOT EXISTS public.meal_prep_selections (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  subscription_id uuid NOT NULL REFERENCES public.meal_prep_subscriptions(id) ON DELETE CASCADE,
  week_id uuid NOT NULL REFERENCES public.meal_prep_weeks(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'fulfilled', 'canceled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (subscription_id, week_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_meal_prep_subs_user ON public.meal_prep_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_prep_subs_stripe ON public.meal_prep_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_meal_prep_selections_week ON public.meal_prep_selections(week_id);
CREATE INDEX IF NOT EXISTS idx_meal_prep_weeks_status ON public.meal_prep_weeks(status, week_start);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_prep_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_prep_week_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_prep_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_prep_selections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view active subscription plans" ON public.subscription_plans;
CREATE POLICY "Public view active subscription plans" ON public.subscription_plans
  FOR SELECT USING (status = 'active' OR is_admin_or_staff());

DROP POLICY IF EXISTS "Staff manage subscription plans" ON public.subscription_plans;
CREATE POLICY "Staff manage subscription plans" ON public.subscription_plans
  FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

DROP POLICY IF EXISTS "Public view published meal prep weeks" ON public.meal_prep_weeks;
CREATE POLICY "Public view published meal prep weeks" ON public.meal_prep_weeks
  FOR SELECT USING (status = 'published' OR is_admin_or_staff());

DROP POLICY IF EXISTS "Staff manage meal prep weeks" ON public.meal_prep_weeks;
CREATE POLICY "Staff manage meal prep weeks" ON public.meal_prep_weeks
  FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

DROP POLICY IF EXISTS "Public view week items for published weeks" ON public.meal_prep_week_items;
CREATE POLICY "Public view week items for published weeks" ON public.meal_prep_week_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_prep_weeks w
      WHERE w.id = week_id AND (w.status = 'published' OR is_admin_or_staff())
    )
  );

DROP POLICY IF EXISTS "Staff manage meal prep week items" ON public.meal_prep_week_items;
CREATE POLICY "Staff manage meal prep week items" ON public.meal_prep_week_items
  FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

DROP POLICY IF EXISTS "Users view own meal prep subscriptions" ON public.meal_prep_subscriptions;
CREATE POLICY "Users view own meal prep subscriptions" ON public.meal_prep_subscriptions
  FOR SELECT USING (auth.uid() = user_id OR is_admin_or_staff());

DROP POLICY IF EXISTS "Users insert own meal prep subscriptions" ON public.meal_prep_subscriptions;
CREATE POLICY "Users insert own meal prep subscriptions" ON public.meal_prep_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin_or_staff());

DROP POLICY IF EXISTS "Users update own meal prep subscriptions" ON public.meal_prep_subscriptions;
CREATE POLICY "Users update own meal prep subscriptions" ON public.meal_prep_subscriptions
  FOR UPDATE USING (auth.uid() = user_id OR is_admin_or_staff());

DROP POLICY IF EXISTS "Staff manage all meal prep subscriptions" ON public.meal_prep_subscriptions;
CREATE POLICY "Staff manage all meal prep subscriptions" ON public.meal_prep_subscriptions
  FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

DROP POLICY IF EXISTS "Users manage own meal prep selections" ON public.meal_prep_selections;
CREATE POLICY "Users manage own meal prep selections" ON public.meal_prep_selections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.meal_prep_subscriptions s
      WHERE s.id = subscription_id AND (s.user_id = auth.uid() OR is_admin_or_staff())
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meal_prep_subscriptions s
      WHERE s.id = subscription_id AND (s.user_id = auth.uid() OR is_admin_or_staff())
    )
  );

-- Plans are created manually in Admin → Subscriptions → Plans (no seed data).

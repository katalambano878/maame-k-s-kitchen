-- ============================================================================
-- FOOD/RESTAURANT SCHEMA ADDITIONS FOR Mama K
-- ============================================================================
-- Run after: 20260218000000_allow_null_order_items_product_fks.sql

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS prep_time integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spice_level integer DEFAULT 0 CHECK (spice_level >= 0 AND spice_level <= 3),
  ADD COLUMN IF NOT EXISTS is_vegetarian boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_vegan boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_gluten_free boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_halal boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS allergens text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS calories integer,
  ADD COLUMN IF NOT EXISTS is_available_today boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS ingredients text[] DEFAULT '{}';

ALTER TABLE public.products
  DROP COLUMN IF EXISTS weight,
  DROP COLUMN IF EXISTS weight_unit,
  DROP COLUMN IF EXISTS barcode,
  DROP COLUMN IF EXISTS brand,
  DROP COLUMN IF EXISTS vendor;

ALTER TABLE public.orders ALTER COLUMN currency SET DEFAULT 'CAD';

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_type text DEFAULT 'delivery' CHECK (delivery_type IN ('delivery', 'pickup')),
  ADD COLUMN IF NOT EXISTS estimated_delivery_at timestamptz,
  ADD COLUMN IF NOT EXISTS special_instructions text;

ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'preparing';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'ready_for_pickup';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'out_for_delivery';

ALTER TABLE public.product_variants
  DROP COLUMN IF EXISTS option2,
  DROP COLUMN IF EXISTS option3;

COMMENT ON COLUMN public.product_variants.option1 IS 'Portion size: e.g. Regular, Large, Family';

CREATE TABLE IF NOT EXISTS public.catering_requests (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  event_date date NOT NULL,
  event_type text,
  guest_count integer,
  location text,
  dishes_requested text,
  budget text,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','contacted','quoted','confirmed','completed','cancelled')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  description text,
  neighborhoods text[] DEFAULT '{}',
  postal_codes text[] DEFAULT '{}',
  delivery_fee numeric DEFAULT 0,
  min_order numeric DEFAULT 0,
  estimated_time_min integer DEFAULT 30,
  estimated_time_max integer DEFAULT 60,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_menu (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  date date NOT NULL,
  is_available boolean DEFAULT true,
  quantity_limit integer,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, date)
);

ALTER TABLE public.catering_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_menu ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit catering request" ON public.catering_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manages catering requests" ON public.catering_requests FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','staff')));
CREATE POLICY "Anyone can view delivery zones" ON public.delivery_zones FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manages delivery zones" ON public.delivery_zones FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','staff')));
CREATE POLICY "Anyone can view daily menu" ON public.daily_menu FOR SELECT USING (true);
CREATE POLICY "Admin manages daily menu" ON public.daily_menu FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','staff')));

INSERT INTO public.delivery_zones (name, description, neighborhoods, postal_codes, delivery_fee, min_order, estimated_time_min, estimated_time_max)
VALUES (
  'Calgary NE',
  'Primary delivery zone â€” Cornerstone and surrounding NE communities',
  ARRAY['Cornerstone','Redstone','Skyview Ranch','Cityscape','Saddle Ridge','Taradale','Martindale','Pineridge','Rundle'],
  ARRAY['T3N','T3J','T1Y'],
  5.00, 20.00, 30, 60
) ON CONFLICT DO NOTHING;

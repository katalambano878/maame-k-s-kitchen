-- Preorder, Saturday menu, product media type, kitchen events, menu categories

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS availability_mode text DEFAULT 'standard'
    CHECK (availability_mode IN ('standard', 'preorder')),
  ADD COLUMN IF NOT EXISTS preorder_lead_hours integer DEFAULT 24,
  ADD COLUMN IF NOT EXISTS available_days text[] DEFAULT '{}';

ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'image'
    CHECK (media_type IN ('image', 'video'));

COMMENT ON COLUMN public.products.availability_mode IS 'standard = regular menu; preorder = requires advance notice';
COMMENT ON COLUMN public.products.available_days IS 'Empty = every day. e.g. {saturday} for Saturday-only dishes';
COMMENT ON COLUMN public.product_images.media_type IS 'image or video URL stored in url column';

CREATE TABLE IF NOT EXISTS public.kitchen_events (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  event_type text NOT NULL DEFAULT 'general'
    CHECK (event_type IN ('chop_bar', 'catering', 'food_fest', 'general')),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  is_upcoming boolean DEFAULT false,
  event_date timestamptz,
  end_date timestamptz,
  location text DEFAULT 'Cornerstone, NE Calgary, Alberta',
  cover_image_url text,
  gallery_urls text[] DEFAULT '{}',
  video_urls text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.kitchen_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view published kitchen events" ON public.kitchen_events;
CREATE POLICY "Public view published kitchen events" ON public.kitchen_events
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Staff manage kitchen events" ON public.kitchen_events;
CREATE POLICY "Staff manage kitchen events" ON public.kitchen_events
  FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

INSERT INTO public.categories (name, slug, description, status, metadata)
SELECT 'Salads & Sides', 'sides', 'Fresh salads and side dishes', 'active', '{"featured": false}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'sides');

INSERT INTO public.categories (name, slug, description, status, metadata)
SELECT 'Pastries', 'pastries', 'Ghanaian pastries and baked treats', 'active', '{"featured": false}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'pastries');

INSERT INTO public.categories (name, slug, description, status, metadata)
SELECT 'Saturday Menu', 'saturday-menu', 'Dishes made fresh every Saturday', 'active', '{"featured": true, "day_only": "saturday"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'saturday-menu');

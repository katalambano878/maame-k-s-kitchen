# Customization Checklist — Maame Ks Kitchen

This codebase has been populated with the brand identity for **Maame Ks Kitchen**, an authentic Ghanaian restaurant in Cornerstone, Calgary, Alberta. Use this checklist to finish any remaining setup before going live.

> Items marked **🟢 Applied** have already been wired in. Items marked **🟡 Confirm** were filled with reasonable defaults that you should verify and update if needed. Items marked **🔴 Action required** still need manual work from you.

---

## 1. Business identity

- 🟢 Brand name: **Maame Ks Kitchen** (uses curly apostrophe `’` to avoid quote-string collisions)
- 🟢 Brand monogram: **MK** (used in header, mobile drawer, OG image, and PWA splash)
- 🟢 Tagline default: *Authentic Ghanaian cuisine in Calgary*
- 🟢 Schema.org type: `Restaurant` + `LocalBusiness` + `Organization`
- 🟢 Cuisine: `Ghanaian`, `Ghanaian`

## 2. Contact details

- 🟢 Phone: **(587) 582-2421** (E.164: `+15875822421`)
- 🟢 Address: **Cornerstone, Calgary, Alberta, Canada** (or `Cornerstone, NE Calgary, Alberta`)
- 🟡 Email: **`hello@maamekskitchen.ca`** — *Confirm this is your real address. If different, search/replace globally.*

## 3. Domain

- 🟡 Domain: **`maamekskitchen.ca`** — *Confirm. If different, do a global find/replace for `maamekskitchen.ca` → `<your-domain>`.*
- 🔴 You still need to register the domain (if not already), connect it in Vercel/your host, and set `NEXT_PUBLIC_APP_URL=https://maamekskitchen.ca` in production env vars.

## 4. Social media (already wired)

- 🟢 Instagram: `https://www.instagram.com/maame.k_kitchen/`
- 🟢 TikTok: `https://www.tiktok.com/@maamekskitchenyyc`
- 🟢 Snapchat: `https://www.snapchat.com/add/maameks_kitchen`

These appear in:
- Footer social icon row (auto-rendered when URLs are present)
- Schema.org `sameAs` JSON-LD in `app/layout.tsx` and `components/SEOHead.tsx`
- FAQ contact answer

## 5. Currency, locale, country

- 🟢 Currency: **CAD** (`$`)
- 🟢 Country: **Canada**, dialing code **+1**, ISO **CA**
- 🟢 Region: **Alberta** (default), with BC/SK/MB available in the checkout dropdown
- 🟢 City: **Calgary**, secondary city **Edmonton**
- 🟢 Locale: `en_CA`

## 6. Assets to add to `/public/`

The codebase references these files but the actual image files do **not** exist yet. Until you add them, related areas of the site will show broken images.

| File | Size | Purpose |
|---|---|---|
| `/public/logo.png` | ~270×80 (or your aspect) | Primary logo (header, footer, admin login) |
| `/public/icon-192.png` | 192×192 | PWA icon (Android) |
| `/public/icon-512.png` | 512×512 | PWA splash icon |
| `/public/favicon.ico` | 32×32 | Browser tab icon |
| `/public/apple-touch-icon.png` | 180×180 | iOS home-screen icon |
| `/public/home_hero_1.jpg` | 1920×1080 | Homepage hero — slide 1 |
| `/public/home_hero_2.jpg` | 1920×1080 | Homepage hero — slide 2 |
| `/public/home_hero_3.jpg` | 1920×1080 | Homepage hero — slide 3 |
| `/public/about-team.png` | ~1200×1500 | About page photo |
| `/public/shop_hero.png` | 1920×600 | Menu page hero |
| `/public/categories_hero.png` | 1920×600 | Categories page hero |
| `/public/contact_hero.png` | 1920×600 | Contact page hero |
| `/public/cart_hero.png` | 1920×600 | Cart page hero |
| `/public/wishlist_hero.png` | 1920×600 | Wishlist page hero |
| `/public/about_hero.png` | 1920×600 | About page hero |

See `/public/ASSETS_GUIDE.md` for tools and tips. Also: the OG image at `/opengraph-image.tsx` is auto-rendered with the brand name and the **MK** monogram, so it will look reasonable even before you add a logo file.

## 7. Environment variables — fill in `.env.local`

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_APP_URL` — production URL, e.g. `https://maamekskitchen.ca`
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project dashboard
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (server-only, never commit)
- `SUPABASE_PROJECT_REF` and `SUPABASE_DB_PASSWORD` — for migration scripts
- `RESEND_API_KEY` — for transactional emails (sign up at resend.com)
- `EMAIL_FROM` — already set to `Maame Ks Kitchen <noreply@maamekskitchen.ca>` (you'll need to verify this domain in Resend)
- `ADMIN_EMAIL` — where customer notifications get sent (e.g. `hello@maamekskitchen.ca`)
- 🔴 **Payment gateway**: see Section 9 below
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` *(optional)* — Google Analytics 4
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY` *(optional)* — for contact form anti-spam
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` *(optional)* — for Search Console

## 8. License

- 🟡 Set to **`Proprietary - All Rights Reserved`** — typical for a private business codebase. If you want a different license (MIT, Apache, etc.), edit `LICENSE` and `package.json`.

## 9. Stripe payment setup

🟢 **Stripe Checkout is integrated.** Online orders redirect to Stripe for card payment; the webhook marks orders as paid.

Add these to `.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_...           # Stripe Dashboard → Developers → API keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...         # From Stripe webhook endpoint
```

### Stripe Dashboard setup

1. Create a [Stripe account](https://dashboard.stripe.com/register) and enable **CAD**.
2. Copy your **Secret key** and **Publishable key** into `.env.local`.
3. Add a webhook endpoint:
   - **URL:** `https://maamekskitchen.ca/api/payment/stripe/webhook`
   - **Events:** `checkout.session.completed`
   - Copy the **Signing secret** into `STRIPE_WEBHOOK_SECRET`.
4. For local testing, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:3004/api/payment/stripe/webhook
   ```
   Use the CLI signing secret in `.env.local` while developing.

### Payment flow

- Checkout → order created → Stripe Checkout Session → customer pays → webhook fulfills order
- `/pay/[orderId]` — retry payment for unpaid orders
- POS → **Stripe** option generates a payment link for in-store card payments

### API routes

- `app/api/payment/stripe/create-checkout-session/route.ts`
- `app/api/payment/stripe/webhook/route.ts`
- `app/api/payment/stripe/verify/route.ts` (fallback after redirect)

## 10. Supabase setup

- 🔴 Create a new Supabase project
- 🔴 Run migrations: `supabase link --project-ref <ref>` then `supabase db push`
- 🔴 (Or use the bundled script: `npm run supabase:migrate`)
- 🔴 Apply RLS policies: `npm run db:migrate` after editing the script env vars, OR run `scripts/enable-rls.sql` directly in the SQL editor
- 🔴 Create the first admin user: `npm run create-admin` (after env vars are set)

## 11. Menu / products

🔴 **There are no products in the database.** The codebase is product-agnostic — once Supabase is wired up, log into `/admin` and add your menu items:

Suggested categories (you can edit/rename in the admin):
- Banku & Soup (banku with red fish & tilapia, banku with okro soup)
- Ghanaian Dishes (Ghanaian Dish, Ghanaian Dish)
- Tuo Zaafi & Sides (tz)
- Fufu & Light Soup (Ghanaian Dish)
- omotuo & groundnut soup (Ghanaian Dish)
- Sides (cheke cheke, etc.)
- Drinks

For each item, add:
- Name (e.g. "Ghanaian Dish with Ghanaian Dish")
- Description (ingredients, spice level, etc.)
- Price
- Photo (recommended: 800×800 or 1200×1200, square)
- Category
- Variants (Small / Regular / Large / Family Pack — see Portion Guide modal)

## 12. Sample blog posts

🟡 The codebase ships with three sample blog posts (`app/(store)/blog/[id]/page.tsx`) about online shopping. They have generic content that mostly works for any e-commerce store but the body copy is not food-specific. Either:
- Replace with food-themed posts (e.g. "How we make our banku", "The story of jollof"), OR
- Hide the blog from the footer/nav until you have real food content, OR
- Leave as-is for SEO benefit

## 13. SEO

- 🟢 Site title, description, keywords, Open Graph, Twitter Cards, Schema.org all populated for Maame Ks Kitchen
- 🟢 OG image auto-renders with brand name and MK monogram
- 🔴 Add `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to env vars to verify Google Search Console
- 🔴 Submit your sitemap (`/sitemap.xml`) to Google Search Console after launch
- 🟡 The Twitter/X handle in metadata is `@maamekskitchenyyc` — same as TikTok. If you create a separate X account, update `app/layout.tsx`.

## 14. PWA

- 🟢 Manifest configured with name, short_name, theme color (`#059669` emerald), background (`#022c22` deep emerald), and CA locale
- 🔴 Add `/public/icon-192.png` and `/public/icon-512.png` for the PWA install prompt to work properly

## 15. Pages that may need rewriting

These pages were built for a fashion store and have been adapted to food, but you may want to rewrite their body content to match your voice:

- `app/(store)/about/page.tsx` — Story / Mission tabs (boilerplate but food-themed)
- `app/(store)/blog/[id]/page.tsx` — three sample blog posts (online shopping, home items, buyer's guide)
- `app/(store)/terms/page.tsx` — generic terms (have a lawyer review before going live)
- `app/(store)/account/privacy/page.tsx` — privacy policy (have a lawyer review)

## 16. Components that may not apply to a restaurant

These components were built for a fashion store. They still work but may not be relevant. Decide whether to remove or repurpose:

- `components/SizeGuideModal.tsx` — already converted to a **Portion Guide** (Small / Regular / Large / Family Pack). You can leave it.
- `app/(store)/wishlist/page.tsx` — wishlist for a restaurant is unusual but harmless. Keep or remove from nav.
- The "loyalty points" FAQ — currently the codebase doesn't have a loyalty system implemented, just the FAQ mention. Either build the system or remove the FAQ entry.
- "Cash on Delivery" was removed from FAQ since you're a Calgary food business; cash on pickup is more typical.

## 17. Final pre-launch checklist

- [ ] Domain registered and DNS pointing to host
- [ ] `.env.local` (and host env vars) all filled in
- [ ] Supabase project created and migrations applied
- [ ] Admin user created
- [ ] Menu items added with photos
- [ ] Logo and PWA icons added to `/public/`
- [ ] Hero images added to `/public/`
- [ ] Stripe keys and webhook configured (see §9)
- [ ] Test order placed end-to-end (cart → checkout → payment → confirmation email)
- [ ] Test admin order view
- [ ] Privacy policy and terms reviewed by a lawyer
- [ ] Resend domain verified for email sending
- [ ] Google Search Console + sitemap submitted
- [ ] Test on mobile (your customers will mostly use phones)
- [ ] Add Google Maps embed to contact page (currently uses `@react-google-maps/api` package — you'll need a Google Maps API key)

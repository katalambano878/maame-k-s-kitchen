# Customization Checklist â€” Mama K

This codebase has been populated with the brand identity for **Mama K**, an authentic Ghanaian restaurant in Cornerstone, Calgary, Alberta. Use this checklist to finish any remaining setup before going live.

> Items marked **ðŸŸ¢ Applied** have already been wired in. Items marked **ðŸŸ¡ Confirm** were filled with reasonable defaults that you should verify and update if needed. Items marked **ðŸ”´ Action required** still need manual work from you.

---

## 1. Business identity

- ðŸŸ¢ Brand name: **Mama K** (uses curly apostrophe `â€™` to avoid quote-string collisions)
- ðŸŸ¢ Brand monogram: **MK** (used in header, mobile drawer, OG image, and PWA splash)
- ðŸŸ¢ Tagline default: *Authentic Ghanaian cuisine in Calgary*
- ðŸŸ¢ Schema.org type: `Restaurant` + `LocalBusiness` + `Organization`
- ðŸŸ¢ Cuisine: `Ghanaian`, `Ghanaian`

## 2. Contact details

- ðŸŸ¢ Phone: **(587) 582-2421** (E.164: `+15875822421`)
- ðŸŸ¢ Address: **Cornerstone, Calgary, Alberta, Canada** (or `Cornerstone, NE Calgary, Alberta`)
- ðŸŸ¡ Email: **`hello@maamekskitchen.ca`** â€” *Confirm this is your real address. If different, search/replace globally.*

## 3. Domain

- ðŸŸ¡ Domain: **`maamekskitchen.ca`** â€” *Confirm. If different, do a global find/replace for `maamekskitchen.ca` â†’ `<your-domain>`.*
- ðŸ”´ You still need to register the domain (if not already), connect it in Vercel/your host, and set `NEXT_PUBLIC_APP_URL=https://maamekskitchen.ca` in production env vars.

## 4. Social media (already wired)

- ðŸŸ¢ Instagram: `https://www.instagram.com/maame.k_kitchen/`
- ðŸŸ¢ TikTok: `https://www.tiktok.com/@maamekskitchenyyc`
- ðŸŸ¢ Snapchat: `https://www.snapchat.com/add/maameks_kitchen`

These appear in:
- Footer social icon row (auto-rendered when URLs are present)
- Schema.org `sameAs` JSON-LD in `app/layout.tsx` and `components/SEOHead.tsx`
- FAQ contact answer

## 5. Currency, locale, country

- ðŸŸ¢ Currency: **CAD** (`$`)
- ðŸŸ¢ Country: **Canada**, dialing code **+1**, ISO **CA**
- ðŸŸ¢ Region: **Alberta** (default), with BC/SK/MB available in the checkout dropdown
- ðŸŸ¢ City: **Calgary**, secondary city **Edmonton**
- ðŸŸ¢ Locale: `en_CA`

## 6. Assets to add to `/public/`

The codebase references these files but the actual image files do **not** exist yet. Until you add them, related areas of the site will show broken images.

| File | Size | Purpose |
|---|---|---|
| `/public/logo.png` | ~270Ã—80 (or your aspect) | Primary logo (header, footer, admin login) |
| `/public/icon-192.png` | 192Ã—192 | PWA icon (Android) |
| `/public/icon-512.png` | 512Ã—512 | PWA splash icon |
| `/public/favicon.ico` | 32Ã—32 | Browser tab icon |
| `/public/apple-touch-icon.png` | 180Ã—180 | iOS home-screen icon |
| `/public/home_hero_1.jpg` | 1920Ã—1080 | Homepage hero â€” slide 1 |
| `/public/home_hero_2.jpg` | 1920Ã—1080 | Homepage hero â€” slide 2 |
| `/public/home_hero_3.jpg` | 1920Ã—1080 | Homepage hero â€” slide 3 |
| `/public/about-team.png` | ~1200Ã—1500 | About page photo |
| `/public/shop_hero.png` | 1920Ã—600 | Menu page hero |
| `/public/categories_hero.png` | 1920Ã—600 | Categories page hero |
| `/public/contact_hero.png` | 1920Ã—600 | Contact page hero |
| `/public/cart_hero.png` | 1920Ã—600 | Cart page hero |
| `/public/wishlist_hero.png` | 1920Ã—600 | Wishlist page hero |
| `/public/about_hero.png` | 1920Ã—600 | About page hero |

See `/public/ASSETS_GUIDE.md` for tools and tips. Also: the OG image at `/opengraph-image.tsx` is auto-rendered with the brand name and the **MK** monogram, so it will look reasonable even before you add a logo file.

## 7. Environment variables â€” fill in `.env.local`

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_APP_URL` â€” production URL, e.g. `https://maamekskitchen.ca`
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` â€” from your Supabase project dashboard
- `SUPABASE_SERVICE_ROLE_KEY` â€” service role key (server-only, never commit)
- `SUPABASE_PROJECT_REF` and `SUPABASE_DB_PASSWORD` â€” for migration scripts
- `RESEND_API_KEY` â€” for transactional emails (sign up at resend.com)
- `EMAIL_FROM` â€” already set to `Mama K <noreply@maamekskitchen.ca>` (you'll need to verify this domain in Resend)
- `ADMIN_EMAIL` â€” where customer notifications get sent (e.g. `hello@maamekskitchen.ca`)
- ðŸ”´ **Payment gateway**: see Section 9 below
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` *(optional)* â€” Google Analytics 4
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY` *(optional)* â€” for contact form anti-spam
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` *(optional)* â€” for Search Console

## 8. License

- ðŸŸ¡ Set to **`Proprietary - All Rights Reserved`** â€” typical for a private business codebase. If you want a different license (MIT, Apache, etc.), edit `LICENSE` and `package.json`.

## 9. Payment gateway â€” IMPORTANT

ðŸ”´ **The codebase still uses Moolre as the payment gateway.** Moolre is a Canada-based mobile-money/card processor â€” it does not work for Canadian businesses.

You have two paths:

### Option A: Swap Moolre for Stripe (recommended for Canada)
This is a real code change. The Moolre integration lives in:
- `app/api/payment/moolre/route.ts`
- `app/api/payment/moolre/callback/route.ts`
- `app/api/payment/moolre/verify/route.ts`
- `app/(store)/pay/[orderId]/page.tsx` (UI)
- `app/(store)/checkout/page.tsx` (calls the moolre API)

You'd replace these with Stripe Checkout (or Stripe Payment Intents). Estimated effort: ~half a day for a developer.

### Option B: Keep Moolre and offer it alongside Interac e-Transfer / cash on pickup
The customer-facing FAQ copy already mentions Visa/Mastercard, Interac e-Transfer, and cash on pickup as accepted methods. If you want online-card processing, you'd still need a Canadian processor (Stripe, Square, etc.) â€” Moolre transactions will fail for CAD/Canadian cards.

For launch, you may want to **disable online payment** entirely and accept Interac e-Transfer + cash on pickup only â€” a small change in `app/(store)/checkout/page.tsx`.

## 10. Supabase setup

- ðŸ”´ Create a new Supabase project
- ðŸ”´ Run migrations: `supabase link --project-ref <ref>` then `supabase db push`
- ðŸ”´ (Or use the bundled script: `npm run supabase:migrate`)
- ðŸ”´ Apply RLS policies: `npm run db:migrate` after editing the script env vars, OR run `scripts/enable-rls.sql` directly in the SQL editor
- ðŸ”´ Create the first admin user: `npm run create-admin` (after env vars are set)

## 11. Menu / products

ðŸ”´ **There are no products in the database.** The codebase is product-agnostic â€” once Supabase is wired up, log into `/admin` and add your menu items:

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
- Photo (recommended: 800Ã—800 or 1200Ã—1200, square)
- Category
- Variants (Small / Regular / Large / Family Pack â€” see Portion Guide modal)

## 12. Sample blog posts

ðŸŸ¡ The codebase ships with three sample blog posts (`app/(store)/blog/[id]/page.tsx`) about online shopping. They have generic content that mostly works for any e-commerce store but the body copy is not food-specific. Either:
- Replace with food-themed posts (e.g. "How we make our banku", "The story of jollof"), OR
- Hide the blog from the footer/nav until you have real food content, OR
- Leave as-is for SEO benefit

## 13. SEO

- ðŸŸ¢ Site title, description, keywords, Open Graph, Twitter Cards, Schema.org all populated for Mama K
- ðŸŸ¢ OG image auto-renders with brand name and MK monogram
- ðŸ”´ Add `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to env vars to verify Google Search Console
- ðŸ”´ Submit your sitemap (`/sitemap.xml`) to Google Search Console after launch
- ðŸŸ¡ The Twitter/X handle in metadata is `@maamekskitchenyyc` â€” same as TikTok. If you create a separate X account, update `app/layout.tsx`.

## 14. PWA

- ðŸŸ¢ Manifest configured with name, short_name, theme color (`#059669` emerald), background (`#022c22` deep emerald), and CA locale
- ðŸ”´ Add `/public/icon-192.png` and `/public/icon-512.png` for the PWA install prompt to work properly

## 15. Pages that may need rewriting

These pages were built for a fashion store and have been adapted to food, but you may want to rewrite their body content to match your voice:

- `app/(store)/about/page.tsx` â€” Story / Mission tabs (boilerplate but food-themed)
- `app/(store)/blog/[id]/page.tsx` â€” three sample blog posts (online shopping, home items, buyer's guide)
- `app/(store)/terms/page.tsx` â€” generic terms (have a lawyer review before going live)
- `app/(store)/account/privacy/page.tsx` â€” privacy policy (have a lawyer review)

## 16. Components that may not apply to a restaurant

These components were built for a fashion store. They still work but may not be relevant. Decide whether to remove or repurpose:

- `components/SizeGuideModal.tsx` â€” already converted to a **Portion Guide** (Small / Regular / Large / Family Pack). You can leave it.
- `app/(store)/wishlist/page.tsx` â€” wishlist for a restaurant is unusual but harmless. Keep or remove from nav.
- The "loyalty points" FAQ â€” currently the codebase doesn't have a loyalty system implemented, just the FAQ mention. Either build the system or remove the FAQ entry.
- "Cash on Delivery" was removed from FAQ since you're a Calgary food business; cash on pickup is more typical.

## 17. Final pre-launch checklist

- [ ] Domain registered and DNS pointing to host
- [ ] `.env.local` (and host env vars) all filled in
- [ ] Supabase project created and migrations applied
- [ ] Admin user created
- [ ] Menu items added with photos
- [ ] Logo and PWA icons added to `/public/`
- [ ] Hero images added to `/public/`
- [ ] Payment provider decided and wired (Stripe recommended)
- [ ] Test order placed end-to-end (cart â†’ checkout â†’ payment â†’ confirmation email)
- [ ] Test admin order view
- [ ] Privacy policy and terms reviewed by a lawyer
- [ ] Resend domain verified for email sending
- [ ] Google Search Console + sitemap submitted
- [ ] Test on mobile (your customers will mostly use phones)
- [ ] Add Google Maps embed to contact page (currently uses `@react-google-maps/api` package â€” you'll need a Google Maps API key)


# Asset Replacement Guide

All original project assets have been removed from this codebase. Drop your own files into `/public/` at the paths below to make the storefront fully branded.

## Required Brand & Icon Assets

| File | Recommended size | Purpose | Referenced in |
|---|---|---|---|
| `/public/logo.png` | 240×80px (PNG, transparent) | Main brand logo (header, footer, admin, push notifications, JSON-LD) | `Header.tsx`, `Footer.tsx`, `app/admin/layout.tsx`, `app/admin/login/page.tsx`, `app/layout.tsx`, `context/CMSContext.tsx`, `app/(store)/blog/[id]/page.tsx` |
| `/public/icon-192.png` | 192×192px (PNG) | PWA icon (Android home screen, manifest) | `public/manifest.json` |
| `/public/icon-512.png` | 512×512px (PNG) | PWA splash, large icon | `public/manifest.json` |
| `/public/icon-192x192.png` | 192×192px (PNG) | Push notification icon & badge | `components/PushNotificationManager.tsx` |
| `/public/favicon.ico` | 32×32px (multi-res ICO) | Browser tab icon | Linked from `app/layout.tsx` (note: copy `/logo.png` references currently use `/logo.png` for favicon — replace with a real `favicon.ico` if desired) |
| `/public/apple-touch-icon.png` | 180×180px (PNG) | iOS home screen icon | `app/layout.tsx` (currently uses `/logo.png` — swap if you want a dedicated Apple icon) |

## Hero / Page Background Images

| File | Recommended size | Page |
|---|---|---|
| `/public/home_hero_1.jpg` | 1920×1080px (JPG/WebP) | Home page slide 1 |
| `/public/home_hero_2.jpg` | 1920×1080px (JPG/WebP) | Home page slide 2, About page |
| `/public/home_hero_3.jpg` | 1920×1080px (JPG/WebP) | Home page slide 3 |
| `/public/shop_hero.png` | 1920×800px (PNG/WebP) | Shop page header |
| `/public/categories_hero.png` | 1920×800px (PNG/WebP) | Categories page header |
| `/public/cart_hero.png` | 1920×600px (PNG/WebP) | Cart page header |
| `/public/wishlist_hero.png` | 1920×600px (PNG/WebP) | Wishlist page header |
| `/public/contact_hero.png` | 1920×600px (PNG/WebP) | Contact page header |
| `/public/events_hero.jpeg` | 1920×1080px (JPG/WebP) | Events page header |
| `/public/meal_prep_hero.jpeg` | 1920×1080px (JPG/WebP) | Meal prep subscription page header |
| `/public/about-team.png` | 800×1000px (PNG/WebP) | About page team / story image |

## Open Graph / Social Preview

The OG image is generated dynamically by `app/opengraph-image.tsx`. To use a static one instead, add `/public/og-image.png` (1200×630px) and update the `openGraph.images` field in `app/layout.tsx` and `components/SEOHead.tsx`.

## Optional / Recommended Extras

These aren't currently referenced but you'll likely want them:

| File | Size | Purpose |
|---|---|---|
| `/public/safari-pinned-tab.svg` | Vector, monochrome | Safari pinned tab |
| `/public/browserconfig.xml` | XML | Windows tile config |
| `/public/mstile-150x150.png` | 150×150px | Windows tile |

## Tools

- Favicon generator: <https://realfavicongenerator.net>
- OG image creator: <https://og-playground.vercel.app>
- Image optimization: <https://squoosh.app>
- Free stock photos: <https://unsplash.com>, <https://pexels.com>

## Tip

Run `npm run compress-images` after dropping in your assets — it will create optimized WebP/AVIF copies via the bundled `sharp` script (`scripts/compress-images.mjs`).

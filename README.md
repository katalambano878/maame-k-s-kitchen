# Mama K

> Authentic Ghanaian cuisine in Calgary â€” order banku, jollof, waakye, fufu, and more for delivery or pickup.

The online ordering site and admin dashboard for Mama K, a Ghanaian restaurant in Cornerstone, Calgary, Alberta.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19 + TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Payments:** Moolre _(swap for Stripe before going live in Canada â€” see [`CUSTOMIZE.md`](./CUSTOMIZE.md) Â§9)_
- **Email:** Resend

## Getting Started

```bash
npm install
cp .env.example .env.local
# Fill in your values in .env.local
npm run dev
```

The app starts on [http://localhost:3004](http://localhost:3004).

## Environment Variables

See [`.env.example`](./.env.example) for all required and optional environment variables. Copy it to `.env.local` and fill in your own values.

## Database Setup

1. Create a Supabase project.
2. Run the migrations in `supabase/migrations/` in order, either via the Supabase Dashboard SQL editor or the Supabase CLI.
3. Update `.env.local` with your Supabase credentials.

```bash
npm run supabase:link    # link to your remote Supabase project
npm run supabase:push    # push migrations
```

## Features

- Online menu with search, filtering, cart, multi-step checkout
- Admin dashboard with analytics, order/menu/customer/coupon management
- PWA with offline support and push notifications
- Email and SMS notifications
- Mobile-responsive design

## Brand & contact

- **Phone:** (587) 582-2421
- **Address:** Cornerstone, Calgary, Alberta, Canada
- **Instagram:** [@maame.k_kitchen](https://www.instagram.com/maame.k_kitchen/)
- **TikTok:** [@maamekskitchenyyc](https://www.tiktok.com/@maamekskitchenyyc)
- **Snapchat:** [maameks_kitchen](https://www.snapchat.com/add/maameks_kitchen)

## Deployment

Deploy via Vercel â€” connect this repo, set the env vars from .env.example, and configure your custom domain.

## Customization

After cloning, see [`CUSTOMIZE.md`](./CUSTOMIZE.md) for the full handoff checklist of placeholders and assets that need to be replaced before going to production.

## License

Proprietary - All Rights Reserved â€” see [`LICENSE`](./LICENSE).


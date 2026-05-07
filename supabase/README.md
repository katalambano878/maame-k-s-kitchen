# Supabase Migrations

This folder contains the SQL migrations for the application's Postgres schema.

## Files

- `migrations/20260209000000_complete_schema.sql` — full initial schema (extensions, enums, tables, indexes, RLS policies, helper functions, triggers, storage bucket policies)
- `migrations/20260218000000_allow_null_order_items_product_fks.sql` — schema patch allowing soft-deletes of products without losing historical orders

## Running migrations

### Option 1 — Supabase Dashboard
1. Open the SQL editor in your Supabase project.
2. Paste each migration file in order (oldest timestamp first).
3. Run.

### Option 2 — Supabase CLI

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_ID
supabase db push
```

### Option 3 — Bundled script

```bash
SUPABASE_PROJECT_REF=YOUR_PROJECT_ID SUPABASE_DB_PASSWORD=YOUR_PASSWORD npm run db:migrate
```

## Notes

- Row-Level Security (RLS) is enabled on all tables. Anon-key clients can only read public data and the rows belonging to the authenticated user.
- Service-role keys bypass RLS — keep them server-side only.
- The schema includes storage bucket configuration for product, avatar, review, blog, and category images. Make sure the buckets exist (or are auto-created) in your project before uploading.

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Policies](https://supabase.com/docs/guides/storage)

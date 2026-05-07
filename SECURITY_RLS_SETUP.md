# Supabase Row Level Security (RLS) Setup

## Why this matters

The Supabase **anon key** is public — it ships in client-side JavaScript. Without RLS enabled, anyone with that key can query every row of every table. RLS is therefore **mandatory** before going to production.

This document is a checklist of policies for the tables shipped with this project. Everything described here is also encoded in the migration at `supabase/migrations/20260209000000_complete_schema.sql` — this file is provided as a human-readable reference and post-deploy verification guide.

## How to enable RLS in the Dashboard

For each table:
1. **Database → Tables** → click the table → **RLS / Policies**
2. Toggle **Enable RLS** on
3. Add the policies below

---

## `orders`

Enable RLS: **YES**

```sql
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
```

The service-role key (used by API routes) bypasses RLS automatically.

---

## `order_items`

Enable RLS: **YES**

```sql
CREATE POLICY "Users can view own order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert order items"
ON order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  )
);
```

---

## `profiles`

Enable RLS: **YES**

```sql
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

---

## `customers`

Enable RLS: **YES**. Admin/staff only — no anon access.

```sql
CREATE POLICY "Admins only"
ON customers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);
```

---

## `products`

Enable RLS: **YES**. Public read for active/published.

```sql
CREATE POLICY "Public can view products"
ON products FOR SELECT
USING (status = 'active' OR status = 'published' OR status IS NULL);
```

---

## `product_images`, `categories`, `banners`, `store_modules`

Enable RLS: **YES**. Public read.

```sql
CREATE POLICY "Public can view product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public can view categories"     ON categories     FOR SELECT USING (true);
CREATE POLICY "Public can view banners"        ON banners        FOR SELECT USING (active = true OR active IS NULL);
CREATE POLICY "Public can view modules"        ON store_modules  FOR SELECT USING (true);
```

---

## `reviews`

Enable RLS: **YES**.

```sql
CREATE POLICY "Public can view approved reviews"
ON reviews FOR SELECT
USING (status = 'approved' OR status IS NULL);

CREATE POLICY "Users can create reviews"
ON reviews FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
```

---

## All other tables

For every other table (coupons, blog_posts, support_tickets, etc.):
- **Enable RLS on every table.**
- Public data: add a `SELECT` policy with `USING (true)` (or a status filter).
- Private data: restrict by `auth.uid()` or admin role.
- When in doubt, enable RLS with no policies — that blocks anon access entirely while still allowing service-role API routes to work.

---

## Required environment variables

Add to `.env.local`:

```
MOOLRE_CALLBACK_SECRET=<strong random string, used to verify payment callbacks>
```

---

## Verification

After applying RLS, in the browser console of your storefront:

```js
const { data } = await supabase.from('customers').select('*');
// → expect [] or an error, NOT real customer rows.

const { data } = await supabase.from('orders').select('*');
// → expect only the logged-in user's orders, or [] if signed out.
```

---

## Application-level security in this project

Server-side code in this project also enforces:

1. **Payment verify endpoint** — verifies amount/status against Moolre's API; the `fromRedirect` flag is no longer trusted on its own.
2. **Payment initiation** — order amount is fetched from the database, never trusted from the client.
3. **Payment callback** — callback secret verification is mandatory when configured; amount mismatches are rejected.
4. **Middleware** — server-side auth check for every `/admin` route.
5. **Notifications API** — sensitive notification types require admin auth; contact-form input is validated.
6. **Order tracking** — email verification is mandatory.
7. **Test SMS** — requires an admin auth token.
8. **HTML sanitization** — all user-supplied input is escaped before being injected into HTML.
9. **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy` are set in `next.config.ts`.

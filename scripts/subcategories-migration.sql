-- Migration: subcategories for product grouping
--
-- Purely additive: one new table plus one nullable column. Nothing existing is
-- renamed, dropped or rewritten, so this is safe to run on live data.
--
-- A product's subcategory is stored as the subcategory's slug (a soft
-- reference). Deleting a subcategory therefore only clears the tag on its
-- products — it never deletes the products themselves.

CREATE TABLE IF NOT EXISTS public.subcategories (
  id          BIGSERIAL PRIMARY KEY,
  category    TEXT NOT NULL DEFAULT 'auto_accessories',
  slug        TEXT NOT NULL,
  name        TEXT NOT NULL,
  name_sq     TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (category, slug)
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory TEXT;

CREATE INDEX IF NOT EXISTS idx_products_subcategory
  ON public.products(subcategory);

CREATE INDEX IF NOT EXISTS idx_subcategories_category
  ON public.subcategories(category, sort_order);

-- The storefront reads this table with the public anon key, the admin writes
-- with the service role (which bypasses RLS). So: public read, no write policy.
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subcategories public read" ON public.subcategories;
CREATE POLICY "subcategories public read"
  ON public.subcategories FOR SELECT
  USING (true);

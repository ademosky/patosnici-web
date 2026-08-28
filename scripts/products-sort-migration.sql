-- Migration: add sort_order to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order, created_at);

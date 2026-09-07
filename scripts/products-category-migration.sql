-- Migration: add category column to products table
-- Categories: rubber_mats | fabric_mats | auto_accessories
-- Existing products default to rubber_mats (safe, nothing is lost).

ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'rubber_mats';

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

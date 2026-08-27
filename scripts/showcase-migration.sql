-- Migration: Create showcase table for "Платнени" gallery
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS showcase (
  id BIGSERIAL PRIMARY KEY,
  image TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (consistent with other tables)
ALTER TABLE showcase ENABLE ROW LEVEL SECURITY;

-- Public read access (same as products)
CREATE POLICY "Public read access for showcase"
  ON showcase FOR SELECT
  USING (true);

-- Admin write access via service_role
CREATE POLICY "Admin write access for showcase"
  ON showcase FOR ALL
  USING (true)
  WITH CHECK (true);

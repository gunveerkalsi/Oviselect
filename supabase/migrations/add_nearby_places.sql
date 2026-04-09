-- ============================================================
-- Migration: Add lat/lng to college_info + college_nearby_places cache table
-- Run once via Supabase SQL Editor or psql
-- ============================================================

-- 1. Add geocoordinate columns to college_info
ALTER TABLE college_info
  ADD COLUMN IF NOT EXISTS lat  double precision,
  ADD COLUMN IF NOT EXISTS lng  double precision;

-- 2. Create the nearby-places cache table
CREATE TABLE IF NOT EXISTS college_nearby_places (
  institute   text PRIMARY KEY,
  places      jsonb        NOT NULL DEFAULT '{}'::jsonb,
  fetched_at  timestamptz  NOT NULL DEFAULT now()
);

-- 3. Enable Row-Level Security (reads are public, writes only via service role)
ALTER TABLE college_nearby_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read college_nearby_places"
  ON college_nearby_places FOR SELECT
  USING (true);

-- writes handled by edge function with service-role key only

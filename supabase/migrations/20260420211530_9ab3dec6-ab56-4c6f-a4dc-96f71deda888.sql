-- Add geolocation columns to page_views
ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS country_code text;

-- Generated column for the date portion (used for daily uniqueness)
ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS view_date date
    GENERATED ALWAYS AS ((created_at AT TIME ZONE 'UTC')::date) STORED;

-- Deduplicate any existing rows that would violate the upcoming unique index.
-- Keeps the earliest row per (visitor_id, view_date) and removes the rest.
DELETE FROM public.page_views pv
USING public.page_views pv2
WHERE pv.visitor_id = pv2.visitor_id
  AND pv.view_date = pv2.view_date
  AND pv.created_at > pv2.created_at;

-- Enforce 1 visit per visitor per day at the database level
CREATE UNIQUE INDEX IF NOT EXISTS page_views_visitor_day_unique
  ON public.page_views (visitor_id, view_date);

-- Helpful index for time-range queries
CREATE INDEX IF NOT EXISTS page_views_created_at_idx
  ON public.page_views (created_at DESC);

CREATE INDEX IF NOT EXISTS page_views_city_idx
  ON public.page_views (city);

-- Add geolocation columns to product_clicks
ALTER TABLE public.product_clicks
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS country_code text;

CREATE INDEX IF NOT EXISTS product_clicks_created_at_idx
  ON public.product_clicks (created_at DESC);

CREATE INDEX IF NOT EXISTS product_clicks_city_idx
  ON public.product_clicks (city);
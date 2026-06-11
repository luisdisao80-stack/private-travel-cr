-- Adds an `attribution` JSONB column to the bookings table so every
-- booking carries the marketing context it came from. Lets Diego answer
-- "what drove this sale?" without guessing.
--
-- Stored fields (all optional, captured opportunistically):
--   referrer            text  -- e.g. "https://www.google.com/"
--   referrer_domain     text  -- e.g. "google.com" (parsed for grouping)
--   landing_page        text  -- e.g. "/blog/costa-rica-7-day-itinerary"
--   utm_source          text  -- e.g. "instagram"
--   utm_medium          text  -- e.g. "social"
--   utm_campaign        text  -- e.g. "summer-2026"
--   utm_content         text  -- e.g. "story-link"
--   utm_term            text  -- e.g. "private-shuttle-cr"
--   first_seen_at       text  -- ISO timestamp of the first page view
--   country             text  -- Vercel geolocation header (e.g. "US")
--   city                text  -- e.g. "Dallas"
--   region              text  -- e.g. "TX"
--   device              text  -- "mobile" | "desktop" | "tablet"
--   user_agent          text  -- raw UA for forensic debugging
--
-- All optional so existing bookings stay valid and future-added fields
-- don't require another migration.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS attribution JSONB;

-- Indexes for the two grouping queries Diego will run most often:
-- "where did my bookings come from this month?" and
-- "which campaigns are converting?"
CREATE INDEX IF NOT EXISTS bookings_attribution_referrer_idx
  ON bookings ((attribution->>'referrer_domain'));

CREATE INDEX IF NOT EXISTS bookings_attribution_utm_source_idx
  ON bookings ((attribution->>'utm_source'));

-- =============================================================
-- Admin-created quotes / payment links — 2026-06-30
--
-- Adds three columns to `bookings` so Diego can prepare a booking for
-- a customer who can't (or doesn't want to) use the website:
--   - payment_token       : short unguessable string that identifies the
--                           booking on the public /pay/[token] page.
--                           Cleared once the booking is paid so the link
--                           can only be used once.
--   - token_expires_at    : the link auto-expires after 48h to keep
--                           inventory reasonable and force decisions.
--   - created_by_admin    : audit flag — every booking created via the
--                           new admin form has this set to true so we
--                           can filter / report on it later.
--
-- All three are nullable / default false so existing rows are untouched.
-- Safe to re-run (IF NOT EXISTS guards).
-- =============================================================

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS payment_token TEXT,
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Fast lookup by token on the public /pay/[token] page. Unique so the
-- same random string can't accidentally point at two rows.
CREATE UNIQUE INDEX IF NOT EXISTS bookings_payment_token_idx
  ON bookings (payment_token)
  WHERE payment_token IS NOT NULL;

-- Verification — should return the three new columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
  AND column_name IN ('payment_token', 'token_expires_at', 'created_by_admin')
ORDER BY column_name;

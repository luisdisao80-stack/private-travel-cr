// Per-booking token for the /api/booking/[orderNumber]/pdf endpoint.
//
// Before this existed, the PDF route was unauthenticated. Order numbers
// are sequential (allocated by the `next_booking_number` Postgres RPC,
// not random as an earlier comment claimed), so anyone who guessed
// PTCR-1541, PTCR-1542, PTCR-1543… could pull the full booking PII
// (name, email, phone, notes, addresses, flight number, card last-4,
// Tilopay auth code).
//
// The fix: require a `?t=<token>` query param derived by HMAC-SHA256
// of the order number under the ADMIN_SESSION_SECRET already used by
// lib/admin-auth.ts. HMAC was chosen over a stored random token because:
//
//   - No DB migration (works for every existing booking retroactively).
//   - `payment_token` exists but is ONLY populated on admin-created
//     quotes — regular customer bookings have it NULL, so it couldn't
//     be reused as-is.
//   - No new env var to configure in Vercel; ADMIN_SESSION_SECRET is
//     already required for the admin login.
//
// Rotating ADMIN_SESSION_SECRET invalidates every outstanding PDF link
// and every admin session simultaneously. That's the intended behavior
// (compromise → rotate → everyone re-authenticates).

import crypto from "crypto";

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET is not set");
  return s;
}

// 16 hex chars = 64 bits of entropy. Enough that a random guess against
// a specific order number will succeed with probability ~2^-64 — brute
// force is not feasible over the internet with per-request latency. Full
// 64-char hex would just make URLs uglier for no material safety gain.
const TOKEN_HEX_LEN = 16;

/** Derive the PDF-download token for a given order number. */
export function pdfTokenFor(orderNumber: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(String(orderNumber))
    .digest("hex")
    .slice(0, TOKEN_HEX_LEN);
}

/** Constant-time compare so the endpoint can't be timing-attacked. */
export function verifyPdfToken(orderNumber: string, provided: string): boolean {
  if (!provided || typeof provided !== "string") return false;
  let expected: string;
  try {
    expected = pdfTokenFor(orderNumber);
  } catch {
    // ADMIN_SESSION_SECRET missing — fail closed rather than allowing
    // through (would happen in a mis-configured deployment).
    return false;
  }
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// Simple in-memory per-IP rate limiter for public POST endpoints.
//
// Motivation: without this, an attacker can flood /api/payment/start
// and pile hundreds of pending bookings into Supabase (each row is a
// write op + storage). This is the MVP defense — one Vercel serverless
// instance's memory, reset on cold start. Good enough for a small-
// traffic booking site; upgrade to @upstash/ratelimit or Vercel KV
// if we ever need durable, cross-instance limits.
//
// Uses a fixed-window strategy per IP: each bucket has a count and a
// resetAt timestamp. When the window expires we reset. Simple, cheap,
// and predictable (no timestamp arrays to prune).
//
// Not intended for auth-critical throttling (e.g., login brute force);
// use a durable store for that. Here we only need to stop bulk abuse.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Occasional sweep so long-lived instances don't accumulate stale IPs.
// Cheap: only runs at most every SWEEP_INTERVAL_MS on any call.
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let lastSweepAt = 0;

function sweepIfDue(now: number) {
  if (now - lastSweepAt < SWEEP_INTERVAL_MS) return;
  lastSweepAt = now;
  for (const [ip, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(ip);
  }
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

export function rateLimit(
  ip: string,
  opts: { max: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  sweepIfDue(now);

  const bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true };
  }

  if (bucket.count < opts.max) {
    bucket.count += 1;
    return { ok: true };
  }

  const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  return { ok: false, retryAfterSeconds };
}

// Small helper so route handlers don't repeat the header-parsing
// dance. Vercel forwards the real client IP in x-forwarded-for;
// x-real-ip is a fallback for other proxies. "unknown" as a last
// resort means abusers behind stripped headers all share one bucket —
// still better than no limit.
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") || "unknown";
}

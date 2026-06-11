// Marketing attribution capture — runs once on the first page view of a
// session and stashes the result in localStorage so it survives the
// multi-page journey from landing to booking confirmation.
//
// The captured payload travels with the booking POST and gets persisted
// to bookings.attribution (JSONB). The admin then renders it on the
// booking detail page, so Diego can answer questions like:
//   "Which blog posts convert to bookings?"
//   "Is the Reddit traffic actually buying or just browsing?"
//   "Was that 5-booking day really driven by Instagram?"
//
// Design choices:
//   - First-touch attribution (not last-touch). Once captured, we never
//     overwrite, so a visitor who lands via Google then comes back
//     directly to book still gets credited to Google. This matches how
//     most growth teams think about marketing impact.
//   - Stored in localStorage (not cookies) — no consent banner needed
//     because we only ship to our own backend with the booking, never
//     to a third party.
//   - Versioned key so future schema changes don't get confused with
//     legacy entries.

const STORAGE_KEY = "ptcr:attribution:v1";

export type Attribution = {
  referrer?: string;
  referrer_domain?: string;
  landing_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  first_seen_at?: string;
  user_agent?: string;
};

function parseDomain(url: string): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    // Strip leading "www." so "www.google.com" and "google.com" group together.
    return u.hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function readStored(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Attribution;
  } catch {
    return null;
  }
}

function writeStored(attr: Attribution): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attr));
  } catch {
    // Quota exceeded / private mode — silently skip; attribution is
    // nice-to-have, not critical to the booking flow.
  }
}

/**
 * Capture marketing attribution from the current page. Idempotent — if
 * we already captured during this browser's session, returns the existing
 * value (first-touch attribution).
 *
 * Safe to call multiple times and on every page mount.
 */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};

  const existing = readStored();
  if (existing) return existing;

  const url = new URL(window.location.href);
  const params = url.searchParams;

  const referrer = document.referrer || undefined;
  const attr: Attribution = {
    referrer,
    referrer_domain: referrer ? parseDomain(referrer) : "direct",
    landing_page: url.pathname + (url.search || ""),
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_content: params.get("utm_content") || undefined,
    utm_term: params.get("utm_term") || undefined,
    first_seen_at: new Date().toISOString(),
    user_agent: navigator.userAgent,
  };

  writeStored(attr);
  return attr;
}

/**
 * Returns the stored attribution payload (or an empty object). Safe
 * during SSR — returns {} on the server.
 */
export function getAttribution(): Attribution {
  return readStored() ?? {};
}

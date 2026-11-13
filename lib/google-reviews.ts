// Server-side fetcher for live Google reviews via the Places API (New).
//
// Strategy: hit the Place Details endpoint once a day via Next.js ISR
// (`next.revalidate: 86400`). The 5 most recent 5-star reviews end up
// in the HTML at build/regen time, so the public ReviewCards section
// always shows fresh customer voices without a client-side widget.
//
// Cost: ~30 calls / month at $0.017 each ≈ $0.51, comfortably inside
// the Google Cloud free tier credit.

import "server-only";

// The business's Place ID on Google Maps. Found once via places:searchText
// and hardcoded — it never changes for a given business.
//
//   curl -X POST https://places.googleapis.com/v1/places:searchText \
//     -H 'X-Goog-Api-Key: $KEY' \
//     -H 'X-Goog-FieldMask: places.id,places.displayName' \
//     -d '{"textQuery":"Private Travel Costa Rica La Fortuna"}'
const PLACE_ID = "ChIJl0aOiIQNoI8R6KcwnmmDEw8";

export type GoogleReview = {
  id: string;
  authorName: string;
  authorPhotoUri?: string;
  authorUri?: string;
  rating: number;
  text: string;
  publishedAt: string; // ISO 8601
  relativeTime: string; // "3 months ago"
};

export type GoogleReviewsData = {
  rating: number;
  count: number;
  reviews: GoogleReview[];
};

// Fallback used when the API key isn't set or the network call fails.
// Counts are conservative — better to under-state than to over-state.
// Bumped 190 → 200 on 2026-06-22 when Diego flagged the count was
// stale. If the GOOGLE_PLACES_API_KEY env var is set, the live API
// result wins anyway; this only kicks in on cold start / API outage.
const FALLBACK: GoogleReviewsData = {
  rating: 5.0,
  count: 200,
  reviews: [],
};

// Process-level memo. Every route/hotel page calls getGoogleReviews() at
// build time (~1,200 pages), and the Next fetch cache did NOT collapse
// those into one request across build workers: the 2026-11-13 deploy
// logged 291 Google calls and blew the Places API daily quota (100
// GetPlace/day → HTTP 429 → every page fell back to zero reviews).
// Holding the in-flight promise here means one Google call per process
// per 24h regardless of how many pages render.
const MEMO_TTL_MS = 24 * 60 * 60 * 1000;
let memo: { promise: Promise<GoogleReviewsData>; at: number } | null = null;

export async function getGoogleReviews(): Promise<GoogleReviewsData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[google-reviews] GOOGLE_PLACES_API_KEY not set — using fallback");
    }
    return FALLBACK;
  }

  if (memo && Date.now() - memo.at < MEMO_TTL_MS) return memo.promise;
  const promise = fetchGoogleReviews(apiKey);
  memo = { promise, at: Date.now() };
  // A failed/quota-limited call must not be pinned for 24h, but hammering
  // Google on every page while the quota is exhausted is pointless too:
  // keep the fallback for 5 minutes, then let the next render retry.
  promise.then((d) => {
    if (d === FALLBACK && memo?.promise === promise) {
      memo.at = Date.now() - MEMO_TTL_MS + 5 * 60 * 1000;
    }
  });
  return promise;
}

async function fetchGoogleReviews(apiKey: string): Promise<GoogleReviewsData> {
  try {
    const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=rating,userRatingCount,reviews&key=${apiKey}`;
    const res = await fetch(url, {
      next: { revalidate: 86400 }, // daily refresh
    });

    if (!res.ok) {
      console.error("[google-reviews] HTTP", res.status, await res.text());
      return FALLBACK;
    }

    const data = await res.json();
    const reviews: GoogleReview[] = (data.reviews || []).map((r: any, i: number) => ({
      id: r.name?.split("/reviews/")[1] || `gr-${i}`,
      authorName: r.authorAttribution?.displayName || "Google reviewer",
      authorPhotoUri: r.authorAttribution?.photoUri,
      authorUri: r.authorAttribution?.uri,
      rating: r.rating || 5,
      text: r.text?.text || r.originalText?.text || "",
      publishedAt: r.publishTime || new Date().toISOString(),
      relativeTime: r.relativePublishTimeDescription || "",
    }));

    return {
      rating: data.rating ?? FALLBACK.rating,
      count: data.userRatingCount ?? FALLBACK.count,
      reviews,
    };
  } catch (err) {
    console.error("[google-reviews] fetch failed:", err);
    return FALLBACK;
  }
}

// Public URL of the business on Google Maps, for "see all reviews" links.
export const GOOGLE_MAPS_URL = `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`;

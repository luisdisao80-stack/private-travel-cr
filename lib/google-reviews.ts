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
const FALLBACK: GoogleReviewsData = {
  rating: 5.0,
  count: 190,
  reviews: [],
};

export async function getGoogleReviews(): Promise<GoogleReviewsData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[google-reviews] GOOGLE_PLACES_API_KEY not set — using fallback");
    }
    return FALLBACK;
  }

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

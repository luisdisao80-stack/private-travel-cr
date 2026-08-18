// Curated 5-star reviews shown on the home page.
// Sources: TripAdvisor + Google. Last updated 2026-05.
//
// Order: newest first. To add a Google review, paste it as a new object
// at the top with source: "google" and date in "Mon YYYY" format.

import { matchScore, detectPlaces } from "@/lib/locations";
// Type-only import: erased at compile time, so pulling in the (server-only)
// google-reviews module here does NOT drag its runtime guard into client
// bundles that import this file.
import type { GoogleReview } from "@/lib/google-reviews";

export type Review = {
  id: string;
  author: string;
  location: string;
  rating: 5;
  date: string; // "Dec 2025"
  title: string;
  body: string;
  source: "tripadvisor" | "google";
  travelType?: "Friends" | "Family" | "Couples" | "Solo" | "Business";
  /**
   * Places this review explicitly mentions, as lowercase alias tokens that
   * match the ALIASES table in lib/locations.ts (e.g. "la fortuna",
   * "manuel antonio", "san jose", "liberia", "tamarindo"). Used by
   * getRouteReviews() to surface a review on the pages of the exact routes
   * it talks about. Leave empty for generic reviews with no route mention.
   */
  places?: string[];
};

export const reviews: Review[] = [
  {
    id: "adsie65-jan-2026",
    author: "Adsie65",
    location: "London, United Kingdom",
    rating: 5,
    date: "Jan 2026",
    title: "A brilliant private transfer company",
    body:
      "Absolutely brilliant transfer company. Diego was incredibly easy and efficient to deal with. Very comfortable cars and delightful drivers who were incredibly prompt. Made our trip seamless and I can't recommend them highly enough.",
    source: "tripadvisor",
    travelType: "Couples",
    places: [],
  },
  {
    id: "katherine-j-dec-2025",
    author: "Katherine J",
    location: "TripAdvisor Reviewer",
    rating: 5,
    date: "Dec 2025",
    title: "Exceptional, Professional, and Reliable Private Transfers Across Costa Rica!",
    body:
      "Our experience with Private Travel Costa Rica was exceptional from start to finish. We used their service for multiple transfers, including from San Juan airport to La Fortuna, between locations in La Fortuna, and from Tamarindo to Liberia International Airport. Every driver was amazing—on time, flexible, and extremely professional. The responsiveness of the entire team made coordinating our travel seamless and stress-free. We highly recommend them for any transportation needs in Costa Rica.",
    source: "tripadvisor",
    travelType: "Friends",
    places: ["san jose", "la fortuna", "tamarindo", "liberia"],
  },
  {
    id: "ridi0406-dec-2025",
    author: "RIDI0406",
    location: "Madison, Wisconsin",
    rating: 5,
    date: "Dec 2025",
    title: "Professional and Reliable",
    body:
      "We used this company for transfers from La Fortuna to San Manuel Antonio and then from San Manuel Antonio to San Jose. I cannot say enough about the professionalism of the company and both the drivers, as well as the cleanliness of the vans. Communication was almost immediate. Our drivers Oscar and Carlos arrived a few minutes early, were highly professional, and super friendly and warm. There was wifi in the van which was much appreciated. All in all, both experiences were excellent. I cannot recommend this company enough. I will definitely use them again for transfers when we are back in CR.",
    source: "tripadvisor",
    travelType: "Family",
    places: ["la fortuna", "manuel antonio", "san jose"],
  },
  {
    id: "orli-b-jun-2024",
    author: "Orli B",
    location: "Oakland, California",
    rating: 5,
    date: "Jun 2024",
    title: "Excellent care and drive with Diego",
    body:
      "I was so glad I booked our transfer from La Fortuna to Manuel Antonio with Diego. He was communicative and professional from the time of booking, confirming everything and checking on our needs. He was friendly, kind, spoke great English, and made the long drive as pleasant as possible. I'd absolutely book again.",
    source: "tripadvisor",
    places: ["la fortuna", "manuel antonio"],
  },
  {
    id: "susie-e-jun-2024",
    author: "Susie E",
    location: "TripAdvisor Reviewer",
    rating: 5,
    date: "Jun 2024",
    title: "Safe, comfortable, courteous",
    body:
      "Great round trip experience from San Jose airport to Puerto Viejo and back. Carlos and Luis were safe, courteous and made sure we were comfortable.",
    source: "tripadvisor",
    travelType: "Couples",
    places: ["san jose", "puerto viejo"],
  },
  {
    id: "vacation-traveler-nov-2023",
    author: "Vacation Traveler",
    location: "TripAdvisor Reviewer",
    rating: 5,
    date: "Nov 2023",
    title: "Monteverde Day Tour",
    body:
      "Diego was a great driver and we really enjoyed our day with him. We stayed at the Westin Conchal and wanted to go to Monteverde for the day. Other drivers said we should not do it because it was too much for a day trip, but that's what we wanted to do, so I was very happy that Diego said no problem, even with picking us up at 8:00 AM and dropping us off very late at night. We got to do all the things on my list and see more of Costa Rica. He was a great communicator, on time always, great driver, car was immaculate, and we felt safe and comfortable all day. He recommended a great restaurant for us for lunch, took pics for us at the waterfalls, and got us everywhere we needed to be. Highly recommend his services!",
    source: "tripadvisor",
    travelType: "Couples",
    places: ["conchal", "monteverde"],
  },
];

/**
 * Reviews to show on a specific route page.
 *
 * Given a route's raw DB origin/destination names, we score each review by
 * how many of the two endpoints it explicitly mentions (via each review's
 * `places` tags, matched against the same alias table the quote search
 * uses). A review that names BOTH endpoints of this exact route wins; one
 * that names EITHER endpoint is still relevant.
 *
 * `routeSpecific` tells the caller whether it found genuinely on-route
 * reviews. When true, the section can honestly say "what travelers say about
 * <origin> → <destination>". When false, we fall back to the top general
 * reviews so every route page still carries real social proof — the caller
 * uses a generic heading in that case.
 */
// Convert a live Google review into our Review shape, auto-tagging the
// places it mentions so it can be route-matched just like a curated one.
function fromGoogle(g: GoogleReview): Review {
  return {
    id: `google-${g.id}`,
    author: g.authorName,
    location: "Google",
    rating: 5,
    date: g.relativeTime || "",
    title: "",
    body: g.text,
    source: "google",
    places: detectPlaces(g.text),
  };
}

export function getRouteReviews(
  origen: string,
  destino: string,
  // Live Google reviews (from lib/google-reviews). Folded into the candidate
  // pool so real, fresh Google voices can appear on the routes they mention.
  googleReviews: GoogleReview[] = [],
  limit = 3
): { reviews: Review[]; routeSpecific: boolean } {
  // Curated reviews first (they have titles + travel type), then any live
  // 5-star Google reviews with enough text to be worth showing.
  const pool: Review[] = [
    ...reviews,
    ...googleReviews.filter((g) => g.rating >= 5 && g.text.trim().length > 40).map(fromGoogle),
  ];

  const scored = pool.map((r) => {
    const places = r.places ?? [];
    const hitsOrigin = places.some((p) => matchScore(origen, p) > 0);
    const hitsDest = places.some((p) => matchScore(destino, p) > 0);
    return { review: r, score: (hitsOrigin ? 1 : 0) + (hitsDest ? 1 : 0) };
  });

  const onRoute = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.review);

  if (onRoute.length > 0) {
    return { reviews: onRoute.slice(0, limit), routeSpecific: true };
  }

  // No review names either endpoint — show the strongest general reviews
  // (curated first, then live Google) under a generic heading.
  return { reviews: pool.slice(0, limit), routeSpecific: false };
}

// Stats agregados para mostrar en el header de la sección
export const reviewStats = {
  google: {
    rating: 5.0,
    count: 200,
    // Was "https://g.co/kgs/cWkFwFM" — Google's KG short URL silently
    // failed on iOS Safari and various in-app browsers (Instagram, FB),
    // doing nothing on tap. Switched to the canonical search URL keyed
    // on our Place ID (same one in lib/google-reviews.ts), which opens
    // directly to the reviews list everywhere. Same Place ID is used
    // in the footer link, so we know it resolves reliably.
    url: "https://search.google.com/local/reviews?placeid=ChIJl0aOiIQNoI8R6KcwnmmDEw8",
  },
  tripadvisor: {
    rating: 5.0,
    count: 27,
    url: "https://www.tripadvisor.com/Attraction_Review-g309226-d25394648-Reviews-Private_Travel_Costa_Rica-La_Fortuna_de_San_Carlos_Arenal_Volcano_National_Park_.html",
    travelersChoiceYear: 2025,
  },
};

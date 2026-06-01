// Maps a route's origen + destino to relevant blog posts so the route
// detail page can surface "Read our travel guide" cards alongside the
// booking CTA. Two reasons it lives in a standalone module:
//   1) Same mapping is needed by both /private-shuttle/[slug] and
//      /routes/[slug] — pulling it out of the page components keeps
//      them DRY.
//   2) The keyword → slug lookup table is the kind of thing we'll edit
//      whenever a new blog post lands; isolating it makes the diffs
//      small and the review easy.
//
// Match strategy: exact origen-to-destino pairs win first (e.g. the
// "How to Get from SJO to La Fortuna" post pairs perfectly with the
// sjo-to-la-fortuna route). When there's no direct match, we fall back
// to destination-keyed guides (La Fortuna travel guide for any route
// to La Fortuna), then to general-interest pieces (7-day itinerary,
// shuttle pricing, family travel) so every route page gets at least
// 2 articles.

import type { BlogPostMeta } from "@/lib/blog";

type RouteKey = { origen: string; destino: string };

// Exact origen+destino pair → blog slug. Use the canonical DB names
// (e.g. "San Jose Airport", not "SJO" — the routes table stores the
// human-readable form). Highest priority.
const EXACT_PAIR_TO_SLUG: Record<string, string> = {
  "San Jose Airport→La Fortuna (Arenal)": "sjo-to-la-fortuna",
  "La Fortuna (Arenal)→Monteverde (Cloud Forest)": "la-fortuna-to-monteverde",
  "Liberia Airport→Tamarindo (Guanacaste)": "liberia-airport-to-tamarindo",
};

// Substring keyword in the destino → blog slugs. Used when no exact
// pair match exists. Order matters: first match wins per slug bucket.
const DESTINATION_KEYWORD_TO_SLUGS: Array<{ keyword: string; slugs: string[] }> = [
  {
    keyword: "La Fortuna",
    slugs: [
      "la-fortuna-travel-guide",
      "top-10-things-la-fortuna",
      "best-month-to-visit-la-fortuna",
      "best-restaurants-la-fortuna",
      "best-beaches-near-la-fortuna",
      "where-to-see-sloths-in-costa-rica",
    ],
  },
  {
    keyword: "Monteverde",
    slugs: ["monteverde-travel-guide", "la-fortuna-to-monteverde"],
  },
  {
    keyword: "Manuel Antonio",
    slugs: [
      "manuel-antonio-travel-guide",
      "manuel-antonio-vs-tamarindo",
      "where-to-see-sloths-in-costa-rica",
    ],
  },
  {
    keyword: "Tamarindo",
    slugs: ["tamarindo-travel-guide", "manuel-antonio-vs-tamarindo", "liberia-airport-to-tamarindo"],
  },
];

// Substring keyword in the origen → extra slugs (mostly airport-arrival
// reads for routes that start at SJO/LIR). Applied after destination
// match so airport guides supplement the destination guide.
const ORIGIN_KEYWORD_TO_SLUGS: Array<{ keyword: string; slugs: string[] }> = [
  { keyword: "San Jose Airport", slugs: ["sjo-airport-arrival-guide"] },
  { keyword: "Liberia Airport", slugs: ["liberia-airport-to-tamarindo"] },
];

// Always-relevant fallbacks. We pull from here when the route is too
// niche to have any keyword match, or to top up to the desired count.
const GENERAL_FALLBACK_SLUGS = [
  "costa-rica-7-day-itinerary",
  "how-much-does-costa-rica-shuttle-cost",
  "shuttle-vs-uber-vs-taxi-costa-rica",
  "family-travel-costa-rica",
  "honeymoon-costa-rica",
  "best-time-to-visit-costa-rica",
  "costa-rica-without-rental-car",
  "where-to-see-sloths-in-costa-rica",
  "best-beaches-costa-rica",
  "costa-rica-packing-list",
  "costa-rica-vs-mexico-vacation",
  "do-i-need-spanish-costa-rica",
];

/** Returns up to `limit` blog posts most relevant to the given route.
 *  Pass in `allPosts` from getAllPosts() — this fn does the filtering
 *  and dedup so the caller doesn't have to. */
export function getRelatedArticles(
  route: RouteKey,
  allPosts: BlogPostMeta[],
  limit = 3,
): BlogPostMeta[] {
  const bySlug = new Map(allPosts.map((p) => [p.slug, p]));
  const picked: string[] = [];

  const push = (slug: string) => {
    if (picked.length >= limit) return;
    if (picked.includes(slug)) return;
    if (!bySlug.has(slug)) return; // safety — skip slugs whose file was deleted
    picked.push(slug);
  };

  // 1. Exact origen→destino pair (highest priority).
  const exactKey = `${route.origen}→${route.destino}`;
  const exactMatch = EXACT_PAIR_TO_SLUG[exactKey];
  if (exactMatch) push(exactMatch);

  // 2. Destination keyword guides (e.g. "La Fortuna travel guide" for
  //    any route ending in La Fortuna).
  for (const { keyword, slugs } of DESTINATION_KEYWORD_TO_SLUGS) {
    if (route.destino.includes(keyword)) {
      slugs.forEach(push);
    }
  }

  // 3. Origin keyword extras (airport arrival guides).
  for (const { keyword, slugs } of ORIGIN_KEYWORD_TO_SLUGS) {
    if (route.origen.includes(keyword)) {
      slugs.forEach(push);
    }
  }

  // 4. General fallbacks until we hit `limit`.
  for (const slug of GENERAL_FALLBACK_SLUGS) {
    push(slug);
  }

  return picked.map((slug) => bySlug.get(slug)!);
}

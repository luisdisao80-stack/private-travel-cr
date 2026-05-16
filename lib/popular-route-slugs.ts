// Client-side shortcut for the most common booking paths. When both legs of
// the user's selection are in the "popular" set AND the resulting slug
// exists in the DB, the Hero can navigate directly to the SEO landing
// page (`/private-shuttle/<slug>`) without bouncing through /book.
//
// Eliminates 200–500ms of round-trip + DB lookup on ~80% of bookings.
// Payload cost: ~1KB of inlined static data (no Supabase query at runtime).

// DB origen name → short slug fragment used in popular-pair URLs.
const POPULAR_SHORT: Record<string, string> = {
  "La Fortuna (Arenal)": "la-fortuna",
  "SJO - Juan Santamaria Int. Airport": "sjo",
  "LIR - Liberia Int. Airport": "lir",
  "Monteverde (Cloud Forest)": "monteverde",
  "Manuel Antonio / Quepos": "manuel-antonio",
  "Tamarindo (Guanacaste)": "tamarindo",
  "Conchal (Guanacaste)": "conchal",
  "Papagayo Peninsula, Guanacaste": "papagayo",
  Jaco: "jaco",
  "Puerto Viejo (Caribbean Coast)": "puerto-viejo",
  "Santa Teresa (Nicoya Peninsula)": "santa-teresa",
};

// All popular-pair slugs that actually exist in the routes table.
// Generated from data/migration/new-route-slugs.txt — regenerate if popular
// pairs are added/removed in the DB.
const POPULAR_PAIR_SLUGS = new Set<string>([
  "conchal-to-jaco",
  "conchal-to-la-fortuna",
  "conchal-to-monteverde",
  "conchal-to-santa-teresa",
  "jaco-to-conchal",
  "jaco-to-la-fortuna",
  "jaco-to-monteverde",
  "jaco-to-tamarindo",
  "la-fortuna-to-conchal",
  "la-fortuna-to-jaco",
  "la-fortuna-to-lir",
  "la-fortuna-to-manuel-antonio",
  "la-fortuna-to-monteverde",
  "la-fortuna-to-papagayo",
  "la-fortuna-to-puerto-viejo",
  "la-fortuna-to-santa-teresa",
  "la-fortuna-to-sjo",
  "la-fortuna-to-tamarindo",
  "lir-to-la-fortuna",
  "lir-to-monteverde",
  "lir-to-papagayo",
  "monteverde-to-conchal",
  "monteverde-to-jaco",
  "monteverde-to-la-fortuna",
  "monteverde-to-manuel-antonio",
  "monteverde-to-puerto-viejo",
  "monteverde-to-santa-teresa",
  "monteverde-to-sjo",
  "monteverde-to-tamarindo",
  "puerto-viejo-to-la-fortuna",
  "puerto-viejo-to-monteverde",
  "santa-teresa-to-conchal",
  "santa-teresa-to-la-fortuna",
  "santa-teresa-to-monteverde",
  "santa-teresa-to-tamarindo",
  "sjo-to-la-fortuna",
  "sjo-to-manuel-antonio",
  "sjo-to-monteverde",
  "sjo-to-puerto-viejo",
  "sjo-to-tamarindo",
  "tamarindo-to-jaco",
  "tamarindo-to-la-fortuna",
  "tamarindo-to-monteverde",
  "tamarindo-to-santa-teresa",
]);

// Returns /private-shuttle/<slug> when both DB names map to popular short
// slugs AND the resulting pair exists in the DB. Null otherwise — caller
// should fall back to /book?from=X&to=Y (which does the server-side smart
// redirect for non-popular pairs).
export function popularDirectUrl(from: string, to: string): string | null {
  const fromShort = POPULAR_SHORT[from];
  const toShort = POPULAR_SHORT[to];
  if (!fromShort || !toShort) return null;

  const slug = `${fromShort}-to-${toShort}`;
  if (!POPULAR_PAIR_SLUGS.has(slug)) return null;

  return `/private-shuttle/${slug}`;
}

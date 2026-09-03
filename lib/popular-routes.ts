// Popular destinations between which we publish dedicated SEO landing pages at
// /private-shuttle/[slug]. These names must match the `origen`/`destino` values
// stored in Supabase exactly.

export const POPULAR_DESTINATIONS: readonly string[] = [
  "La Fortuna (Arenal)",
  "SJO - Juan Santamaria Int. Airport",
  "LIR - Liberia Int. Airport",
  "Monteverde (Cloud Forest)",
  "Manuel Antonio / Quepos",
  "Tamarindo (Guanacaste)",
  "Conchal (Guanacaste)",
  "Papagayo Peninsula, Guanacaste",
  "Jaco",
  "Puerto Viejo (Caribbean Coast)",
  "Santa Teresa (Nicoya Peninsula)",
  // Diego 2026-08-27: both sell well through payment links, which never show
  // up in the bookings table — so the web-only numbers understated them.
  "Flamingo (Guanacaste)",
  "Las Catalinas, Guanacaste",
  // Diego 2026-09-03: 27 tramos vendidos y no había NI UNA página indexable.
  // Era el hueco más grande del sitio — todo ese tráfico se iba a /routes/,
  // que no se indexa. Suma 26 páginas nuevas.
  "San Jose Downtown",
] as const;

const popularSet = new Set<string>(POPULAR_DESTINATIONS);

export function isPopularRoute(origen: string, destino: string): boolean {
  return popularSet.has(origen) && popularSet.has(destino);
}

/**
 * Diego 2026-09-03: "quiero enfocar la atención de Google en esas páginas que
 * son las que más venden".
 *
 * POPULAR_DESTINATIONS is too coarse for that. Fourteen destinations means 150
 * published pages, and the site treated all 150 as equally important — same
 * sitemap priority, same odds of being linked. These are the pairs Diego named
 * as the ones that actually sell. They are the 34 pages (17 pairs × 2
 * directions) that everything else on the site should point at.
 *
 * Unordered pairs, like isPopularRoute: a top route is a top route in both
 * directions. Note SJO↔La Fortuna and LIR↔La Fortuna each appear once here even
 * though Diego listed them twice (once from the airport, once from La Fortuna).
 */
export const TOP_PAIRS: readonly (readonly [string, string])[] = [
  // desde el aeropuerto de San José
  ["SJO - Juan Santamaria Int. Airport", "La Fortuna (Arenal)"],
  ["SJO - Juan Santamaria Int. Airport", "Puerto Viejo (Caribbean Coast)"],
  ["SJO - Juan Santamaria Int. Airport", "Manuel Antonio / Quepos"],
  ["SJO - Juan Santamaria Int. Airport", "Monteverde (Cloud Forest)"],
  ["SJO - Juan Santamaria Int. Airport", "Tamarindo (Guanacaste)"],
  ["SJO - Juan Santamaria Int. Airport", "Conchal (Guanacaste)"],
  // desde el aeropuerto de Liberia
  ["LIR - Liberia Int. Airport", "La Fortuna (Arenal)"],
  ["LIR - Liberia Int. Airport", "Monteverde (Cloud Forest)"],
  ["LIR - Liberia Int. Airport", "Tamarindo (Guanacaste)"],
  ["LIR - Liberia Int. Airport", "Conchal (Guanacaste)"],
  ["LIR - Liberia Int. Airport", "Papagayo Peninsula, Guanacaste"],
  ["LIR - Liberia Int. Airport", "Santa Teresa (Nicoya Peninsula)"],
  // desde La Fortuna
  ["La Fortuna (Arenal)", "Tamarindo (Guanacaste)"],
  ["La Fortuna (Arenal)", "Conchal (Guanacaste)"],
  ["La Fortuna (Arenal)", "Papagayo Peninsula, Guanacaste"],
  ["La Fortuna (Arenal)", "Monteverde (Cloud Forest)"],
  ["La Fortuna (Arenal)", "Manuel Antonio / Quepos"],
] as const;

// El separador se escribe como escape a propósito. Un byte NUL crudo en el
// fuente hace que git trate el archivo como binario: se pierde el diff por
// líneas y nadie puede volver a revisar este archivo. Sirve como separador
// porque ningún nombre de lugar lo contiene, así que "A"+"BC" nunca choca
// con "AB"+"C".
const pairKey = (a: string, b: string) => [a, b].sort().join("\u0000");
const topSet = new Set<string>(TOP_PAIRS.map(([a, b]) => pairKey(a, b)));

/** True for both directions of the pairs Diego named as the best sellers. */
export function isTopRoute(origen: string, destino: string): boolean {
  return topSet.has(pairKey(origen, destino));
}

/** 34 when every pair has both directions in the database. */
export const TOP_PAIR_COUNT = TOP_PAIRS.length;

/**
 * Canonical URL for a route page, or null when the row has no slug and is
 * therefore unlinkable. Popular pairs get the /private-shuttle/ landing page;
 * everything else stays on /routes/. Every internal link to a route must go
 * through this — linking the wrong tier costs a redirect hop and splits the
 * signal between two URLs for the same pair.
 *
 * `routes.slug` is nullable in the schema, and callers used to interpolate it
 * straight into the href, which silently produced links to "/routes/null".
 * Returning null forces the caller to skip those rows instead.
 */
export function routeHref(route: {
  origen: string;
  destino: string;
  slug: string | null;
}): string | null {
  if (!route.slug) return null;
  return isPopularRoute(route.origen, route.destino)
    ? `/private-shuttle/${route.slug}`
    : `/routes/${route.slug}`;
}

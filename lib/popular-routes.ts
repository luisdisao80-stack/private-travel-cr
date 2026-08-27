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
] as const;

const popularSet = new Set<string>(POPULAR_DESTINATIONS);

export function isPopularRoute(origen: string, destino: string): boolean {
  return popularSet.has(origen) && popularSet.has(destino);
}

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

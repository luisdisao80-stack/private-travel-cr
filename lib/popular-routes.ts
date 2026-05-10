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
] as const;

const popularSet = new Set<string>(POPULAR_DESTINATIONS);

export function isPopularRoute(origen: string, destino: string): boolean {
  return popularSet.has(origen) && popularSet.has(destino);
}

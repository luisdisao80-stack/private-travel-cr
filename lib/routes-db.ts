import { supabase } from "./supabase";
import type { Route } from "./types";
import { isPopularRoute, isTopRoute } from "./popular-routes";

// Supabase returns max 1000 rows per request; paginate for the full 1240+ routes.
const PAGE_SIZE = 1000;

async function fetchAllRoutesPaginated(filter?: { is_indexable?: boolean }): Promise<Route[]> {
  const all: Route[] = [];
  let page = 0;

  while (true) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("routes")
      .select("*")
      .order("origen", { ascending: true })
      .order("destino", { ascending: true })
      .range(from, to);

    if (filter?.is_indexable) query = query.eq("is_indexable", true);

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching routes:", error);
      return all;
    }
    if (!data || data.length === 0) break;

    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    page++;
  }

  return all;
}

export async function getAllRoutes(): Promise<Route[]> {
  return fetchAllRoutesPaginated();
}

export async function getIndexableRoutes(): Promise<Route[]> {
  return fetchAllRoutesPaginated({ is_indexable: true });
}

/**
 * getIndexableRoutes() con memoria, para quien lo llama una vez por página.
 *
 * getRelatedRoutes necesita la tabla entera para elegir a dónde enlazar, y se
 * ejecuta en las ~640 páginas de ruta. Sin esto serían 640 recorridos de las
 * 1.618 filas, de a 1.000 por request: el build pasa de minutos a mucho más.
 * Next 15 ya no cachea fetch por defecto, así que no alcanza con confiar en él.
 *
 * El TTL es el mismo `revalidate = 86400` que tienen las páginas de ruta, o sea
 * que los enlaces no pueden quedar más viejos que la página que los muestra.
 */
const TTL_MS = 86_400_000;
let cacheRutas: { at: number; rows: Promise<Route[]> } | null = null;

export function getIndexableRoutesCached(): Promise<Route[]> {
  if (!cacheRutas || Date.now() - cacheRutas.at > TTL_MS) {
    const rows = fetchAllRoutesPaginated({ is_indexable: true });
    // Si falla, que no quede el rechazo pegado en memoria para siempre.
    rows.catch(() => {
      cacheRutas = null;
    });
    cacheRutas = { at: Date.now(), rows };
  }
  return cacheRutas.rows;
}

export async function getRouteBySlug(slug: string): Promise<Route | null> {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(`Error fetching route ${slug}:`, error);
    return null;
  }
  return data;
}

export async function getIndexableSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 0;

  while (true) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("routes")
      .select("slug")
      .eq("is_indexable", true)
      .range(from, to);

    if (error) {
      console.error("Error fetching slugs:", error);
      return slugs;
    }
    if (!data || data.length === 0) break;

    slugs.push(...data.map(r => r.slug).filter(Boolean) as string[]);
    if (data.length < PAGE_SIZE) break;
    page++;
  }

  return slugs;
}

// All indexable routes from a given origen. Used by hotel landing pages
// to build the "shuttle from <hotel>" pricing grid.
export async function getRoutesFromOrigen(origen: string): Promise<Route[]> {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("origen", origen)
    .eq("is_indexable", true)
    .order("precio1a6", { ascending: true });
  if (error) {
    console.error(`Error fetching routes from ${origen}:`, error);
    return [];
  }
  return data || [];
}

// All indexable routes INTO a given destino, cheapest first. Powers the
// destination hub pages (/shuttle-to/[slug]) — "every way to reach <place>".
export async function getRoutesToDestino(destino: string): Promise<Route[]> {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("destino", destino)
    .eq("is_indexable", true)
    .order("precio1a6", { ascending: true });
  if (error) {
    console.error(`Error fetching routes to ${destino}:`, error);
    return [];
  }
  return data || [];
}

/**
 * "More routes from here" — the block at the bottom of every route page.
 *
 * This used to be `.eq("origen", origen).limit(4)` with no ordering, which
 * handed Postgres four arbitrary rows out of however many share that origin.
 * On sjo-to-la-fortuna that is a pool of ~100, so the block filled up with
 * sjo-to-puntarenas and la-fortuna-to-rincon-de-la-vieja. Measured on 12 live
 * pages: HALF the outbound route links pointed at the /routes/ long tail.
 *
 * That matters more than it looks. There are ~640 route pages, each with four
 * of these links — roughly 2,500 internal links, which is most of the site's
 * link graph. Scattering them at random tells Google every page is equally
 * important. Diego's ask (2026-09-03) was the opposite: point the site at the
 * pages that actually sell.
 *
 * So the four slots now fill in this order:
 *   1. the reverse of this exact trip — the most useful link on the page for
 *      an actual visitor, and it is a top page whenever the forward one is;
 *   2. best sellers that share an endpoint with this route (still on-topic:
 *      from SJO you get the other SJO runs);
 *   3. any other best seller, rotated by slug so the links spread across all
 *      34 instead of piling onto whichever four sort first;
 *   4. other /private-shuttle/ pairs from the same origin;
 *   5. same-origin long tail, only if nothing above filled the slot.
 *
 * Relevance still comes first — a rule that linked unrelated routes would be
 * both worse for the visitor and read as link scheming. Rule 5 is what keeps
 * the block honest on a page with no top-selling neighbours at all.
 */
export async function getRelatedRoutes(
  route: Pick<Route, "origen" | "destino" | "slug">,
  limit = 4,
): Promise<Route[]> {
  const all = await getIndexableRoutesCached();
  const pool = all.filter((r) => r.slug && r.slug !== route.slug);

  const picked: Route[] = [];
  const seen = new Set<string>();
  const take = (rows: Route[]) => {
    for (const r of rows) {
      if (picked.length >= limit) return;
      if (seen.has(r.slug as string)) continue;
      seen.add(r.slug as string);
      picked.push(r);
    }
  };

  const top = pool.filter((r) => isTopRoute(r.origen, r.destino));
  const sharesEndpoint = (r: Route) =>
    r.origen === route.origen || r.destino === route.destino || r.origen === route.destino || r.destino === route.origen;

  // 1. la vuelta de este mismo viaje
  take(pool.filter((r) => r.origen === route.destino && r.destino === route.origen));

  // 2. best sellers que comparten una punta con esta ruta
  take(rotar(top.filter(sharesEndpoint), route.slug));

  // 3. el resto de best sellers
  take(rotar(top.filter((r) => !sharesEndpoint(r)), route.slug));

  // 4. y 5. relleno: mismo origen, primero las que tienen página propia
  const mismoOrigen = pool.filter((r) => r.origen === route.origen).sort(bySlug);
  take(mismoOrigen.filter((r) => isPopularRoute(r.origen, r.destino)));
  take(mismoOrigen);

  return picked;
}

const bySlug = (a: Route, b: Route) => (a.slug ?? "").localeCompare(b.slug ?? "");

/**
 * Ordena por slug y después corta el arranque según de qué página venimos.
 *
 * Sin esto el desempate era alfabético puro y siempre ganaban los mismos: en la
 * primera medición la-fortuna-to-sjo se llevaba 107 enlaces y sjo-to-la-fortuna
 * 13, que es justo al revés de lo que conviene — sjo-to-la-fortuna es la página
 * con más búsquedas de todas. Rotar reparte sin perder relevancia: cada página
 * elige del mismo grupo, pero empieza en otro punto.
 *
 * Determinista a propósito. Si esto fuera al azar, cada build cambiaría los
 * enlaces internos de las 640 páginas y Google vería un sitio que se reescribe
 * solo.
 */
function rotar(rows: Route[], desde: string | null): Route[] {
  if (rows.length < 2) return rows;
  const ordenadas = [...rows].sort(bySlug);
  const i = hashSlug(desde ?? "") % ordenadas.length;
  return [...ordenadas.slice(i), ...ordenadas.slice(0, i)];
}

// Hash chico y estable: solo sirve para elegir por dónde empezar a repartir,
// no tiene que ser bueno, tiene que dar siempre lo mismo para el mismo slug.
function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * COTIZADOR: Obtener todas las locations únicas (orígenes + destinos)
 * IMPORTANTE: Usa paginación para traer TODAS las 1240 rutas
 */
export async function getAllLocations(): Promise<string[]> {
  const allOrigenes: string[] = [];
  const allDestinos: string[] = [];
  
  // Paginar para traer todas las rutas (más de 1000)
  const PAGE_SIZE = 1000;
  let page = 0;
  let hasMore = true;
  
  while (hasMore) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    
    const { data, error } = await supabase
      .from("routes")
      .select("origen, destino")
      .range(from, to);
    
    if (error || !data || data.length === 0) {
      hasMore = false;
      break;
    }
    
    data.forEach(r => {
      if (r.origen) allOrigenes.push(r.origen);
      if (r.destino) allDestinos.push(r.destino);
    });
    
    if (data.length < PAGE_SIZE) {
      hasMore = false;
    } else {
      page++;
    }
  }
  
  const allLocations = new Set<string>();
  allOrigenes.forEach(o => allLocations.add(o));
  allDestinos.forEach(d => allLocations.add(d));
  
  return Array.from(allLocations).sort();
}

/**
 * COTIZADOR: Obtener UNA ruta por origen + destino
 */
export async function getRouteByLocations(origen: string, destino: string): Promise<Route | null> {
  // Try forward: origen -> destino
  const result1 = await supabase
    .from("routes")
    .select("*")
    .eq("origen", origen)
    .eq("destino", destino)
    .maybeSingle();

  if (result1.data) return result1.data as Route;

  // Try reverse: destino -> origen
  const result2 = await supabase
    .from("routes")
    .select("*")
    .eq("origen", destino)
    .eq("destino", origen)
    .maybeSingle();

  return (result2.data as Route) || null;
}

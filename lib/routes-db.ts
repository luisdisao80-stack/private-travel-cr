import { supabase } from "./supabase";
import type { Route } from "./types";

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

export async function getRelatedRoutes(origen: string, currentSlug: string, limit = 4): Promise<Route[]> {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("origen", origen)
    .neq("slug", currentSlug)
    .eq("is_indexable", true)
    .limit(limit);

  if (error) return [];
  return data || [];
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

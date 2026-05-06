import { supabase } from "./supabase";
import type { Route } from "./types";

/**
 * Obtener TODAS las rutas (para listado)
 */
export async function getAllRoutes(): Promise<Route[]> {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .order("origen", { ascending: true })
    .order("destino", { ascending: true });

  if (error) {
    console.error("Error fetching routes:", error);
    return [];
  }
  return data || [];
}

/**
 * Obtener SOLO rutas indexables (para sitemap y SEO)
 */
export async function getIndexableRoutes(): Promise<Route[]> {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("is_indexable", true)
    .order("origen", { ascending: true });

  if (error) {
    console.error("Error fetching indexable routes:", error);
    return [];
  }
  return data || [];
}

/**
 * Obtener UNA ruta por slug (para página individual)
 */
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

/**
 * Obtener slugs de rutas indexables (para generateStaticParams)
 */
export async function getIndexableSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from("routes")
    .select("slug")
    .eq("is_indexable", true);

  if (error) {
    console.error("Error fetching slugs:", error);
    return [];
  }
  return (data || []).map(r => r.slug).filter(Boolean) as string[];
}

/**
 * Obtener rutas relacionadas (mismo origen)
 */
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
 */
export async function getAllLocations(): Promise<string[]> {
  const { data: origenes } = await supabase
    .from("routes")
    .select("origen");
  
  const { data: destinos } = await supabase
    .from("routes")
    .select("destino");
  
  const allLocations = new Set<string>();
  (origenes || []).forEach(r => r.origen && allLocations.add(r.origen));
  (destinos || []).forEach(r => r.destino && allLocations.add(r.destino));
  
  return Array.from(allLocations).sort();
}

/**
 * COTIZADOR: Obtener UNA ruta por origen + destino
 * Busca en ambas direcciones (origen->destino o destino->origen)
 */
export async function getRouteByLocations(origen: string, destino: string): Promise<Route | null> {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .or(`and(origen.eq.${origen},destino.eq.${destino}),and(origen.eq.${destino},destino.eq.${origen})`)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching route ${origen} -> ${destino}:`, error);
    return null;
  }
  return data;
}

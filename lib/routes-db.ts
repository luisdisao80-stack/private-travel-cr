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

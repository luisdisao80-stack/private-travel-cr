import { supabase } from "./supabase";
import type { Hotel } from "./types";

export async function getAllHotels(): Promise<Hotel[]> {
  const { data, error } = await supabase
    .from("hotels")
    .select("*")
    .order("city", { ascending: true })
    .order("name", { ascending: true });
  if (error) {
    console.error("Error fetching hotels:", error);
    return [];
  }
  return data || [];
}

export async function getIndexableHotelSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from("hotels")
    .select("slug")
    .eq("is_indexable", true);
  if (error) return [];
  return (data || []).map((h) => h.slug).filter(Boolean);
}

export async function getHotelBySlug(slug: string): Promise<Hotel | null> {
  const { data, error } = await supabase
    .from("hotels")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error(`Error fetching hotel ${slug}:`, error);
    return null;
  }
  return data;
}

// All hotels mapped to a given area_origen (matches routes.origen exactly).
// Used by route detail pages to cross-link to hotels at the destination —
// e.g., /routes/sjo-to-la-fortuna shows "Top hotels in La Fortuna (Arenal)".
//
// Ordered by priority DESC (manually curated top tier first) then name —
// without that, alphabetical sort would push "Arenal Paraíso" above the
// actually-flagship "Tabacón" / "Nayara" simply because of the A prefix.
export async function getHotelsByArea(
  area: string,
  limit = 8
): Promise<Hotel[]> {
  const { data, error } = await supabase
    .from("hotels")
    .select("*")
    .eq("area_origen", area)
    .eq("is_indexable", true)
    .order("priority", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true })
    .limit(limit);
  if (error) {
    console.error(`Error fetching hotels for area ${area}:`, error);
    return [];
  }
  return data || [];
}

// Hotels in the same city, excluding the current one — for "Other hotels
// in <city>" cross-linking at the bottom of a hotel page.
export async function getRelatedHotels(
  city: string,
  currentSlug: string,
  limit = 4
): Promise<Hotel[]> {
  const { data, error } = await supabase
    .from("hotels")
    .select("*")
    .eq("city", city)
    .neq("slug", currentSlug)
    .eq("is_indexable", true)
    .limit(limit);
  if (error) return [];
  return data || [];
}

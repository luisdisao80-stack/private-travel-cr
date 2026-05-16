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

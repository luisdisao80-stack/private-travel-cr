// Data access for the tours catalog (initially La Fortuna, sourced from
// Canoa Aventura). Mirrors hotels-db / routes-db patterns so consumers
// don't have to learn a new shape.

import { supabase } from "./supabase";
import type { Tour } from "./types";

export async function getAllTours(): Promise<Tour[]> {
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("is_active", true)
    .order("priority", { ascending: false })
    .order("name", { ascending: true });
  if (error) {
    console.error("[tours-db] getAllTours:", error);
    return [];
  }
  return (data || []) as Tour[];
}

export async function getToursByRegion(region: string): Promise<Tour[]> {
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("is_active", true)
    .eq("region", region)
    .order("priority", { ascending: false })
    .order("name", { ascending: true });
  if (error) {
    console.error("[tours-db] getToursByRegion:", error);
    return [];
  }
  return (data || []) as Tour[];
}

export async function getFeaturedTours(limit = 6): Promise<Tour[]> {
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("priority", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[tours-db] getFeaturedTours:", error);
    return [];
  }
  return (data || []) as Tour[];
}

export async function getTourBySlug(slug: string): Promise<Tour | null> {
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) {
    console.error("[tours-db] getTourBySlug:", error);
    return null;
  }
  return (data || null) as Tour | null;
}

export async function getIndexableTourSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from("tours")
    .select("slug")
    .eq("is_active", true)
    .eq("is_indexable", true);
  if (error) return [];
  return (data || []).map((t) => t.slug).filter(Boolean) as string[];
}

// Pricing helpers — single source of truth for the customer total so the
// UI, the cart, and the server-side payment route all agree.

export type TourQuoteInput = {
  adults: number;
  children: number;
};

export type TourQuote = {
  adults: number;
  children: number;
  adultUnitPrice: number;
  childUnitPrice: number | null;
  adultSubtotal: number;
  childSubtotal: number;
  total: number;
};

export function quoteTour(tour: Tour, input: TourQuoteInput): TourQuote {
  const adults = Math.max(0, Math.floor(input.adults || 0));
  const children = Math.max(0, Math.floor(input.children || 0));
  const adultUnit = Number(tour.adult_price) || 0;
  const childUnit = tour.child_price == null ? null : Number(tour.child_price);
  const adultSubtotal = adults * adultUnit;
  const childSubtotal = childUnit != null ? children * childUnit : 0;
  return {
    adults,
    children,
    adultUnitPrice: adultUnit,
    childUnitPrice: childUnit,
    adultSubtotal,
    childSubtotal,
    total: Math.round((adultSubtotal + childSubtotal) * 100) / 100,
  };
}

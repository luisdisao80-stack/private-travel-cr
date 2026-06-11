// lib/quote-helpers.ts
// Helpers para el cotizador - usa precios reales de Supabase

import type { Route } from "./types";

export const VIP_EXTRA_USD = 80;

export type ServiceType = "standard" | "vip";
export type VehicleType = "staria" | "hiace" | "maxus";

export const AIRPORT_NAMES = [
  "SJO - Juan Santamaria Int. Airport",
  "LIR - Liberia Int. Airport",
];

export function isAirport(locationName: string): boolean {
  return AIRPORT_NAMES.includes(locationName);
}

// Tier boundaries (set 2026-06-11): Staria caps at 5, Hiace covers 6-9.
// The Supabase column names `precio1a6` and `precio7a9` are now misleading
// labels (precio1a6 actually holds the 1-5 price, precio7a9 holds the
// 6-9 price) but we kept them to avoid a destructive rename + redeploy
// against thousands of route rows. Treat the column names as internal
// identifiers; user-facing copy below uses 1-5 / 6-9 throughout.
export function getVehicleForPax(totalPax: number): VehicleType {
  if (totalPax <= 5) return "staria";
  if (totalPax <= 9) return "hiace";
  return "maxus";
}

export function getPriceForGroupSize(route: Route, totalPax: number): number {
  if (totalPax <= 5) {
    return route.precio1a6 || 0;
  }
  if (totalPax <= 9) {
    return route.precio7a9 || route.precio1a6 || 0;
  }
  if (totalPax <= 12) {
    return route.precio10a12 || route.precio7a9 || route.precio1a6 || 0;
  }
  return route.precio13a18 || route.precio10a12 || route.precio7a9 || route.precio1a6 || 0;
}

export function calculateAllPricesFromRoute(route: Route): {
  stariaStandard: number;
  stariaVip: number;
  hiaceStandard: number;
  hiaceVip: number;
} {
  const stariaStandard = route.precio1a6 || 0;
  const hiaceStandard = route.precio7a9 || route.precio1a6 || 0;
  return {
    stariaStandard,
    stariaVip: stariaStandard + VIP_EXTRA_USD,
    hiaceStandard,
    hiaceVip: hiaceStandard + VIP_EXTRA_USD,
  };
}

export function parseDurationToMinutes(duracion: string | null): number {
  if (!duracion) return 180;
  const cleaned = duracion.replace("H", "").replace(",", ".").trim();
  const hours = parseFloat(cleaned);
  return Math.round(hours * 60);
}

export function formatDuration(duracion: string | null): string {
  if (!duracion) return "3h";
  const cleaned = duracion.replace("H", "").replace(",", ".").trim();
  const hours = parseFloat(cleaned);
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  if (minutes === 0) return wholeHours + "h";
  return wholeHours + "h " + minutes + "min";
}

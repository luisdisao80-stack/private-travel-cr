// lib/quote-helpers.ts
// Helpers para el cotizador - usa precios reales de Supabase

import type { Route } from "./types";

export const VIP_EXTRA_USD = 70;

export type ServiceType = "standard" | "vip";
export type VehicleType = "staria" | "hiace";

export const AIRPORT_NAMES = [
  "SJO - Juan Santamaria Int. Airport",
  "LIR - Liberia Int. Airport",
];

export function isAirport(locationName: string): boolean {
  return AIRPORT_NAMES.includes(locationName);
}

export function getVehicleForPax(totalPax: number): VehicleType {
  return totalPax <= 6 ? "staria" : "hiace";
}

export function getPriceForGroupSize(route: Route, totalPax: number): number {
  if (totalPax <= 6) {
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

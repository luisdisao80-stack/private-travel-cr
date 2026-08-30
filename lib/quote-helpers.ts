// lib/quote-helpers.ts
// Helpers para el cotizador - usa precios reales de Supabase

import type { Route } from "./types";

export const VIP_EXTRA_USD = 80;

// Late-night pickup surcharge. Drivers pick up between 11:00 PM and 5:00 AM
// get a flat $30 extra per trip (unsocial-hours pay + empty return legs at
// night). Applies to the PICKUP time the customer selects, in Costa Rica
// local time (pickupTime is stored as "HH:MM"). Window: 23:00–04:59.
export const NIGHT_SURCHARGE_USD = 30;

export function isNightPickup(pickupTime: string | null | undefined): boolean {
  if (!pickupTime) return false;
  const m = /^(\d{1,2}):(\d{2})$/.exec(pickupTime.trim());
  if (!m) return false;
  const hour = parseInt(m[1], 10);
  if (Number.isNaN(hour)) return false;
  // 11 PM (23) through 4:59 AM (hour < 5).
  return hour >= 23 || hour < 5;
}

export function nightSurchargeFor(pickupTime: string | null | undefined): number {
  return isNightPickup(pickupTime) ? NIGHT_SURCHARGE_USD : 0;
}

// Precio por hora de parada extra. Vivía duplicado como una const local en
// QuoteCalculatorV2 y en BookingForm; ahora que el checkout también
// recalcula precios (fecha/hora/pasajeros editables ahí) tiene que haber
// UNA sola fuente de verdad o las dos pantallas se desincronizan.
export const EXTRA_STOP_PRICE_USD = 35;

// Grupo máximo que despachamos por la web. Arriba de eso Diego cotiza a
// mano por WhatsApp (hacen falta 2+ vehículos).
//
// Vivía como const local en BookingForm, pero desde que el Hero también
// pregunta los pasajeros hay DOS pantallas validando el mismo tope. Si se
// separan, el buscador deja meter un grupo de 14 al carrito y el checkout
// lo rechaza después: el visitante llega hasta el final para que le digan
// que no. Una sola fuente de verdad.
export const MAX_TOTAL_PAX = 12;

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

// Nombre comercial del vehículo. Estaba escrito a mano (con el mismo
// ternario triple) en QuoteCalculatorV2 y en el Hero; centralizarlo evita
// que el carrito muestre "Toyota Hiace" para un vehicleId "maxus".
export const VEHICLE_NAMES: Record<VehicleType, string> = {
  staria: "Hyundai Staria",
  hiace: "Toyota Hiace",
  maxus: "Maxus V90",
};

export function getVehicleName(vehicle: VehicleType): string {
  return VEHICLE_NAMES[vehicle];
}

/**
 * Precio total de UN viaje. Es exactamente la fórmula que usaba
 * QuoteCalculatorV2 inline (base + VIP + paradas + recargo nocturno),
 * extraída acá porque ahora el checkout (BookingForm) también recalcula
 * cuando el cliente cambia fecha / hora / pasajeros. Si las dos copias se
 * separan, el cliente ve un precio en el carrito y paga otro: ruta del
 * dinero, una sola implementación.
 *
 * El recargo nocturno se aplica sólo cuando hay un basePrice real —
 * si no, un formulario vacío mostraría un $30 suelto (mismo guard que
 * tenía el calculador).
 */
export function computeTripTotal(input: {
  basePrice: number;
  serviceType: ServiceType;
  extraStopHours: number;
  pickupTime?: string | null;
}): number {
  const { basePrice, serviceType, extraStopHours, pickupTime } = input;
  const vipExtra = serviceType === "vip" ? VIP_EXTRA_USD : 0;
  const stopsExtra = (extraStopHours || 0) * EXTRA_STOP_PRICE_USD;
  const nightExtra = basePrice > 0 ? nightSurchargeFor(pickupTime) : 0;
  return basePrice + vipExtra + stopsExtra + nightExtra;
}

// Tramo de precio al que cae un grupo. Los mismos cortes que usa
// getPriceForGroupSize acá abajo — y ese es justamente el punto: los
// cortes ya estaban escritos a mano en getPriceForGroupSize, en
// getVehicleForPax y otra vez en la etiqueta de RoutePricePreview. Tres
// copias de la misma regla.
//
// OJO: NO sirve getVehicleForPax como clave de precio. Ese devuelve
// "maxus" tanto para 12 como para 13, pero 12 paga precio10a12 y 13 paga
// precio13a18: usarlo para decidir si hay que recotizar dejaría a un
// grupo de 13 viendo el precio de 12.
export type PriceTier = "1-5" | "6-9" | "10-12" | "13-18";

export function getPriceTier(totalPax: number): PriceTier {
  if (totalPax <= 5) return "1-5";
  if (totalPax <= 9) return "6-9";
  if (totalPax <= 12) return "10-12";
  return "13-18";
}

// Cómo se le muestra el tramo al visitante ("Estándar · 6-9 pax").
// Sólo el primero cambia de idioma; los otros tres son rangos de números
// y "6-9 pax" se lee igual en los dos.
export const PRICE_TIER_LABELS: Record<PriceTier, string> = {
  "1-5": "up to 5 pax",
  "6-9": "6-9 pax",
  "10-12": "10-12 pax",
  "13-18": "13-18 pax",
};

export const PRICE_TIER_LABELS_ES: Record<PriceTier, string> = {
  "1-5": "hasta 5 pax",
  "6-9": "6-9 pax",
  "10-12": "10-12 pax",
  "13-18": "13-18 pax",
};

// Sólo las cuatro columnas de precio de una fila de `routes`.
//
// Existe para que un componente de cliente pueda cotizar sin arrastrar la
// fila entera. Las páginas de ruta son ~590 páginas estáticas, y todo lo
// que se le pasa a un componente "use client" viaja serializado dentro
// del HTML: mandar el `Route` completo metería en cada una el JSONB de
// FAQs, las descripciones largas y los tips — kilobytes que ahí nadie
// lee.
//
// Un `Route` entero sigue calzando acá (Pick es un supertipo), así que
// las llamadas que ya existían no cambian.
export type RoutePrices = Pick<
  Route,
  "precio1a6" | "precio7a9" | "precio10a12" | "precio13a18"
>;

export function getPriceForGroupSize(route: RoutePrices, totalPax: number): number {
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

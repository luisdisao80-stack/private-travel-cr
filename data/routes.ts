// data/routes.ts

export type Location = {
  id: string;
  name: string;
  nameEn: string;
  region: string;
  isAirport?: boolean;
};

export type VehicleType = "staria" | "hiace";

export type Vehicle = {
  id: VehicleType;
  name: string;
  model: string;
  minPax: number;
  maxPax: number;
  description: string;
  descriptionEn: string;
  priceMultiplier: number;
  features: string[];
  featuresEn: string[];
};

export type Route = {
  id: string;
  from: string;
  to: string;
  basePriceUSD: number;
  durationMinutes: number;
  distanceKm: number;
  popular?: boolean;
};

// ============================================
// VEHÍCULOS
// ============================================
export const vehicles: Vehicle[] = [
  {
    id: "staria",
    name: "Hyundai Staria",
    model: "Staria",
    minPax: 1,
    maxPax: 5,
    description: "Viaje ultra cómodo con tecnología de vanguardia y amplio espacio para equipaje. Ideal para parejas, familias pequeñas y grupos de hasta 5 personas.",
    descriptionEn: "Ultra-comfortable journey with cutting-edge technology and ample luggage space. Ideal for couples, small families, and groups up to 5 passengers.",
    priceMultiplier: 1.0,
    features: ["Aire acondicionado premium", "WiFi a bordo", "Agua embotellada gratis", "Espacio amplio para equipaje", "Asientos de cuero"],
    featuresEn: ["Premium air conditioning", "Onboard WiFi", "Complimentary bottled water", "Ample luggage space", "Leather seats"],
  },
  {
    id: "hiace",
    name: "Toyota Hiace",
    model: "Hiace High Roof",
    minPax: 6,
    maxPax: 9,
    description: "Opción de techo alto que garantiza máxima libertad y visibilidad panorámica. Perfecta para grupos grandes y familias numerosas de 6 a 9 personas.",
    descriptionEn: "High-roof option ensures maximum freedom and panoramic visibility. Perfect for large groups and big families from 6 to 9 passengers.",
    priceMultiplier: 1.3,
    features: ["Techo alto para mayor comodidad", "Aire acondicionado dual", "WiFi a bordo", "Gran capacidad de equipaje", "Ventanas panorámicas"],
    featuresEn: ["High roof for extra comfort", "Dual air conditioning", "Onboard WiFi", "Large luggage capacity", "Panoramic windows"],
  },
];

// ============================================
// UBICACIONES
// ============================================
export const locations: Location[] = [
  { id: "sjo", name: "Aeropuerto SJO (San José)", nameEn: "SJO Airport (San Jose)", region: "Valle Central", isAirport: true },
  { id: "lir", name: "Aeropuerto LIR (Liberia)", nameEn: "LIR Airport (Liberia)", region: "Guanacaste", isAirport: true },
  { id: "la-fortuna", name: "La Fortuna / Arenal", nameEn: "La Fortuna / Arenal Volcano", region: "Norte" },
  { id: "monteverde", name: "Monteverde", nameEn: "Monteverde", region: "Norte" },
  { id: "manuel-antonio", name: "Manuel Antonio", nameEn: "Manuel Antonio", region: "Pacífico Central" },
  { id: "tamarindo", name: "Tamarindo", nameEn: "Tamarindo", region: "Guanacaste" },
  { id: "jaco", name: "Jacó", nameEn: "Jaco", region: "Pacífico Central" },
  { id: "samara", name: "Sámara", nameEn: "Samara", region: "Guanacaste" },
  { id: "nosara", name: "Nosara", nameEn: "Nosara", region: "Guanacaste" },
  { id: "papagayo", name: "Papagayo", nameEn: "Papagayo", region: "Guanacaste" },
  { id: "puerto-viejo", name: "Puerto Viejo", nameEn: "Puerto Viejo", region: "Caribe" },
  { id: "tortuguero", name: "Tortuguero", nameEn: "Tortuguero", region: "Caribe" },
  { id: "san-jose", name: "San José Ciudad", nameEn: "San Jose City", region: "Valle Central" },
  { id: "uvita", name: "Uvita", nameEn: "Uvita", region: "Pacífico Sur" },
  { id: "dominical", name: "Dominical", nameEn: "Dominical", region: "Pacífico Sur" },
  { id: "santa-teresa", name: "Santa Teresa", nameEn: "Santa Teresa", region: "Península de Nicoya" },
];

// ============================================
// RUTAS CON PRECIOS BASE (para Staria)
// ============================================
export const routes: Route[] = [
  // Desde SJO
  { id: "sjo-la-fortuna", from: "sjo", to: "la-fortuna", basePriceUSD: 190, durationMinutes: 180, distanceKm: 125, popular: true },
  { id: "sjo-manuel-antonio", from: "sjo", to: "manuel-antonio", basePriceUSD: 195, durationMinutes: 180, distanceKm: 165, popular: true },
  { id: "sjo-monteverde", from: "sjo", to: "monteverde", basePriceUSD: 200, durationMinutes: 210, distanceKm: 150 },
  { id: "sjo-tamarindo", from: "sjo", to: "tamarindo", basePriceUSD: 290, durationMinutes: 300, distanceKm: 260 },
  { id: "sjo-jaco", from: "sjo", to: "jaco", basePriceUSD: 150, durationMinutes: 90, distanceKm: 100 },
  { id: "sjo-puerto-viejo", from: "sjo", to: "puerto-viejo", basePriceUSD: 250, durationMinutes: 240, distanceKm: 210 },
  { id: "sjo-uvita", from: "sjo", to: "uvita", basePriceUSD: 260, durationMinutes: 240, distanceKm: 200 },

  // Desde LIR
  { id: "lir-tamarindo", from: "lir", to: "tamarindo", basePriceUSD: 120, durationMinutes: 75, distanceKm: 70, popular: true },
  { id: "lir-la-fortuna", from: "lir", to: "la-fortuna", basePriceUSD: 195, durationMinutes: 180, distanceKm: 140, popular: true },
  { id: "lir-monteverde", from: "lir", to: "monteverde", basePriceUSD: 195, durationMinutes: 180, distanceKm: 130 },
  { id: "lir-papagayo", from: "lir", to: "papagayo", basePriceUSD: 90, durationMinutes: 45, distanceKm: 40 },
  { id: "lir-samara", from: "lir", to: "samara", basePriceUSD: 160, durationMinutes: 120, distanceKm: 110 },
  { id: "lir-nosara", from: "lir", to: "nosara", basePriceUSD: 180, durationMinutes: 135, distanceKm: 125 },
  { id: "lir-manuel-antonio", from: "lir", to: "manuel-antonio", basePriceUSD: 340, durationMinutes: 360, distanceKm: 320 },

  // Desde La Fortuna
  { id: "la-fortuna-manuel-antonio", from: "la-fortuna", to: "manuel-antonio", basePriceUSD: 295, durationMinutes: 300, distanceKm: 245, popular: true },
  { id: "la-fortuna-tamarindo", from: "la-fortuna", to: "tamarindo", basePriceUSD: 280, durationMinutes: 270, distanceKm: 200, popular: true },
  { id: "la-fortuna-monteverde", from: "la-fortuna", to: "monteverde", basePriceUSD: 220, durationMinutes: 180, distanceKm: 110 },
  { id: "la-fortuna-sjo", from: "la-fortuna", to: "sjo", basePriceUSD: 190, durationMinutes: 180, distanceKm: 125 },
  { id: "la-fortuna-lir", from: "la-fortuna", to: "lir", basePriceUSD: 195, durationMinutes: 180, distanceKm: 140 },
  { id: "la-fortuna-samara", from: "la-fortuna", to: "samara", basePriceUSD: 290, durationMinutes: 270, distanceKm: 230 },
  { id: "la-fortuna-nosara", from: "la-fortuna", to: "nosara", basePriceUSD: 300, durationMinutes: 285, distanceKm: 245 },

  // Desde Manuel Antonio
  { id: "manuel-antonio-monteverde", from: "manuel-antonio", to: "monteverde", basePriceUSD: 280, durationMinutes: 270, distanceKm: 220 },
  { id: "manuel-antonio-tamarindo", from: "manuel-antonio", to: "tamarindo", basePriceUSD: 340, durationMinutes: 330, distanceKm: 280 },
  { id: "manuel-antonio-uvita", from: "manuel-antonio", to: "uvita", basePriceUSD: 120, durationMinutes: 60, distanceKm: 45 },

  // Desde Monteverde
  { id: "monteverde-tamarindo", from: "monteverde", to: "tamarindo", basePriceUSD: 240, durationMinutes: 210, distanceKm: 170 },
];

// ============================================
// FUNCIONES HELPER
// ============================================

export type ServiceType = "standard" | "vip";

export const VIP_EXTRA_USD = 70;

export function getLocationById(id: string): Location | undefined {
  return locations.find((loc) => loc.id === id);
}

export function getVehicleById(id: VehicleType): Vehicle | undefined {
  return vehicles.find((v) => v.id === id);
}

export function getRoute(fromId: string, toId: string): Route | undefined {
  return routes.find(
    (r) =>
      (r.from === fromId && r.to === toId) ||
      (r.from === toId && r.to === fromId)
  );
}

export function getPopularRoutes(): Route[] {
  return routes.filter((r) => r.popular);
}

export function calculatePrice(
  fromId: string,
  toId: string,
  passengers: number,
  serviceType: ServiceType = "standard"
): { price: number; vehicle: Vehicle; route: Route } | null {
  const route = getRoute(fromId, toId);
  if (!route) return null;

  const vehicle = passengers <= 5 ? vehicles[0] : vehicles[1];
  let price = Math.round(route.basePriceUSD * vehicle.priceMultiplier);

  if (serviceType === "vip") {
    price += VIP_EXTRA_USD;
  }

  return { price, vehicle, route };
}

export function calculateAllPrices(
  fromId: string,
  toId: string
): {
  stariaStandard: number;
  stariaVip: number;
  hiaceStandard: number;
  hiaceVip: number;
  route: Route;
} | null {
  const route = getRoute(fromId, toId);
  if (!route) return null;

  const stariaStandard = Math.round(route.basePriceUSD * vehicles[0].priceMultiplier);
  const hiaceStandard = Math.round(route.basePriceUSD * vehicles[1].priceMultiplier);

  return {
    stariaStandard,
    stariaVip: stariaStandard + VIP_EXTRA_USD,
    hiaceStandard,
    hiaceVip: hiaceStandard + VIP_EXTRA_USD,
    route,
  };
}





// lib/types.ts

// Manually-curated FAQs stored in routes.faqs (JSONB column). Optional —
// most routes fall back to the 4 auto-generated FAQs in RouteDetail.tsx.
// Curate route-specific Q&A for high-traffic pairs to capture long-tail
// queries Google's PAA panel surfaces.
export type RouteFAQ = {
  question: string;
  answer: string;
};

// Hotel landing pages live at /hotels/[slug]. Each hotel maps to an
// area_origen that exactly matches a routes.origen value, so the page
// can derive shuttle prices from existing route rows.
export type Hotel = {
  id: number;
  slug: string;
  name: string;
  area_origen: string;
  city: string;
  description: string | null;
  image_url: string | null;
  amenities: string[] | null;
  is_indexable: boolean;
  /** Higher = surfaces first in "Top hotels in <area>" lists. Default 0.
   *  Reserved values: 100 = flagship/luxury, 50 = popular mid-tier. */
  priority: number;
  created_at: string;
};

export type Route = {
  id: number;
  origen: string;
  destino: string;
  precio1a6: number | null;
  precio7a9: number | null;
  precio10a12: number | null;
  precio13a18: number | null;
  duracion: string | null;
  kilometros: number | null;
  alias: string | null;
  slug: string | null;
  descripcion_viaje: string | null;
  puntos_interes: string | null;
  tipo_terreno: string | null;
  tip_viajero: string | null;
  journey_description: string | null;
  points_of_interest: string | null;
  road_type: string | null;
  traveler_tip: string | null;
  late_night_info: string | null;
  google_maps_note: string | null;
  family_info: string | null;
  budget_tip: string | null;
  local_recommendation: string | null;
  is_indexable: boolean;
  faqs: RouteFAQ[] | null;
};

// Tours we resell from third-party operators (initially Canoa Aventura in
// La Fortuna). RACK prices are what the customer pays here; operator_net_*
// is our wholesale cost. Pricing is per-person with separate adult/child
// rates and a per-tour kid age policy. Bookings reuse the bookings table
// with kind='tour'.
export type TourScheduleSlot = {
  departure: string; // "07:50"
  return: string;    // "12:30"
};

export type Tour = {
  id: number;
  slug: string;
  name: string;
  name_es: string | null;
  category: "combo" | "caminata" | "rio" | "wildlife" | "kayak" | "nocturno";
  region: string; // "la-fortuna"
  short_description: string | null;
  description: string | null;
  description_es: string | null;
  // pricing — USD, includes 13% IVA
  adult_price: number;
  child_price: number | null;
  child_age_min: number | null;
  child_age_max: number | null;
  child_discount_pct: number | null;
  min_age: number | null;
  child_policy_note: string | null;
  // logistics
  duration_label: string;
  duration_hours: number | null;
  schedule_times: TourScheduleSlot[];
  min_pax: number;
  max_pax: number | null;
  pickup_zone: string | null;
  // what's included / what to bring
  includes: string[];
  what_to_bring: string[];
  highlights: string[];
  // media
  hero_image: string | null;
  gallery: string[];
  // seo
  meta_title: string | null;
  meta_description: string | null;
  // operator (internal — not for public display)
  operator_id: number | null;
  operator_tour_name: string | null;
  operator_net_adult: number | null;
  operator_net_child: number | null;
  // flags
  is_active: boolean;
  is_indexable: boolean;
  is_featured: boolean;
  priority: number;
};

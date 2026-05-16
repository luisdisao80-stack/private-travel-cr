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

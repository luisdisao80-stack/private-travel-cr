// lib/types.ts

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
};

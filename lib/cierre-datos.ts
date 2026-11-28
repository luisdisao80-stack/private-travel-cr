// Lectura de una semana de cierre desde Supabase. Server-only: usa la
// service role, nunca se importa desde un componente de cliente.
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  armarCierre,
  domingoDeLaSemana,
  type BookingRow,
  type Cierre,
  type DispatchRow,
  type ResumenProveedor,
} from "@/lib/cierre-semanal";

/** Una fila de cierre_pagos: el monto congelado al momento de cerrar. */
export type PagoGuardado = {
  provider_id: number | null;
  proveedor: string;
  es_planta: boolean;
  viajes: number;
  monto_usd: number;
  viajes_con_factura: number;
  viajes_sin_factura: number;
  pagado: boolean;
  pagado_at: string | null;
};

export type SemanaCierre = {
  /** Lo que dicen `dispatch` y `bookings` en este momento. */
  cierre: Cierre;
  cerrado: boolean;
  cerradoAt: string | null;
  /** Vacio si la semana no se ha cerrado. */
  guardado: PagoGuardado[];
  /**
   * La semana esta cerrada pero alguien movio un neto en Despacho despues:
   * lo guardado y lo actual ya no coinciden. No se corrige solo a proposito,
   * porque puede haber un pago hecho contra el monto viejo.
   */
  descuadrado: boolean;
};

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function cargarSemana(lunes: string): Promise<SemanaCierre> {
  const domingo = domingoDeLaSemana(lunes);

  const [dispatchRes, cierreRes, pagosRes] = await Promise.all([
    supabaseAdmin
      .from("dispatch")
      .select("order_number,fecha,tramo,provider_id,neto_usd,nota,provider:providers(nombre,es_planta)")
      .gte("fecha", lunes)
      .lte("fecha", domingo),
    supabaseAdmin
      .from("cierres")
      .select("semana_lunes,cerrado_at,total_usd,total_viajes")
      .eq("semana_lunes", lunes)
      .maybeSingle(),
    supabaseAdmin
      .from("cierre_pagos")
      .select("provider_id,proveedor,es_planta,viajes,monto_usd,viajes_con_factura,viajes_sin_factura,pagado,pagado_at")
      .eq("semana_lunes", lunes),
  ]);

  const dispatch = (dispatchRes.data || []) as unknown as DispatchRow[];

  // Las reservas solo de los tramos despachados de la semana.
  const ordenes = [...new Set(dispatch.map((d) => d.order_number))];
  let bookings: BookingRow[] = [];
  if (ordenes.length) {
    const { data } = await supabaseAdmin
      .from("bookings")
      .select("order_number,customer_name,status,items,tilopay_id,tilopay_response")
      .in("order_number", ordenes);
    bookings = (data || []) as unknown as BookingRow[];
  }

  const cierre = armarCierre(lunes, dispatch, bookings);

  const guardado: PagoGuardado[] = (pagosRes.data || []).map((p) => ({
    provider_id: p.provider_id,
    proveedor: p.proveedor,
    es_planta: p.es_planta,
    viajes: p.viajes,
    monto_usd: num(p.monto_usd),
    viajes_con_factura: p.viajes_con_factura,
    viajes_sin_factura: p.viajes_sin_factura,
    pagado: p.pagado,
    pagado_at: p.pagado_at,
  }));

  const cerrado = Boolean(cierreRes.data);
  const totalGuardado = num(cierreRes.data?.total_usd);
  const descuadrado =
    cerrado &&
    (Math.abs(totalGuardado - cierre.totalUsd) > 0.005 ||
      num(cierreRes.data?.total_viajes) !== cierre.totalViajes);

  return {
    cierre,
    cerrado,
    cerradoAt: cierreRes.data?.cerrado_at ?? null,
    guardado,
    descuadrado,
  };
}

/** Lo que se le pago a cada proveedor en un mes ("YYYY-MM"), por semanas cerradas. */
export type MesProveedor = {
  proveedor: string;
  provider_id: number | null;
  viajes: number;
  monto_usd: number;
  viajes_con_factura: number;
  viajes_sin_factura: number;
  semanas_pagadas: number;
  semanas_pendientes: number;
};

export async function cargarMes(mes: string): Promise<MesProveedor[]> {
  const { data } = await supabaseAdmin
    .from("cierre_mensual")
    .select("proveedor,provider_id,viajes,monto_usd,viajes_con_factura,viajes_sin_factura,semanas_pagadas,semanas_pendientes")
    .eq("mes", mes);

  return (data || [])
    .map((r) => ({ ...r, monto_usd: num(r.monto_usd) }))
    .sort((a, z) => z.monto_usd - a.monto_usd || a.proveedor.localeCompare(z.proveedor));
}

/**
 * El cierre tal como se muestra y se exporta: si la semana ya se cerro, con
 * los montos congelados; si no, con lo que dicen dispatch y bookings ahora.
 * El detalle viaje por viaje es siempre el actual, que es el respaldo.
 */
export function cierreAPagar(s: SemanaCierre): Cierre {
  if (!s.cerrado) return s.cierre;
  const porProveedor: ResumenProveedor[] = s.guardado
    .map((p) => ({
      providerId: p.provider_id,
      proveedor: p.proveedor,
      esPlanta: p.es_planta,
      viajes: p.viajes,
      montoUsd: p.monto_usd,
      viajesConFactura: p.viajes_con_factura,
      viajesSinFactura: p.viajes_sin_factura,
    }))
    .sort((a, z) => z.montoUsd - a.montoUsd || a.proveedor.localeCompare(z.proveedor));

  return {
    ...s.cierre,
    porProveedor,
    totalUsd: porProveedor.reduce((t, r) => t + r.montoUsd, 0),
    totalViajes: porProveedor.reduce((t, r) => t + r.viajes, 0),
  };
}

/** Mapa proveedor -> ya se le pago, con la misma llave que usa el Excel. */
export function pagadosDe(s: SemanaCierre): Record<string, boolean> {
  const m: Record<string, boolean> = {};
  for (const p of s.guardado) {
    m[String(p.provider_id ?? p.proveedor)] = p.pagado;
  }
  return m;
}

// Cierre semanal por proveedor, de lunes a domingo: cuántos viajes hizo cada
// proveedor, cuánto hay que pagarle, y cuáles de esos viajes exigen que él
// entregue factura.
//
// La regla de la factura es del negocio, no del sistema: un viaje que entró
// por la web se le paga al proveedor contra factura; uno que entró por
// WeTravel se le paga sin factura.
//
// Una semana se identifica SIEMPRE por su lunes en formato YYYY-MM-DD, que es
// también la llave de las tablas `cierres` y `cierre_pagos`.
import type { CartItem } from "@/lib/CartContext";

// ---------------------------------------------------------------- fechas
// Costa Rica es UTC-6 todo el año (no hay horario de verano), así que basta
// con restar 6 horas para saber en qué día calendario estamos aquí.

/** Hoy en Costa Rica, como YYYY-MM-DD. */
export function hoyCR(): string {
  return new Date(Date.now() - 6 * 3600 * 1000).toISOString().slice(0, 10);
}

export function sumarDias(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function esFechaIso(s: string | undefined | null): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s || "");
}

/** El lunes de la semana a la que pertenece esa fecha. */
export function lunesDeLaSemana(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = domingo
  return sumarDias(iso, dow === 0 ? -6 : 1 - dow);
}

/** El domingo que cierra la semana que empieza ese lunes. */
export function domingoDeLaSemana(lunes: string): string {
  return sumarDias(lunes, 6);
}

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MESES_LARGOS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** "lunes 24 nov 2026" */
export function fechaCorta(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DIAS[dow]} ${d} ${MESES[m - 1]} ${y}`;
}

/** "24 nov – 30 nov 2026" */
export function rotuloSemana(lunes: string): string {
  const dom = domingoDeLaSemana(lunes);
  const [, m1, d1] = lunes.split("-").map(Number);
  const [y2, m2, d2] = dom.split("-").map(Number);
  return `${d1} ${MESES[m1 - 1]} – ${d2} ${MESES[m2 - 1]} ${y2}`;
}

/** "noviembre 2026", para el acumulado del mes. */
export function rotuloMes(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return `${MESES_LARGOS[m - 1]} ${y}`;
}

// ------------------------------------------------------- origen del pago

export type OrigenPago = "Web" | "WeTravel" | "Pendiente";

export type BookingOrigen = {
  status: string | null;
  tilopay_id: string | null;
  tilopay_response: string | null;
};

/**
 * De dónde salió el pago de la reserva. Es la misma regla que ya aplica
 * /admin/despacho; vive aquí para que el despacho y el cierre no se puedan
 * contradecir. Una reserva aprobada sin tilopay_id se cobró fuera del sitio,
 * o sea WeTravel.
 */
export function origenPago(b: BookingOrigen): OrigenPago {
  if (b.status !== "approved") return "Pendiente";
  if (b.tilopay_response === "paid_via_wetravel") return "WeTravel";
  return b.tilopay_id ? "Web" : "WeTravel";
}

/** Los viajes que entraron por la web se le pagan al proveedor contra factura. */
export function requiereFactura(origen: OrigenPago): boolean {
  return origen === "Web";
}

// ------------------------------------------------------------- agregación

export type DispatchRow = {
  order_number: string;
  fecha: string;
  tramo: number;
  provider_id: number | null;
  neto_usd: number | string | null;
  nota: string | null;
  provider?: { nombre: string; es_planta: boolean } | null;
};

export type BookingRow = BookingOrigen & {
  order_number: string;
  customer_name: string | null;
  items: CartItem[] | null;
};

export type ViajeCierre = {
  orden: string;
  fecha: string;
  tramo: number;
  cliente: string;
  ruta: string;
  hora: string;
  pax: number;
  providerId: number | null;
  proveedor: string;
  esPlanta: boolean;
  /** null = chofer de planta, no se le paga por servicio. */
  netoUsd: number | null;
  origen: OrigenPago;
  factura: boolean;
  nota: string;
};

export type ResumenProveedor = {
  providerId: number | null;
  proveedor: string;
  esPlanta: boolean;
  viajes: number;
  montoUsd: number;
  viajesConFactura: number;
  viajesSinFactura: number;
};

export type Cierre = {
  lunes: string;
  domingo: string;
  viajes: ViajeCierre[];
  porProveedor: ResumenProveedor[];
  totalUsd: number;
  totalViajes: number;
};

function neto(v: DispatchRow["neto_usd"]): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Cruza los tramos despachados de la semana con sus reservas y arma el cierre.
 * Un tramo se ubica por reserva + fecha + posición, igual que en `dispatch`.
 */
export function armarCierre(
  lunes: string,
  dispatch: DispatchRow[],
  bookings: BookingRow[]
): Cierre {
  const porOrden = new Map(bookings.map((b) => [b.order_number, b]));
  const viajes: ViajeCierre[] = [];

  for (const d of dispatch) {
    const b = porOrden.get(d.order_number);
    const delDia = (b?.items || []).filter((i) => i.date === d.fecha);
    const it = delDia[d.tramo - 1];
    const origen = b ? origenPago(b) : "Pendiente";
    const ruta = it ? `${it.fromName} → ${it.toName}` : "—";

    viajes.push({
      orden: d.order_number,
      fecha: d.fecha,
      tramo: d.tramo,
      cliente: b?.customer_name || "—",
      ruta,
      hora: it?.pickupTime || "",
      pax: it?.passengers ?? 0,
      providerId: d.provider_id,
      proveedor: d.provider?.nombre || "(sin proveedor)",
      esPlanta: d.provider?.es_planta ?? false,
      netoUsd: neto(d.neto_usd),
      origen,
      factura: requiereFactura(origen),
      nota: d.nota || "",
    });
  }

  viajes.sort(
    (a, z) =>
      a.fecha.localeCompare(z.fecha) ||
      a.proveedor.localeCompare(z.proveedor) ||
      a.orden.localeCompare(z.orden) ||
      a.tramo - z.tramo
  );

  const acum = new Map<string, ResumenProveedor>();
  for (const v of viajes) {
    const k = String(v.providerId ?? v.proveedor);
    const r =
      acum.get(k) ||
      {
        providerId: v.providerId,
        proveedor: v.proveedor,
        esPlanta: v.esPlanta,
        viajes: 0,
        montoUsd: 0,
        viajesConFactura: 0,
        viajesSinFactura: 0,
      };
    r.viajes += 1;
    r.montoUsd += v.netoUsd ?? 0;
    if (v.factura) r.viajesConFactura += 1;
    else r.viajesSinFactura += 1;
    acum.set(k, r);
  }

  const porProveedor = [...acum.values()].sort(
    (a, z) => z.montoUsd - a.montoUsd || a.proveedor.localeCompare(z.proveedor)
  );

  return {
    lunes,
    domingo: domingoDeLaSemana(lunes),
    viajes,
    porProveedor,
    totalUsd: porProveedor.reduce((s, r) => s + r.montoUsd, 0),
    totalViajes: viajes.length,
  };
}

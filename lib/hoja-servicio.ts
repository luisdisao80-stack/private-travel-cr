// Hoja de servicio para choferes: modelo de datos + HTML.
//
// Lo usan dos caminos que deben producir la MISMA imagen:
//   - scripts/hoja-servicio.ts (Chrome headless, en la Mac de Diego)
//   - app/api/admin/hoja (satori / ImageResponse, en Vercel) via
//     components/admin/HojaServicioImage.tsx
//
// Reglas: nunca lleva teléfonos del cliente ni el precio que pagó; los
// choferes de planta no llevan neto; el vuelo solo importa si viene.

export const HOJA_COLORS = {
  bg: "#0b1220",
  card: "#111a2e",
  card2: "#15213a",
  gold: "#c9a227",
  text: "#f3f4f6",
  text2: "#e5e7eb",
  text3: "#d1d5db",
  muted: "#9ca3af",
  faint: "#6b7280",
  okBg: "#0f3d2e",
  okText: "#6ee7b7",
  okBorder: "#10b981",
  noBg: "#3f1d1d",
  noText: "#fca5a5",
  noBorder: "#ef4444",
  plantaBg: "#1f2a44",
} as const;

export const HOJA_WIDTH = 1080;

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export function fechaLarga(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `${DIAS[dt.getUTCDay()]} ${d} de ${MESES[m - 1]} de ${y}`;
}

export function hora12(h: string): string {
  if (!h) return "";
  const [H, M] = h.split(":").map(Number);
  if (!Number.isFinite(H)) return h;
  const ap = H >= 12 ? "pm" : "am";
  const h12 = H % 12 === 0 ? 12 : H % 12;
  return `${h12}:${String(M || 0).padStart(2, "0")} ${ap}`;
}

function esc(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Lo mínimo que la hoja necesita de un tramo (`items[]` de bookings). */
export type HojaItem = {
  pickupTime?: string;
  pickupPlace?: string;
  dropoffPlace?: string;
  fromName?: string;
  toName?: string;
  passengers?: number;
  children?: number;
  vehicleName?: string;
  serviceType?: string;
  extraStopHours?: number;
  extraStopNames?: string[];
  flightNumber?: string;
  flightTime?: string;
  duration?: string;
  infantSeats?: number;
  convertibleSeats?: number;
  boosterSeats?: number;
};

export type HojaBooking = {
  order_number: string;
  customer_name: string | null;
  status: string | null;
};

export type HojaModel = {
  orden: string;
  fechaIso: string;
  fechaTexto: string;
  chofer: string;
  /** null / "" = chofer de planta (sin pago por servicio) */
  neto: string | null;
  cliente: string;
  pax: number;
  vehiculo: string;
  hora: string;
  recoger: string;
  zonaOrigen: string;
  llevar: string;
  zonaDestino: string;
  duracion: string;
  extras: string[];
  pagado: boolean;
};

export function sillasTexto(it: HojaItem): string[] {
  const seats: string[] = [];
  if (it.infantSeats) seats.push(`${it.infantSeats} silla de bebé`);
  if (it.convertibleSeats) seats.push(`${it.convertibleSeats} silla convertible`);
  if (it.boosterSeats) seats.push(`${it.boosterSeats} booster`);
  if (!seats.length && it.children) seats.push(`${it.children} niño(s) — revisar sillas`);
  return seats;
}

export function vueloValido(v: string | undefined | null): boolean {
  return !!v && !/^(na|n\/a|none|-)$/i.test(String(v).trim());
}

export function buildHoja(
  b: HojaBooking,
  it: HojaItem,
  opts: { fecha: string; chofer: string; neto?: string | number | null; nota?: string | null }
): HojaModel {
  const extras: string[] = [];
  if (it.serviceType === "vip") extras.push("Servicio VIP: paradas para fotos incluidas");
  if (it.extraStopHours) {
    const lugares = it.extraStopNames?.length ? ` (${it.extraStopNames.join(", ")})` : "";
    extras.push(`Parada larga incluida: ${it.extraStopHours} h${lugares}`);
  }
  if (vueloValido(it.flightNumber)) {
    extras.push(`Vuelo: ${it.flightNumber}${it.flightTime ? ` · ${hora12(it.flightTime)}` : ""}`);
  }
  const seats = sillasTexto(it);
  if (seats.length) extras.push(`Sillas: ${seats.join(", ")}`);
  if (opts.nota && opts.nota.trim()) extras.push(opts.nota.trim());

  const netoRaw = opts.neto;
  const neto =
    netoRaw === null || netoRaw === undefined || String(netoRaw).trim() === "" || Number(netoRaw) === 0
      ? null
      : String(Number(netoRaw) % 1 === 0 ? Number(netoRaw) : Number(netoRaw).toFixed(2));

  return {
    orden: b.order_number,
    fechaIso: opts.fecha,
    fechaTexto: fechaLarga(opts.fecha),
    chofer: opts.chofer,
    neto,
    cliente: b.customer_name || "",
    pax: Number(it.passengers || 0),
    vehiculo: it.vehicleName || "",
    hora: hora12(it.pickupTime || ""),
    recoger: it.pickupPlace || it.fromName || "",
    zonaOrigen: it.fromName || "",
    llevar: it.dropoffPlace || it.toName || "",
    zonaDestino: it.toName || "",
    duracion: it.duration || "",
    extras,
    pagado: b.status === "approved",
  };
}

/** Alto estimado del PNG: 1300 sin bloque Importante, más espacio con él. */
export function hojaAlto(m: HojaModel): number {
  if (!m.extras.length) return 1300;
  const lineas = m.extras.reduce((n, e) => n + Math.max(1, Math.ceil(e.length / 62)), 0);
  return Math.max(1500, 1340 + lineas * 42);
}

/** HTML completo (para Chrome headless). `logoSrc` es un file:// o data: URI. */
export function renderHojaHtml(m: HojaModel, logoSrc: string): string {
  const c = HOJA_COLORS;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${HOJA_WIDTH}px; background: ${c.bg}; }
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; color: ${c.text}; padding: 56px 64px 48px; }
  .top { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid ${c.gold}; padding-bottom: 28px; }
  .top img { height: 150px; }
  .top .t { text-align: right; }
  .top .t h1 { font-size: 30px; letter-spacing: 4px; color: ${c.gold}; font-weight: 700; }
  .top .t .f { font-size: 26px; margin-top: 10px; color: ${c.text2}; text-transform: capitalize; }
  .top .t .o { font-size: 22px; margin-top: 6px; color: ${c.muted}; }
  .chofer { margin: 34px 0 10px; font-size: 26px; color: ${c.muted}; }
  .chofer b { color: #fff; font-size: 34px; margin-left: 10px; }
  .grid { margin-top: 26px; display: grid; grid-template-columns: 1fr; gap: 22px; }
  .row { background: ${c.card}; border-radius: 18px; padding: 24px 28px; border-left: 8px solid ${c.gold}; }
  .row .k { font-size: 20px; letter-spacing: 3px; color: ${c.gold}; text-transform: uppercase; }
  .row .v { font-size: 36px; font-weight: 700; margin-top: 8px; line-height: 1.2; }
  .row .s { font-size: 26px; color: ${c.text3}; margin-top: 6px; line-height: 1.3; }
  .hora { display: flex; gap: 22px; }
  .hora .row:first-child { flex: 0 0 300px; }
  .hora .row:first-child .v { font-size: 56px; }
  .extras { margin-top: 24px; background: ${c.card2}; border-radius: 18px; padding: 22px 28px; }
  .extras .k { font-size: 20px; letter-spacing: 3px; color: ${c.gold}; text-transform: uppercase; margin-bottom: 10px; }
  .extras li { list-style: none; font-size: 27px; line-height: 1.45; padding-left: 30px; position: relative; }
  .extras li::before { content: "•"; color: ${c.gold}; position: absolute; left: 6px; }
  .bottom { margin-top: 30px; display: flex; gap: 22px; }
  .pago { flex: 1; border-radius: 18px; padding: 24px 28px; font-size: 30px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-align: center; }
  .pago.ok { background: ${c.okBg}; color: ${c.okText}; border: 2px solid ${c.okBorder}; }
  .pago.no { background: ${c.noBg}; color: ${c.noText}; border: 2px solid ${c.noBorder}; }
  .neto { flex: 1; background: ${c.gold}; color: ${c.bg}; border-radius: 18px; padding: 24px 28px; text-align: center; }
  .neto .k { font-size: 22px; letter-spacing: 3px; font-weight: 700; }
  .neto .v { font-size: 64px; font-weight: 800; margin-top: 2px; }
  .foot { margin-top: 34px; text-align: center; color: ${c.faint}; font-size: 20px; letter-spacing: 1px; }
</style></head><body>
<div class="top">
  <img src="${logoSrc}" alt="Private Travel CR">
  <div class="t">
    <h1>HOJA DE SERVICIO</h1>
    <div class="f">${esc(m.fechaTexto)}</div>
    <div class="o">Reserva ${esc(m.orden)}</div>
  </div>
</div>
<div class="chofer">Chofer:<b>${esc(m.chofer)}</b></div>
<div class="grid">
  <div class="hora">
    <div class="row"><div class="k">Pickup</div><div class="v">${esc(m.hora)}</div></div>
    <div class="row" style="flex:1"><div class="k">Cliente</div><div class="v">${esc(m.cliente)}</div><div class="s">${esc(String(m.pax))} pasajero${m.pax === 1 ? "" : "s"} · ${esc(m.vehiculo)}</div></div>
  </div>
  <div class="row"><div class="k">Recoger en</div><div class="v">${esc(m.recoger)}</div><div class="s">${esc(m.zonaOrigen)}</div></div>
  <div class="row"><div class="k">Llevar a</div><div class="v">${esc(m.llevar)}</div><div class="s">${esc(m.zonaDestino)}${m.duracion ? ` · aprox. ${esc(m.duracion)}` : ""}</div></div>
</div>
${m.extras.length ? `<div class="extras"><div class="k">Importante</div><ul>${m.extras.map((e) => `<li>${esc(e)}</li>`).join("")}</ul></div>` : ""}
<div class="bottom">
  <div class="pago ${m.pagado ? "ok" : "no"}">${m.pagado ? "SERVICIO PAGADO<br>No cobrar nada al cliente" : "PAGO PENDIENTE<br>Confirmar con Diego antes de salir"}</div>
  ${m.neto
    ? `<div class="neto"><div class="k">NETO CHOFER</div><div class="v">$${esc(m.neto)}</div></div>`
    : `<div class="neto" style="background:${c.plantaBg};color:${c.text2}"><div class="k" style="color:${c.gold}">CHOFER DE PLANTA</div><div class="v" style="font-size:34px;margin-top:10px">Sin pago por servicio</div></div>`}
</div>
<div class="foot">Private Travel CR · Cualquier duda, llamar a Diego · No compartir esta hoja con el cliente</div>
</body></html>`;
}

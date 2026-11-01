/**
 * Booking rules shared between the customer-facing pickers, client-side
 * form validation, and the server action that persists the booking.
 *
 * Change MIN_LEAD_TIME_HOURS to adjust the threshold — one knob, three
 * enforcement points stay in sync.
 *
 * Why 18h (was 12h until 2026-10-29): Diego (business owner) was getting
 * bookings at 10pm for 6am next-day pickups. 12h still left too little
 * runway to reliably confirm a driver, so the threshold was raised to 18h.
 * Customers who genuinely need a short-notice trip are routed to WhatsApp
 * so Diego can accept them manually.
 *
 * Bypasses (do NOT enforce here):
 *   - Admin quotes (`createQuoteAction`) — Diego uses that surface to
 *     accept last-minute WhatsApp requests on purpose.
 *   - Paying an already-created pending booking — the rule fires at
 *     booking CREATION, not at payment time.
 */

export const MIN_LEAD_TIME_HOURS = 18;
export const WHATSAPP_URGENT_URL = "https://wa.me/50686334133";

/**
 * WhatsApp deep links with pre-filled text so the visitor doesn't have to
 * type anything after tapping the CTA. Both locales exposed so the client
 * can pick based on `useLanguage().lang`.
 */
export const WHATSAPP_URGENT_URL_EN =
  WHATSAPP_URGENT_URL +
  "?text=" +
  encodeURIComponent(
    "Hi! I need a trip in less than 18 hours, can you help?",
  );

export const WHATSAPP_URGENT_URL_ES =
  WHATSAPP_URGENT_URL +
  "?text=" +
  encodeURIComponent(
    "Hola! Necesito un viaje en menos de 18 horas, ¿pueden ayudarme?",
  );

/**
 * Parse a naive Costa Rica local datetime ("YYYY-MM-DD", "HH:MM") into a
 * real Date. CR is UTC-6 with no DST, so we can just shift the hour by +6
 * and use Date.UTC. Same pattern as lib email + cron/send-reminders.
 *
 * Returns null if either part is missing or unparseable — callers should
 * treat that as "no valid pickup yet" and skip the lead-time check.
 */
export function parseCostaRicaPickup(
  date: string | undefined | null,
  time: string | undefined | null,
): Date | null {
  if (!date || !time) return null;
  const [y, m, d] = date.split("-").map((s) => parseInt(s, 10));
  const [h, mi] = time.split(":").map((s) => parseInt(s, 10));
  if ([y, m, d, h, mi].some((n) => Number.isNaN(n))) return null;
  // CR is UTC-6 year-round. Local 10:00 → 16:00 UTC.
  return new Date(Date.UTC(y, m - 1, d, h + 6, mi, 0));
}

/**
 * Absolute Date representing the earliest pickup instant the customer
 * can currently book. Timezone-agnostic — comparison via .getTime() is
 * what matters. Consumers that need a CR-local calendar date for a
 * date-picker `min` should use getMinPickupCRDate() instead.
 */
export function getMinPickupDate(): Date {
  const now = new Date();
  // Floor to the minute so the constant doesn't drift with millisecond
  // arithmetic between the picker rendering and the server validating.
  const floored = new Date(Math.floor(now.getTime() / 60000) * 60000);
  return new Date(floored.getTime() + MIN_LEAD_TIME_HOURS * 60 * 60 * 1000);
}

/**
 * The earliest calendar date, in Costa Rica local time, that the visitor
 * can pick. Returned as a Date pointing at 00:00 CR-local (represented in
 * UTC via +6h shift) so react-day-picker's `disabled: { before }` prop
 * hides earlier days.
 *
 * Example: if it's 2026-07-12 22:00 CR now, min pickup is 2026-07-13
 * 10:00 CR — the earliest date that could conceivably host a valid
 * pickup is 2026-07-13, so we return that day at 00:00 CR.
 */
export function getMinPickupCRDate(): Date {
  const min = getMinPickupDate();
  // Format the min instant as a CR-local YYYY-MM-DD.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(min);
  const y = parseInt(parts.find((p) => p.type === "year")!.value, 10);
  const m = parseInt(parts.find((p) => p.type === "month")!.value, 10);
  const d = parseInt(parts.find((p) => p.type === "day")!.value, 10);
  // 00:00 CR-local == 06:00 UTC (UTC-6, no DST).
  return new Date(Date.UTC(y, m - 1, d, 6, 0, 0));
}

/**
 * True when the given pickup instant is at least MIN_LEAD_TIME_HOURS
 * from now. Accepts either:
 *   - a Date object (absolute instant)
 *   - an ISO 8601 string with offset (parsed via Date constructor)
 *   - the CR-local pair via `parseCostaRicaPickup` — call that first
 *     and pass the resulting Date here.
 *
 * A pickup exactly MIN_LEAD_TIME_HOURS out is allowed (>=, not >).
 * Returning `true` means the booking passes the rule.
 */
export function isPickupWithinLeadTime(pickup: string | Date): boolean {
  const pickupDate = pickup instanceof Date ? pickup : new Date(pickup);
  if (Number.isNaN(pickupDate.getTime())) return false;
  const minAllowed = getMinPickupDate();
  return pickupDate.getTime() >= minAllowed.getTime();
}

/**
 * Convenience for the shuttle cart: the FIRST trip in the cart is the
 * one the driver has to prep for — Diego only cares that the departure
 * gives him enough runway. Returns true if the first trip passes.
 * Returns true (permissive) when the input is empty or missing date/time,
 * because other validators handle those cases first.
 */
export function isFirstTripLeadTimeOk(
  items: ReadonlyArray<{ date?: string; pickupTime?: string }>,
): boolean {
  if (!items || items.length === 0) return true;
  const first = items[0];
  const pickup = parseCostaRicaPickup(first.date, first.pickupTime);
  if (!pickup) return true; // let the "pick a date/time" validator surface the problem
  return isPickupWithinLeadTime(pickup);
}

/**
 * Message copy — kept here so tests and both UI + API use the same
 * strings verbatim. The API returns EN by default (it can't tell locale
 * cheaply); the client picks the right one from useLanguage().
 */
export const LEAD_TIME_MESSAGE_EN =
  "⏰ Bookings require at least 18 hours' notice. For urgent trips, WhatsApp us at +506 8633-4133 — we'll do our best to accommodate.";

export const LEAD_TIME_MESSAGE_ES =
  "⏰ Las reservas requieren mínimo 18 horas de anticipación. Para viajes urgentes, escríbenos por WhatsApp al +506 8633-4133 — haremos lo posible.";

/* ------------------------------------------------------------------ */
/* Temporada alta navideña (22–30 de diciembre)                        */
/* ------------------------------------------------------------------ */

/**
 * Regla actualizada por Diego (2026-11-01): del 22 al 30 de diciembre
 * la página NO acepta reservas en línea de NINGÚN tamaño de grupo —
 * sold out total. El cliente debe escribir por WhatsApp para consultar
 * disponibilidad y Diego decide manualmente. (Supersede la regla
 * anterior del 2026-10-31 que solo limitaba a 5 pasajeros.)
 * Aplica TODOS los años (se compara solo mes/día) — si algún diciembre
 * no hace falta, se quita este bloque.
 *
 * Igual que la regla de 18 h, se aplica en tres puntos: cotizador,
 * checkout (cart + form) y el endpoint que crea la reserva. Además el
 * calendario (DatePicker) deshabilita visualmente esos días en las
 * superficies públicas vía isPeakSeasonCalendarDate().
 * Los quotes de admin (createQuoteAction / scripts) NO pasan por aquí
 * a propósito — Diego acepta reservas en esas fechas manualmente.
 */
export const PEAK_SEASON_MAX_PAX = 5; // ya no se usa para validar (bloqueo total); se conserva por compatibilidad

/** true si la fecha "YYYY-MM-DD" cae del 22 al 30 de diciembre (cualquier año). */
export function isPeakSeasonDate(date: string | undefined | null): boolean {
  if (!date) return false;
  const parts = date.split("-").map((s) => parseInt(s, 10));
  if (parts.length < 3) return false;
  const [, m, d] = parts;
  if (Number.isNaN(m) || Number.isNaN(d)) return false;
  return m === 12 && d >= 22 && d <= 30;
}

/**
 * Versión Date (para el calendario): true si el día cae del 22 al 30
 * de diciembre de cualquier año. El DatePicker la usa como matcher de
 * `disabled` para pintar esos días en gris en las superficies públicas.
 */
export function isPeakSeasonCalendarDate(d: Date): boolean {
  return d.getMonth() === 11 && d.getDate() >= 22 && d.getDate() <= 30;
}

/**
 * true si la reserva pasa la regla. Desde 2026-11-01 el bloqueo es
 * TOTAL: cualquier fecha pico falla sin importar el número de
 * pasajeros (el parámetro se conserva para no romper a los llamadores).
 * Permisivo sin fecha (otros validadores piden la fecha primero).
 */
export function isPeakSeasonPaxOk(
  date: string | undefined | null,
  _totalPax: number,
): boolean {
  return !isPeakSeasonDate(date);
}

/**
 * Versión para el carrito: revisa TODOS los viajes (no solo el primero —
 * cualquier tramo en fechas pico bloquea el checkout completo).
 */
export function isCartPeakSeasonOk(
  items: ReadonlyArray<{ date?: string; passengers?: number }>,
): boolean {
  if (!items || items.length === 0) return true;
  return items.every((it) =>
    isPeakSeasonPaxOk(it.date, Number(it.passengers) || 0),
  );
}

export const PEAK_SEASON_MESSAGE_EN =
  "🎄 Dec 22–30 we are SOLD OUT for online booking. WhatsApp us at +506 8633-4133 to ask about availability — we may still be able to help.";

export const PEAK_SEASON_MESSAGE_ES =
  "🎄 Del 22 al 30 de diciembre estamos SOLD OUT para reservas en línea. Escríbenos por WhatsApp al +506 8633-4133 para consultar disponibilidad — puede que aún podamos ayudarte.";

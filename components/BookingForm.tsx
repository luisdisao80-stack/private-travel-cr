"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Crown,
  MapPin,
  Plane,
  Clock,
  Calendar,
  Users,
  Check,
  ArrowDown,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import HotelAddressAutocomplete from "@/components/HotelAddressAutocomplete";
import type { Hotel } from "@/lib/types";
import { useCart, type CartItem } from "@/lib/CartContext";
import { COUNTRY_CODES, DEFAULT_COUNTRY, type Country } from "@/lib/country-codes";
import {
  isAirport,
  VIP_EXTRA_USD,
  nightSurchargeFor,
  computeTripTotal,
  getVehicleForPax,
  getVehicleName,
  MAX_TOTAL_PAX,
} from "@/lib/quote-helpers";
import { events } from "@/lib/analytics";
import { getAttribution } from "@/lib/attribution";
import { useCurrency } from "@/lib/CurrencyContext";
import { useLanguage } from "@/lib/LanguageContext";
import { formatPrice } from "@/lib/currency";
import {
  isFirstTripLeadTimeOk,
  isPickupWithinLeadTime,
  parseCostaRicaPickup,
  getMinPickupCRDate,
  getMinPickupDate,
  MIN_LEAD_TIME_HOURS,
  LEAD_TIME_MESSAGE_EN,
  LEAD_TIME_MESSAGE_ES,
  WHATSAPP_URGENT_URL_EN,
  WHATSAPP_URGENT_URL_ES,
} from "@/lib/booking-rules";
import Price from "@/components/Price";

function generateTimeOptions(): { value: string; label: string }[] {
  const times: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    const hh = h.toString().padStart(2, "0");
    const period = h < 12 ? "AM" : "PM";
    let display = h % 12;
    if (display === 0) display = 12;
    times.push({ value: `${hh}:00`, label: `${display}:00 ${period}` });
    times.push({ value: `${hh}:30`, label: `${display}:30 ${period}` });
  }
  return times;
}
const TIME_OPTIONS = generateTimeOptions();

/**
 * Qué le falta a un viaje para poder cobrarlo.
 *
 * Desde que el hero agrega al carrito directo (Diego, 2026-08) un item
 * puede llegar acá sin fecha ni hora — antes era imposible porque
 * QuoteCalculatorV2 las exigía para habilitar "Add to Cart". El checkout
 * pasa a ser el único punto donde se exige completarlas; el servidor
 * (/api/payment/start → validateShuttleItem) vuelve a chequear lo mismo
 * por si alguien fuerza el POST desde una pestaña vieja.
 */
type TripGap = "date" | "time" | "passengers" | "capacity";

function tripGap(item: CartItem): TripGap | null {
  if (!item.date) return "date";
  if (!item.pickupTime) return "time";
  if (!(item.passengers >= 1)) return "passengers";
  if (item.passengers > MAX_TOTAL_PAX) return "capacity";
  return null;
}

function tripGapMessage(
  gap: TripGap,
  tripNumber: number,
  route: string,
  lang: "en" | "es",
): string {
  const trip =
    lang === "es"
      ? `El viaje #${tripNumber} (${route})`
      : `Trip #${tripNumber} (${route})`;
  switch (gap) {
    case "date":
      return lang === "es"
        ? `${trip} no tiene fecha de viaje. Elegila arriba para continuar.`
        : `${trip} has no travel date. Pick one above to continue.`;
    case "time":
      return lang === "es"
        ? `${trip} no tiene hora de recogida. Elegila arriba para continuar.`
        : `${trip} has no pickup time. Pick one above to continue.`;
    case "passengers":
      return lang === "es"
        ? `${trip} necesita al menos 1 pasajero.`
        : `${trip} needs at least 1 passenger.`;
    case "capacity":
      return lang === "es"
        ? `${trip} supera los ${MAX_TOTAL_PAX} pasajeros. Escribinos por WhatsApp y lo cotizamos con más vehículos.`
        : `${trip} is over ${MAX_TOTAL_PAX} passengers. WhatsApp us and we'll quote it with extra vehicles.`;
  }
}

type BookingFormProps = {
  onBack: () => void;
  /** Optional hotels list to power address autocomplete inside each
   *  TripConfigCard. When omitted (e.g., cart drawer, which doesn't
   *  server-fetch hotels) the fields fall back to plain free-text —
   *  same UX as before autocomplete existed. */
  hotels?: Hotel[];
};

type FlightStateMap = Record<string, { number: string; time: string }>;

export default function BookingForm({ onBack, hotels = [] }: BookingFormProps) {
  const { items, updateItem, removeItem, totalPrice } = useCart();
  const { currency, hydrated } = useCurrency();
  const { lang } = useLanguage();
  const es = lang === "es";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 12h lead-time guard. In practice the calculator already blocks bad
  // slots at pick time, but a cart hydrated from localStorage could hold
  // a trip that was valid yesterday and isn't anymore. Also protects
  // against a visitor sitting on the checkout screen until the window
  // closes on them.
  const firstTripLeadTimeOk = isFirstTripLeadTimeOk(items);

  // Tilopay charges USD — that's the only number the bank sees. Show
  // the converted approximation parenthetically when the visitor is
  // browsing in a different currency, so they understand the rate
  // without ever doubting what hits their card.
  const showCurrencyHint = hydrated && currency !== "USD";
  const convertedTotal = formatPrice(totalPrice, currency);

  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneLocal: "",
    notes: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Per-trip flight-time state lives only in the form — the cart item already
  // stores flightNumber; flightTime is just a hint sent in the booking payload.
  const [flightByItem, setFlightByItem] = useState<FlightStateMap>({});

  const handleChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Flight number is HELPFUL (not required) for every trip that picks UP
  // at an airport — Diego uses it to track the flight for delays, but per
  // his 2026-08-18 request it must no longer block checkout. Trips that
  // DROP OFF at an airport never asked for it (the customer isn't flying
  // in, they're flying out afterwards and don't have an inbound flight to
  // track). We still compute this list to show a soft, non-blocking
  // reminder — it's just no longer part of `isValid`.
  const airportTripsMissingFlight = items
    .map((it, idx) => ({ it, idx }))
    .filter(
      ({ it }) =>
        isAirport(it.fromName) && !(it.flightNumber && it.flightNumber.trim().length > 0),
    );

  // Primer viaje incompleto (sin fecha, sin hora, sin pasajeros o con
  // grupo sobre el tope). Mostramos UNO solo, el primero, para no tapar
  // el CTA con una lista de errores — el visitante lo arregla y aparece
  // el siguiente si lo hay. Mismo criterio que el banner de vuelos.
  const incompleteTrip = (() => {
    for (let i = 0; i < items.length; i++) {
      const gap = tripGap(items[i]);
      if (gap) return { index: i, gap, item: items[i] };
    }
    return null;
  })();

  const isValid =
    form.name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    // Was >= 5 — too lax. A 5-digit phone is almost certainly truncated
    // (no country in the world has a 5-digit reachable number once you
    // strip the country code), so it would slip through and Diego had
    // no way to confirm the booking. 7 keeps US/CA local numbers valid
    // while filtering out obvious truncation.
    form.phoneLocal.replace(/\D/g, "").length >= 7 &&
    items.length > 0 &&
    // Guard against a cart hydrated from a corrupt/legacy localStorage
    // state (or an item whose price failed to compute). Without this
    // the button reads "Pay $0.00 USD" and posts to Tilopay which
    // rejects the charge — a scary dead-end mid-checkout.
    totalPrice > 0 &&
    // Ningún viaje puede quedar sin fecha / hora / pasajeros. Los items
    // que entran por el quick-add del hero nacen así a propósito.
    incompleteTrip === null &&
    firstTripLeadTimeOk &&
    acceptedTerms;

  const handleSubmit = async () => {
    if (!isValid) return;
    events.beginCheckout({
      value: totalPrice,
      currency: "USD",
      itemCount: items.length,
    });
    setLoading(true);
    setError(null);

    try {
      const phone = `${country.dial} ${form.phoneLocal.trim()}`;
      // Decorate each item with its flightTime so the booking record carries it.
      const decoratedItems = items.map((it) => {
        const flight = flightByItem[it.id];
        return flight?.time ? { ...it, flightTime: flight.time } : it;
      });
      const resp = await fetch("/api/payment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name,
            email: form.email,
            phone,
            notes: form.notes || undefined,
          },
          items: decoratedItems,
          totalUsd: totalPrice,
          // First-touch marketing attribution captured on the visitor's
          // landing page (lib/attribution.ts). The API merges this with
          // server-side geo data before persisting to bookings.attribution.
          attribution: getAttribution(),
        }),
      });

      const data = (await resp.json()) as { checkoutUrl?: string; error?: string };
      if (!resp.ok || !data.checkoutUrl) {
        // We still log the real server error so admins can debug, but
        // never surface "Server returned 500" or a stack trace to the
        // visitor at the moment of payment — that's the highest-stress
        // point of the funnel and a scary message kills the booking.
        throw new Error(data.error || `Server returned ${resp.status}`);
      }
      window.location.href = data.checkoutUrl;
    } catch (e) {
      console.error("Payment start failed:", e);
      // Friendly, action-oriented copy. The previous version dumped the
      // raw error (sometimes "Server returned 500" or a JSON stack
      // fragment) to the visitor — terrifying mid-checkout. Now we tell
      // them what to do and offer WhatsApp as a fallback path so a
      // technical glitch never costs Diego the booking.
      setError(
        es
          ? "No pudimos iniciar el pago. Intentá de nuevo, o escribinos por WhatsApp al +506 8633-4133 y te hacemos la reserva a mano."
          : "We couldn't start your payment. Please try again, or message us on WhatsApp at +506 8633-4133 and we'll book you manually.",
      );
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>{es ? "Tu carrito está vacío." : "Your cart is empty."}</p>
        <button onClick={onBack} className="mt-3 text-amber-400 hover:text-amber-300 text-sm">
          ← {es ? "Volver" : "Back"}
        </button>
      </div>
    );
  }

  return (
    <div className="cart-item-in p-5 md:p-6 space-y-6">
      {/* Header row — explicit "+ Add another trip" on mobile (sidebar
          hidden) so multi-leg planners aren't stuck. The old "Back"
          label was ambiguous: easy to read as "abandon booking" rather
          than "add another shuttle to this booking". */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft size={14} />
          {lang === "es" ? "Volver" : "Back"}
        </button>
        <button
          onClick={onBack}
          className="lg:hidden inline-flex items-center gap-1.5 rounded-lg border border-dashed border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/5 px-3 py-1.5 text-xs text-amber-300 hover:text-amber-200 transition-colors"
        >
          <span className="text-base leading-none">+</span>
          {lang === "es" ? "Agregar otro viaje" : "Add another trip"}
        </button>
      </div>

      {/* One card per cart item — addresses, service type, flight all per-trip. */}
      <section className="space-y-4">
        <div className="text-amber-400 text-xs font-bold tracking-[0.18em] uppercase">
          {lang === "es" ? "Tus viajes" : "Your trips"}
        </div>
        {items.map((item, idx) => (
          <TripConfigCard
            key={item.id}
            index={idx}
            item={item}
            hotels={hotels}
            flight={flightByItem[item.id] ?? { number: item.flightNumber ?? "", time: "" }}
            onFlightChange={(next) =>
              setFlightByItem((prev) => ({ ...prev, [item.id]: next }))
            }
            onUpdateItem={(patch) => updateItem(item.id, patch)}
            onRemove={items.length > 1 ? () => removeItem(item.id) : undefined}
          />
        ))}
      </section>

      <section className="space-y-4">
        <div className="text-amber-400 text-xs font-bold tracking-[0.18em] uppercase">
          {es ? "Tus datos" : "Your information"}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-gray-300 text-sm">
              {es ? "Nombre completo" : "Full name"}{" "}
              <span className="text-red-400">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={handleChange("name")}
              placeholder={es ? "Juan Pérez" : "John Doe"}
              className="bg-black/50 border-amber-500/30 text-white h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300 text-sm">
              {es ? "Correo" : "Email"} <span className="text-red-400">*</span>
            </Label>
            <Input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder={es ? "vos@ejemplo.com" : "you@example.com"}
              className="bg-black/50 border-amber-500/30 text-white h-11"
            />
            <p className="text-[10px] text-gray-500">
              {es
                ? "Ahí te mandamos la confirmación."
                : "We'll send your confirmation here."}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-gray-300 text-sm">
            {es ? "Teléfono" : "Phone"} <span className="text-red-400">*</span>
          </Label>
          <div className="flex gap-2">
            <select
              value={country.iso2}
              onChange={(e) => {
                const next = COUNTRY_CODES.find((c) => c.iso2 === e.target.value);
                if (next) setCountry(next);
              }}
              className="w-24 sm:w-28 md:w-32 bg-black/50 border border-amber-500/30 text-white h-11 rounded-md px-2 text-sm focus:border-amber-500 outline-none shrink-0"
              aria-label={es ? "Código de país" : "Country code"}
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.iso2} value={c.iso2} className="bg-gray-900">
                  {c.flag} {c.dial}
                </option>
              ))}
            </select>
            <Input
              type="tel"
              inputMode="tel"
              value={form.phoneLocal}
              onChange={handleChange("phoneLocal")}
              placeholder="555 123 4567"
              className="bg-black/50 border-amber-500/30 text-white h-11 flex-1"
            />
          </div>
          <p className="text-[10px] text-gray-500">
            {es ? "Seleccionado:" : "Selected:"}{" "}
            <span className="text-amber-400">{country.flag} {country.name} ({country.dial})</span>
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-gray-300 text-sm">
            {es ? "Solicitudes especiales (opcional)" : "Special requests (optional)"}
          </Label>
          <textarea
            value={form.notes}
            onChange={handleChange("notes")}
            placeholder={
              es
                ? "¿Algo que debamos saber? Sillas para niños, llegada tarde, etc."
                : "Anything we should know? Child seats, late arrival, etc."
            }
            rows={3}
            className="w-full rounded-md bg-black/50 border border-amber-500/30 text-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
          />
        </div>
      </section>

      {error ? (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      ) : null}

      <label className="flex items-start gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-amber-500/40 bg-black/50 accent-amber-500 shrink-0"
        />
        <span className="text-xs text-gray-300 leading-snug">
          {es ? "Leí y acepto los " : "I have read and accept the "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
          >
            {es ? "Términos y Condiciones" : "Terms & Conditions"}
          </a>
          .
        </span>
      </label>

      {/* Inline summary of missing flight numbers — sits right above the
          Pay CTA as a gentle reminder. Flight number is helpful (Diego
          tracks it for delays) but, per his 2026-08-18 request, no longer
          blocks checkout — so this is informational only, styled amber
          (not red) to match the site's other non-blocking hints instead
          of looking like an error. */}
      {airportTripsMissingFlight.length > 0 && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
          {airportTripsMissingFlight.length === 1 ? (
            es ? (
              <>
                El viaje #{airportTripsMissingFlight[0].idx + 1} (
                {airportTripsMissingFlight[0].it.fromName}) todavía no tiene
                número de vuelo. Es opcional, pero nos ayuda a seguir tu vuelo
                por si hay atrasos — también nos lo podés mandar después.
              </>
            ) : (
              <>
                Trip #{airportTripsMissingFlight[0].idx + 1} (
                {airportTripsMissingFlight[0].it.fromName}) has no flight
                number yet. Optional, but it helps us track your flight for
                delays — you can add it later too.
              </>
            )
          ) : es ? (
            <>
              {airportTripsMissingFlight.length} viajes de aeropuerto todavía
              no tienen número de vuelo (#
              {airportTripsMissingFlight.map((t) => t.idx + 1).join(", #")}).
              Es opcional, pero nos ayuda a seguir tus vuelos por si hay
              atrasos — también nos los podés mandar después.
            </>
          ) : (
            <>
              {airportTripsMissingFlight.length} airport trips have no
              flight number yet (#
              {airportTripsMissingFlight.map((t) => t.idx + 1).join(", #")}).
              Optional, but it helps us track your flights for delays — you
              can add it later too.
            </>
          )}
        </div>
      )}

      {/* Viaje incompleto — bloqueante. Rojo (no ámbar) porque, a
          diferencia del número de vuelo, esto sí impide pagar: sin fecha
          y hora no hay chofer que asignar, y el servidor rechaza el POST
          igual. Apunta al viaje concreto por número + ruta, como el
          resto de los mensajes del carrito. */}
      {incompleteTrip && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          <p className="leading-snug">
            {tripGapMessage(
              incompleteTrip.gap,
              incompleteTrip.index + 1,
              `${incompleteTrip.item.fromName} → ${incompleteTrip.item.toName}`,
              lang === "es" ? "es" : "en",
            )}
          </p>
          {incompleteTrip.gap === "capacity" && (
            <a
              href={lang === "es" ? WHATSAPP_URGENT_URL_ES : WHATSAPP_URGENT_URL_EN}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-md bg-green-600 hover:bg-green-500 text-white font-semibold text-xs px-3 py-1.5 transition-colors"
            >
              {lang === "es" ? "Escríbenos por WhatsApp" : "WhatsApp us"}
            </a>
          )}
        </div>
      )}

      {!firstTripLeadTimeOk && items.length > 0 && (
        <div className="rounded-lg border border-amber-400/50 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
          <p className="leading-snug mb-2">
            {lang === "es" ? LEAD_TIME_MESSAGE_ES : LEAD_TIME_MESSAGE_EN}
          </p>
          <a
            href={lang === "es" ? WHATSAPP_URGENT_URL_ES : WHATSAPP_URGENT_URL_EN}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-green-600 hover:bg-green-500 text-white font-semibold text-xs px-3 py-1.5 transition-colors"
          >
            {lang === "es" ? "Escríbenos por WhatsApp" : "WhatsApp us"}
          </a>
        </div>
      )}

      {/* International-card decline disclaimer. Diego flagged 2026-06-22:
          ~45% of attempted transactions are auto-declined on busy days,
          and the dominant cause is US/Canada/EU banks treating any
          Costa Rica-origin charge as suspected fraud (geo-bias by the
          issuing bank, not Tilopay). Surfacing this expectation BEFORE
          the click — with the call-bank-to-authorize remediation and a
          WhatsApp escape hatch — converts what would be an abandoned
          decline into either (a) a successful retry after the customer
          pre-authorizes, or (b) a manual WA-based recovery by Diego.
          Yellow callout intentionally sits between the red blocker
          (missing flight) and the small grey FX disclaimer below — same
          visual hierarchy the form already uses, so it reads as "heads
          up" not "error". */}
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-xs text-amber-100/90 leading-relaxed">
        <p className="font-semibold text-amber-300 mb-1">
          {es
            ? "💳 Ojo — tarjetas internacionales"
            : "💳 Heads up — international cards"}
        </p>
        <p>
          {es
            ? "Algunos bancos de Estados Unidos, Canadá y Europa rechazan automáticamente los cobros desde Costa Rica como control de fraude. Si te rechazan la tarjeta, llamá a tu banco y autorizá el cobro a "
            : "Some US, Canada and EU banks auto-decline charges from Costa Rica as a fraud check. If your card is declined, call your bank and authorize the charge to "}
          <span className="font-semibold text-amber-200">
            &ldquo;Private Travel CR&rdquo;
          </span>{" "}
          {es ? "— o " : "— or "}
          <a
            href={
              es
                ? "https://wa.me/50686334133?text=Hola%20Diego%2C%20me%20rechazaron%20la%20tarjeta%20en%20el%20sitio.%20%C2%BFMe%20pod%C3%A9s%20enviar%20un%20enlace%20de%20pago%20alternativo%3F"
                : "https://wa.me/50686334133?text=Hi%20Diego%2C%20my%20card%20was%20declined%20on%20your%20site.%20Can%20you%20send%20me%20an%20alternative%20payment%20link%3F"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-green-400 hover:text-green-300 underline underline-offset-2"
          >
            {es ? "escribinos por WhatsApp" : "WhatsApp us"}
          </a>{" "}
          {es
            ? "y te mandamos un enlace de pago alternativo."
            : "for an alternative payment link."}
        </p>
      </div>

      {/* Zero-total guard. If localStorage was corrupted (an item stored
          with totalPrice=0 by an older calculator, or a partial write)
          the cart hydrates but the Pay button reads "Pay $0.00 USD"
          and Tilopay rejects the charge. Surfacing this early avoids
          a dead-end mid-checkout. */}
      {items.length > 0 && totalPrice <= 0 ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          {es
            ? "Tu carrito se ve vacío o dañado — recargá la página y volvé a agregar tus viajes para continuar."
            : "Your cart looks empty or invalid — please refresh the page and re-add your trips to continue."}
        </div>
      ) : null}

      {/* Last-mile reassurance checklist. The route/landing pages carry a
          full "Why book with us" block, but the checkout screen — the
          highest-anxiety moment, right before the card charge — had only
          disclaimers (declines, FX fees) and no positive trust signal.
          These four verified points (same facts as RouteTrust) sit
          directly above the Pay CTA to reinforce the decision at the exact
          instant of commitment. Bilingual to match the rest of the form. */}
      {items.length > 0 && totalPrice > 0 ? (
        <div className="rounded-xl border border-white/10 bg-gray-900/40 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-amber-400 shrink-0" />
            <span className="text-xs font-semibold text-white">
              {lang === "es"
                ? "Por qué reservar con nosotros"
                : "Why book with us"}
            </span>
          </div>
          <ul className="space-y-1.5">
            {(lang === "es"
              ? [
                  "Con licencia y seguro — transporte turístico certificado por el ICT",
                  "Seguimiento de vuelo gratis y soporte 24/7 por WhatsApp",
                  "Sillas para niños gratis · agua y WiFi a bordo",
                  "Pago seguro — tus datos de tarjeta nunca pasan por nuestros servidores",
                ]
              : [
                  "Licensed & insured — ICT-certified tourist transport",
                  "Free flight tracking & 24/7 WhatsApp support",
                  "Free child seats · water and WiFi on board",
                  "Secure payment — card details never touch our servers",
                ]
            ).map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-gray-300 leading-snug">
                <Check size={14} className="text-green-400 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Button
        onClick={handleSubmit}
        disabled={!isValid || loading}
        className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-black font-bold text-base disabled:opacity-40"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            <CreditCard size={18} className="mr-2" />
            {es ? "Pagar" : "Pay"} ${totalPrice.toFixed(2)} USD
          </>
        )}
      </Button>

      {showCurrencyHint ? (
        <p className="text-[11px] text-center text-amber-300">
          ≈ {convertedTotal} {currency}{" "}
          {es ? "al tipo de cambio de hoy" : "at today's rate"}
        </p>
      ) : null}
      <p className="text-[11px] text-center text-green-400">
        {es
          ? "Impuestos incluidos · Precio final"
          : "Taxes included · Final price"}
      </p>
      <p className="text-[10px] text-center text-gray-500">
        {es
          ? "El cobro se hace en USD por Tilopay. Tu banco aplica el tipo de cambio del día. Los datos de tu tarjeta nunca pasan por nuestros servidores."
          : "Charges in USD via Tilopay. Your card issuer applies the live conversion rate. Card details never touch our servers."}
      </p>
      {/* Foreign-transaction-fee disclaimer. Diego flagged 2026-06-22:
          a US customer (Nicole Gitto, PTCR-1515/1516) saw a ~$13 extra
          charge on her $440 booking — her bank's foreign transaction
          fee (~3% on international USD charges). She thought it was
          our charge and abandoned. Surfacing this expectation up front
          stops future customers from blaming us / disputing the
          chargeback / abandoning the second attempt. Kept as small
          italic helper copy so the legitimate paying customer barely
          notices it, but anyone confused at their bank statement gets
          the answer here first. */}
      <p className="text-[10px] text-center text-gray-500 italic mt-2 px-2">
        {es
          ? "💳 Ojo: algunos bancos (sobre todo de Estados Unidos, Canadá y Europa) cobran aparte una pequeña comisión por transacción internacional (~3%) cuando pagás a un comercio de Costa Rica. Esa comisión NO es nuestra, es de tu banco. Las tarjetas pensadas para viajar (Chase Sapphire, Capital One Venture, Amex Platinum, etc.) normalmente no la cobran."
          : "💳 Heads-up: some banks (especially in the US / Canada / EU) charge a small foreign transaction fee (~3%) on top when you pay a Costa Rica-based merchant. That fee is NOT ours — it's your bank's. Travel-friendly cards (Chase Sapphire, Capital One Venture, Amex Platinum, etc.) usually waive it."}
      </p>
    </div>
  );
}

type TripConfigCardProps = {
  index: number;
  item: CartItem;
  hotels: Hotel[];
  flight: { number: string; time: string };
  onFlightChange: (next: { number: string; time: string }) => void;
  onUpdateItem: (patch: Partial<Omit<CartItem, "id">>) => void;
  onRemove?: () => void;
};

function TripConfigCard({
  index,
  item,
  hotels,
  flight,
  onFlightChange,
  onUpdateItem,
  onRemove,
}: TripConfigCardProps) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const showFlight = isAirport(item.fromName);

  // Late-night pickup surcharge (11 PM–5 AM) is part of both service tiers,
  // so the card prices the customer picks between already reflect what will
  // be charged. It's a pure function of the trip's pickup time.
  const nightExtra = nightSurchargeFor(item.pickupTime);
  // Precios de las dos tarjetas de servicio. Misma fórmula que
  // QuoteCalculatorV2 — ahora compartida en lib/quote-helpers.ts para que
  // no se separen (el checkout ya recalcula por su cuenta).
  const standardPrice = computeTripTotal({
    basePrice: item.basePrice,
    serviceType: "standard",
    extraStopHours: item.extraStopHours,
    pickupTime: item.pickupTime,
  });
  const vipPrice = standardPrice + VIP_EXTRA_USD;

  // Controlled inputs. The previous version used defaultValue + onBlur,
  // which silently dropped data on iOS where tapping the Pay CTA from
  // inside an input (very common — they tap "Done" on the keyboard, then
  // Pay) doesn't always fire a blur first. Now every keystroke updates
  // both local state (so the input remains responsive) AND the cart
  // item (so submission can never use stale data).
  const [pickupValue, setPickupValue] = useState(
    item.pickupPlace && item.pickupPlace !== item.fromName ? item.pickupPlace : "",
  );
  const [dropoffValue, setDropoffValue] = useState(
    item.dropoffPlace && item.dropoffPlace !== item.toName ? item.dropoffPlace : "",
  );
  const [flightNumberValue, setFlightNumberValue] = useState(item.flightNumber ?? "");

  // `passengers` en el CartItem es el TOTAL (adultos + niños), igual que
  // lo guarda QuoteCalculatorV2. Los adultos son la resta.
  const [adultsStr, setAdultsStr] = useState(
    String(Math.max(0, item.passengers - item.children)),
  );
  const [childrenStr, setChildrenStr] = useState(String(item.children));
  const adults = parseInt(adultsStr, 10) || 0;
  const children = parseInt(childrenStr, 10) || 0;
  const totalPax = adults + children;
  const overCapacity = totalPax > MAX_TOTAL_PAX;

  // Se prende cuando el re-cotizado por cambio de pasajeros falla (red
  // caída o par sin tarifa). Dejamos el precio anterior — nunca ponemos 0.
  const [repriceFailed, setRepriceFailed] = useState(false);
  const [repricing, setRepricing] = useState(false);

  // Regla de 12h (lib/booking-rules.ts). Mismos tres puntos de acuerdo que
  // el calculador: `minDate` del picker, filtro de horarios y validación.
  const minPickupCRDate = getMinPickupCRDate();
  const minPickupCRIsoDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(getMinPickupDate());
  const isPickingEarliestDate = item.date === minPickupCRIsoDate;
  const timeOptionsFiltered = useMemo(() => {
    if (!isPickingEarliestDate) return TIME_OPTIONS;
    return TIME_OPTIONS.filter((opt) => {
      const pickup = parseCostaRicaPickup(item.date, opt.value);
      return pickup ? isPickupWithinLeadTime(pickup) : true;
    });
  }, [isPickingEarliestDate, item.date]);

  /**
   * Único punto de escritura al carrito desde esta tarjeta. Aplica el
   * patch y RECALCULA el total con la fórmula compartida, así ningún
   * handler puede dejar el precio desincronizado del resto del item.
   */
  const applyPatch = (patch: Partial<Omit<CartItem, "id">>) => {
    const next = { ...item, ...patch };
    onUpdateItem({
      ...patch,
      totalPrice: computeTripTotal({
        basePrice: next.basePrice,
        serviceType: next.serviceType,
        extraStopHours: next.extraStopHours,
        pickupTime: next.pickupTime,
      }),
    });
  };

  // Refs para el efecto de re-cotización: `item` y `onUpdateItem` cambian
  // de identidad en cada render del padre, y meterlos en las dependencias
  // dispararía el fetch en bucle.
  const itemRef = useRef(item);
  const updateRef = useRef(onUpdateItem);
  useEffect(() => {
    itemRef.current = item;
    updateRef.current = onUpdateItem;
  });

  // Última cantidad de pasajeros que ya cotizamos. Arranca con la del
  // item para no pegarle a la API al montar (el precio guardado ya
  // corresponde a ese tamaño de grupo).
  const lastQuotedPax = useRef(item.passengers);

  // Cambio de pasajeros → cambia el TRAMO de precio (1-5 Staria, 6-9
  // Hiace, 10-12 Maxus). No podemos derivarlo en el cliente porque los
  // precios por tramo viven en la fila de Supabase, así que le
  // preguntamos al MISMO endpoint que ya usa el preview del hero, que a
  // su vez usa getPriceForGroupSize() — la misma función que el
  // calculador. Cero reglas de precio reimplementadas acá.
  useEffect(() => {
    if (totalPax < 1 || totalPax > MAX_TOTAL_PAX) return;
    if (totalPax === lastQuotedPax.current) return;

    const controller = new AbortController();
    // Debounce: el input es numérico, teclear "12" pasa por "1".
    const timer = setTimeout(() => {
      setRepricing(true);
      const current = itemRef.current;
      fetch(
        `/api/quote/route-price?from=${encodeURIComponent(current.fromName)}&to=${encodeURIComponent(current.toName)}&adults=${totalPax}`,
        { signal: controller.signal },
      )
        .then((r) => r.json())
        .then((data: { found?: boolean; basePrice?: number; duration?: string }) => {
          if (!data?.found || !(data.basePrice && data.basePrice > 0)) {
            setRepriceFailed(true);
            return;
          }
          lastQuotedPax.current = totalPax;
          setRepriceFailed(false);
          const vehicleId = getVehicleForPax(totalPax);
          const latest = itemRef.current;
          updateRef.current({
            basePrice: data.basePrice,
            vehicleId,
            vehicleName: getVehicleName(vehicleId),
            duration: data.duration ?? latest.duration,
            totalPrice: computeTripTotal({
              basePrice: data.basePrice,
              serviceType: latest.serviceType,
              extraStopHours: latest.extraStopHours,
              pickupTime: latest.pickupTime,
            }),
          });
        })
        .catch((e) => {
          // AbortError = el visitante siguió tecleando, no es un fallo.
          if (e instanceof DOMException && e.name === "AbortError") return;
          setRepriceFailed(true);
        })
        .finally(() => setRepricing(false));
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [totalPax]);

  // Escribimos pasajeros al carrito de inmediato (la validación del Pay
  // los lee), y el efecto de arriba corrige el precio cuando llega la
  // cotización del tramo nuevo.
  const commitPax = (nextAdults: number, nextChildren: number) => {
    applyPatch({
      passengers: nextAdults + nextChildren,
      children: nextChildren,
    });
  };

  const handleAdultsChange = (val: string) => {
    if (val === "") {
      setAdultsStr("");
      commitPax(0, children);
      return;
    }
    const n = parseInt(val, 10);
    if (isNaN(n)) return;
    const clamped = Math.max(0, Math.min(MAX_TOTAL_PAX, n));
    setAdultsStr(String(clamped));
    commitPax(clamped, children);
  };

  const handleChildrenChange = (val: string) => {
    if (val === "") {
      setChildrenStr("");
      commitPax(adults, 0);
      return;
    }
    const n = parseInt(val, 10);
    if (isNaN(n)) return;
    const clamped = Math.max(0, Math.min(MAX_TOTAL_PAX - 1, n));
    setChildrenStr(String(clamped));
    commitPax(adults, clamped);
  };

  // iOS no siempre dispara blur antes del tap en Pagar, por eso el commit
  // va en cada keystroke; el blur sólo normaliza el campo vacío a 1/0.
  const handleAdultsBlur = () => {
    if (adultsStr === "" || parseInt(adultsStr, 10) === 0) {
      setAdultsStr("1");
      commitPax(1, children);
    }
  };
  const handleChildrenBlur = () => {
    if (childrenStr === "") {
      setChildrenStr("0");
      commitPax(adults, 0);
    }
  };

  const setDate = (value: string) => {
    // Si la hora ya elegida deja de ser válida para la fecha nueva
    // (movió el viaje al primer día permitido), la limpiamos para que el
    // gate de "falta la hora" se dispare en vez de dejar pasar un pickup
    // dentro de la ventana de 12h.
    const pickup = parseCostaRicaPickup(value, item.pickupTime);
    const timeStillValid =
      !item.pickupTime || !pickup || isPickupWithinLeadTime(pickup);
    applyPatch({
      date: value,
      ...(timeStillValid ? {} : { pickupTime: "" }),
    });
  };

  const setPickupTime = (value: string) => {
    // Recalcula solo: computeTripTotal aplica (o quita) el recargo
    // nocturno según la hora nueva.
    applyPatch({ pickupTime: value });
  };

  const setService = (service: "standard" | "vip") => {
    applyPatch({ serviceType: service });
  };

  const setPickup = (value: string) => {
    setPickupValue(value);
    onUpdateItem({ pickupPlace: value.trim() || item.fromName });
  };
  const setDropoff = (value: string) => {
    setDropoffValue(value);
    onUpdateItem({ dropoffPlace: value.trim() || item.toName });
  };
  const setFlightNumber = (value: string) => {
    setFlightNumberValue(value);
    onUpdateItem({ flightNumber: value.trim() || undefined });
    onFlightChange({ ...flight, number: value });
  };

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-black/30 p-4 md:p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 shrink-0">
            #{index + 1}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white flex items-start gap-1.5">
              <MapPin size={13} className="text-amber-400 mt-0.5 shrink-0" />
              <span className="break-words">{item.fromName}</span>
            </div>
            <div className="pl-[18px]">
              <ArrowDown size={11} className="text-amber-400/60" />
            </div>
            <div className="text-sm font-semibold text-white flex items-start gap-1.5">
              <MapPin size={13} className="text-amber-400 mt-0.5 shrink-0" />
              <span className="break-words">{item.toName}</span>
            </div>
          </div>
        </div>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="text-gray-500 hover:text-red-400 transition-colors p-1"
            aria-label={es ? "Quitar viaje" : "Remove trip"}
          >
            <Trash2 size={15} />
          </button>
        ) : null}
      </div>

      {/* Fecha / hora / pasajeros. Antes se elegían en QuoteCalculatorV2
          ANTES de que el viaje entrara al carrito; ahora el hero agrega
          directo y este es el lugar donde se completan (pedido de Diego:
          "al final sea donde el cliente ponga los detalles"). Va arriba
          de las tarjetas de servicio porque determina los precios que
          esas tarjetas muestran. */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-gray-300 text-xs flex items-center gap-1.5">
              <Calendar size={12} className="text-amber-400" />
              {lang === "es" ? "Fecha" : "Date"}{" "}
              <span className="text-red-400">*</span>
            </Label>
            <DatePicker
              value={item.date}
              onChange={setDate}
              placeholder={lang === "es" ? "Elegí la fecha…" : "Select date…"}
              lang={lang === "es" ? "es" : "en"}
              minDate={minPickupCRDate}
              className={
                item.date
                  ? "h-10"
                  : "h-10 border-red-500/50 ring-1 ring-red-500/30"
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300 text-xs flex items-center gap-1.5">
              <Clock size={12} className="text-amber-400" />
              {lang === "es" ? "Hora de recogida" : "Pickup time"}{" "}
              <span className="text-red-400">*</span>
            </Label>
            <select
              value={item.pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className={
                "w-full bg-black/50 border text-white h-10 rounded-md px-3 text-sm focus:border-amber-500 outline-none " +
                (item.pickupTime
                  ? "border-amber-500/30"
                  : "border-red-500/50 ring-1 ring-red-500/30")
              }
            >
              <option value="">
                {lang === "es" ? "Elegí la hora…" : "Select time…"}
              </option>
              {timeOptionsFiltered.map((t) => (
                <option key={t.value} value={t.value} className="bg-gray-900">
                  {t.label}
                </option>
              ))}
            </select>
            {isPickingEarliestDate &&
              timeOptionsFiltered.length < TIME_OPTIONS.length && (
                <p className="text-[10px] text-gray-500">
                  {lang === "es"
                    ? `Los horarios antes requieren ${MIN_LEAD_TIME_HOURS}h de anticipación — escogé un horario más tarde u otro día.`
                    : `Earlier times need ${MIN_LEAD_TIME_HOURS}h notice — pick a later slot or day.`}
                </p>
              )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-gray-300 text-xs flex items-center gap-1.5">
            <Users size={12} className="text-amber-400" />
            {lang === "es" ? "Pasajeros" : "Passengers"}{" "}
            <span className="text-red-400">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/40 border border-white/10 rounded-lg p-2.5">
              <div className="text-[10px] text-gray-400">
                {lang === "es" ? "Adultos" : "Adults"}{" "}
                <span className="text-gray-600">
                  {lang === "es" ? "12+ años" : "12+ years"}
                </span>
              </div>
              <input
                type="number"
                min="1"
                max={MAX_TOTAL_PAX}
                inputMode="numeric"
                value={adultsStr}
                onChange={(e) => handleAdultsChange(e.target.value)}
                onBlur={handleAdultsBlur}
                className="mt-1 w-full bg-black border border-white/20 text-white rounded px-2 py-1.5 text-sm"
              />
            </div>
            <div className="bg-black/40 border border-white/10 rounded-lg p-2.5">
              <div className="text-[10px] text-gray-400">
                {lang === "es" ? "Niños" : "Children"}{" "}
                <span className="text-gray-600">
                  {lang === "es" ? "0-11 años" : "0-11 years"}
                </span>
              </div>
              <input
                type="number"
                min="0"
                max={MAX_TOTAL_PAX - 1}
                inputMode="numeric"
                value={childrenStr}
                onChange={(e) => handleChildrenChange(e.target.value)}
                onBlur={handleChildrenBlur}
                className="mt-1 w-full bg-black border border-white/20 text-white rounded px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          {overCapacity ? (
            <p className="text-[11px] text-red-400">
              {lang === "es"
                ? `Máximo ${MAX_TOTAL_PAX} en total. Escribinos por WhatsApp para grupos más grandes.`
                : `Max ${MAX_TOTAL_PAX} total. Contact us via WhatsApp for larger groups.`}
            </p>
          ) : (
            <p className="text-[11px] text-gray-500">
              {totalPax}{" "}
              {totalPax === 1
                ? lang === "es"
                  ? "pasajero"
                  : "passenger"
                : lang === "es"
                  ? "pasajeros"
                  : "passengers"}{" "}
              · {item.vehicleName}
              {repricing ? (
                <span className="text-amber-400/80">
                  {" "}
                  · {lang === "es" ? "recalculando…" : "updating price…"}
                </span>
              ) : null}
            </p>
          )}
          {repriceFailed && !overCapacity ? (
            <p className="text-[11px] text-amber-300/90">
              {lang === "es"
                ? "No pudimos actualizar el precio para ese grupo. Mantenemos el precio anterior — confirmalo con nosotros por WhatsApp antes de pagar."
                : "We couldn't update the price for that group size. Keeping the previous price — please confirm with us on WhatsApp before paying."}
            </p>
          ) : null}
          {/*
            Las paradas se eligen en la página de la ruta, dos pantallas
            antes de acá. Sin esta línea el cliente llega al checkout, ve
            $290 en vez de $220 y no tiene NADA en pantalla que le diga
            que los $70 son el Poás que él mismo marcó: parece un cobro
            inventado y o escribe por WhatsApp o abandona el pago.
            Va acá adentro y no en el bloque de precio porque pertenece
            al tramo (cada viaje trae sus propias paradas), igual que en
            el carrito y en el correo de confirmación.
          */}
          {item.extraStopNames?.length ? (
            <p className="text-[11px] text-amber-300/90">
              {es ? "Paradas: " : "Stops: "}
              {item.extraStopNames.join(" · ")}
              {item.extraStopHours > 0 ? (
                <span className="text-gray-500">
                  {" "}
                  ({item.extraStopHours}h{" "}
                  {es ? "de espera, ya incluidas" : "of waiting, already included"})
                </span>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <div className="text-[10px] text-amber-300 font-bold tracking-[0.18em] uppercase mb-2">
          {es ? "Servicio" : "Service"}
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <ServiceCard
            label={es ? "Estándar" : "Standard"}
            tagline={es ? "Rápido y eficiente" : "Fast & efficient"}
            description={
              es
                ? "Viaje privado directo — sin paradas, sin esperas"
                : "Private direct ride — no stops, no waiting"
            }
            priceUsd={standardPrice}
            selected={item.serviceType === "standard"}
            onClick={() => setService("standard")}
            features={
              es
                ? [
                    "Ruta directa, sin desvíos",
                    "Servicio puerta a puerta",
                    "Chofer profesional bilingüe",
                    "WiFi a bordo y agua embotellada",
                    "Sillas para niños gratis a pedido",
                    "Seguimiento de vuelo y seguro completo",
                  ]
                : [
                    "Direct route, no detours",
                    "Door-to-door service",
                    "Bilingual professional driver",
                    "Onboard WiFi & bottled water",
                    "Free child seats on request",
                    "Flight tracking & full insurance",
                  ]
            }
            ideal={
              es
                ? "Ideal para traslados de aeropuerto y horarios ajustados"
                : "Ideal for airport transfers and tight schedules"
            }
          />
          <ServiceCard
            label="VIP"
            tagline={es ? "Experiencia premium" : "Premium experience"}
            description={
              es
                ? "Paradas turísticas, welcome kit, chofer que te guía"
                : "Tourist stops, welcome kit, driver who guides you"
            }
            priceUsd={vipPrice}
            priceNote={
              es
                ? `+$${VIP_EXTRA_USD} sobre el Estándar`
                : `+$${VIP_EXTRA_USD} over Standard`
            }
            selected={item.serviceType === "vip"}
            onClick={() => setService("vip")}
            crown
            badge={es ? "EL MÁS POPULAR" : "MOST POPULAR"}
            features={
              es
                ? [
                    "Parada turística flexible de 1–2h",
                    "Welcome Kit: cervezas locales, gaseosas, snacks",
                    "Agua con gas San Pellegrino",
                    "Chofer concierge — recomendaciones personalizadas",
                    "Cargadores USB y WiFi a bordo",
                    "Recomendado para lunas de miel",
                    "Todo lo del Estándar, y más",
                  ]
                : [
                    "1–2h flexible tourist stop",
                    "Welcome Kit: local beers, sodas, snacks",
                    "San Pellegrino sparkling water",
                    "Concierge driver — personalized tips",
                    "USB chargers & onboard WiFi",
                    "Recommended for honeymoons",
                    "Everything in Standard, plus more",
                  ]
            }
            ideal={
              es
                ? "Perfecto para lunas de miel y viajes inolvidables"
                : "Perfect for honeymoons and unforgettable trips"
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-gray-300 text-xs flex items-center gap-1.5">
            <MapPin size={12} className="text-amber-400" />
            {es ? "Dirección de recogida" : "Pickup address"}
          </Label>
          <HotelAddressAutocomplete
            value={pickupValue}
            onChange={setPickup}
            hotels={hotels}
            contextArea={item.fromName}
            placeholder={
              es
                ? `Hotel, Airbnb o dirección en ${item.fromName}`
                : `Hotel, Airbnb or address in ${item.fromName}`
            }
            inputClassName="w-full bg-black/50 border border-amber-500/30 text-white rounded-md h-10 px-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-gray-300 text-xs flex items-center gap-1.5">
            <MapPin size={12} className="text-amber-400" />
            {es ? "Dirección de destino" : "Drop-off address"}
          </Label>
          <HotelAddressAutocomplete
            value={dropoffValue}
            onChange={setDropoff}
            hotels={hotels}
            contextArea={item.toName}
            placeholder={
              es
                ? `Hotel, Airbnb o dirección en ${item.toName}`
                : `Hotel, Airbnb or address in ${item.toName}`
            }
            inputClassName="w-full bg-black/50 border border-amber-500/30 text-white rounded-md h-10 px-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        {showFlight ? (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-xs flex items-center gap-1.5">
                <Plane size={12} className="text-amber-400" />
                {es ? "Número de vuelo" : "Flight number"}{" "}
                <span className="text-gray-500 font-normal">
                  {es ? "(opcional)" : "(optional)"}
                </span>
              </Label>
              <Input
                value={flightNumberValue}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                placeholder={es ? "ej. UA1234" : "e.g. UA1234"}
                className="bg-black/50 text-white h-10 uppercase border-amber-500/30"
              />
              {flightNumberValue.trim().length === 0 && (
                <p className="text-[10px] text-gray-500 mt-1">
                  {es
                    ? "Opcional — nos ayuda a seguir tu vuelo por si hay atrasos. También nos lo podés mandar después por WhatsApp."
                    : "Optional — helps us track your flight for delays. You can also send it later on WhatsApp."}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-xs flex items-center gap-1.5">
                <Clock size={12} className="text-amber-400" />
                {es ? "Hora del vuelo" : "Flight time"}
              </Label>
              <select
                value={flight.time}
                onChange={(e) => onFlightChange({ ...flight, time: e.target.value })}
                className="w-full bg-black/50 border border-amber-500/30 text-white h-10 rounded-md px-3 text-sm focus:border-amber-500 outline-none"
              >
                <option value="">{es ? "Elegí la hora…" : "Select time…"}</option>
                {TIME_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value} className="bg-gray-900">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}
      </div>

      {nightExtra > 0 ? (
        <div className="flex items-center justify-between text-[11px] text-amber-300/90">
          <span>
            {lang === "es"
              ? "Recargo por recogida nocturna (11PM–5AM)"
              : "Late-night pickup surcharge (11PM–5AM)"}
          </span>
          <span className="font-semibold">+<Price usd={nightExtra} /></span>
        </div>
      ) : null}

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="text-xs text-gray-400">
          {es ? "Total del viaje" : "Trip total"}
        </span>
        <span className="text-lg font-bold text-white"><Price usd={item.totalPrice} /></span>
      </div>
    </div>
  );
}

function ServiceCard({
  label,
  tagline,
  description,
  priceUsd,
  priceNote,
  selected,
  onClick,
  features,
  crown,
  badge,
  ideal,
}: {
  label: string;
  tagline?: string;
  description: string;
  /** USD source-of-truth price; Price component handles the conversion. */
  priceUsd: number;
  priceNote?: string;
  selected: boolean;
  onClick: () => void;
  features: string[];
  crown?: boolean;
  badge?: string;
  ideal?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "relative text-left rounded-xl p-4 border-2 transition-all " +
        (selected
          ? "border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/20"
          : "border-white/10 bg-gray-900/40 hover:border-amber-500/40")
      }
    >
      {badge ? (
        <span className="absolute -top-2.5 right-3 px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-bold tracking-wider shadow">
          {badge}
        </span>
      ) : null}

      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="font-bold text-white text-base flex items-center gap-1.5 leading-tight">
            {crown ? <Crown size={15} className="text-amber-400" /> : null}
            {label}
          </div>
          {tagline ? (
            <div className="text-[10px] text-amber-300/80 font-semibold tracking-wider uppercase mt-0.5">
              {tagline}
            </div>
          ) : null}
        </div>
        {selected ? (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-black shrink-0">
            <Check size={11} strokeWidth={3} />
          </span>
        ) : null}
      </div>

      <p className="text-[11px] text-gray-400 mb-2 leading-snug">{description}</p>

      <div className="mb-2">
        <div className="text-xl font-bold text-white leading-none">
          <Price usd={priceUsd} />
        </div>
        {priceNote ? (
          <div className="text-[10px] text-amber-400/90 mt-0.5">{priceNote}</div>
        ) : null}
      </div>

      <ul className="space-y-1 mb-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-1.5 text-[11px] text-gray-300 leading-tight">
            <Check size={11} className="text-amber-400 shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {ideal ? (
        <div className="pt-2 mt-2 border-t border-white/5 text-[10px] text-gray-400 italic leading-tight">
          {ideal}
        </div>
      ) : null}
    </button>
  );
}

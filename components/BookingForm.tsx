"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Crown,
  MapPin,
  Plane,
  Clock,
  Check,
  ArrowDown,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import HotelAddressAutocomplete from "@/components/HotelAddressAutocomplete";
import type { Hotel } from "@/lib/types";
import { useCart, type CartItem } from "@/lib/CartContext";
import { COUNTRY_CODES, DEFAULT_COUNTRY, type Country } from "@/lib/country-codes";
import { isAirport, VIP_EXTRA_USD } from "@/lib/quote-helpers";
import { events } from "@/lib/analytics";
import { getAttribution } from "@/lib/attribution";
import { useCurrency } from "@/lib/CurrencyContext";
import { useLanguage } from "@/lib/LanguageContext";
import { formatPrice } from "@/lib/currency";
import {
  isFirstTripLeadTimeOk,
  LEAD_TIME_MESSAGE_EN,
  LEAD_TIME_MESSAGE_ES,
  WHATSAPP_URGENT_URL_EN,
  WHATSAPP_URGENT_URL_ES,
} from "@/lib/booking-rules";
import Price from "@/components/Price";

const EXTRA_STOP_PRICE = 35;

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

  // Flight number is required for every trip that picks UP at an
  // airport — without it Diego can't track the flight for delays and
  // ends up chasing the customer on WhatsApp for the missing info
  // hours before pickup. We DON'T require it for trips that DROP OFF
  // at an airport (the customer isn't flying in, they're flying out
  // afterwards and don't have an inbound flight to track).
  const airportTripsMissingFlight = items
    .map((it, idx) => ({ it, idx }))
    .filter(
      ({ it }) =>
        isAirport(it.fromName) && !(it.flightNumber && it.flightNumber.trim().length > 0),
    );

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
    airportTripsMissingFlight.length === 0 &&
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
        "We couldn't start your payment. Please try again, or message us on WhatsApp at +506 8633-4133 and we'll book you manually.",
      );
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>Your cart is empty.</p>
        <button onClick={onBack} className="mt-3 text-amber-400 hover:text-amber-300 text-sm">
          ← Back
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 md:p-6 space-y-6"
    >
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
          Back
        </button>
        <button
          onClick={onBack}
          className="lg:hidden inline-flex items-center gap-1.5 rounded-lg border border-dashed border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/5 px-3 py-1.5 text-xs text-amber-300 hover:text-amber-200 transition-colors"
        >
          <span className="text-base leading-none">+</span>
          Add another trip
        </button>
      </div>

      {/* One card per cart item — addresses, service type, flight all per-trip. */}
      <section className="space-y-4">
        <div className="text-amber-400 text-xs font-bold tracking-[0.18em] uppercase">
          Your trips
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
          Your information
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-gray-300 text-sm">
              Full name <span className="text-red-400">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={handleChange("name")}
              placeholder="John Doe"
              className="bg-black/50 border-amber-500/30 text-white h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300 text-sm">
              Email <span className="text-red-400">*</span>
            </Label>
            <Input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="you@example.com"
              className="bg-black/50 border-amber-500/30 text-white h-11"
            />
            <p className="text-[10px] text-gray-500">We&apos;ll send your confirmation here.</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-gray-300 text-sm">
            Phone <span className="text-red-400">*</span>
          </Label>
          <div className="flex gap-2">
            <select
              value={country.iso2}
              onChange={(e) => {
                const next = COUNTRY_CODES.find((c) => c.iso2 === e.target.value);
                if (next) setCountry(next);
              }}
              className="w-24 sm:w-28 md:w-32 bg-black/50 border border-amber-500/30 text-white h-11 rounded-md px-2 text-sm focus:border-amber-500 outline-none shrink-0"
              aria-label="Country code"
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
            Selected: <span className="text-amber-400">{country.flag} {country.name} ({country.dial})</span>
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-gray-300 text-sm">Special requests (optional)</Label>
          <textarea
            value={form.notes}
            onChange={handleChange("notes")}
            placeholder="Anything we should know? Child seats, late arrival, etc."
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
          I have read and accept the{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
          >
            Terms &amp; Conditions
          </a>
          .
        </span>
      </label>

      {/* Inline summary of missing flight numbers — sits right above
          the Pay CTA so a visitor who can't see why the button is
          disabled gets a clear pointer to the offending trip(s) without
          scrolling back up. Per-card red helper text already exists in
          the trip card itself; this is the cross-trip aggregate. */}
      {airportTripsMissingFlight.length > 0 && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          {airportTripsMissingFlight.length === 1 ? (
            <>
              Trip #{airportTripsMissingFlight[0].idx + 1} (
              {airportTripsMissingFlight[0].it.fromName}) is missing a
              flight number. We need it to track your flight for delays.
            </>
          ) : (
            <>
              {airportTripsMissingFlight.length} airport trips are missing
              flight numbers (#
              {airportTripsMissingFlight.map((t) => t.idx + 1).join(", #")}).
              We need them to track your flights for delays.
            </>
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
          💳 Heads up — international cards
        </p>
        <p>
          Some US, Canada and EU banks auto-decline charges from Costa
          Rica as a fraud check. If your card is declined, call your bank
          and authorize the charge to{" "}
          <span className="font-semibold text-amber-200">
            &ldquo;Private Travel CR&rdquo;
          </span>{" "}
          — or{" "}
          <a
            href="https://wa.me/50686334133?text=Hi%20Diego%2C%20my%20card%20was%20declined%20on%20your%20site.%20Can%20you%20send%20me%20an%20alternative%20payment%20link%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-green-400 hover:text-green-300 underline underline-offset-2"
          >
            WhatsApp us
          </a>{" "}
          for an alternative payment link.
        </p>
      </div>

      {/* Zero-total guard. If localStorage was corrupted (an item stored
          with totalPrice=0 by an older calculator, or a partial write)
          the cart hydrates but the Pay button reads "Pay $0.00 USD"
          and Tilopay rejects the charge. Surfacing this early avoids
          a dead-end mid-checkout. */}
      {items.length > 0 && totalPrice <= 0 ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          Your cart looks empty or invalid — please refresh the page and
          re-add your trips to continue.
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
            Pay ${totalPrice.toFixed(2)} USD
          </>
        )}
      </Button>

      {showCurrencyHint ? (
        <p className="text-[11px] text-center text-amber-300">
          ≈ {convertedTotal} {currency} at today&apos;s rate
        </p>
      ) : null}
      <p className="text-[11px] text-center text-green-400">
        Taxes included · Final price
      </p>
      <p className="text-[10px] text-center text-gray-500">
        Charges in USD via Tilopay. Your card issuer applies the live
        conversion rate. Card details never touch our servers.
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
        💳 Heads-up: some banks (especially in the US / Canada / EU)
        charge a small foreign transaction fee (~3%) on top when you
        pay a Costa Rica-based merchant. That fee is NOT ours — it&apos;s
        your bank&apos;s. Travel-friendly cards (Chase Sapphire, Capital
        One Venture, Amex Platinum, etc.) usually waive it.
      </p>
    </motion.div>
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
  const showFlight = isAirport(item.fromName);

  const standardPrice = item.basePrice + item.extraStopHours * EXTRA_STOP_PRICE;
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

  const setService = (service: "standard" | "vip") => {
    const stopsCost = item.extraStopHours * EXTRA_STOP_PRICE;
    const totalForItem =
      item.basePrice + (service === "vip" ? VIP_EXTRA_USD : 0) + stopsCost;
    onUpdateItem({ serviceType: service, totalPrice: totalForItem });
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
            aria-label="Remove trip"
          >
            <Trash2 size={15} />
          </button>
        ) : null}
      </div>

      <div>
        <div className="text-[10px] text-amber-300 font-bold tracking-[0.18em] uppercase mb-2">
          Service
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <ServiceCard
            label="Standard"
            tagline="Fast & efficient"
            description="Private direct ride — no stops, no waiting"
            priceUsd={standardPrice}
            selected={item.serviceType === "standard"}
            onClick={() => setService("standard")}
            features={[
              "Direct route, no detours",
              "Door-to-door service",
              "Bilingual professional driver",
              "Onboard WiFi & bottled water",
              "Free child seats on request",
              "Flight tracking & full insurance",
            ]}
            ideal="Ideal for airport transfers and tight schedules"
          />
          <ServiceCard
            label="VIP"
            tagline="Premium experience"
            description="Tourist stops, welcome kit, driver who guides you"
            priceUsd={vipPrice}
            priceNote={`+$${VIP_EXTRA_USD} over Standard`}
            selected={item.serviceType === "vip"}
            onClick={() => setService("vip")}
            crown
            badge="MOST POPULAR"
            features={[
              "1–2h flexible tourist stop",
              "Welcome Kit: local beers, sodas, snacks",
              "San Pellegrino sparkling water",
              "Concierge driver — personalized tips",
              "USB chargers & onboard WiFi",
              "Recommended for honeymoons",
              "Everything in Standard, plus more",
            ]}
            ideal="Perfect for honeymoons and unforgettable trips"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-gray-300 text-xs flex items-center gap-1.5">
            <MapPin size={12} className="text-amber-400" />
            Pickup address
          </Label>
          <HotelAddressAutocomplete
            value={pickupValue}
            onChange={setPickup}
            hotels={hotels}
            contextArea={item.fromName}
            placeholder={`Hotel, Airbnb or address in ${item.fromName}`}
            inputClassName="w-full bg-black/50 border border-amber-500/30 text-white rounded-md h-10 px-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-gray-300 text-xs flex items-center gap-1.5">
            <MapPin size={12} className="text-amber-400" />
            Drop-off address
          </Label>
          <HotelAddressAutocomplete
            value={dropoffValue}
            onChange={setDropoff}
            hotels={hotels}
            contextArea={item.toName}
            placeholder={`Hotel, Airbnb or address in ${item.toName}`}
            inputClassName="w-full bg-black/50 border border-amber-500/30 text-white rounded-md h-10 px-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        {showFlight ? (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-xs flex items-center gap-1.5">
                <Plane size={12} className="text-amber-400" />
                Flight number <span className="text-red-400">*</span>
              </Label>
              <Input
                value={flightNumberValue}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                placeholder="e.g. UA1234"
                required
                aria-required="true"
                className={`bg-black/50 text-white h-10 uppercase ${
                  flightNumberValue.trim().length === 0
                    ? "border-red-500/60 focus:border-red-400"
                    : "border-amber-500/30"
                }`}
              />
              {flightNumberValue.trim().length === 0 && (
                <p className="text-[10px] text-red-400 mt-1">
                  Required for airport pickups so we can track your flight
                  for delays.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-xs flex items-center gap-1.5">
                <Clock size={12} className="text-amber-400" />
                Flight time
              </Label>
              <select
                value={flight.time}
                onChange={(e) => onFlightChange({ ...flight, time: e.target.value })}
                className="w-full bg-black/50 border border-amber-500/30 text-white h-10 rounded-md px-3 text-sm focus:border-amber-500 outline-none"
              >
                <option value="">Select time…</option>
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

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="text-xs text-gray-400">Trip total</span>
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

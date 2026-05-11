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
import { useCart, type CartItem } from "@/lib/CartContext";
import { COUNTRY_CODES, DEFAULT_COUNTRY, type Country } from "@/lib/country-codes";
import { isAirport, VIP_EXTRA_USD } from "@/lib/quote-helpers";

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
};

type FlightStateMap = Record<string, { number: string; time: string }>;

export default function BookingForm({ onBack }: BookingFormProps) {
  const { items, updateItem, removeItem, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneLocal: "",
    notes: "",
  });

  // Per-trip flight-time state lives only in the form — the cart item already
  // stores flightNumber; flightTime is just a hint sent in the booking payload.
  const [flightByItem, setFlightByItem] = useState<FlightStateMap>({});

  const handleChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const isValid =
    form.name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.phoneLocal.trim().length >= 5 &&
    items.length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
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
        }),
      });

      const data = (await resp.json()) as { checkoutUrl?: string; error?: string };
      if (!resp.ok || !data.checkoutUrl) {
        throw new Error(data.error || `Server returned ${resp.status}`);
      }
      window.location.href = data.checkoutUrl;
    } catch (e) {
      console.error("Payment start failed:", e);
      setError(e instanceof Error ? e.message : "Could not start payment. Please try again.");
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
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft size={14} />
        Back
      </button>

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

        <div className="grid sm:grid-cols-2 gap-3">
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
              className="w-32 bg-black/50 border border-amber-500/30 text-white h-11 rounded-md px-2 text-sm focus:border-amber-500 outline-none"
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

      <p className="text-[10px] text-center text-gray-500">
        Secure payment processed by Tilopay. Your card details never touch our servers.
      </p>
    </motion.div>
  );
}

type TripConfigCardProps = {
  index: number;
  item: CartItem;
  flight: { number: string; time: string };
  onFlightChange: (next: { number: string; time: string }) => void;
  onUpdateItem: (patch: Partial<Omit<CartItem, "id">>) => void;
  onRemove?: () => void;
};

function TripConfigCard({
  index,
  item,
  flight,
  onFlightChange,
  onUpdateItem,
  onRemove,
}: TripConfigCardProps) {
  const showFlight = isAirport(item.fromName);

  const standardPrice = item.basePrice + item.extraStopHours * EXTRA_STOP_PRICE;
  const vipPrice = standardPrice + VIP_EXTRA_USD;

  const setService = (service: "standard" | "vip") => {
    const stopsCost = item.extraStopHours * EXTRA_STOP_PRICE;
    const totalForItem =
      item.basePrice + (service === "vip" ? VIP_EXTRA_USD : 0) + stopsCost;
    onUpdateItem({ serviceType: service, totalPrice: totalForItem });
  };

  const setPickup = (value: string) => {
    onUpdateItem({ pickupPlace: value.trim() || item.fromName });
  };
  const setDropoff = (value: string) => {
    onUpdateItem({ dropoffPlace: value.trim() || item.toName });
  };
  const setFlightNumber = (value: string) => {
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
            description="Direct ride"
            price={standardPrice}
            selected={item.serviceType === "standard"}
            onClick={() => setService("standard")}
            features={["A/C", "WiFi", "Water", "Luggage"]}
          />
          <ServiceCard
            label="VIP"
            description="Tourist stops, snacks, concierge"
            price={vipPrice}
            selected={item.serviceType === "vip"}
            onClick={() => setService("vip")}
            crown
            features={["1-2h stop", "Welcome kit", `+$${VIP_EXTRA_USD}`]}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-gray-300 text-xs flex items-center gap-1.5">
            <MapPin size={12} className="text-amber-400" />
            Pickup address
          </Label>
          <Input
            defaultValue={
              item.pickupPlace && item.pickupPlace !== item.fromName ? item.pickupPlace : ""
            }
            onBlur={(e) => setPickup(e.target.value)}
            placeholder={`Hotel, Airbnb or address in ${item.fromName}`}
            className="bg-black/50 border-amber-500/30 text-white h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-gray-300 text-xs flex items-center gap-1.5">
            <MapPin size={12} className="text-amber-400" />
            Drop-off address
          </Label>
          <Input
            defaultValue={
              item.dropoffPlace && item.dropoffPlace !== item.toName ? item.dropoffPlace : ""
            }
            onBlur={(e) => setDropoff(e.target.value)}
            placeholder={`Hotel, Airbnb or address in ${item.toName}`}
            className="bg-black/50 border-amber-500/30 text-white h-10"
          />
        </div>

        {showFlight ? (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-xs flex items-center gap-1.5">
                <Plane size={12} className="text-amber-400" />
                Flight number
              </Label>
              <Input
                defaultValue={item.flightNumber ?? ""}
                onBlur={(e) => setFlightNumber(e.target.value.toUpperCase())}
                placeholder="e.g. UA1234"
                className="bg-black/50 border-amber-500/30 text-white h-10 uppercase"
              />
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
        <span className="text-lg font-bold text-white">${item.totalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}

function ServiceCard({
  label,
  description,
  price,
  selected,
  onClick,
  features,
  crown,
}: {
  label: string;
  description: string;
  price: number;
  selected: boolean;
  onClick: () => void;
  features: string[];
  crown?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "relative text-left rounded-xl p-3 border-2 transition-all " +
        (selected
          ? "border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/20"
          : "border-white/10 bg-gray-900/40 hover:border-amber-500/40")
      }
    >
      <div className="flex items-start justify-between mb-1">
        <div className="font-bold text-white text-sm flex items-center gap-1.5">
          {crown ? <Crown size={14} className="text-amber-400" /> : null}
          {label}
        </div>
        {selected ? (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-black">
            <Check size={11} strokeWidth={3} />
          </span>
        ) : null}
      </div>
      <p className="text-[10px] text-gray-400 mb-1.5">{description}</p>
      <div className="text-lg font-bold text-white mb-1.5">
        ${price.toFixed(0)}
        <span className="text-[10px] text-gray-400 font-normal ml-1">USD</span>
      </div>
      <ul className="space-y-0.5">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-1 text-[10px] text-gray-300">
            <Check size={10} className="text-amber-400 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </button>
  );
}

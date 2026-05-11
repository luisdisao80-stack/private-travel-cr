"use client";

import { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/CartContext";
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

export default function BookingForm({ onBack }: BookingFormProps) {
  const { items, updateItem, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For the checkout we focus on the most recent cart item. Multi-trip carts still total
  // correctly via totalPrice — the service-type cards apply to the latest trip.
  const item = items[items.length - 1];
  const showFlight = !!item && isAirport(item.fromName);

  // Customer form state
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneLocal: "",
    pickupAddress: "",
    dropoffAddress: "",
    flightNumber: "",
    flightTime: "",
    notes: "",
  });

  // Seed pickup/dropoff addresses from cart item once it's available.
  useEffect(() => {
    if (!item) return;
    setForm((prev) => ({
      ...prev,
      pickupAddress:
        prev.pickupAddress ||
        (item.pickupPlace && item.pickupPlace !== item.fromName ? item.pickupPlace : ""),
      dropoffAddress:
        prev.dropoffAddress ||
        (item.dropoffPlace && item.dropoffPlace !== item.toName ? item.dropoffPlace : ""),
      flightNumber: prev.flightNumber || item.flightNumber || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  const handleChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const isValid =
    form.name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.phoneLocal.trim().length >= 5;

  // Recompute the latest item's price when the visitor switches Standard/VIP.
  const setService = (service: "standard" | "vip") => {
    if (!item) return;
    const stopsCost = item.extraStopHours * EXTRA_STOP_PRICE;
    const totalForItem = item.basePrice + (service === "vip" ? VIP_EXTRA_USD : 0) + stopsCost;
    updateItem(item.id, { serviceType: service, totalPrice: totalForItem });
  };

  // Persist address / flight edits into the cart item so they appear in Order Summary + payload.
  useEffect(() => {
    if (!item) return;
    const pickup = form.pickupAddress.trim() || item.fromName;
    const dropoff = form.dropoffAddress.trim() || item.toName;
    const flight = form.flightNumber.trim() || undefined;
    if (item.pickupPlace !== pickup || item.dropoffPlace !== dropoff || item.flightNumber !== flight) {
      updateItem(item.id, { pickupPlace: pickup, dropoffPlace: dropoff, flightNumber: flight });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.pickupAddress, form.dropoffAddress, form.flightNumber]);

  // Price preview for the service cards (latest item only — totalPrice already includes the change).
  const standardPriceForItem = useMemo(() => {
    if (!item) return 0;
    return item.basePrice + item.extraStopHours * EXTRA_STOP_PRICE;
  }, [item]);
  const vipPriceForItem = standardPriceForItem + VIP_EXTRA_USD;

  const handleSubmit = async () => {
    if (!isValid || items.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const phone = `${country.dial} ${form.phoneLocal.trim()}`;
      const resp = await fetch("/api/payment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name,
            email: form.email,
            phone,
            hotel: undefined,
            flightNumber: showFlight ? form.flightNumber || undefined : undefined,
            flightTime: showFlight ? form.flightTime || undefined : undefined,
            notes: form.notes || undefined,
          },
          items,
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

  if (!item) {
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
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to cart
      </button>

      {/* Service Type cards (Standard vs VIP) */}
      <section>
        <div className="text-amber-400 text-xs font-bold tracking-[0.18em] uppercase mb-3">
          Choose your shuttle service
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <ServiceCard
            label="Standard"
            description="Direct ride to your destination"
            price={standardPriceForItem}
            selected={item.serviceType === "standard"}
            onClick={() => setService("standard")}
            features={["A/C", "WiFi", "Bottled water", "Luggage included"]}
          />
          <ServiceCard
            label="VIP"
            description="Tourist stops, drinks & snacks, concierge"
            price={vipPriceForItem}
            selected={item.serviceType === "vip"}
            onClick={() => setService("vip")}
            badge="MOST POPULAR"
            crown
            features={["1-2h tourist stop", "Welcome kit", "Concierge driver", `+$${VIP_EXTRA_USD}`]}
          />
        </div>
      </section>

      {/* Customer details */}
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

        {/* Phone with country code dropdown */}
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
      </section>

      {/* Trip-specific pickup / dropoff / flight */}
      <section className="space-y-4">
        <div className="text-amber-400 text-xs font-bold tracking-[0.18em] uppercase">
          Trip details
        </div>

        <div className="space-y-1.5">
          <Label className="text-gray-300 text-sm flex items-center gap-1.5">
            <MapPin size={14} className="text-amber-400" />
            Pickup address
          </Label>
          <Input
            value={form.pickupAddress}
            onChange={handleChange("pickupAddress")}
            placeholder={`Hotel, Airbnb or specific address in ${item.fromName}`}
            className="bg-black/50 border-amber-500/30 text-white h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-gray-300 text-sm flex items-center gap-1.5">
            <MapPin size={14} className="text-amber-400" />
            Drop-off address
          </Label>
          <Input
            value={form.dropoffAddress}
            onChange={handleChange("dropoffAddress")}
            placeholder={`Hotel, Airbnb or specific address in ${item.toName}`}
            className="bg-black/50 border-amber-500/30 text-white h-11"
          />
        </div>

        {showFlight ? (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm flex items-center gap-1.5">
                <Plane size={14} className="text-amber-400" />
                Flight number
              </Label>
              <Input
                value={form.flightNumber}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, flightNumber: e.target.value.toUpperCase() }))
                }
                placeholder="e.g. UA1234"
                className="bg-black/50 border-amber-500/30 text-white h-11 uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm flex items-center gap-1.5">
                <Clock size={14} className="text-amber-400" />
                Flight time
              </Label>
              <select
                value={form.flightTime}
                onChange={handleChange("flightTime")}
                className="w-full bg-black/50 border border-amber-500/30 text-white h-11 rounded-md px-3 text-sm focus:border-amber-500 outline-none"
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

function ServiceCard({
  label,
  description,
  price,
  selected,
  onClick,
  features,
  badge,
  crown,
}: {
  label: string;
  description: string;
  price: number;
  selected: boolean;
  onClick: () => void;
  features: string[];
  badge?: string;
  crown?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "relative text-left rounded-2xl p-5 border-2 transition-all " +
        (selected
          ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20"
          : "border-white/10 bg-gray-900/40 hover:border-amber-500/40")
      }
    >
      {badge ? (
        <span className="absolute -top-3 right-3 px-3 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-bold tracking-wider shadow">
          {badge}
        </span>
      ) : null}
      <div className="flex items-start justify-between mb-2">
        <div className="font-bold text-white text-base flex items-center gap-1.5">
          {crown ? <Crown size={16} className="text-amber-400" /> : null}
          {label}
        </div>
        {selected ? (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-black">
            <Check size={14} strokeWidth={3} />
          </span>
        ) : null}
      </div>
      <p className="text-xs text-gray-400 mb-3">{description}</p>
      <div className="text-2xl font-bold text-white mb-2">
        ${price.toFixed(0)}
        <span className="text-xs text-gray-400 font-normal ml-1">USD</span>
      </div>
      <ul className="space-y-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-1.5 text-xs text-gray-300">
            <Check size={12} className="text-amber-400 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </button>
  );
}

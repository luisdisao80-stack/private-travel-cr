"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { COUNTRY_CODES, DEFAULT_COUNTRY, type Country } from "@/lib/country-codes";
import Price from "@/components/Price";
import { useCurrency } from "@/lib/CurrencyContext";
import { formatPrice } from "@/lib/currency";

type TourSnapshot = {
  id: number;
  slug: string;
  name: string;
  hero_image: string | null;
  duration_label: string;
  adult_price: number;
  child_price: number | null;
};

type BookingSnapshot = {
  date: string;
  time: string;
  adults: number;
  children: number;
  adultSubtotal: number;
  childSubtotal: number;
  total: number;
};

type Props = {
  tour: TourSnapshot;
  booking: BookingSnapshot;
};

/**
 * Final-step checkout for a tour booking. The customer has already chosen
 * date / time / pax on /tours/[slug]; here we just collect their identity
 * details and hand off to Tilopay via /api/payment/start.
 */
export default function TourCheckoutClient({ tour, booking }: Props) {
  const router = useRouter();
  const { currency, hydrated } = useCurrency();
  const showCurrencyHint = hydrated && currency !== "USD";
  const convertedTotal = formatPrice(booking.total, currency);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phoneLocal, setPhoneLocal] = useState("");
  const [hotel, setHotel] = useState("");
  const [notes, setNotes] = useState("");
  const [accepts, setAccepts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateLabel = booking.date
    ? new Date(booking.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const phoneDigits = phoneLocal.replace(/\D/g, "");
  const canSubmit =
    !submitting &&
    accepts &&
    name.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(email) &&
    phoneDigits.length >= 7 &&
    booking.date &&
    booking.time &&
    booking.total > 0;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      // Combine country dial code with the local number so the backend
      // and Tilopay get a full international-format string (e.g. "+1 555
      // 123 4567"). Matches the shuttle booking flow.
      const fullPhone = `${country.dial} ${phoneLocal.trim()}`;
      const res = await fetch("/api/payment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "tour",
          customer: {
            name: name.trim(),
            email: email.trim(),
            phone: fullPhone,
            hotel: hotel.trim() || undefined,
            notes: notes.trim() || undefined,
          },
          tour: {
            id: tour.id,
            slug: tour.slug,
            name: tour.name,
            date: booking.date,
            time: booking.time,
            adults: booking.adults,
            children: booking.children,
          },
          totalUsd: booking.total,
        }),
      });

      const data = (await res.json()) as
        | { orderNumber: string; checkoutUrl: string }
        | { error: string };

      if (!res.ok || !("checkoutUrl" in data)) {
        setError(
          "error" in data
            ? data.error
            : "Could not start the payment. Please try again."
        );
        setSubmitting(false);
        return;
      }

      // Hand off to Tilopay
      window.location.href = data.checkoutUrl;
    } catch (e) {
      console.error("[tour-checkout] submit error", e);
      setError("Network error — please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 pb-12">
      <div className="max-w-5xl mx-auto">
        <Link
          href={`/tours/${tour.slug}`}
          className="inline-flex items-center gap-1.5 text-amber-400 text-sm hover:text-amber-300 mb-4 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to tour
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Complete your booking
        </h1>
        <p className="text-gray-400 mb-8 text-sm">
          Your spot is held for 15 minutes once you continue to payment.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Customer form */}
          <section className="lg:col-span-3 space-y-5">
            <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6">
              <h2 className="text-lg font-bold text-white mb-4">
                Your details
              </h2>

              <Field label="Full name *">
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="As it appears on your ID"
                  className="form-input"
                />
              </Field>

              <Field label="Email *">
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your confirmation goes here"
                  className="form-input"
                />
              </Field>

              <Field label="Phone / WhatsApp *">
                <div className="flex gap-2">
                  <select
                    value={country.iso2}
                    onChange={(e) => {
                      const next = COUNTRY_CODES.find(
                        (c) => c.iso2 === e.target.value
                      );
                      if (next) setCountry(next);
                    }}
                    aria-label="Country code"
                    className="form-input"
                    style={{ width: 120, flex: "0 0 auto" }}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.iso2} value={c.iso2} className="bg-gray-900">
                        {c.flag} {c.dial}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={phoneLocal}
                    onChange={(e) => setPhoneLocal(e.target.value)}
                    placeholder="555 123 4567"
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1.5">
                  Selected:{" "}
                  <span className="text-amber-400">
                    {country.flag} {country.name} ({country.dial})
                  </span>
                </p>
              </Field>

              <Field label="Hotel in La Fortuna (optional)">
                <input
                  type="text"
                  value={hotel}
                  onChange={(e) => setHotel(e.target.value)}
                  placeholder="Where we pick you up"
                  className="form-input"
                />
              </Field>

              <Field label="Anything we should know? (optional)">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Kids' ages, allergies, special requests, etc."
                  className="form-input resize-none"
                />
              </Field>
            </div>

            <label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={accepts}
                onChange={(e) => setAccepts(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-amber-500"
              />
              <span>
                I agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
                >
                  Terms &amp; cancellation policy
                </Link>{" "}
                — free cancellation up to 24h before departure.
              </span>
            </label>

            {error ? (
              <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/40 p-4 text-sm text-red-200">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className="w-full h-14 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-amber-500/20"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending to payment…
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Pay ${booking.total.toFixed(0)} USD &amp; confirm
                </>
              )}
            </button>

            {showCurrencyHint ? (
              <p className="text-[11px] text-center text-amber-300">
                ≈ {convertedTotal} {currency} at today&apos;s rate
              </p>
            ) : null}
            <p className="text-[11px] text-center text-gray-500">
              Charges in USD via Tilopay · Visa, Mastercard, AmEx accepted ·
              Receipt by email
            </p>
          </section>

          {/* Order summary */}
          <aside className="lg:col-span-2">
            <div className="rounded-2xl bg-gray-900/60 border border-amber-500/20 overflow-hidden sticky top-24">
              {tour.hero_image ? (
                <div className="relative w-full aspect-[16/9]">
                  <Image
                    src={tour.hero_image}
                    alt={tour.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className="object-cover"
                    style={{ objectPosition: "center 35%" }}
                  />
                </div>
              ) : null}

              <div className="p-5">
                <h2 className="text-base font-bold text-white leading-tight mb-3">
                  {tour.name}
                </h2>

                <ul className="space-y-2.5 text-sm text-gray-300 mb-5">
                  <li className="flex items-center gap-2">
                    <Calendar size={14} className="text-amber-400" />
                    {dateLabel}
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock size={14} className="text-amber-400" />
                    Departure {booking.time || "—"} ·{" "}
                    {tour.duration_label}
                  </li>
                  <li className="flex items-center gap-2">
                    <Users size={14} className="text-amber-400" />
                    {booking.adults} adult{booking.adults !== 1 ? "s" : ""}
                    {booking.children > 0
                      ? ` + ${booking.children} child${booking.children !== 1 ? "ren" : ""}`
                      : ""}
                  </li>
                </ul>

                <div className="border-t border-white/5 pt-4 space-y-1.5 text-sm">
                  <Row
                    label={<>{booking.adults} × adult @ <Price usd={tour.adult_price} /></>}
                    value={booking.adultSubtotal}
                  />
                  {booking.children > 0 && tour.child_price != null ? (
                    <Row
                      label={<>{booking.children} × child @ <Price usd={tour.child_price} /></>}
                      value={booking.childSubtotal}
                    />
                  ) : null}
                </div>

                <div className="border-t border-amber-500/30 mt-4 pt-4 flex items-baseline justify-between">
                  <span className="text-sm text-gray-400">Total</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      ${booking.total.toFixed(0)}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        USD
                      </span>
                    </div>
                    {showCurrencyHint ? (
                      <div className="text-[11px] text-amber-300">
                        ≈ {convertedTotal} {currency}
                      </div>
                    ) : null}
                    <div className="text-[11px] text-green-400">
                      ✓ Taxes included
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px 14px;
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
        }
        .form-input:focus { border-color: rgba(245,158,11,0.6); }
        .form-input::placeholder { color: #6b7280; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3 last:mb-0">
      <span className="block text-xs font-semibold text-gray-400 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function Row({
  label,
  value,
}: {
  label: ReactNode;
  value: number;
}) {
  return (
    <div className="flex justify-between text-gray-400">
      <span>{label}</span>
      <span className="text-gray-200">
        <Price usd={value} />
      </span>
    </div>
  );
}

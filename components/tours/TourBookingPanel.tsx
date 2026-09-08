"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/components/ui/date-picker";
import { Calendar, Minus, Plus, Loader2, ArrowRight } from "lucide-react";
import type { TourScheduleSlot } from "@/lib/types";
import Price from "@/components/Price";
import {
  MIN_LEAD_TIME_HOURS,
  WHATSAPP_URGENT_URL_EN,
  LEAD_TIME_MESSAGE_EN,
  getMinPickupCRDate,
  getMinPickupDate,
  parseCostaRicaPickup,
  isPickupWithinLeadTime,
} from "@/lib/booking-rules";

type Props = {
  tour: {
    id: number;
    slug: string;
    name: string;
    adultPrice: number;        // rounded display price
    childPrice: number | null; // null when no kid rate
    minAge: number | null;
    childAgeMin: number | null;
    childAgeMax: number | null;
    childPolicyNote: string | null;
    scheduleTimes: TourScheduleSlot[];
    minPax: number;
  };
};

export default function TourBookingPanel({ tour }: Props) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(tour.scheduleTimes[0]?.departure || "");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(() => {
    const a = adults * tour.adultPrice;
    const c = (tour.childPrice ?? 0) * children;
    return a + c;
  }, [adults, children, tour.adultPrice, tour.childPrice]);

  const totalPax = adults + children;
  const meetsMin = totalPax >= tour.minPax;
  const hasTime = Boolean(timeSlot);
  const hasDate = Boolean(date);

  // 12h lead-time — same rule as shuttle bookings. See lib/booking-rules.ts.
  // Tours: `date` is YYYY-MM-DD and `timeSlot` is "HH:MM" (departure).
  const minPickupCRDate = getMinPickupCRDate();
  const minPickupCRIsoDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(getMinPickupDate());
  const isPickingEarliestDate = date === minPickupCRIsoDate;
  const scheduleTimesFiltered = useMemo(() => {
    if (!isPickingEarliestDate) return tour.scheduleTimes;
    return tour.scheduleTimes.filter((slot) => {
      const pickup = parseCostaRicaPickup(date, slot.departure);
      return pickup ? isPickupWithinLeadTime(pickup) : true;
    });
  }, [isPickingEarliestDate, date, tour.scheduleTimes]);

  // If the previously-selected slot is now filtered out, clear it so the
  // Continue button re-disables and the visitor re-picks.
  useEffect(() => {
    if (!timeSlot) return;
    if (!scheduleTimesFiltered.some((s) => s.departure === timeSlot)) {
      setTimeSlot("");
    }
  }, [scheduleTimesFiltered, timeSlot]);

  const pickedPickup = parseCostaRicaPickup(date, timeSlot);
  const pickupTooSoon =
    pickedPickup !== null && !isPickupWithinLeadTime(pickedPickup);

  const isValid = meetsMin && hasTime && hasDate && adults >= 1 && !pickupTooSoon;

  function clampAdults(n: number) {
    return Math.max(1, Math.min(20, n));
  }
  function clampChildren(n: number) {
    return Math.max(0, Math.min(15, n));
  }

  function go() {
    if (!isValid || submitting) return;
    setSubmitting(true);
    const params = new URLSearchParams({
      tour: tour.slug,
      date,
      time: timeSlot,
      adults: String(adults),
      children: String(children),
    });
    // Route into the existing booking flow with a tour-aware shortcut.
    // The /book page will detect the `tour` param, skip the shuttle wizard,
    // and pre-fill the customer + payment step.
    router.push(`/book/tour?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 md:p-6 shadow-xl shadow-amber-500/5">
      <div className="mb-4 pb-4 border-b border-slate-200">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">
          From
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-orange-600">
            <Price usd={tour.adultPrice} />
          </span>
          <span className="text-sm text-slate-500">per adult</span>
        </div>
        {tour.childPrice != null ? (
          <div className="text-xs text-slate-500 mt-1">
            Kids from <Price usd={tour.childPrice} />
            {tour.childAgeMin != null && tour.childAgeMax != null
              ? ` (${tour.childAgeMin}–${tour.childAgeMax} yrs)`
              : ""}
          </div>
        ) : null}
        <div className="text-[11px] text-green-700 mt-1">✓ Taxes included</div>
      </div>

      {/* Date */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
          <Calendar size={12} className="text-orange-600" />
          Tour date
        </label>
        <DatePicker
          value={date}
          onChange={setDate}
          placeholder="Select a date..."
          minDate={minPickupCRDate}
        />
      </div>

      {/* Time */}
      {tour.scheduleTimes.length > 0 ? (
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
            Departure time
          </label>
          <div className="grid grid-cols-2 gap-2">
            {scheduleTimesFiltered.map((slot) => {
              const active = timeSlot === slot.departure;
              return (
                <button
                  key={slot.departure}
                  type="button"
                  onClick={() => setTimeSlot(slot.departure)}
                  className={
                    "h-11 rounded-lg border text-sm font-semibold transition-all " +
                    (active
                      ? "bg-orange-100 border-orange-600 text-orange-600"
                      : "bg-white/40 border-slate-200 text-slate-600 hover:border-orange-300")
                  }
                >
                  {slot.departure}
                </button>
              );
            })}
          </div>
          {isPickingEarliestDate &&
            scheduleTimesFiltered.length < tour.scheduleTimes.length && (
              <p className="text-[10px] text-slate-500 mt-2">
                Earlier departures need {MIN_LEAD_TIME_HOURS}h notice —
                pick a later slot or day.
              </p>
            )}
          {isPickingEarliestDate && scheduleTimesFiltered.length === 0 && (
            <p className="text-[11px] text-orange-600 mt-2">
              No departures on this date meet the {MIN_LEAD_TIME_HOURS}h
              minimum notice. Please pick a later day.
            </p>
          )}
        </div>
      ) : null}

      {/* Adults */}
      <div className="mb-3 flex items-center justify-between gap-3 py-3 border-t border-slate-200">
        <div>
          <div className="text-sm font-semibold text-slate-900">Adults</div>
          <div className="text-xs text-slate-500">
            <Price usd={tour.adultPrice} /> per adult
          </div>
        </div>
        <PaxStepper
          value={adults}
          onChange={(n) => setAdults(clampAdults(n))}
          min={1}
        />
      </div>

      {/* Children (only when applicable) */}
      {tour.childPrice != null ? (
        <div className="mb-3 flex items-center justify-between gap-3 py-3 border-t border-slate-200">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Children
              {tour.childAgeMin != null && tour.childAgeMax != null
                ? (
                  <span className="text-slate-500 font-normal ml-1">
                    ({tour.childAgeMin}–{tour.childAgeMax})
                  </span>
                ) : null}
            </div>
            <div className="text-xs text-slate-500">
              <Price usd={tour.childPrice ?? 0} /> per child
            </div>
          </div>
          <PaxStepper
            value={children}
            onChange={(n) => setChildren(clampChildren(n))}
            min={0}
          />
        </div>
      ) : (
        <div className="mb-3 py-3 border-t border-slate-200 text-xs text-orange-600">
          Minimum age {tour.minAge} · no child rate available
        </div>
      )}

      {/* Total */}
      <div className="my-4 py-4 border-t border-slate-200 flex items-baseline justify-between">
        <span className="text-sm text-slate-500">Total</span>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-900">
            <Price usd={total} showUsdHint />
          </div>
          <div className="text-[11px] text-green-700">
            Final price · Taxes included · Charged in USD via Tilopay
          </div>
        </div>
      </div>

      {/* Validation messages */}
      {totalPax > 0 && !meetsMin ? (
        <p className="text-xs text-orange-600 mb-3">
          Minimum {tour.minPax} people per booking.
        </p>
      ) : null}

      {pickupTooSoon && (
        <div className="mb-3 rounded-lg border border-orange-500/50 bg-orange-50 px-4 py-3 text-xs text-amber-900">
          <p className="leading-snug mb-2">{LEAD_TIME_MESSAGE_EN}</p>
          <a
            href={WHATSAPP_URGENT_URL_EN}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-green-600 hover:bg-green-500 text-slate-900 font-semibold text-xs px-3 py-1.5 transition-colors"
          >
            WhatsApp us
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={go}
        disabled={!isValid || submitting}
        className="w-full h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-orange-600/15"
      >
        {submitting ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            Continue to booking
            <ArrowRight size={16} />
          </>
        )}
      </button>

      <p className="text-[10px] text-center text-slate-500 mt-3">
        Free cancellation up to 24h before. Secure payment by Tilopay.
      </p>
    </div>
  );
}

function PaxStepper({
  value,
  onChange,
  min,
}: {
  value: number;
  onChange: (n: number) => void;
  min: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center transition-colors"
        aria-label="Decrease"
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-blue-900 font-bold">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-9 h-9 rounded-lg bg-orange-100 hover:bg-orange-100 text-orange-600 flex items-center justify-center transition-colors"
        aria-label="Increase"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

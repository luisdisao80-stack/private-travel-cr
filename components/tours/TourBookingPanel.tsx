"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/components/ui/date-picker";
import { Calendar, Minus, Plus, Loader2, ArrowRight } from "lucide-react";
import type { TourScheduleSlot } from "@/lib/types";

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
  const isValid = meetsMin && hasTime && hasDate && adults >= 1;

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
    <div className="rounded-2xl bg-gray-900/60 border border-amber-500/30 p-5 md:p-6 shadow-xl shadow-amber-500/5">
      <div className="mb-4 pb-4 border-b border-white/5">
        <div className="text-[10px] uppercase tracking-wider text-gray-500">
          From
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-amber-400">
            ${tour.adultPrice}
          </span>
          <span className="text-sm text-gray-400">per adult</span>
        </div>
        {tour.childPrice != null ? (
          <div className="text-xs text-gray-400 mt-1">
            Kids from ${tour.childPrice}
            {tour.childAgeMin != null && tour.childAgeMax != null
              ? ` (${tour.childAgeMin}–${tour.childAgeMax} yrs)`
              : ""}
          </div>
        ) : null}
        <div className="text-[11px] text-green-400 mt-1">✓ Taxes included</div>
      </div>

      {/* Date */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1.5">
          <Calendar size={12} className="text-amber-400" />
          Tour date
        </label>
        <DatePicker
          value={date}
          onChange={setDate}
          placeholder="Select a date..."
        />
      </div>

      {/* Time */}
      {tour.scheduleTimes.length > 0 ? (
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-400 mb-1.5 block">
            Departure time
          </label>
          <div className="grid grid-cols-2 gap-2">
            {tour.scheduleTimes.map((slot) => {
              const active = timeSlot === slot.departure;
              return (
                <button
                  key={slot.departure}
                  type="button"
                  onClick={() => setTimeSlot(slot.departure)}
                  className={
                    "h-11 rounded-lg border text-sm font-semibold transition-all " +
                    (active
                      ? "bg-amber-500/20 border-amber-500 text-amber-300"
                      : "bg-gray-900/40 border-white/10 text-gray-300 hover:border-amber-500/40")
                  }
                >
                  {slot.departure}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Adults */}
      <div className="mb-3 flex items-center justify-between gap-3 py-3 border-t border-white/5">
        <div>
          <div className="text-sm font-semibold text-white">Adults</div>
          <div className="text-xs text-gray-500">
            ${tour.adultPrice} per adult
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
        <div className="mb-3 flex items-center justify-between gap-3 py-3 border-t border-white/5">
          <div>
            <div className="text-sm font-semibold text-white">
              Children
              {tour.childAgeMin != null && tour.childAgeMax != null
                ? (
                  <span className="text-gray-500 font-normal ml-1">
                    ({tour.childAgeMin}–{tour.childAgeMax})
                  </span>
                ) : null}
            </div>
            <div className="text-xs text-gray-500">
              ${tour.childPrice} per child
            </div>
          </div>
          <PaxStepper
            value={children}
            onChange={(n) => setChildren(clampChildren(n))}
            min={0}
          />
        </div>
      ) : (
        <div className="mb-3 py-3 border-t border-white/5 text-xs text-amber-300">
          Minimum age {tour.minAge} · no child rate available
        </div>
      )}

      {/* Total */}
      <div className="my-4 py-4 border-t border-amber-500/20 flex items-baseline justify-between">
        <span className="text-sm text-gray-400">Total</span>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">
            ${total.toFixed(0)}
            <span className="text-sm text-gray-400 font-normal ml-1">USD</span>
          </div>
          <div className="text-[11px] text-green-400">
            Final price · Taxes included
          </div>
        </div>
      </div>

      {/* Validation messages */}
      {totalPax > 0 && !meetsMin ? (
        <p className="text-xs text-amber-400 mb-3">
          Minimum {tour.minPax} people per booking.
        </p>
      ) : null}

      <button
        type="button"
        onClick={go}
        disabled={!isValid || submitting}
        className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-amber-500/20"
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

      <p className="text-[10px] text-center text-gray-500 mt-3">
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
        className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
        aria-label="Decrease"
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-white font-bold">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-9 h-9 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 flex items-center justify-center transition-colors"
        aria-label="Increase"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

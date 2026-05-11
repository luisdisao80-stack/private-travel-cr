"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  Hourglass,
  MapPin,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Shield,
  Wifi,
  Baby,
  Briefcase,
  Coffee,
  CheckCircle2,
} from "lucide-react";

type Props = {
  from: string;
  to: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  travelDate?: string; // ISO yyyy-mm-dd
  pickupTime?: string; // "HH:MM"
  passengers: number;
  duration?: string;
  totalPrice: number;
  vehicleName?: string;
};

function formatDateShort(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function format12h(time?: string): string {
  if (!time) return "—";
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return time;
  const period = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mStr} ${period}`;
}

function Chip({
  icon: Icon,
  label,
  tone = "gray",
}: {
  icon: typeof Calendar;
  label: string;
  tone?: "gray" | "green" | "amber";
}) {
  const tones: Record<string, string> = {
    gray: "bg-gray-800/60 border-gray-700 text-gray-300",
    green: "bg-green-500/10 border-green-500/30 text-green-300",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${tones[tone]}`}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}

const INCLUDED = [
  { icon: Shield, label: "Licensed & insured" },
  { icon: Wifi, label: "Free WiFi" },
  { icon: Baby, label: "Free child seats" },
  { icon: Briefcase, label: "Luggage included" },
  { icon: Coffee, label: "Complimentary water" },
  { icon: CheckCircle2, label: "No hidden fees" },
];

export default function OrderSummarySidebar({
  from,
  to,
  pickupAddress,
  dropoffAddress,
  travelDate,
  pickupTime,
  passengers,
  duration,
  totalPrice,
  vehicleName,
}: Props) {
  const [openIncluded, setOpenIncluded] = useState(false);

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="rounded-2xl overflow-hidden border border-amber-500/20 bg-gradient-to-br from-gray-900 to-black shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-b border-amber-500/20 px-5 py-4">
          <h2 className="text-lg font-bold text-white">Order Summary</h2>
          <p className="text-xs text-amber-200/80 mt-0.5">Review your shuttle details</p>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Route */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold leading-tight break-words">{from || "—"}</div>
                {pickupAddress ? (
                  <div className="text-xs text-gray-400 mt-0.5">{pickupAddress}</div>
                ) : null}
              </div>
            </div>
            <div className="pl-1.5">
              <ArrowDown size={14} className="text-amber-400/60" />
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold leading-tight break-words">{to || "—"}</div>
                {dropoffAddress ? (
                  <div className="text-xs text-gray-400 mt-0.5">{dropoffAddress}</div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            <Chip icon={Calendar} label={formatDateShort(travelDate)} tone={travelDate ? "amber" : "gray"} />
            <Chip icon={Clock} label={format12h(pickupTime)} tone={pickupTime ? "amber" : "gray"} />
            <Chip icon={Users} label={`${passengers} pax`} tone="green" />
            {duration ? <Chip icon={Hourglass} label={duration} tone="gray" /> : null}
          </div>

          {vehicleName ? (
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 px-3 py-2 text-xs text-amber-200">
              <span className="text-gray-400">Vehicle: </span>
              <span className="font-semibold">{vehicleName}</span>
            </div>
          ) : null}

          {/* Price */}
          <div className="pt-4 border-t border-amber-500/10">
            <div className="flex items-end justify-between">
              <span className="text-gray-400 text-sm">Total</span>
              <div className="text-right">
                <div className="text-3xl font-bold text-white leading-none">${totalPrice.toFixed(2)}</div>
                <div className="text-[11px] text-green-400 mt-1">Final price · All taxes included</div>
              </div>
            </div>
          </div>

          {/* Included accordion */}
          <button
            type="button"
            onClick={() => setOpenIncluded((v) => !v)}
            className="w-full flex items-center justify-between rounded-lg bg-gray-800/40 border border-white/5 hover:border-amber-500/30 transition-colors px-4 py-3 text-sm text-white"
          >
            <span>What&apos;s included?</span>
            {openIncluded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openIncluded ? (
            <div className="grid grid-cols-1 gap-2 -mt-2">
              {INCLUDED.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-gray-300">
                  <Icon size={14} className="text-amber-400" />
                  {label}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
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
import type { CartItem } from "@/lib/CartContext";

type Props = {
  items: CartItem[];
  totalPrice: number;
};

function vehicleImage(id?: CartItem["vehicleId"]): string | null {
  if (id === "staria") return "/staria.webp";
  if (id === "hiace") return "/hiace.png";
  if (id === "maxus") return "/maxus-v90.webp";
  return null;
}

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

const INCLUDED = [
  { icon: Shield, label: "Licensed & insured" },
  { icon: Wifi, label: "Free WiFi" },
  { icon: Baby, label: "Free child seats" },
  { icon: Briefcase, label: "Luggage included" },
  { icon: Coffee, label: "Complimentary water" },
  { icon: CheckCircle2, label: "No hidden fees" },
];

export default function OrderSummarySidebar({ items, totalPrice }: Props) {
  const [openIncluded, setOpenIncluded] = useState(false);

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="rounded-2xl overflow-hidden border border-amber-500/20 bg-gradient-to-br from-gray-900 to-black shadow-2xl shadow-black/40">
        <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-b border-amber-500/20 px-5 py-4">
          <h2 className="text-lg font-bold text-white">Order Summary</h2>
          <p className="text-xs text-amber-200/80 mt-0.5">
            {items.length} {items.length === 1 ? "trip" : "trips"} in cart
          </p>
        </div>

        <div className="p-5 space-y-5">
          <div className="space-y-3">
            {items.map((it, idx) => {
              const img = vehicleImage(it.vehicleId);
              return (
                <div
                  key={it.id}
                  className="rounded-xl border border-amber-500/15 bg-black/30 p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-300">
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400">
                        {it.serviceType === "vip" ? "VIP" : "Standard"} · {it.vehicleName}
                      </span>
                    </span>
                    <span className="text-sm font-bold text-white">${it.totalPrice.toFixed(0)}</span>
                  </div>

                  <div className="flex gap-2">
                    {img ? (
                      <div className="hidden sm:flex w-14 h-10 bg-white rounded-md p-1 items-center justify-center shrink-0">
                        <img src={img} alt={it.vehicleName} className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : null}
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-start gap-1.5">
                        <MapPin size={11} className="text-amber-400 mt-0.5 shrink-0" />
                        <span className="text-white font-medium break-words">{it.fromName}</span>
                      </div>
                      <div className="pl-[14px]">
                        <ArrowDown size={10} className="text-amber-400/60" />
                      </div>
                      <div className="flex items-start gap-1.5">
                        <MapPin size={11} className="text-amber-400 mt-0.5 shrink-0" />
                        <span className="text-white font-medium break-words">{it.toName}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={9} className="text-amber-400" />
                          {formatDateShort(it.date)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={9} className="text-amber-400" />
                          {format12h(it.pickupTime)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users size={9} className="text-amber-400" />
                          {it.passengers} pax
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-amber-500/10">
            <div className="flex items-end justify-between">
              <span className="text-gray-400 text-sm">Total</span>
              <div className="text-right">
                <div className="text-3xl font-bold text-white leading-none">${totalPrice.toFixed(2)}</div>
                <div className="text-[11px] text-green-400 mt-1">Final price · All taxes included</div>
              </div>
            </div>
          </div>

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

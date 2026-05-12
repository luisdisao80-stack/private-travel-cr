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
    <aside className="hidden lg:block lg:sticky lg:top-24">
      <div className="rounded-2xl overflow-hidden border border-amber-500/20 bg-gradient-to-br from-gray-900 to-black shadow-2xl shadow-black/40">
        <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-b border-amber-500/20 px-6 py-5">
          <h2 className="text-xl md:text-2xl font-bold text-white">Order Summary</h2>
          <p className="text-sm text-amber-200/80 mt-1">
            {items.length} {items.length === 1 ? "trip" : "trips"} in cart
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            {items.map((it, idx) => {
              const img = vehicleImage(it.vehicleId);
              return (
                <div
                  key={it.id}
                  className="rounded-xl border border-amber-500/15 bg-black/30 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300">
                        #{idx + 1}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-gray-400">
                        {it.serviceType === "vip" ? "VIP" : "Standard"} · {it.vehicleName}
                      </span>
                    </span>
                    <span className="text-base font-bold text-white">${it.totalPrice.toFixed(0)}</span>
                  </div>

                  <div className="flex gap-3">
                    {img ? (
                      <div className="hidden sm:flex w-20 h-14 bg-white rounded-md p-1.5 items-center justify-center shrink-0">
                        <img src={img} alt={it.vehicleName} className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : null}
                    <div className="flex-1 min-w-0 text-sm">
                      <div className="flex items-start gap-1.5">
                        <MapPin size={13} className="text-amber-400 mt-0.5 shrink-0" />
                        <span className="text-white font-medium break-words">{it.fromName}</span>
                      </div>
                      <div className="pl-[17px] py-0.5">
                        <ArrowDown size={12} className="text-amber-400/60" />
                      </div>
                      <div className="flex items-start gap-1.5">
                        <MapPin size={13} className="text-amber-400 mt-0.5 shrink-0" />
                        <span className="text-white font-medium break-words">{it.toName}</span>
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={11} className="text-amber-400" />
                          {formatDateShort(it.date)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} className="text-amber-400" />
                          {format12h(it.pickupTime)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users size={11} className="text-amber-400" />
                          {it.passengers} pax
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-5 border-t border-amber-500/10">
            <div className="flex items-end justify-between">
              <span className="text-gray-400 text-base">Total</span>
              <div className="text-right">
                <div className="text-4xl font-bold text-white leading-none">${totalPrice.toFixed(2)}</div>
                <div className="text-xs text-green-400 mt-1.5">Final price · All taxes included</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpenIncluded((v) => !v)}
            className="w-full flex items-center justify-between rounded-lg bg-gray-800/40 border border-white/5 hover:border-amber-500/30 transition-colors px-4 py-3.5 text-sm text-white"
          >
            <span>What&apos;s included?</span>
            {openIncluded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {openIncluded ? (
            <div className="grid grid-cols-1 gap-2.5 -mt-2">
              {INCLUDED.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-gray-300">
                  <Icon size={15} className="text-amber-400" />
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

"use client";

import {
  MapPin,
  ArrowRight,
  Calendar,
  Clock,
  Users,
  Trash2,
  Plus,
  ArrowDown,
} from "lucide-react";
import { useCart } from "@/lib/CartContext";

type Props = {
  onAddAnother: () => void;
  onContinue: () => void;
};

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function format12h(time: string): string {
  if (!time || !time.includes(":")) return time || "—";
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return time;
  const period = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mStr} ${period}`;
}

function vehicleImage(id: string): string | null {
  if (id === "staria") return "/staria.webp";
  if (id === "hiace") return "/hiace.png";
  if (id === "maxus") return "/maxus-v90.webp";
  return null;
}

export default function TripsList({ onAddAnother, onContinue }: Props) {
  const { items, removeItem, totalPrice } = useCart();

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-gray-900/95 to-black/95 shadow-2xl shadow-black/40 p-5 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-white">Your trips</h2>
          <p className="text-xs text-gray-400">
            {items.length} {items.length === 1 ? "transfer" : "transfers"} in cart
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((it, i) => {
          const img = vehicleImage(it.vehicleId);
          return (
            <div
              key={it.id}
              className="rounded-xl border border-amber-500/15 bg-black/30 p-4 hover:border-amber-500/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/30 text-[11px] font-bold text-amber-300">
                    #{i + 1}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-gray-400">
                    {it.serviceType === "vip" ? "VIP" : "Standard"} · {it.vehicleName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(it.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors p-1"
                  aria-label="Remove trip"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex gap-3">
                {img ? (
                  <div className="hidden sm:flex w-24 h-16 bg-white rounded-lg p-1.5 items-center justify-center shrink-0">
                    <img src={img} alt={it.vehicleName} className="max-h-full max-w-full object-contain" />
                  </div>
                ) : null}
                <div className="flex-1 min-w-0">
                  <div className="text-sm space-y-1">
                    <div className="flex items-start gap-2">
                      <MapPin size={13} className="text-amber-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-white font-medium">{it.fromName}</span>
                        {it.pickupPlace && it.pickupPlace !== it.fromName ? (
                          <span className="text-gray-400 text-xs"> · {it.pickupPlace}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="pl-[18px]">
                      <ArrowDown size={12} className="text-amber-400/60" />
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={13} className="text-amber-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-white font-medium">{it.toName}</span>
                        {it.dropoffPlace && it.dropoffPlace !== it.toName ? (
                          <span className="text-gray-400 text-xs"> · {it.dropoffPlace}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={11} className="text-amber-400" />
                      {formatDate(it.date)}
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
                <div className="text-right shrink-0">
                  <div className="text-base font-bold text-white">${it.totalPrice.toFixed(0)}</div>
                  <div className="text-[10px] text-gray-500">USD</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-5 pt-5 border-t border-amber-500/10 flex items-center justify-between">
        <span className="text-gray-400 text-sm">Total</span>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">${totalPrice.toFixed(2)}</div>
          <div className="text-[11px] text-green-400">All taxes included</div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onAddAnother}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-colors"
        >
          <Plus size={16} />
          Add another trip
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm transition-colors shadow-lg shadow-amber-500/30"
        >
          Continue to checkout
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

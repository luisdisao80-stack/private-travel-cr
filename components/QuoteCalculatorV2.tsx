"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Route } from "@/lib/types";
import { VIP_EXTRA_USD, getPriceForGroupSize, getVehicleForPax, formatDuration, isAirport } from "@/lib/quote-helpers";
import { MapPin, Users, Crown, ArrowRight, Plane, Clock } from "lucide-react";

type Props = {
  locations: string[];
};

const WHATSAPP_NUMBER = "50686334133";

export default function QuoteCalculatorV2({ locations }: Props) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [pax, setPax] = useState(2);
  const [serviceType, setServiceType] = useState<"standard" | "vip">("standard");
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function findRoute() {
      if (!from || !to || from === to) {
        setRoute(null);
        setNotFound(false);
        return;
      }
      setLoading(true);
      setNotFound(false);

      // Try forward: from -> to
      const result1 = await supabase
        .from("routes")
        .select("*")
        .eq("origen", from)
        .eq("destino", to)
        .maybeSingle();

      if (result1.data) {
        setRoute(result1.data as Route);
        setNotFound(false);
        setLoading(false);
        return;
      }

      // Try reverse: to -> from
      const result2 = await supabase
        .from("routes")
        .select("*")
        .eq("origen", to)
        .eq("destino", from)
        .maybeSingle();

      if (result2.data) {
        setRoute(result2.data as Route);
        setNotFound(false);
      } else {
        setRoute(null);
        setNotFound(true);
      }
      setLoading(false);
    }
    findRoute();
  }, [from, to]);

  const basePrice = route ? getPriceForGroupSize(route, pax) : 0;
  const vipExtra = serviceType === "vip" ? VIP_EXTRA_USD : 0;
  const totalPrice = basePrice + vipExtra;
  const vehicle = getVehicleForPax(pax);
  const requiresFlight = (from && isAirport(from)) || (to && isAirport(to));

  const whatsappMessage = route
    ? "Hi! I want to book: " + from + " to " + to + " for " + pax + " people. Service: " + (serviceType === "vip" ? "VIP" : "Standard") + ". Total: $" + totalPrice + " USD"
    : "";

  const whatsappUrl = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(whatsappMessage);

  const standardBtnClass = serviceType === "standard"
    ? "py-3 rounded-lg border-2 transition-all border-amber-500 bg-amber-500/20 text-amber-400"
    : "py-3 rounded-lg border-2 transition-all border-white/10 text-gray-400 hover:border-white/30";

  const vipBtnClass = serviceType === "vip"
    ? "py-3 rounded-lg border-2 transition-all border-amber-500 bg-amber-500/20 text-amber-400"
    : "py-3 rounded-lg border-2 transition-all border-white/10 text-gray-400 hover:border-white/30";

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-amber-500/30 rounded-2xl p-6 md:p-8">
      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold mb-2">
          <MapPin size={16} />
          <span>Pickup Location</span>
        </label>
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-full bg-black border border-white/20 text-white rounded-lg px-4 py-3 focus:border-amber-500 outline-none"
        >
          <option value="">Select pickup...</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold mb-2">
          <MapPin size={16} />
          <span>Drop-off Location</span>
        </label>
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full bg-black border border-white/20 text-white rounded-lg px-4 py-3 focus:border-amber-500 outline-none"
        >
          <option value="">Select destination...</option>
          {locations.map((loc) => (
            <option key={loc} value={loc} disabled={loc === from}>{loc}</option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold mb-2">
          <Users size={16} />
          <span>Passengers ({pax})</span>
        </label>
        <input
          type="range"
          min="1"
          max="12"
          value={pax}
          onChange={(e) => setPax(parseInt(e.target.value))}
          className="w-full accent-amber-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1</span>
          <span>{pax} people - {vehicle === "staria" ? "Hyundai Staria" : "Toyota Hiace"}</span>
          <span>12</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm text-amber-400 font-semibold mb-2 block">Service Type</label>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setServiceType("standard")} className={standardBtnClass}>
            <div className="font-bold text-sm">Standard</div>
            <div className="text-xs mt-1">Comfortable</div>
          </button>
          <button onClick={() => setServiceType("vip")} className={vipBtnClass}>
            <div className="font-bold text-sm flex items-center justify-center gap-1">
              <Crown size={14} />
              <span>VIP</span>
            </div>
            <div className="text-xs mt-1">+$70 USD</div>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-black/50 border border-white/10 rounded-lg p-6 text-center text-gray-400">
          Looking for route...
        </div>
      ) : notFound ? (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400 font-semibold">Route not available</p>
          <p className="text-sm text-gray-400 mt-1">
            We dont have a direct shuttle for this combination. Contact us via WhatsApp for a custom quote.
          </p>
        </div>
      ) : route ? (
        <div className="bg-black/50 border border-amber-500/30 rounded-lg p-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Clock size={14} />
            <span>Duration: {formatDuration(route.duracion)}</span>
            {requiresFlight ? (
              <>
                <span>·</span>
                <Plane size={14} />
                <span>Airport route</span>
              </>
            ) : null}
          </div>

          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Total Price</div>
              <div className="text-4xl font-bold text-amber-400">
                ${totalPrice}
                <span className="text-base text-gray-400 font-normal"> USD</span>
              </div>
            </div>
            {serviceType === "vip" ? (
              <div className="text-right">
                <div className="text-xs text-gray-500">Standard: ${basePrice}</div>
                <div className="text-xs text-amber-400">+ VIP: ${VIP_EXTRA_USD}</div>
              </div>
            ) : null}
          </div>

          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg text-center transition-colors">
            <span>Book via WhatsApp</span>
            <ArrowRight size={16} className="inline ml-1" />
          </a>
        </div>
      ) : null}
    </div>
  );
}

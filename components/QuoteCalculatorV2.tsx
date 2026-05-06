"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Route } from "@/lib/types";
import { VIP_EXTRA_USD, getPriceForGroupSize, getVehicleForPax, formatDuration, isAirport } from "@/lib/quote-helpers";
import { MapPin, Users, Crown, ArrowRight, Plane, Clock, Calendar, Baby } from "lucide-react";

type Props = { locations: string[] };
const WHATSAPP_NUMBER = "50686334133";

type AutocompleteInputProps = {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  locations: string[];
  excludeLocation?: string;
};

function AutocompleteInput({ value, onChange, placeholder, locations, excludeLocation }: AutocompleteInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) { setFiltered(locations.filter(l => l !== excludeLocation)); return; }
    const lv = value.toLowerCase();
    setFiltered(locations.filter(l => l !== excludeLocation && l.toLowerCase().includes(lv)).slice(0, 8));
  }, [value, locations, excludeLocation]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) { setShowDropdown(false); }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setShowDropdown(true); }}
        onFocus={() => setShowDropdown(true)}
        placeholder={placeholder}
        className="w-full bg-black border border-white/20 text-white rounded-lg px-4 py-3 focus:border-amber-500 outline-none"
      />
      {showDropdown && filtered.length > 0 ? (
        <div className="absolute z-20 w-full mt-1 bg-gray-900 border border-amber-500/30 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {filtered.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => { onChange(loc); setShowDropdown(false); }}
              className="w-full text-left px-4 py-2 text-white hover:bg-amber-500/20 transition-colors text-sm"
            >
              {loc}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function QuoteCalculatorV2({ locations }: Props) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [pax, setPax] = useState(2);
  const [serviceType, setServiceType] = useState<"standard" | "vip">("standard");
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // ETAPA 1: fecha, hora, vuelo, sillas
  const [travelDate, setTravelDate] = useState("");
  const [travelTime, setTravelTime] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [infantSeats, setInfantSeats] = useState(0);
  const [convertibleSeats, setConvertibleSeats] = useState(0);
  const [boosterSeats, setBoosterSeats] = useState(0);

  useEffect(() => {
    async function findRoute() {
      if (!from || !to || from === to) { setRoute(null); setNotFound(false); return; }
      setLoading(true); setNotFound(false);
      const r1 = await supabase.from("routes").select("*").eq("origen", from).eq("destino", to).maybeSingle();
      if (r1.data) { setRoute(r1.data as Route); setNotFound(false); setLoading(false); return; }
      const r2 = await supabase.from("routes").select("*").eq("origen", to).eq("destino", from).maybeSingle();
      if (r2.data) { setRoute(r2.data as Route); setNotFound(false); }
      else { setRoute(null); setNotFound(true); }
      setLoading(false);
    }
    findRoute();
  }, [from, to]);

  const basePrice = route ? getPriceForGroupSize(route, pax) : 0;
  const vipExtra = serviceType === "vip" ? VIP_EXTRA_USD : 0;
  const totalPrice = basePrice + vipExtra;
  const vehicle = getVehicleForPax(pax);
  const requiresFlight = (from && isAirport(from)) || (to && isAirport(to));
  const totalChildSeats = infantSeats + convertibleSeats + boosterSeats;

  // Construir mensaje de WhatsApp con TODOS los detalles
  function buildWhatsappMessage() {
    const lines: string[] = [];
    if (route) {
      lines.push("Hi! I want to book a shuttle:");
      lines.push("");
      lines.push("Route: " + from + " to " + to);
      lines.push("Passengers: " + pax);
      lines.push("Vehicle: " + (vehicle === "staria" ? "Hyundai Staria" : "Toyota Hiace"));
      lines.push("Service: " + (serviceType === "vip" ? "VIP" : "Standard"));
      if (travelDate) lines.push("Date: " + travelDate);
      if (travelTime) lines.push("Time: " + travelTime);
      if (flightNumber) lines.push("Flight: " + flightNumber);
      if (totalChildSeats > 0) {
        const seats: string[] = [];
        if (infantSeats > 0) seats.push(infantSeats + " infant");
        if (convertibleSeats > 0) seats.push(convertibleSeats + " convertible");
        if (boosterSeats > 0) seats.push(boosterSeats + " booster");
        lines.push("Child seats: " + seats.join(", "));
      }
      lines.push("");
      lines.push("Total: $" + totalPrice + " USD");
    } else {
      lines.push("Hi! I need a custom quote:");
      lines.push("");
      lines.push("Route: " + from + " to " + to);
      lines.push("Passengers: " + pax);
      if (travelDate) lines.push("Date: " + travelDate);
      if (travelTime) lines.push("Time: " + travelTime);
      if (flightNumber) lines.push("Flight: " + flightNumber);
      if (totalChildSeats > 0) {
        const seats: string[] = [];
        if (infantSeats > 0) seats.push(infantSeats + " infant");
        if (convertibleSeats > 0) seats.push(convertibleSeats + " convertible");
        if (boosterSeats > 0) seats.push(boosterSeats + " booster");
        lines.push("Child seats: " + seats.join(", "));
      }
      lines.push("");
      lines.push("Could you help me with a quote?");
    }
    return lines.join("\n");
  }

  const whatsappUrl = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(buildWhatsappMessage());

  const standardBtnClass = serviceType === "standard"
    ? "py-3 rounded-lg border-2 transition-all border-amber-500 bg-amber-500/20 text-amber-400"
    : "py-3 rounded-lg border-2 transition-all border-white/10 text-gray-400 hover:border-white/30";

  const vipBtnClass = serviceType === "vip"
    ? "py-3 rounded-lg border-2 transition-all border-amber-500 bg-amber-500/20 text-amber-400"
    : "py-3 rounded-lg border-2 transition-all border-white/10 text-gray-400 hover:border-white/30";

  // Fecha mínima = hoy
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-amber-500/30 rounded-2xl p-6 md:p-8">
      {/* PICKUP */}
      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold mb-2">
          <MapPin size={16} />
          <span>Pickup Location</span>
        </label>
        <AutocompleteInput value={from} onChange={setFrom} placeholder="Type or select pickup..." locations={locations} excludeLocation={to} />
      </div>

      {/* DROP-OFF */}
      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold mb-2">
          <MapPin size={16} />
          <span>Drop-off Location</span>
        </label>
        <AutocompleteInput value={to} onChange={setTo} placeholder="Type or select destination..." locations={locations} excludeLocation={from} />
      </div>

      {/* DATE + TIME */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold mb-2">
            <Calendar size={16} />
            <span>Date</span>
          </label>
          <input
            type="date"
            value={travelDate}
            min={todayStr}
            onChange={(e) => setTravelDate(e.target.value)}
            className="w-full bg-black border border-white/20 text-white rounded-lg px-3 py-3 focus:border-amber-500 outline-none"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold mb-2">
            <Clock size={16} />
            <span>Pickup Time</span>
          </label>
          <input
            type="time"
            value={travelTime}
            onChange={(e) => setTravelTime(e.target.value)}
            className="w-full bg-black border border-white/20 text-white rounded-lg px-3 py-3 focus:border-amber-500 outline-none"
          />
        </div>
      </div>

      {/* FLIGHT NUMBER (condicional) */}
      {requiresFlight ? (
        <div className="mb-5">
          <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold mb-2">
            <Plane size={16} />
            <span>Flight Number (optional)</span>
          </label>
          <input
            type="text"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
            placeholder="e.g. UA1234, AV628"
            className="w-full bg-black border border-white/20 text-white rounded-lg px-4 py-3 focus:border-amber-500 outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">We track your flight to ensure on-time pickup</p>
        </div>
      ) : null}

      {/* PASSENGERS */}
      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold mb-2">
          <Users size={16} />
          <span>Passengers ({pax})</span>
        </label>
        <input type="range" min="1" max="12" value={pax} onChange={(e) => setPax(parseInt(e.target.value))} className="w-full accent-amber-500" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1</span>
          <span>{pax} people - {vehicle === "staria" ? "Hyundai Staria" : "Toyota Hiace"}</span>
          <span>12</span>
        </div>
      </div>

      {/* CHILD SEATS */}
      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold mb-2">
          <Baby size={16} />
          <span>Child Seats (FREE)</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-black/50 border border-white/10 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Infant</div>
            <div className="text-xs text-gray-500 mb-2">0-12 months</div>
            <select value={infantSeats} onChange={(e) => setInfantSeats(parseInt(e.target.value))} className="w-full bg-black border border-white/20 text-white rounded px-2 py-1 text-sm">
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <div className="bg-black/50 border border-white/10 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Convertible</div>
            <div className="text-xs text-gray-500 mb-2">1-4 years</div>
            <select value={convertibleSeats} onChange={(e) => setConvertibleSeats(parseInt(e.target.value))} className="w-full bg-black border border-white/20 text-white rounded px-2 py-1 text-sm">
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <div className="bg-black/50 border border-white/10 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Booster</div>
            <div className="text-xs text-gray-500 mb-2">4-12 years</div>
            <select value={boosterSeats} onChange={(e) => setBoosterSeats(parseInt(e.target.value))} className="w-full bg-black border border-white/20 text-white rounded px-2 py-1 text-sm">
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
        </div>
      </div>

      {/* SERVICE TYPE */}
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

      {/* RESULT */}
      {loading ? (
        <div className="bg-black/50 border border-white/10 rounded-lg p-6 text-center text-gray-400">Looking for route...</div>
      ) : notFound ? (
        <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-6 text-center">
          <p className="text-amber-400 font-semibold mb-2">Custom route</p>
          <p className="text-sm text-gray-400 mb-4">We dont have a fixed price. Contact us via WhatsApp for a custom quote.</p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg">
            <span>Get Custom Quote on WhatsApp</span>
          </a>
        </div>
      ) : route ? (
        <div className="bg-black/50 border border-amber-500/30 rounded-lg p-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Clock size={14} />
            <span>Duration: {formatDuration(route.duracion)}</span>
            {requiresFlight ? (<><span>·</span><Plane size={14} /><span>Airport route</span></>) : null}
          </div>
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Total Price</div>
              <div className="text-4xl font-bold text-amber-400">${totalPrice}<span className="text-base text-gray-400 font-normal"> USD</span></div>
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

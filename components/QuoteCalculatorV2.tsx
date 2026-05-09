"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Route } from "@/lib/types";
import { VIP_EXTRA_USD, getPriceForGroupSize, getVehicleForPax, formatDuration, isAirport } from "@/lib/quote-helpers";
import { MapPin, Users, Crown, ArrowRight, Plane, Clock, Calendar, Baby, MapPinned } from "lucide-react";

type Props = { locations: string[] };
const WHATSAPP_NUMBER = "50686334133";
const EXTRA_STOP_PRICE = 35;

function generateTimeOptions(): { value: string; label: string }[] {
  const times: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    const hh = h.toString().padStart(2, "0");
    const period = h < 12 ? "AM" : "PM";
    let display = h % 12;
    if (display === 0) display = 12;
    const dd = display.toString();
    times.push({ value: hh + ":00", label: dd + ":00 " + period });
    times.push({ value: hh + ":30", label: dd + ":30 " + period });
  }
  return times;
}
const TIME_OPTIONS = generateTimeOptions();

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

  useEffect(() => {
    function syncFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const fromParam = params.get("from");
      const toParam = params.get("to");
      if (fromParam) setFrom(fromParam);
      if (toParam) setTo(toParam);
    }
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);
  const [adultsStr, setAdultsStr] = useState("2");
  const [childrenStr, setChildrenStr] = useState("0");
  const [serviceType, setServiceType] = useState<"standard" | "vip">("standard");
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [travelDate, setTravelDate] = useState("");
  const [travelTime, setTravelTime] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [infantSeats, setInfantSeats] = useState(0);
  const [convertibleSeats, setConvertibleSeats] = useState(0);
  const [boosterSeats, setBoosterSeats] = useState(0);
  const [extraStops, setExtraStops] = useState(0);

  const adults = parseInt(adultsStr) || 0;
  const children = parseInt(childrenStr) || 0;
  const totalPax = adults + children;

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

  const basePrice = route ? getPriceForGroupSize(route, totalPax || 1) : 0;
  const vipExtra = serviceType === "vip" ? VIP_EXTRA_USD : 0;
  const stopsExtra = extraStops * EXTRA_STOP_PRICE;
  const totalPrice = basePrice + vipExtra + stopsExtra;
  const vehicle = getVehicleForPax(totalPax || 1);
  const requiresFlight = (from && isAirport(from)) || (to && isAirport(to));
  const totalChildSeats = infantSeats + convertibleSeats + boosterSeats;
  const timeLabel = TIME_OPTIONS.find(t => t.value === travelTime)?.label || travelTime;

  function buildWhatsappMessage() {
    const lines: string[] = [];
    if (route) {
      lines.push("Hi! I want to book a shuttle:");
      lines.push("");
      lines.push("Route: " + from + " to " + to);
      lines.push("Adults: " + adults);
      if (children > 0) lines.push("Children: " + children);
      lines.push("Total passengers: " + totalPax);
      lines.push("Vehicle: " + (vehicle === "staria" ? "Hyundai Staria" : "Toyota Hiace"));
      lines.push("Service: " + (serviceType === "vip" ? "VIP" : "Standard"));
      if (travelDate) lines.push("Date: " + travelDate);
      if (travelTime) lines.push("Time: " + timeLabel);
      if (flightNumber) lines.push("Flight: " + flightNumber);
      if (extraStops > 0) lines.push("Extra stops: " + extraStops + "hr (+$" + stopsExtra + ")");
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
      lines.push("Adults: " + adults);
      if (children > 0) lines.push("Children: " + children);
      if (travelDate) lines.push("Date: " + travelDate);
      if (travelTime) lines.push("Time: " + timeLabel);
      if (flightNumber) lines.push("Flight: " + flightNumber);
      if (extraStops > 0) lines.push("Extra stops: " + extraStops + "hr");
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

  const todayStr = new Date().toISOString().split("T")[0];
  const overCapacity = totalPax > 12;

  function handleAdultsChange(val: string) {
    if (val === "") { setAdultsStr(""); return; }
    const n = parseInt(val);
    if (isNaN(n)) return;
    setAdultsStr(Math.max(0, Math.min(12, n)).toString());
  }

  function handleChildrenChange(val: string) {
    if (val === "") { setChildrenStr(""); return; }
    const n = parseInt(val);
    if (isNaN(n)) return;
    setChildrenStr(Math.max(0, Math.min(11, n)).toString());
  }

  function handleAdultsBlur() {
    if (adultsStr === "" || parseInt(adultsStr) === 0) setAdultsStr("1");
  }

  function handleChildrenBlur() {
    if (childrenStr === "") setChildrenStr("0");
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-amber-500/30 rounded-2xl p-6 md:p-8">
      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold mb-2">
          <MapPin size={16} />
          <span>Pickup Location</span>
        </label>
        <AutocompleteInput value={from} onChange={setFrom} placeholder="Type or select pickup..." locations={locations} excludeLocation={to} />
      </div>

      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold mb-2">
          <MapPin size={16} />
          <span>Drop-off Location</span>
        </label>
        <AutocompleteInput value={to} onChange={setTo} placeholder="Type or select destination..." locations={locations} excludeLocation={from} />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold mb-2">
            <Calendar size={16} />
            <span>Date</span>
          </label>
          <input type="date" value={travelDate} min={todayStr} onChange={(e) => setTravelDate(e.target.value)} className="w-full bg-black border border-white/20 text-white rounded-lg px-3 py-3 focus:border-amber-500 outline-none" />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold mb-2">
            <Clock size={16} />
            <span>Pickup Time</span>
          </label>
          <select value={travelTime} onChange={(e) => setTravelTime(e.target.value)} className="w-full bg-black border border-white/20 text-white rounded-lg px-3 py-3 focus:border-amber-500 outline-none">
            <option value="">Select time...</option>
            {TIME_OPTIONS.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
          </select>
        </div>
      </div>

      {requiresFlight ? (
        <div className="mb-5">
          <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold mb-2">
            <Plane size={16} />
            <span>Flight Number (optional)</span>
          </label>
          <input type="text" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value.toUpperCase())} placeholder="e.g. UA1234, AV628" className="w-full bg-black border border-white/20 text-white rounded-lg px-4 py-3 focus:border-amber-500 outline-none" />
          <p className="text-xs text-gray-500 mt-1">We track your flight to ensure on-time pickup</p>
        </div>
      ) : null}

      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold mb-2">
          <Users size={16} />
          <span>Passengers</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/50 border border-white/10 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Adults</div>
            <div className="text-xs text-gray-500 mb-2">12+ years</div>
            <input
              type="number"
              min="1"
              max="12"
              value={adultsStr}
              onChange={(e) => handleAdultsChange(e.target.value)}
              onBlur={handleAdultsBlur}
              className="w-full bg-black border border-white/20 text-white rounded px-2 py-2 text-base"
            />
          </div>
          <div className="bg-black/50 border border-white/10 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Children</div>
            <div className="text-xs text-gray-500 mb-2">0-11 years</div>
            <input
              type="number"
              min="0"
              max="11"
              value={childrenStr}
              onChange={(e) => handleChildrenChange(e.target.value)}
              onBlur={handleChildrenBlur}
              className="w-full bg-black border border-white/20 text-white rounded px-2 py-2 text-base"
            />
          </div>
        </div>
        {!overCapacity ? (
          <div className="text-xs text-gray-500 mt-2 text-center">
            Total: {totalPax} {totalPax === 1 ? "passenger" : "passengers"} - {vehicle === "staria" ? "Hyundai Staria" : "Toyota Hiace"}
          </div>
        ) : (
          <div className="text-xs text-red-400 mt-2 text-center">
            Max 12 total. Contact us via WhatsApp for larger groups.
          </div>
        )}
      </div>

      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold mb-2">
          <MapPinned size={16} />
          <span>Extra Stops (optional)</span>
        </label>
        <select
          value={extraStops}
          onChange={(e) => setExtraStops(parseInt(e.target.value))}
          className="w-full bg-black border border-white/20 text-white rounded-lg px-3 py-3 focus:border-amber-500 outline-none"
        >
          <option value="0">No extra stops</option>
          <option value="1">1 hour stop (+$35)</option>
          <option value="2">2 hour stop (+$70)</option>
          <option value="3">3 hour stop (+$105)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Add stops for restaurants, scenic viewpoints, photo opportunities, etc.</p>
      </div>

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
              <option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
            </select>
          </div>
          <div className="bg-black/50 border border-white/10 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Convertible</div>
            <div className="text-xs text-gray-500 mb-2">1-4 years</div>
            <select value={convertibleSeats} onChange={(e) => setConvertibleSeats(parseInt(e.target.value))} className="w-full bg-black border border-white/20 text-white rounded px-2 py-1 text-sm">
              <option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
            </select>
          </div>
          <div className="bg-black/50 border border-white/10 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Booster</div>
            <div className="text-xs text-gray-500 mb-2">4-12 years</div>
            <select value={boosterSeats} onChange={(e) => setBoosterSeats(parseInt(e.target.value))} className="w-full bg-black border border-white/20 text-white rounded px-2 py-1 text-sm">
              <option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
            </select>
          </div>
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
            {(serviceType === "vip" || extraStops > 0) ? (
              <div className="text-right">
                <div className="text-xs text-gray-500">Base: ${basePrice}</div>
                {serviceType === "vip" ? (<div className="text-xs text-amber-400">+ VIP: ${VIP_EXTRA_USD}</div>) : null}
                {extraStops > 0 ? (<div className="text-xs text-amber-400">+ Stops: ${stopsExtra}</div>) : null}
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

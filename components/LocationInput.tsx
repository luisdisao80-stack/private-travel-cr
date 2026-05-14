"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Plane } from "lucide-react";
import {
  displayLocation,
  isAirport,
  matchScore,
  priorityScore,
} from "@/lib/locations";

type LocationInputProps = {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  locations: string[];
};

export default function LocationInput({ value, onChange, placeholder, locations }: LocationInputProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const locationSet = useMemo(() => new Set(locations), [locations]);

  // True when `value` is a canonical DB name (i.e., user selected from the
  // dropdown). False when it's free-text the user is still typing.
  const isDbName = locationSet.has(value);

  // What the user sees in the input: friendly label for known DB names,
  // raw typed value otherwise. So selecting "SJO - Juan Santamaria Int.
  // Airport" displays "San Jose Airport" without losing the DB binding.
  const inputDisplay = isDbName ? displayLocation(value) : value;

  // Debounce the filter so a fast typist doesn't trigger 1,200+ matchScore
  // calls per keystroke.
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), 150);
    return () => clearTimeout(t);
  }, [value]);

  const suggestions = useMemo(() => {
    // When the user already picked a valid DB name, treat as "no query"
    // and show the top curated list (airports first).
    const query = locationSet.has(debouncedValue) ? "" : debouncedValue;
    return locations
      .map((loc) => ({
        loc,
        score: matchScore(loc, query) + priorityScore(loc),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.loc);
  }, [debouncedValue, locations, locationSet]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative z-40 flex-1 min-w-0">
      <MapPin
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none"
      />
      <input
        type="text"
        value={inputDisplay}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full pl-12 pr-9 py-4 bg-black/60 border border-amber-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 transition"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-xl leading-none"
        >
          ×
        </button>
      )}
      {open && suggestions.length > 0 && (
        // Mobile: static positioning so the dropdown pushes the next input
        // (and the Continue button) down instead of floating on top.
        // Desktop: absolute so it overlays.
        <div className="static md:absolute z-50 w-full mt-2 bg-gradient-to-br from-gray-900/98 to-black/98 backdrop-blur-xl border border-amber-500/30 rounded-xl shadow-2xl shadow-black/60 max-h-72 overflow-y-auto">
          {suggestions.map((loc) => {
            const airport = isAirport(loc);
            return (
              <button
                key={loc}
                type="button"
                // onMouseDown (not onClick) fires before the input blurs,
                // so the selection isn't lost when focus shifts.
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(loc);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 text-left px-4 py-3 text-white hover:bg-amber-500/15 transition-colors text-sm border-b border-white/5 last:border-b-0"
              >
                {airport ? (
                  <Plane size={14} className="text-amber-400 shrink-0" />
                ) : (
                  <MapPin size={14} className="text-amber-400/60 shrink-0" />
                )}
                <span>{displayLocation(loc)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

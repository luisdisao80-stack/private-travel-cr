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

  // Internal "what the user is currently typing" state. Separate from `value`
  // (which is the canonical DB name) so the input can show the friendly
  // display label when a location is selected, but show the raw search text
  // while the user is typing.
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the filter input so a fast typist doesn't trigger 1,200+ match
  // calls on every keystroke. 150ms is below the perception threshold but
  // cuts the work to one pass per pause.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText), 150);
    return () => clearTimeout(t);
  }, [searchText]);

  const suggestions = useMemo(() => {
    const query = isSearching ? debouncedSearch : "";
    return locations
      .map((loc) => ({
        loc,
        score: matchScore(loc, query) + priorityScore(loc),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.loc);
  }, [debouncedSearch, isSearching, locations]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // What text actually shows in the input. While the user is typing → their
  // raw text. While idle → the friendly display name of the selected value.
  const inputDisplay = isSearching ? searchText : value ? displayLocation(value) : "";

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
          setSearchText(e.target.value);
          setIsSearching(true);
          onChange("");
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full pl-12 pr-9 py-4 bg-black/60 border border-amber-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 transition"
      />
      {(value || searchText) && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            setSearchText("");
            setIsSearching(false);
          }}
          aria-label="Clear"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-xl leading-none"
        >
          ×
        </button>
      )}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-gradient-to-br from-gray-900/98 to-black/98 backdrop-blur-xl border border-amber-500/30 rounded-xl shadow-2xl shadow-black/60 max-h-72 overflow-y-auto">
          {suggestions.map((loc) => {
            const airport = isAirport(loc);
            return (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  onChange(loc);
                  setSearchText("");
                  setIsSearching(false);
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

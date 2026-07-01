"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Plane, Building2 } from "lucide-react";
import type { Hotel } from "@/lib/types";
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
  // Optional: when the user picks a hotel, it acts as an alias for the
  // hotel's area_origen so booking / pricing logic stays uniform. Hotels
  // appear interleaved with locations in the dropdown.
  hotels?: Hotel[];
  /** Fires whenever the user picks (or clears) a hotel suggestion. The
   *  parent can use this to remember the exact hotel name and pre-fill
   *  the pickup/dropoff address field on the checkout step. */
  onHotelPick?: (hotel: Hotel | null) => void;
};

// Suggestion entry — either a location string or a hotel pointer.
type Suggestion =
  | { kind: "location"; loc: string; score: number }
  | { kind: "hotel"; hotel: Hotel; score: number };

// Matches a query against a hotel by name + city. Returns same scoring
// shape as locations.matchScore so the two streams sort together.
function hotelMatchScore(hotel: Hotel, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 1;

  const name = hotel.name.toLowerCase();
  const city = hotel.city.toLowerCase();

  if (name === q || city === q) return 1000;
  if (name.startsWith(q)) return 500;
  if (city.startsWith(q)) return 450;
  if (name.includes(q)) return 200;
  if (city.includes(q)) return 150;

  const tokens = q.split(/\s+/);
  if (tokens.length > 1) {
    if (tokens.every((t) => name.includes(t) || city.includes(t))) return 100;
  }
  return 0;
}

export default function LocationInput({
  value,
  onChange,
  placeholder,
  locations,
  hotels = [],
  onHotelPick,
}: LocationInputProps) {
  const [open, setOpen] = useState(false);
  // Keyboard-nav index into the visible suggestions[]. Starts at 0 so
  // the top match is pre-highlighted the moment the visitor types —
  // Diego asked (2026-06-30) for the flow to be "type 'manu' and just
  // hit Enter to pick Manuel Antonio", so the first row has to be
  // visually selected from keystroke 1. Arrow keys move the highlight,
  // Enter commits, Esc closes.
  const [highlightIndex, setHighlightIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const locationSet = useMemo(() => new Set(locations), [locations]);

  const isDbName = locationSet.has(value);
  const inputDisplay = isDbName ? displayLocation(value) : value;

  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), 150);
    return () => clearTimeout(t);
  }, [value]);

  const suggestions = useMemo<Suggestion[]>(() => {
    const query = locationSet.has(debouncedValue) ? "" : debouncedValue;

    const locItems: Suggestion[] = locations
      .map<Suggestion>((loc) => ({
        kind: "location" as const,
        loc,
        score: matchScore(loc, query) + priorityScore(loc),
      }))
      .filter((x) => x.score > 0);

    const hotelItems: Suggestion[] = hotels
      .map<Suggestion>((hotel) => ({
        kind: "hotel" as const,
        hotel,
        // Slight penalty so an exact location match still wins over a
        // weaker hotel match for the same query.
        score: hotelMatchScore(hotel, query) - 5,
      }))
      .filter((x) => x.score > 0);

    return [...locItems, ...hotelItems]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [debouncedValue, locations, locationSet, hotels]);

  // Reset the highlight to the top match every time the visible
  // suggestion list changes — otherwise pressing Enter after typing
  // a couple more letters could commit whatever row happened to be
  // at that index in the previous suggestion list.
  useEffect(() => {
    setHighlightIndex(0);
  }, [suggestions]);

  // Commit whichever suggestion is currently highlighted. Extracted so
  // both the click handlers and the Enter-key handler go through the
  // same code path (setting onChange / onHotelPick / closing the menu).
  function commitSuggestion(s: Suggestion) {
    if (s.kind === "location") {
      onChange(s.loc);
      onHotelPick?.(null);
    } else {
      onChange(s.hotel.area_origen);
      onHotelPick?.(s.hotel);
    }
    setOpen(false);
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    // z-index jumps when the dropdown is open so it stacks above the
    // next-sibling input (also z-40). Without this bump, two adjacent
    // LocationInputs render their dropdowns at the same level, and the
    // browser paints the later one on top — so a Pickup dropdown gets
    // covered by the Drop-off input below.
    <div
      ref={wrapperRef}
      className={`relative flex-1 min-w-0 ${open ? "z-[60]" : "z-40"}`}
    >
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
        // Keyboard navigation. Enter commits the highlighted suggestion
        // (default: the first one) so "type manu -> Enter" lands the
        // visitor on Manuel Antonio without touching the mouse. Arrows
        // move the highlight; Escape closes the dropdown. When the
        // menu isn't open OR there are no suggestions, all of this is
        // a no-op and default browser behaviour takes over.
        onKeyDown={(e) => {
          if (!open || suggestions.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex((i) => (i + 1) % suggestions.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
          } else if (e.key === "Enter") {
            e.preventDefault();
            const target = suggestions[highlightIndex] ?? suggestions[0];
            if (target) commitSuggestion(target);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
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
        <div className="static md:absolute z-50 w-full mt-2 bg-gradient-to-br from-gray-900/98 to-black/98 backdrop-blur-xl border border-amber-500/30 rounded-xl shadow-2xl shadow-black/60 max-h-80 overflow-y-auto">
          {suggestions.map((s, idx) => {
            // Highlighted row = current keyboard target. Rendered with
            // an amber background so the visitor can see at a glance
            // which suggestion Enter is about to commit. Hover still
            // works — mouseenter updates highlightIndex so the amber
            // follows the pointer, keeping mouse + keyboard in sync.
            const isActive = idx === highlightIndex;
            const rowClass =
              "w-full flex items-center gap-3 text-left px-4 py-3 transition-colors text-sm border-b border-white/5 last:border-b-0 " +
              (isActive
                ? "bg-amber-500/20 text-white"
                : "text-white hover:bg-amber-500/15");

            if (s.kind === "location") {
              const airport = isAirport(s.loc);
              return (
                <button
                  key={`loc-${s.loc}`}
                  type="button"
                  onMouseEnter={() => setHighlightIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commitSuggestion(s);
                  }}
                  className={rowClass}
                >
                  {airport ? (
                    <Plane size={14} className="text-amber-400 shrink-0" />
                  ) : (
                    <MapPin size={14} className="text-amber-400/60 shrink-0" />
                  )}
                  <span className="flex-1 min-w-0 truncate">{displayLocation(s.loc)}</span>
                </button>
              );
            }

            // Hotel suggestion: clicking sets value to the hotel's
            // area_origen so the existing routing/pricing logic just works,
            // and also emits the hotel via onHotelPick so the parent can
            // remember it (used to pre-fill the pickup address in checkout).
            return (
              <button
                key={`hotel-${s.hotel.id}`}
                type="button"
                onMouseEnter={() => setHighlightIndex(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  commitSuggestion(s);
                }}
                className={rowClass}
              >
                <Building2
                  size={14}
                  className="text-amber-400/80 shrink-0"
                  aria-hidden="true"
                />
                <span className="flex-1 min-w-0 truncate">{s.hotel.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 shrink-0">
                  Hotel · {s.hotel.city}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

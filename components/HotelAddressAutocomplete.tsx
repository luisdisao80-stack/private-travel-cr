"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Building2 } from "lucide-react";
import type { Hotel } from "@/lib/types";

// Address autocomplete for pickup/dropoff fields in the customer booking
// flow. Reuses the same hotel DB rows that power LocationInput's dropdown,
// but here the value is FREE-TEXT by default — the visitor can type an
// Airbnb, a private residence, "700m west of the bridge", whatever — and
// only when they explicitly pick a suggestion do we replace the field
// value with the canonical hotel name.
//
// Real reported issue (Diego, 2 weeks pre-launch of this component): a
// customer named Nicole Zamore booked with
//   dropoffPlace = "700 meters west from Bridgestone/Firestone, La
//                   Ribera de Belén, Heredia, Costa Rica"
// which is literally the Marriott Hacienda Belén's address. The hotel
// was already in the DB but the plain <input> gave no way to surface it.
// Now the visitor types "marriott" and picks the row.
//
// Free-text fallback stays intact: if no suggestion matches, or the
// visitor never picks one, whatever they typed is what gets saved to
// pickupPlace / dropoffPlace. No schema change, no server-side change.

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Fired when the visitor explicitly picks a suggestion (hotel), or
   *  null when they edit the text (clearing any previous hotel context). */
  onHotelPick?: (hotel: Hotel | null) => void;
  placeholder?: string;
  hotels: Hotel[];
  /** Destination the address is paired with (e.g., dropoff address uses
   *  toName, pickup uses fromName). Hotels whose area_origen matches this
   *  are boosted so the visitor sees contextually-relevant options first
   *  without those completely hiding hotels from other areas. */
  contextArea?: string;
  /** Tailwind classes on the outer wrapper (positioning context for the
   *  dropdown). */
  className?: string;
  /** Tailwind classes on the <input> itself so callers can match the
   *  local look-and-feel (QuoteCalculatorV2 uses a heavier field style
   *  than BookingForm's shadcn <Input>, so we don't hard-code anything). */
  inputClassName?: string;
};

type Suggestion = { hotel: Hotel; score: number };

// Multi-stop support. Real reported issue (Diego, 2026-09-26): a customer
// needed TWO hotels in the drop-off field and could not get them to stick.
// Two things were fighting him:
//   1. highlightIndex started at 0, so a suggestion was ALWAYS pre-selected
//      and Enter silently replaced the whole field with one hotel name.
//   2. commitHotel() overwrote the entire value, so picking the second
//      hotel erased the first.
// Fix: " + " is the separator between stops, and only the LAST segment is
// ever autocompleted or replaced. Typing "Arenal Springs + Magic Mountain"
// autocompletes "Magic Mountain" and leaves "Arenal Springs" untouched.
// Visitors who never type a "+" get plain free text, exactly as before.
const SEGMENT_SEPARATOR = " + ";
const SEGMENT_SPLIT_RE = /\s*\+\s*/;

/** The part of the field the visitor is currently typing — everything
 *  after the last "+". Used as the autocomplete query so earlier stops
 *  don't pollute the match. */
function lastSegment(value: string): string {
  const parts = value.split(SEGMENT_SPLIT_RE);
  return parts[parts.length - 1] ?? "";
}

/** Swap only the segment being typed, preserving every earlier stop. */
function replaceLastSegment(value: string, replacement: string): string {
  const parts = value.split(SEGMENT_SPLIT_RE);
  parts[parts.length - 1] = replacement;
  return parts.join(SEGMENT_SEPARATOR);
}

// Strip diacritics so "Belén" matches "belen", "Peñas" matches "penas",
// etc. Same pattern as lib/locations.ts matchScore — kept local because
// we're matching against hotel names+cities, not the location DB names
// that matchScore handles.
function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

// Base fuzzy score for a hotel against the query. Higher = better match.
// Zero means "no match, don't show". Mirrors the shape of matchScore in
// lib/locations.ts so the two dropdowns feel consistent.
function hotelMatchScore(hotel: Hotel, query: string): number {
  const q = stripDiacritics(query.toLowerCase().trim());
  if (!q) return 0; // no query → dropdown stays closed

  const name = stripDiacritics(hotel.name.toLowerCase());
  const city = stripDiacritics(hotel.city.toLowerCase());

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

// Boost for hotels whose area_origen matches the current context
// (destination for dropoff, origin for pickup). Additive to the fuzzy
// score — small enough that a strong match in a different area still
// beats a weak match in the "right" area, but big enough to break ties
// meaningfully. Also folds in the hotel's manual priority (flagship
// 100 > mid 50 > default 0) so featured properties surface first.
function contextBoost(hotel: Hotel, contextArea?: string): number {
  let boost = hotel.priority ?? 0;
  if (contextArea && hotel.area_origen === contextArea) {
    boost += 250;
  }
  return boost;
}

export default function HotelAddressAutocomplete({
  value,
  onChange,
  onHotelPick,
  placeholder = "Hotel, Airbnb, or exact address...",
  hotels,
  contextArea,
  className = "relative w-full",
  inputClassName = "w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-3 focus:border-orange-600 outline-none",
}: Props) {
  const [open, setOpen] = useState(false);
  // -1 = nothing highlighted. We deliberately do NOT pre-select the top
  // match: this field is free text first and a hotel picker second, so
  // guessing on the visitor's behalf loses real addresses. A hotel is
  // only committed when the visitor arrows onto a row or clicks it.
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce the value used for filtering so a fast typer doesn't
  // re-rank the whole 156-hotel list on every keystroke. 120ms is short
  // enough that the dropdown feels live but long enough to skip the
  // intermediate states of "marr" → "marri" → "marrio".
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), 120);
    return () => clearTimeout(t);
  }, [value]);

  const suggestions = useMemo<Suggestion[]>(() => {
    // Match only the stop currently being typed, so an already-entered
    // first hotel doesn't skew (or zero out) the ranking for the second.
    const query = lastSegment(debouncedValue).trim();
    if (!query) return [];
    return hotels
      .map<Suggestion>((hotel) => {
        const base = hotelMatchScore(hotel, query);
        return {
          hotel,
          score: base > 0 ? base + contextBoost(hotel, contextArea) : 0,
        };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 7);
  }, [debouncedValue, hotels, contextArea]);

  // Clear the keyboard highlight whenever the QUERY changes — otherwise
  // pressing Enter after typing another letter could commit whatever row
  // happened to sit at that index in the previous list.
  //
  // Keyed on the query string, NOT on the `suggestions` array identity.
  // Callers pass `hotels` as a fresh array on some renders (BookingForm
  // defaults the prop to `[]`), which makes the useMemo recompute and
  // hand back a new array every render — depending on that identity meant
  // the highlight was wiped on every keystroke-triggered re-render, so
  // ArrowDown could never stick. A string key is stable across renders.
  const queryKey = lastSegment(debouncedValue).trim().toLowerCase();
  useEffect(() => {
    setHighlightIndex(-1);
  }, [queryKey]);

  // Close on outside click. `mousedown` (not `click`) so the input's
  // onMouseDown on a suggestion still fires — the button uses
  // onMouseDown to commit BEFORE the input loses focus.
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function commitHotel(hotel: Hotel) {
    // Replace only the stop being typed. Anything the visitor entered
    // before a "+" survives, which is what makes two-hotel drop-offs work.
    onChange(replaceLastSegment(value, hotel.name));
    onHotelPick?.(hotel);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className={className}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          // Editing the text clears any prior hotel context — the parent
          // may have been tracking the last-picked hotel, and if the
          // visitor is now typing free text ("700m west of ...") they're
          // no longer confirming a hotel selection.
          onHotelPick?.(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open || suggestions.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            // From -1 this lands on 0, so the first ArrowDown selects the
            // top match — opt-in, instead of it being selected already.
            setHighlightIndex((i) => (i + 1) % suggestions.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex((i) =>
              i < 0 ? suggestions.length - 1 : (i - 1 + suggestions.length) % suggestions.length,
            );
          } else if (e.key === "Enter") {
            // Enter commits ONLY a row the visitor deliberately moved to
            // (ArrowDown or hover). With nothing highlighted we just close
            // the dropdown and keep the typed text verbatim.
            //
            // This is the multi-hotel bug: Enter used to fall back to
            // `suggestions[0]` and overwrite the whole field with a single
            // canonical hotel name, so a customer entering two drop-off
            // hotels watched their text get swallowed.
            e.preventDefault();
            if (highlightIndex < 0) {
              setOpen(false);
              return;
            }
            const target = suggestions[highlightIndex];
            if (target) commitHotel(target.hotel);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        // z-50 so we render above sibling inputs (BookingForm stacks
        // pickup + dropoff addresses back-to-back — without the z-bump
        // the dropoff dropdown covers the pickup one).
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl shadow-black/60 max-h-72 overflow-y-auto">
          {suggestions.map((s, idx) => {
            const isActive = idx === highlightIndex;
            const rowClass =
              "w-full flex items-center gap-3 text-left px-4 py-3 transition-colors text-sm border-b border-slate-200 last:border-b-0 " +
              (isActive
                ? "bg-orange-50 text-slate-900"
                : "text-slate-700 hover:bg-orange-50");
            return (
              <button
                key={`hotel-${s.hotel.id}`}
                type="button"
                onMouseEnter={() => setHighlightIndex(idx)}
                // onMouseDown (not onClick) so we commit BEFORE the
                // input's blur fires and the outside-click handler
                // closes the dropdown. preventDefault keeps focus on
                // the input for continued keyboard flow.
                onMouseDown={(e) => {
                  e.preventDefault();
                  commitHotel(s.hotel);
                }}
                className={rowClass}
              >
                <Building2
                  size={14}
                  className="text-orange-600/80 shrink-0"
                  aria-hidden="true"
                />
                <span className="flex-1 min-w-0 truncate">{s.hotel.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 shrink-0">
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

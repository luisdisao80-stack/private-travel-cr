"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Plane, Building2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
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

// Tope de filas que se dibujan. No es cosmético: cada fila es un
// <button> y la lista se re-arma en cada tecla, así que dibujar las 110
// que calzan con "la" se siente lento al escribir. 25 cubre el 100% de
// las búsquedas que medí salvo "la" y "hotel" (que nadie escribe para
// buscar un lugar), y cuando sí corta, ahora se avisa abajo.
const MAX_SUGGESTIONS = 25;

// Alto del nav fijo (~89px) más un poco de aire. Es el límite de cuánto
// se puede subir la página para hacerle campo al menú sin esconder el
// propio campo de búsqueda debajo del nav.
const NAV_CLEARANCE = 100;

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
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  // Keyboard-nav index into the visible suggestions[]. Starts at 0 so
  // the top match is pre-highlighted the moment the visitor types —
  // Diego asked (2026-06-30) for the flow to be "type 'manu' and just
  // hit Enter to pick Manuel Antonio", so the first row has to be
  // visually selected from keystroke 1. Arrow keys move the highlight,
  // Enter commits, Esc closes.
  const [highlightIndex, setHighlightIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const locationSet = useMemo(() => new Set(locations), [locations]);

  const isDbName = locationSet.has(value);
  const inputDisplay = isDbName ? displayLocation(value) : value;

  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), 150);
    return () => clearTimeout(t);
  }, [value]);

  const allSuggestions = useMemo<Suggestion[]>(() => {
    // Filter by whatever the user has typed. We used to zero the query
    // when the value happened to equal a DB name exactly — the intent
    // was "already picked, show everything again" — but that fired
    // mid-typing too: someone typing "Jaco" would suddenly see the
    // full unfiltered list (airports first) as soon as the last
    // character landed, because "Jaco" IS a DB name. The visitor sees
    // Liberia highlighted at the top and — worst case — hits Enter
    // and books Liberia instead of Jacó. Always filter by the actual
    // input; when the input matches a DB name, matchScore naturally
    // scores that name at 1000 and floats it to the top.
    const query = debouncedValue;

    const locItems: Suggestion[] = locations
      .map<Suggestion>((loc) => {
        const base = matchScore(loc, query);
        return {
          kind: "location" as const,
          loc,
          // Airport priority only kicks in for locations that already
          // match the query. Without this guard, airports scored 50 on
          // every query — including gibberish like "xyz123" — so the
          // dropdown would fall back to "Liberia Airport" for anything
          // that didn't match, which is exactly the wrong-destination
          // trap that got Diego reporting the Jacó bug.
          score: base > 0 ? base + priorityScore(loc) : 0,
        };
      })
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

    return [...locItems, ...hotelItems].sort((a, b) => b.score - a.score);
  }, [debouncedValue, locations, hotels]);

  // Lo que se enseña de verdad. Antes el tope eran 10 fijas y Diego
  // reportó (2026-09-05) que "en el where to salen muy pocos lugares".
  // Medido sobre los datos reales, subiendo el tope a 500: "playa"
  // calza 27, "san" 33, "guanacaste" 23, "monteverde" 14 — la mediana
  // de una búsqueda normal es 14, y "la" llega a 110. O sea que 10
  // cortaba casi todas las búsquedas, y peor: las cortaba en silencio,
  // así que el cliente no tenía cómo saber que su hotel sí estaba.
  const suggestions = useMemo(
    () => allSuggestions.slice(0, MAX_SUGGESTIONS),
    [allSuggestions],
  );
  const hiddenCount = allSuggestions.length - suggestions.length;

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

  // Que el menú quepa donde el cliente lo pueda ver.
  //
  // El menú flota (`absolute`) a propósito. Antes en celular estaba en
  // el flujo (`static md:absolute`) y por eso abrirlo o cerrarlo movía
  // el alto de la página entera: medido, 328px al abrirse y 229px más
  // cuando la lista se achica — 557px de brinco escribiendo un solo
  // destino. Eso es lo que reportó Diego (2026-09-05).
  //
  // Pero flotando aparece el problema que `static` estaba tapando: en
  // celular el teclado en pantalla puede dejar el menú debajo y el
  // cliente no ve nada. `visualViewport` es la única API que sabe dónde
  // termina lo que se ve de verdad con el teclado arriba, así que al
  // abrir se revisa y, si no cabe, se sube la página lo justo — nunca
  // tanto como para meter el campo debajo del nav fijo.
  useEffect(() => {
    if (!open) return;

    function ensureMenuVisible() {
      const menu = menuRef.current;
      const wrapper = wrapperRef.current;
      if (!menu || !wrapper) return;

      const vv = window.visualViewport;
      if (!vv) return;

      // Solo cuando hay teclado en pantalla tapando. Sin esta condición
      // el efecto también dispara en computadora — medido, movía la
      // página 178px al abrir el menú, o sea que yo mismo estaba
      // metiendo el brinco que vinimos a quitar. En computadora el menú
      // puede pasarse del borde de abajo sin problema: como flota,
      // acompaña al campo si el cliente hace scroll.
      const keyboard = window.innerHeight - vv.height;
      if (keyboard < 120) return;

      const overflow = menu.getBoundingClientRect().bottom - (vv.offsetTop + vv.height) + 12;
      if (overflow <= 0) return;

      // Tope: el campo tiene que quedar visible bajo el nav fijo. De
      // nada sirve enseñar el menú si se pierde de vista lo que escribió.
      const room = wrapper.getBoundingClientRect().top - NAV_CLEARANCE;
      const delta = Math.min(overflow, room);
      if (delta <= 0) return;

      // Sin animación: un scroll suave aquí se vería exactamente igual
      // que el brinco que estamos quitando.
      window.scrollBy({ top: delta, behavior: "instant" as ScrollBehavior });
    }

    // Un frame de espera para medir el menú ya dibujado.
    const frame = requestAnimationFrame(ensureMenuVisible);
    // El teclado no sube al instante; cuando sube, visualViewport
    // dispara resize y hay que volver a revisar.
    const vv = window.visualViewport;
    vv?.addEventListener("resize", ensureMenuVisible);
    return () => {
      cancelAnimationFrame(frame);
      vv?.removeEventListener("resize", ensureMenuVisible);
    };
  }, [open]);

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
        <div
          ref={menuRef}
          className="absolute z-50 w-full mt-2 bg-gradient-to-br from-gray-900/98 to-black/98 backdrop-blur-xl border border-amber-500/30 rounded-xl shadow-2xl shadow-black/60 max-h-80 overflow-y-auto"
        >
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
          {/* El aviso de "hay más". Esto es lo que faltaba de verdad: el
              tope viejo cortaba la lista sin decir nada, así que el que
              no veía su hotel asumía que no estaba y se iba. Es un <div>,
              no un <button>: no se puede escoger ni sale en la navegación
              con flechas, solo explica qué hacer. */}
          {hiddenCount > 0 && (
            <div className="px-4 py-2.5 text-[11px] text-gray-400 bg-black/40 border-t border-amber-500/20">
              {lang === "en"
                ? `+${hiddenCount} more — keep typing to narrow it down`
                : `+${hiddenCount} más — seguí escribiendo para afinar`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

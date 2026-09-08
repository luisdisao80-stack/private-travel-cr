"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useCurrency } from "@/lib/CurrencyContext";
import { CURRENCIES, getCurrencyMeta } from "@/lib/currency";
import { useLanguage } from "@/lib/LanguageContext";

/**
 * Compact currency dropdown that mirrors the visual language of
 * LanguageSwitcher (dark pill, amber accents). Lives in the Navbar
 * next to the EN/ES toggle. All bookings still settle in USD via
 * Tilopay — this only changes what visitors SEE on marketing pages.
 */
export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click / Escape so the dropdown doesn't trap the
  // user (especially on mobile where there's no obvious close button).
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = getCurrencyMeta(currency);
  const heading =
    lang === "en" ? "Display currency" : "Moneda de visualización";
  const disclaimer =
    lang === "en"
      ? "Charges in USD via Tilopay"
      : "Cobros en USD vía Tilopay";

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={
          lang === "en"
            ? `Change display currency, current ${active.code}`
            : `Cambiar moneda, actual ${active.code}`
        }
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white border border-slate-200 backdrop-blur-sm text-xs font-bold tracking-wider text-slate-700 hover:text-orange-600 hover:border-orange-500/60 transition-colors"
      >
        <span className="text-sm leading-none" aria-hidden="true">
          {active.flag}
        </span>
        <span>{active.code}</span>
        <ChevronDown
          size={12}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* La apertura del dropdown es CSS (`pop-in`); antes era
          AnimatePresence + motion.div, y eso metia framer-motion en el
          bundle inicial de todas las paginas por venir dentro del Navbar. */}
      <>
        {open ? (
          <div
            className="pop-in absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 backdrop-blur-xl shadow-2xl shadow-slate-900/15 z-50 overflow-hidden"
            role="listbox"
            aria-label={heading}
          >
            <div className="px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-orange-600 font-bold border-b border-slate-200">
              {heading}
            </div>
            <ul className="py-1">
              {CURRENCIES.map((c) => {
                const isActive = c.code === currency;
                return (
                  <li key={c.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        setCurrency(c.code);
                        setOpen(false);
                      }}
                      className={
                        "w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors " +
                        (isActive
                          ? "bg-orange-50 text-orange-700"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900")
                      }
                    >
                      <span
                        className="text-base leading-none"
                        aria-hidden="true"
                      >
                        {c.flag}
                      </span>
                      <span className="flex-1">
                        <span className="font-semibold mr-1">{c.code}</span>
                        <span className="text-[11px] text-slate-400">
                          {c.symbol}
                        </span>
                      </span>
                      <span className="text-[11px] text-slate-500 truncate max-w-[90px]">
                        {c.label}
                      </span>
                      {isActive ? (
                        <Check
                          size={12}
                          className="text-orange-600 shrink-0"
                          strokeWidth={3}
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="px-3 py-2 border-t border-slate-200 text-[10px] text-slate-500 leading-snug">
              {disclaimer}
            </div>
          </div>
        ) : null}
      </>
    </div>
  );
}

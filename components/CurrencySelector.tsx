"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/40 border border-amber-500/20 backdrop-blur-sm text-xs font-bold tracking-wider text-gray-200 hover:text-white hover:border-amber-500/40 transition-colors"
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

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            aria-label={heading}
            className="absolute right-0 mt-2 w-56 rounded-2xl bg-black/95 border border-amber-500/30 backdrop-blur-xl shadow-2xl shadow-black/60 z-50 overflow-hidden"
          >
            <div className="px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-amber-400 font-bold border-b border-amber-500/15">
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
                          ? "bg-amber-500/10 text-amber-300"
                          : "text-gray-200 hover:bg-white/5 hover:text-white")
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
                        <span className="text-[11px] text-gray-400">
                          {c.symbol}
                        </span>
                      </span>
                      <span className="text-[11px] text-gray-500 truncate max-w-[90px]">
                        {c.label}
                      </span>
                      {isActive ? (
                        <Check
                          size={12}
                          className="text-amber-400 shrink-0"
                          strokeWidth={3}
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="px-3 py-2 border-t border-amber-500/15 text-[10px] text-gray-500 leading-snug">
              {disclaimer}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

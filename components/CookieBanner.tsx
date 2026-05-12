"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "ptcr_cookie_consent";

export type Consent = "accepted" | "declined";

export function getCookieConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent() === "accepted";
}

/**
 * Cookie consent banner shown on first visit. Stores the choice in
 * localStorage and dispatches a window event so the analytics layer
 * can pick it up immediately (no reload required to fire events after
 * accept, no events fired before decline).
 */
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = getCookieConsent();
    if (existing == null) {
      // Tiny delay so the banner doesn't fight the first paint.
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const choose = (value: Consent) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
      window.dispatchEvent(new CustomEvent("ptcr:consent-changed", { detail: value }));
    } catch {
      // localStorage disabled — banner just closes.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:bottom-6 md:max-w-md z-[80]"
    >
      <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-amber-500/30 shadow-2xl shadow-black/60 p-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/40">
            <Cookie size={18} className="text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white mb-1">We use cookies</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Essential cookies make the site work (cart, language). Analytics cookies help us
              understand which routes you search and where the booking flow needs work. You can
              decline analytics and the rest still works.{" "}
              <Link href="/privacy" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
                Read more
              </Link>
              .
            </p>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => choose("accepted")}
                className="flex-1 h-9 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition"
              >
                Accept all
              </button>
              <button
                type="button"
                onClick={() => choose("declined")}
                className="flex-1 h-9 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition"
              >
                Essential only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

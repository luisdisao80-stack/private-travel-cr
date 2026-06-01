"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type Currency,
  detectInitialCurrency,
  formatPrice as formatPriceFn,
} from "@/lib/currency";

const STORAGE_KEY = "ptcr-currency";

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (next: Currency) => void;
  /** True once the client has read localStorage / detected the locale.
   *  Components can use this to avoid a flash of converted values
   *  before the real preference is known. */
  hydrated: boolean;
  /** Convenience wrapper around lib/currency#formatPrice that uses the
   *  current currency from context. */
  format: (usd: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined
);

/**
 * SSR renders USD because that's the displayed-price default on the
 * server. On client mount we look at localStorage first (returning
 * visitor), then fall back to a navigator.language guess. If the
 * detected currency differs from USD, we swap in — Price.tsx renders
 * the USD value until `hydrated` flips so there's no early flash of a
 * converted number that then jumps back to USD.
 */
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let initial: Currency = "USD";
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (
        saved === "USD" ||
        saved === "EUR" ||
        saved === "GBP" ||
        saved === "CAD" ||
        saved === "MXN"
      ) {
        initial = saved;
      } else {
        initial = detectInitialCurrency();
      }
    } catch {
      // localStorage can throw in some embedded webviews (private mode,
      // Safari ITP, etc.). Fall back to detection.
      initial = detectInitialCurrency();
    }
    setCurrencyState(initial);
    setHydrated(true);
  }, []);

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Best-effort persistence — never crash the UI.
    }
  }, []);

  const format = useCallback(
    (usd: number) => formatPriceFn(usd, currency),
    [currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, hydrated, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Render-safe fallback: this only happens if someone forgets to
    // wrap the tree. Returning USD prevents the entire page from
    // crashing — pages still render, just always in USD.
    return {
      currency: "USD",
      setCurrency: () => {},
      hydrated: false,
      format: (usd) => formatPriceFn(usd, "USD"),
    };
  }
  return ctx;
}

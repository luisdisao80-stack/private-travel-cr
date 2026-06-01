// Multi-currency display layer for the marketing pages.
//
// IMPORTANT: this only affects what visitors SEE. All bookings still
// process in USD via Tilopay — the totals that hit the payment API,
// confirmation emails, and Supabase records remain in USD. The selector
// is a conversion convenience for European/Canadian/British/Mexican
// shoppers who would otherwise have to mentally convert from USD.
//
// Exchange rates below are static approximations checked against
// public mid-market rates around mid-2026. They drift with the FX
// market — refresh roughly every 3-6 months (or whenever a major
// currency moves > 5%). Because every rounded display value resolves
// back to USD at checkout, a stale rate is a UX nit, not a money bug.

export type Currency = "USD" | "EUR" | "GBP" | "CAD" | "MXN";

export type CurrencyMeta = {
  code: Currency;
  symbol: string;   // What renders before the number ("$", "€", "£", "C$", "MX$")
  label: string;    // Long form for the dropdown ("US Dollar")
  /** Conversion factor relative to USD (1 USD = rate × currency).
   *  Approximate mid-2026 mid-market values — refresh periodically. */
  rate: number;
  flag: string;     // Emoji flag for the selector
};

export const CURRENCIES: CurrencyMeta[] = [
  { code: "USD", symbol: "$",   label: "US Dollar",     rate: 1.0,   flag: "🇺🇸" },
  { code: "EUR", symbol: "€",   label: "Euro",          rate: 0.92,  flag: "🇪🇺" },
  { code: "GBP", symbol: "£",   label: "British Pound", rate: 0.79,  flag: "🇬🇧" },
  { code: "CAD", symbol: "C$",  label: "Canadian Dollar", rate: 1.37, flag: "🇨🇦" },
  { code: "MXN", symbol: "MX$", label: "Mexican Peso",  rate: 17.5,  flag: "🇲🇽" },
];

const CURRENCY_BY_CODE: Record<Currency, CurrencyMeta> = CURRENCIES.reduce(
  (acc, c) => {
    acc[c.code] = c;
    return acc;
  },
  {} as Record<Currency, CurrencyMeta>
);

export function getCurrencyMeta(code: Currency): CurrencyMeta {
  return CURRENCY_BY_CODE[code] ?? CURRENCY_BY_CODE.USD;
}

/**
 * Convert a USD amount to the chosen currency and format it with the
 * right symbol. Rounding rules:
 *
 *   - converted value < 10  → show one decimal (e.g. "€7.5") so we
 *     don't lose meaningful precision on very small numbers
 *   - everything else       → round to the nearest whole unit so cards
 *     read clean ("C$301", not "C$301.40")
 *
 * Thousands separators come from `toLocaleString("en-US")` so the look
 * stays predictable regardless of the visitor's browser locale.
 */
export function formatPrice(usd: number, currency: Currency): string {
  const meta = getCurrencyMeta(currency);
  const raw = usd * meta.rate;

  if (!Number.isFinite(raw)) return `${meta.symbol}0`;

  if (Math.abs(raw) < 10) {
    return `${meta.symbol}${raw.toFixed(1)}`;
  }
  const rounded = Math.round(raw);
  return `${meta.symbol}${rounded.toLocaleString("en-US")}`;
}

/**
 * First-visit currency guess based on the browser's reported language.
 * Conservative on purpose — only fires for the obvious matches and
 * falls back to USD for anything ambiguous. Visitor can always
 * override via the selector.
 *
 * Returns USD when called in a non-browser environment (SSR safety).
 */
export function detectInitialCurrency(): Currency {
  if (typeof navigator === "undefined") return "USD";
  const raw = navigator.language || "";
  const lang = raw.toLowerCase();

  if (lang === "en-gb" || lang.startsWith("en-gb")) return "GBP";
  if (lang === "en-ca" || lang.startsWith("en-ca")) return "CAD";
  if (lang === "fr-ca" || lang.startsWith("fr-ca")) return "CAD";
  if (lang === "es-mx" || lang.startsWith("es-mx")) return "MXN";

  // EUR-zone heuristics: French, German, Italian, Portuguese, Spain-Spanish,
  // plus the smaller eurozone language tags.
  if (lang.startsWith("fr")) return "EUR";
  if (lang.startsWith("de")) return "EUR";
  if (lang.startsWith("it")) return "EUR";
  if (lang.startsWith("pt")) return "EUR";
  if (lang === "es-es" || lang.startsWith("es-es")) return "EUR";
  if (lang.startsWith("nl")) return "EUR";

  return "USD";
}

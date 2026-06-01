"use client";

import { useCurrency } from "@/lib/CurrencyContext";
import { formatPrice } from "@/lib/currency";

type Props = {
  /** Price in USD — the canonical source of truth (Tilopay still
   *  charges USD). */
  usd: number;
  /** Optional inline-element styling. Renders as <span>. */
  className?: string;
  /** When true, append " ≈ USD <amount>" so the visitor knows the
   *  final charge currency. Useful on cart/checkout adjacent labels.
   *  Default false to keep cards clean. */
  showUsdHint?: boolean;
};

/**
 * Drop-in replacement for hardcoded "${usd}" displays. SSR-safe:
 * renders the USD-formatted value until the CurrencyContext finishes
 * hydrating client-side, then swaps to the visitor's chosen currency.
 * That keeps "EUR €203" from flashing as "USD $220" first (or vice
 * versa) — first paint matches what the server sent.
 */
export default function Price({ usd, className, showUsdHint }: Props) {
  const { currency, hydrated, format } = useCurrency();

  // Server (and pre-hydration client) → always USD so the hydration
  // markup matches the SSR HTML exactly. Once `hydrated` flips true,
  // the converted value paints with no layout shift on USD visitors.
  const display = hydrated ? format(usd) : formatPrice(usd, "USD");

  if (showUsdHint && currency !== "USD" && hydrated) {
    return (
      <span className={className}>
        {display}
        <span className="text-[0.75em] text-gray-400 ml-1">
          (≈ ${usd} USD)
        </span>
      </span>
    );
  }

  return <span className={className}>{display}</span>;
}

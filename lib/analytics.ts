// Lightweight analytics layer — fires events to GA4 (gtag) when the
// NEXT_PUBLIC_GA_ID env var is set, and to Vercel Analytics (sendGAEvent
// is handled by @next/third-parties when the script is mounted).
//
// Safe to call from the server: in that case it no-ops.

"use client";

import { track as vercelTrack } from "@vercel/analytics";

type GtagFn = (
  command: "event",
  action: string,
  params?: Record<string, unknown>
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

/**
 * Fire a custom event. Reaches both Vercel Analytics and GA4 if either is
 * configured. Events with monetary value should pass `value` (USD) and
 * `currency` so GA4's revenue attribution works.
 */
export function track(
  event: string,
  params: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;
  try {
    vercelTrack(event, params as Record<string, string | number | boolean | null>);
  } catch {
    // Vercel Analytics not initialized — fine.
  }
  if (typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
}

/** GA4 standard e-commerce events used by the booking flow. */
export const events = {
  addToCart: (params: {
    value: number;
    currency: "USD";
    routeFrom: string;
    routeTo: string;
    vehicleId: string;
    serviceType: string;
  }) =>
    track("add_to_cart", {
      ...params,
      items: [
        {
          item_id: `${params.routeFrom}__${params.routeTo}`,
          item_name: `${params.routeFrom} → ${params.routeTo}`,
          item_category: params.serviceType,
          item_variant: params.vehicleId,
          price: params.value,
          quantity: 1,
        },
      ],
    }),

  beginCheckout: (params: { value: number; currency: "USD"; itemCount: number }) =>
    track("begin_checkout", params),

  purchase: (params: {
    transaction_id: string;
    value: number;
    currency: "USD";
    itemCount: number;
  }) => track("purchase", params),
};

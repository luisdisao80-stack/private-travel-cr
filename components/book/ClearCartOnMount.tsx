"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/lib/CartContext";
import { events } from "@/lib/analytics";

type Props = {
  /** Pass the just-paid booking so we can fire the purchase event with
   *  GA4's expected `transaction_id` + `value`. */
  purchase?: {
    orderNumber: string;
    totalUsd: number;
    itemCount: number;
  };
};

/**
 * Clears the cart once the CartProvider finishes hydrating, and fires the
 * GA4/Vercel `purchase` event. Used on /booking/success so the visitor
 * doesn't see their just-paid trips lingering and our funnel is closed out.
 *
 * The wait on `hydrated` matters: child effects fire before the parent
 * provider's hydration effect, so calling clearCart() on plain mount
 * would be overwritten when the provider reads the saved cart from
 * localStorage milliseconds later.
 */
export default function ClearCartOnMount({ purchase }: Props) {
  const { clearCart, hydrated } = useCart();
  const ran = useRef(false);
  useEffect(() => {
    if (!hydrated || ran.current) return;
    ran.current = true;
    clearCart();
    if (purchase) {
      events.purchase({
        transaction_id: purchase.orderNumber,
        value: purchase.totalUsd,
        currency: "USD",
        itemCount: purchase.itemCount,
      });
    }
  }, [hydrated, clearCart, purchase]);
  return null;
}

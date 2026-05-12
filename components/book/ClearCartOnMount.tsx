"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/lib/CartContext";

/**
 * Clears the cart once the CartProvider finishes hydrating. Used on
 * /booking/success so the visitor doesn't see their just-paid trips
 * lingering after the redirect.
 *
 * The wait on `hydrated` matters: child effects fire before the parent
 * provider's hydration effect, so calling clearCart() on plain mount
 * would be overwritten when the provider reads the saved cart from
 * localStorage milliseconds later.
 */
export default function ClearCartOnMount() {
  const { clearCart, hydrated } = useCart();
  const cleared = useRef(false);
  useEffect(() => {
    if (!hydrated || cleared.current) return;
    cleared.current = true;
    clearCart();
  }, [hydrated, clearCart]);
  return null;
}

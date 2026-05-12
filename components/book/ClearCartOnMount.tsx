"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/CartContext";

/**
 * Clears the cart once on mount. Used on /booking/success so the visitor
 * doesn't see their just-paid trips lingering after the redirect.
 */
export default function ClearCartOnMount() {
  const { clearCart } = useCart();
  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

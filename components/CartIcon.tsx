"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { useLanguage } from "@/lib/LanguageContext";

export default function CartIcon() {
  const { itemCount, setCartOpen } = useCart();
  const { t } = useLanguage();

  return (
    <button
      onClick={() => setCartOpen(true)}
      aria-label={`${t.cart.openCart} (${itemCount})`}
      className="relative p-2 rounded-full text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-all"
    >
      <ShoppingCart size={20} />

      {/* El `key={itemCount}` hace que el badge se re-monte cada vez que
          cambia la cantidad, así la animación CSS `badge-pop` se vuelve a
          disparar en cada "add to cart" — el mismo feedback que daba el
          spring de framer-motion, pero sin bajar la librería. */}
      {itemCount > 0 && (
        <span
          key={itemCount}
          className="badge-pop absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white"
        >
          {itemCount}
        </span>
      )}
    </button>
  );
}

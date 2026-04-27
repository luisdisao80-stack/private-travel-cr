"use client";

import { ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/CartContext";
import { useLanguage } from "@/lib/LanguageContext";

export default function CartIcon() {
  const { itemCount, setCartOpen } = useCart();
  const { t } = useLanguage();

  return (
    <button
      onClick={() => setCartOpen(true)}
      aria-label={`${t.cart.openCart} (${itemCount})`}
      className="relative p-2 rounded-full text-gray-300 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
    >
      <ShoppingCart size={20} />

      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black text-[10px] font-bold flex items-center justify-center border-2 border-black"
          >
            {itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

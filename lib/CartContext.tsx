"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CartItem = {
  id: string;
  fromName: string;
  toName: string;
  date: string;
  pickupTime: string;
  passengers: number;
  children: number;
  flightNumber?: string;
  pickupPlace?: string;
  dropoffPlace?: string;
  vehicleId: "staria" | "hiace" | "maxus";
  vehicleName: string;
  serviceType: "standard" | "vip";
  extraStopHours: number;
  basePrice: number;
  totalPrice: number;
  duration?: string;
  infantSeats?: number;
  convertibleSeats?: number;
  boosterSeats?: number;
};

type CartContextType = {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
  totalPrice: number;
  itemCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ptcr_cart");
      if (saved) setItems(JSON.parse(saved));
    } catch (e) {
      console.error("Error loading cart:", e);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem("ptcr_cart", JSON.stringify(items));
      } catch (e) {
        console.error("Error saving cart:", e);
      }
    }
  }, [items, hydrated]);

  const addItem = (item: Omit<CartItem, "id">) => {
    const newItem: CartItem = {
      ...item,
      id: `trip_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };
    setItems((prev) => [...prev, newItem]);
    setCartOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const clearCart = () => setItems([]);

  const totalPrice = items.reduce((sum, it) => sum + it.totalPrice, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider
      value={{ items, isCartOpen, addItem, removeItem, clearCart, setCartOpen, totalPrice, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

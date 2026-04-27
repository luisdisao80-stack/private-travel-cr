"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { ServiceType } from "@/data/routes";

export type CartItem = {
  id: string; // unique id (timestamp + random)
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  pickupPlace: string;  // Lugar exacto de recogida (hotel, terminal, etc.)
  pickupTime: string;   // Hora de pickup en formato HH:MM (ej: "14:30")
  dropoffPlace: string; // Lugar exacto de destino
  flightNumber?: string; // Solo si origen O destino es aeropuerto
  passengers: number;
  date: string;
  serviceType: ServiceType;
  vehicleId: "staria" | "hiace";
  vehicleName: string;
  basePrice: number;
  extraStopHours: number; // 0-3, solo aplica a Standard
  extraStopsCost: number;
  totalPrice: number; // basePrice + extraStopsCost
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalPrice: number;
  itemCount: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "ptcr-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Cargar del localStorage al montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (err) {
      console.error("Error loading cart:", err);
    }
    setMounted(true);
  }, []);

  // Guardar al localStorage cada vez que cambia
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Error saving cart:", err);
    }
  }, [items, mounted]);

  const addItem = (item: Omit<CartItem, "id">) => {
    const newItem: CartItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        totalPrice,
        itemCount,
        isCartOpen,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

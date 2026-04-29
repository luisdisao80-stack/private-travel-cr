"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trash2,
  MapPin,
  Calendar,
  Users,
  Crown,
  Clock,
  ShoppingCart,
  ArrowRight,
  Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/CartContext";
import { useLanguage } from "@/lib/LanguageContext";
import BookingForm from "@/components/BookingForm";

export default function Cart() {
  const { items, removeItem, clearCart, totalPrice, isCartOpen, setCartOpen } = useCart();
  const { t, lang } = useLanguage();
  const [showBookingForm, setShowBookingForm] = useState(false);

  const handleClose = () => {
    setCartOpen(false);
    setShowBookingForm(false);
  };

  const handleContinue = () => {
    if (items.length === 0) return;
    setShowBookingForm(true);
  };

  const handleBack = () => {
    setShowBookingForm(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString(lang === "en" ? "en-US" : "es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Convierte "HH:MM" (24h) a formato 12h amigable: "11:30 PM"
  const formatTime = (timeStr: string) => {
    if (!timeStr || !timeStr.includes(":")) return timeStr;
    const [hStr, mStr] = timeStr.split(":");
    const h = parseInt(hStr, 10);
    if (isNaN(h)) return timeStr;
    const period = h < 12 ? "AM" : "PM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${mStr} ${period}`;
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[480px] bg-black border-l border-amber-500/20 z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-amber-500/10 bg-gradient-to-b from-amber-500/5 to-transparent">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-amber-400" size={22} />
                <h2 className="text-xl font-bold text-white">
                  {showBookingForm ? t.cart.bookingDetails : t.cart.title}
                </h2>
                {!showBookingForm && items.length > 0 && (
                  <span className="text-sm text-gray-400">
                    ({items.length} {items.length === 1 ? t.cart.transfer : t.cart.transfers})
                  </span>
                )}
              </div>
              <button
                onClick={handleClose}
                aria-label={t.cart.close}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {!showBookingForm ? (
                items.length === 0 ? (
                  /* Empty state */
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                      <ShoppingCart size={32} className="text-amber-400/50" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{t.cart.emptyTitle}</h3>
                    <p className="text-gray-400 text-sm mb-6">{t.cart.emptyDescription}</p>
                    <Button
                      onClick={handleClose}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                    >
                      {t.cart.startBooking}
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                ) : (
                  /* Cart items */
                  <div className="p-5 space-y-3">
                    {items.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        layout
                        className="relative p-4 rounded-xl border border-amber-500/20 bg-gradient-to-br from-white/[0.04] to-transparent"
                      >
                        {/* Number badge */}
                        <div className="absolute -top-2.5 left-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold px-2.5 py-0.5 rounded-full">
                          #{idx + 1}
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label={t.cart.removeItem}
                          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                        >
                          <Trash2 size={14} />
                        </button>

                        {/* Route */}
                        <div className="mb-3 pr-8">
                          <div className="flex items-center gap-2 text-white font-semibold text-sm mb-1">
                            <MapPin size={14} className="text-amber-400 flex-shrink-0" />
                            <span className="truncate">{item.fromName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white font-semibold text-sm">
                            <ArrowRight size={14} className="text-amber-400 flex-shrink-0" />
                            <span className="truncate">{item.toName}</span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            <span>{formatDate(item.date)}</span>
                            {item.pickupTime && (
                              <>
                                <span className="text-gray-600">·</span>
                                <Clock size={12} className="text-amber-400/70" />
                                <span className="text-amber-400/90 font-medium">{formatTime(item.pickupTime)}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users size={12} />
                            {item.passengers} {t.cart.pax}
                            {item.children > 0 && (
                              <span className="text-amber-400/80 ml-1">
                                ({item.children} {item.children === 1 ? t.cart.child : t.cart.children})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Pickup / Dropoff with vehicle photo */}
                        <div className="flex gap-3 mb-3 pb-3 border-b border-amber-500/10">
                          {/* Vehicle photo - left side */}
                          <div className="flex-shrink-0 w-40 h-28 rounded-lg overflow-hidden bg-white border border-amber-500/30 flex items-center justify-center p-2">
                            <img
                              src={item.vehicleId === "staria" ? "/staria.webp" : "/hiace.png"}
                              alt={item.vehicleName}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Pickup/Dropoff/Flight - right side */}
                          <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                            <div className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-gray-500">{t.cart.pickup}: </span>
                                <span className="text-gray-200 break-words">{item.pickupPlace}</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-gray-500">{t.cart.dropoff}: </span>
                                <span className="text-gray-200 break-words">{item.dropoffPlace}</span>
                              </div>
                            </div>
                            {item.flightNumber && (
                              <div className="flex items-start gap-2">
                                <Plane size={11} className="text-amber-400 mt-1 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-gray-500">{t.cart.flight}: </span>
                                  <span className="text-amber-400 font-medium uppercase">{item.flightNumber}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Service + price */}
                        <div className="flex items-center justify-between pt-3 border-t border-amber-500/10">
                          <div className="flex items-center gap-2">
                            {item.serviceType === "vip" ? (
                              <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                                <Crown size={12} />
                                VIP
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-white/70">
                                {t.cart.standard}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">·</span>
                            <span className="text-xs text-gray-400">{item.vehicleName}</span>
                            {item.extraStopHours > 0 && (
                              <>
                                <span className="text-xs text-gray-500">·</span>
                                <span className="flex items-center gap-1 text-xs text-amber-400">
                                  <Clock size={11} />
                                  +{item.extraStopHours}h
                                </span>
                              </>
                            )}
                          </div>
                          <div className="text-amber-400 font-bold">${item.totalPrice}</div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Clear cart button */}
                    <button
                      onClick={clearCart}
                      className="w-full text-xs text-gray-500 hover:text-red-400 transition-colors py-2"
                    >
                      {t.cart.clearAll}
                    </button>
                  </div>
                )
              ) : (
                /* Booking form */
                <BookingForm onBack={handleBack} />
              )}
            </div>

            {/* Footer with total */}
            {!showBookingForm && items.length > 0 && (
              <div className="border-t border-amber-500/20 p-5 space-y-4 bg-gradient-to-t from-amber-500/5 to-transparent">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">{t.cart.total}</span>
                  <span className="text-3xl font-bold text-white">
                    ${totalPrice}
                    <span className="text-sm text-gray-400 font-normal ml-1">USD</span>
                  </span>
                </div>
                <Button
                  onClick={handleContinue}
                  className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-lg"
                >
                  {t.cart.continueBooking}
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

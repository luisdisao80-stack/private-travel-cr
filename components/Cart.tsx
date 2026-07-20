"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { useCurrency } from "@/lib/CurrencyContext";
import { formatPrice } from "@/lib/currency";
import { isAirport } from "@/lib/quote-helpers";
import {
  isFirstTripLeadTimeOk,
  LEAD_TIME_MESSAGE_EN,
  LEAD_TIME_MESSAGE_ES,
  WHATSAPP_URGENT_URL_EN,
  WHATSAPP_URGENT_URL_ES,
} from "@/lib/booking-rules";
import BookingForm from "@/components/BookingForm";
import Price from "@/components/Price";

export default function Cart() {
  const { items, removeItem, clearCart, totalPrice, isCartOpen, setCartOpen } = useCart();
  const { t, lang } = useLanguage();
  const { currency, hydrated } = useCurrency();
  const router = useRouter();
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Charges settle in USD via Tilopay regardless of display currency.
  // Surface the converted approximation under the USD total so EUR/GBP
  // browsers see roughly what they'll be billed in their currency.
  const showCurrencyHint = hydrated && currency !== "USD";
  const convertedTotal = formatPrice(totalPrice, currency);

  // Lock body scroll while the drawer is open so the underlying page can't
  // scroll behind the overlay (also kills mobile rubber-banding).
  useEffect(() => {
    if (!isCartOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isCartOpen]);

  const handleClose = () => {
    setCartOpen(false);
    setShowBookingForm(false);
  };

  // Cart-side pre-validation. BookingForm has always enforced these
  // rules (12h lead time, flight-number-for-airport-pickup, no same-same
  // route), but the cart drawer used to only check items.length > 0 —
  // so a visitor with a stale cart (12h window closed overnight) or a
  // half-configured trip would hit Continue, land on checkout, and see
  // the Pay button silently disabled with no clear reason. Now we
  // surface the specific issue right here so they can fix it before
  // even leaving the drawer.
  const leadTimeOk = isFirstTripLeadTimeOk(items);
  const airportMissingFlightIndex = items.findIndex(
    (it) =>
      isAirport(it.fromName) &&
      !(it.flightNumber && it.flightNumber.trim().length > 0),
  );
  const sameRouteIndex = items.findIndex(
    (it) => it.fromName.trim().toLowerCase() === it.toName.trim().toLowerCase(),
  );

  // First-issue message + type — used to render a single banner above
  // Continue. Order matters: lead-time is the only issue that can't be
  // fixed inside the checkout form (the clock has already run out), so
  // it takes precedence with the WhatsApp fallback CTA.
  type CartIssue =
    | { kind: "leadTime" }
    | { kind: "missingFlight"; tripIndex: number; fromName: string }
    | { kind: "sameRoute"; tripIndex: number };

  let cartIssue: CartIssue | null = null;
  if (items.length > 0) {
    if (!leadTimeOk) {
      cartIssue = { kind: "leadTime" };
    } else if (airportMissingFlightIndex !== -1) {
      const it = items[airportMissingFlightIndex];
      cartIssue = {
        kind: "missingFlight",
        tripIndex: airportMissingFlightIndex,
        fromName: it.fromName,
      };
    } else if (sameRouteIndex !== -1) {
      cartIssue = { kind: "sameRoute", tripIndex: sameRouteIndex };
    }
  }

  // isCartValid gates the Continue button. Missing-flight and same-route
  // ARE technically fixable on the checkout page (BookingForm surfaces
  // them there), but pushing the visitor forward when we already know
  // they're going to hit a wall is bad UX — better to fix in place.
  const isCartValid = items.length > 0 && cartIssue === null;

  const handleContinue = () => {
    if (!isCartValid) return;
    setCartOpen(false);
    // /book uses ?checkout=1 to skip the calculator and render the booking form.
    router.push("/book?checkout=1");
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
                      className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
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
                              src={
                                item.vehicleId === "staria"
                                  ? "/staria.webp"
                                  : item.vehicleId === "maxus"
                                    ? "/maxus-v90.webp"
                                    : "/hiace.png"
                              }
                              alt={item.vehicleName}
                              width={160}
                              height={112}
                              loading="lazy"
                              decoding="async"
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
                          <div className="text-amber-400 font-bold"><Price usd={item.totalPrice} /></div>
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
                  <div className="text-right">
                    <span className="text-3xl font-bold text-white">
                      ${totalPrice.toFixed(2)}
                      <span className="text-sm text-gray-400 font-normal ml-1">USD</span>
                    </span>
                    {showCurrencyHint ? (
                      <div className="text-[11px] text-amber-300 mt-0.5">
                        ≈ {convertedTotal} {currency}
                      </div>
                    ) : null}
                    <div className="text-[11px] text-gray-500 mt-0.5">{t.quote.taxesIncluded} · {lang === "en" ? "Charges in USD via Tilopay" : "Cobros en USD vía Tilopay"}</div>
                  </div>
                </div>
                {cartIssue && (
                  <div
                    className={
                      cartIssue.kind === "leadTime"
                        ? "rounded-lg border border-amber-400/50 bg-amber-500/10 px-4 py-3 text-xs text-amber-100"
                        : "rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200"
                    }
                  >
                    {cartIssue.kind === "leadTime" && (
                      <>
                        <p className="leading-snug mb-2">
                          {lang === "es"
                            ? LEAD_TIME_MESSAGE_ES
                            : LEAD_TIME_MESSAGE_EN}
                        </p>
                        <a
                          href={
                            lang === "es"
                              ? WHATSAPP_URGENT_URL_ES
                              : WHATSAPP_URGENT_URL_EN
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-green-600 hover:bg-green-500 text-white font-semibold text-xs px-3 py-1.5 transition-colors"
                        >
                          {lang === "es"
                            ? "Escríbenos por WhatsApp"
                            : "WhatsApp us"}
                        </a>
                      </>
                    )}
                    {cartIssue.kind === "missingFlight" && (
                      <p className="leading-snug">
                        {lang === "es"
                          ? `El viaje #${cartIssue.tripIndex + 1} (${cartIssue.fromName}) necesita un número de vuelo. Continuá al checkout para agregarlo — sin él no podemos rastrear tu vuelo por retrasos.`
                          : `Trip #${cartIssue.tripIndex + 1} (${cartIssue.fromName}) needs a flight number. Continue to checkout to add it — without it we can't track your flight for delays.`}
                      </p>
                    )}
                    {cartIssue.kind === "sameRoute" && (
                      <p className="leading-snug">
                        {lang === "es"
                          ? `El origen y el destino del viaje #${cartIssue.tripIndex + 1} son iguales. Eliminá el viaje y agregalo de nuevo con destinos diferentes.`
                          : `Pickup and drop-off are the same on trip #${cartIssue.tripIndex + 1}. Remove that trip and add it again with different locations.`}
                      </p>
                    )}
                  </div>
                )}
                <Button
                  onClick={handleContinue}
                  disabled={!isCartValid}
                  title={
                    cartIssue?.kind === "leadTime"
                      ? lang === "es"
                        ? "El horario de reserva ya pasó — usá WhatsApp"
                        : "Lead time expired — use WhatsApp"
                      : cartIssue?.kind === "missingFlight"
                        ? lang === "es"
                          ? "Falta el número de vuelo en un viaje al aeropuerto"
                          : "Airport pickup is missing a flight number"
                        : cartIssue?.kind === "sameRoute"
                          ? lang === "es"
                            ? "Origen y destino son iguales en un viaje"
                            : "Pickup and drop-off are the same on a trip"
                          : undefined
                  }
                  className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t.cart.continueBooking}
                  <ArrowRight size={18} className="ml-2" />
                </Button>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    // Used to bounce to /routes (listing of 90+ routes),
                    // which dropped the visitor's context — they'd see a
                    // catalog and have to find their next leg from
                    // scratch. Now we go straight to /book?add=1 which
                    // the BookWizardClient interprets as "render the
                    // calculator even though cart isn't empty". Same
                    // surface as the sidebar "Add another trip" CTA.
                    router.push("/book?add=1");
                  }}
                  className="w-full h-12 border border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/5 text-amber-400 font-semibold rounded-md transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-lg">+</span>
                  <span>Add Another Trip</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

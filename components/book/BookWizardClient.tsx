"use client";

import { useEffect, useMemo, useRef } from "react";
import QuoteCalculatorV2 from "@/components/QuoteCalculatorV2";
import BookingForm from "@/components/BookingForm";
import WizardProgress from "@/components/book/WizardProgress";
import OrderSummarySidebar from "@/components/book/OrderSummarySidebar";
import { useCart } from "@/lib/CartContext";

type Props = { locations: string[] };

export default function BookWizardClient({ locations }: Props) {
  const { items, isCartOpen, setCartOpen, totalPrice } = useCart();

  // CartContext.addItem auto-opens the drawer. On /book the inline checkout already takes
  // over, so close the drawer when an item is added. Manual opens (clicking the cart icon
  // without adding) are left alone.
  const prevCount = useRef(items.length);
  useEffect(() => {
    if (items.length > prevCount.current && isCartOpen) {
      setCartOpen(false);
    }
    prevCount.current = items.length;
  }, [items.length, isCartOpen, setCartOpen]);

  // Step 2 (Trip Details) while building the cart, Step 3 (Checkout) once there's at least one trip.
  const hasTrip = items.length > 0;
  const currentStep = hasTrip ? "checkout" : "trip";

  // Drive the OrderSummary sidebar from the latest cart item (or placeholders).
  const latest = items[items.length - 1];
  const summary = useMemo(
    () => ({
      from: latest?.fromName || "",
      to: latest?.toName || "",
      pickupAddress: latest?.pickupPlace && latest.pickupPlace !== latest.fromName ? latest.pickupPlace : undefined,
      dropoffAddress: latest?.dropoffPlace && latest.dropoffPlace !== latest.toName ? latest.dropoffPlace : undefined,
      travelDate: latest?.date,
      pickupTime: latest?.pickupTime,
      passengers: latest?.passengers || 0,
      duration: latest?.duration,
      totalPrice,
      vehicleName: latest?.vehicleName,
      vehicleId: latest?.vehicleId,
    }),
    [latest, totalPrice]
  );

  return (
    <>
      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <img
          src="https://privatecr2.imgix.net/principal.jpeg?auto=format,compress&cs=srgb&q=60&w=2000"
          alt="Costa Rica private shuttle"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black z-[1]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.18),transparent_60%)] z-[2]" />
        <div className="relative z-10 container mx-auto px-4 pt-24 pb-10 md:pt-28 md:pb-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
            {hasTrip ? "Confirm your booking" : "Book your private shuttle"}
          </h1>
          <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto">
            {hasTrip
              ? "Enter your details and we'll handle the rest"
              : "Pick your route, your date, and ride in comfort"}
          </p>
        </div>
      </section>

      <WizardProgress current={currentStep} />

      {/* Layout: two-column once a trip is in the cart, single narrow column while configuring */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        {hasTrip ? (
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-10">
            <div className="min-w-0 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-gray-900/95 to-black/95 shadow-2xl shadow-black/40">
              <BookingForm onBack={() => setCartOpen(true)} />
            </div>
            <OrderSummarySidebar {...summary} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <QuoteCalculatorV2 locations={locations} />
          </div>
        )}
      </section>
    </>
  );
}

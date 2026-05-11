"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QuoteCalculatorV2 from "@/components/QuoteCalculatorV2";
import BookingForm from "@/components/BookingForm";
import WizardProgress from "@/components/book/WizardProgress";
import OrderSummarySidebar from "@/components/book/OrderSummarySidebar";
import TripsList from "@/components/book/TripsList";
import { useCart } from "@/lib/CartContext";

type Props = { locations: string[] };
type View = "configuring" | "review" | "checkout";

export default function BookWizardClient({ locations }: Props) {
  const { items, isCartOpen, setCartOpen, hydrated, totalPrice } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasUrlRoute = !!searchParams.get("from") || !!searchParams.get("to");

  // Three sub-views inside Step 2:
  //   configuring – QuoteCalculator only (cart empty, or arriving from /routes)
  //   review      – TripsList only (one+ trips already added, awaiting next action)
  // Step 3 is `checkout` – the BookingForm.
  //
  // The cart hydrates from localStorage AFTER mount, so we can't pick the
  // initial view from `items.length` synchronously. Start in 'configuring'
  // and let the post-hydration effect settle the view.
  const [view, setView] = useState<View>("configuring");
  const prevItemsCount = useRef(0);
  const settledFromHydration = useRef(false);

  // Settle view once the cart finishes hydrating, then react to real changes.
  // Hydration looks like "items.length went 0 → N" but it's not a user add,
  // so we must not treat it as one (otherwise arriving with ?from=&to= and a
  // pre-existing cart bounces the visitor into 'review').
  useEffect(() => {
    if (!hydrated) return;
    if (!settledFromHydration.current) {
      settledFromHydration.current = true;
      prevItemsCount.current = items.length;
      if (!hasUrlRoute && items.length > 0) {
        setView("review");
      }
      return;
    }
    if (items.length > prevItemsCount.current) {
      setView("review");
    } else if (items.length === 0) {
      setView("configuring");
    }
    prevItemsCount.current = items.length;
  }, [items.length, hydrated, hasUrlRoute]);

  // The cart drawer auto-opens on addItem; on /book we render the cart inline, so close it.
  useEffect(() => {
    if (!hydrated) return;
    if (isCartOpen && items.length > prevItemsCount.current) {
      setCartOpen(false);
    }
    // intentionally not depending on isCartOpen — only react to count changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, hydrated]);

  const handleAddAnother = () => {
    router.push("/routes");
  };

  const currentStep = view === "checkout" ? "checkout" : "trip";

  // Drive Order Summary sidebar from the latest cart item (only relevant in checkout view).
  const latest = items[items.length - 1];
  const summary = useMemo(
    () => ({
      from: latest?.fromName || "",
      to: latest?.toName || "",
      pickupAddress:
        latest?.pickupPlace && latest.pickupPlace !== latest.fromName ? latest.pickupPlace : undefined,
      dropoffAddress:
        latest?.dropoffPlace && latest.dropoffPlace !== latest.toName ? latest.dropoffPlace : undefined,
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

  const heroTitle =
    view === "checkout"
      ? "Confirm your booking"
      : view === "review"
        ? "Your trips"
        : "Book your private shuttle";
  const heroSub =
    view === "checkout"
      ? "Enter your details and we'll handle the rest"
      : view === "review"
        ? "Add another or continue to checkout"
        : "Pick your route, your date, and ride in comfort";

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
            {heroTitle}
          </h1>
          <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto">{heroSub}</p>
        </div>
      </section>

      <WizardProgress current={currentStep} />

      <section className="container mx-auto px-4 py-8 md:py-12">
        {view === "checkout" ? (
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-10">
            <div className="min-w-0 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-gray-900/95 to-black/95 shadow-2xl shadow-black/40">
              <BookingForm onBack={() => setView("review")} />
            </div>
            <OrderSummarySidebar {...summary} />
          </div>
        ) : view === "review" ? (
          <div className="max-w-2xl mx-auto">
            <TripsList
              onAddAnother={handleAddAnother}
              onContinue={() => setView("checkout")}
            />
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

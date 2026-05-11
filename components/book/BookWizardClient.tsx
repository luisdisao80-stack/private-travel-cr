"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Shield, Zap } from "lucide-react";
import QuoteCalculatorV2 from "@/components/QuoteCalculatorV2";
import BookingForm from "@/components/BookingForm";
import WizardProgress from "@/components/book/WizardProgress";
import OrderSummarySidebar from "@/components/book/OrderSummarySidebar";
import LocationInput from "@/components/LocationInput";
import { useCart } from "@/lib/CartContext";

type Props = { locations: string[] };
type View = "configuring" | "checkout";

export default function BookWizardClient({ locations }: Props) {
  const { items, isCartOpen, setCartOpen, hydrated, totalPrice } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasUrlRoute = !!searchParams.get("from") || !!searchParams.get("to");
  const wantsCheckout = searchParams.get("checkout") === "1";

  // Two views on /book:
  //   configuring – QuoteCalculator (pick a route, add to cart)
  //   checkout    – BookingForm (finalize the booking)
  //
  // The cart hydrates from localStorage AFTER mount, so we can't pick the
  // initial view from `items.length` synchronously. Start in 'configuring'
  // (or 'checkout' if the URL explicitly asked for it) and let the
  // post-hydration effect promote the view if the cart has items.
  const [view, setView] = useState<View>(wantsCheckout ? "checkout" : "configuring");
  const prevItemsCount = useRef(0);
  const settledFromHydration = useRef(false);

  // Hero search card state — kept in sync with ?from=&to= so the calculator
  // below pre-fills via its existing syncFromUrl listener.
  const [heroFrom, setHeroFrom] = useState<string>(searchParams.get("from") ?? "");
  const [heroTo, setHeroTo] = useState<string>(searchParams.get("to") ?? "");

  const pushRouteParams = (from: string, to: string) => {
    if (typeof window === "undefined") return;
    const next = new URLSearchParams();
    if (from) next.set("from", from);
    if (to) next.set("to", to);
    const qs = next.toString();
    window.history.replaceState({}, "", qs ? `/book?${qs}` : "/book");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleHeroFrom = (val: string) => {
    setHeroFrom(val);
    pushRouteParams(val, heroTo);
  };
  const handleHeroTo = (val: string) => {
    setHeroTo(val);
    pushRouteParams(heroFrom, val);
  };

  useEffect(() => {
    if (!hydrated) return;
    if (!settledFromHydration.current) {
      settledFromHydration.current = true;
      prevItemsCount.current = items.length;
      // First settle: if the visitor arrived without an explicit intent
      // (no ?from=&to= and no ?checkout=1) but already has cart items,
      // jump straight to checkout — they're returning to finalize.
      if (!hasUrlRoute && !wantsCheckout && items.length > 0) {
        setView("checkout");
      }
      return;
    }
    // After Add to Cart: bounce the visitor to /routes so they can pick
    // the next route. From there, "Continue to booking" leads to checkout.
    if (items.length > prevItemsCount.current) {
      router.push("/routes");
      return;
    }
    if (items.length === 0) {
      setView("configuring");
    }
    prevItemsCount.current = items.length;
  }, [items.length, hydrated, hasUrlRoute, wantsCheckout, router]);

  // The cart drawer auto-opens on addItem; on /book the cart is reachable
  // through the navbar icon, so close the drawer to keep the page calm.
  useEffect(() => {
    if (!hydrated) return;
    if (isCartOpen && items.length > prevItemsCount.current) {
      setCartOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, hydrated]);

  const currentStep = view === "checkout" ? "checkout" : "trip";

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
        <div className="relative z-10 container mx-auto px-4 pt-24 pb-10 md:pt-28 md:pb-12">
          {view === "checkout" ? (
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
                Confirm your booking
              </h1>
              <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto">
                Enter your details and we&apos;ll handle the rest
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-5 text-center">
                Where are you headed?
              </h1>
              <div className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-amber-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-black/50">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2">
                  <LocationInput
                    value={heroFrom}
                    onChange={handleHeroFrom}
                    placeholder="Where from?"
                    locations={locations}
                  />
                  <ArrowRight size={20} className="text-amber-400 self-center hidden md:block shrink-0" />
                  <LocationInput
                    value={heroTo}
                    onChange={handleHeroTo}
                    placeholder="Where to?"
                    locations={locations}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-5 pt-5 border-t border-white/5 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Zap size={12} className="text-amber-400" />
                    Instant pricing
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield size={12} className="text-amber-400" />
                    Free cancellation
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-amber-400" />
                    No hidden fees
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <WizardProgress current={currentStep} />

      <section className="container mx-auto px-4 py-8 md:py-12">
        {view === "checkout" ? (
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-10">
            <div className="min-w-0 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-gray-900/95 to-black/95 shadow-2xl shadow-black/40">
              <BookingForm onBack={() => setView("configuring")} />
            </div>
            <OrderSummarySidebar items={items} totalPrice={totalPrice} />
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

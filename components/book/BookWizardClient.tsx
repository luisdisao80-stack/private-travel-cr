"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextImage from "next/image";
import { ArrowRight, CheckCircle2, Shield, Zap } from "lucide-react";
import QuoteCalculatorV2 from "@/components/QuoteCalculatorV2";
import BookingForm from "@/components/BookingForm";
import WizardProgress from "@/components/book/WizardProgress";
import OrderSummarySidebar from "@/components/book/OrderSummarySidebar";
import LocationInput from "@/components/LocationInput";
import RoutePricePreview from "@/components/RoutePricePreview";
import { useCart } from "@/lib/CartContext";
import type { Hotel } from "@/lib/types";

type Props = { locations: string[]; hotels?: Hotel[] };
type View = "configuring" | "checkout";

export default function BookWizardClient({ locations, hotels = [] }: Props) {
  const { items, isCartOpen, setCartOpen, hydrated, totalPrice } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasUrlRoute = !!searchParams.get("from") || !!searchParams.get("to");
  const wantsCheckout = searchParams.get("checkout") === "1";
  // `?add=1` is set by the "Add another trip" CTA in the cart sidebar.
  // Without it, the hydration effect below sees the populated cart and
  // bounces the visitor right back to the checkout view they came from —
  // the very thing they were trying to leave to add a new leg.
  const wantsAdd = searchParams.get("add") === "1";

  // Two views on /book:
  //   configuring – QuoteCalculator (pick a route, add to cart)
  //   checkout    – BookingForm (finalize the booking)
  //
  // The cart hydrates from localStorage AFTER mount, so we can't pick the
  // initial view from `items.length` synchronously. Start in 'configuring'
  // (or 'checkout' if the URL explicitly asked for it) and let the
  // post-hydration effect promote the view if the cart has items.
  const [view, setView] = useState<View>(
    wantsCheckout && !wantsAdd ? "checkout" : "configuring",
  );
  const prevItemsCount = useRef(0);
  const settledFromHydration = useRef(false);

  // Hero search card state — kept in sync with ?from=&to= so the calculator
  // below pre-fills via its existing syncFromUrl listener.
  const [heroFrom, setHeroFrom] = useState<string>(searchParams.get("from") ?? "");
  const [heroTo, setHeroTo] = useState<string>(searchParams.get("to") ?? "");
  // Track hotel picks here too so the URL keeps `pickupHotel` / `dropoffHotel`
  // alive when the visitor edits the route from inside /book. Otherwise
  // pushRouteParams would strip them, and the calculator below would re-read
  // the URL via popstate and lose the hotel pre-fill.
  const [heroPickupHotel, setHeroPickupHotel] = useState<Hotel | null>(null);
  const [heroDropoffHotel, setHeroDropoffHotel] = useState<Hotel | null>(null);

  const pushRouteParams = (
    from: string,
    to: string,
    pickupHotel: Hotel | null,
    dropoffHotel: Hotel | null,
  ) => {
    if (typeof window === "undefined") return;
    const next = new URLSearchParams();
    if (from) next.set("from", from);
    if (to) next.set("to", to);
    if (pickupHotel) next.set("pickupHotel", pickupHotel.name);
    if (dropoffHotel) next.set("dropoffHotel", dropoffHotel.name);
    const qs = next.toString();
    window.history.replaceState({}, "", qs ? `/book?${qs}` : "/book");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleHeroFrom = (val: string) => {
    setHeroFrom(val);
    pushRouteParams(val, heroTo, heroPickupHotel, heroDropoffHotel);
  };
  const handleHeroTo = (val: string) => {
    setHeroTo(val);
    pushRouteParams(heroFrom, val, heroPickupHotel, heroDropoffHotel);
  };
  const handlePickupHotel = (hotel: Hotel | null) => {
    setHeroPickupHotel(hotel);
    pushRouteParams(heroFrom, heroTo, hotel, heroDropoffHotel);
  };
  const handleDropoffHotel = (hotel: Hotel | null) => {
    setHeroDropoffHotel(hotel);
    pushRouteParams(heroFrom, heroTo, heroPickupHotel, hotel);
  };

  // URL → view sync. The `view` state was initialised from the URL on
  // first mount only; if the visitor is already on /book (?from=&to=,
  // view='configuring') and then opens the cart drawer + clicks
  // 'Continue to checkout', Next.js updates the URL to /book?checkout=1
  // WITHOUT remounting the component, so useState never re-runs and
  // the visitor stays stuck in Trip Details. Mirroring URL → view
  // every time wantsCheckout flips fixes both directions (cart→checkout
  // and add-another-trip→configuring).
  useEffect(() => {
    // `?add=1` overrides everything — visitor explicitly wants to
    // configure another trip even if the cart is non-empty.
    if (wantsAdd) {
      setView("configuring");
    } else if (wantsCheckout) {
      setView("checkout");
    } else if (hasUrlRoute) {
      setView("configuring");
    }
  }, [wantsCheckout, wantsAdd, hasUrlRoute]);

  useEffect(() => {
    if (!hydrated) return;
    if (!settledFromHydration.current) {
      settledFromHydration.current = true;
      prevItemsCount.current = items.length;
      // First settle:
      //   - ?add=1 → configuring (visitor wants to add another trip,
      //              overrides the cart-has-items → checkout rule below)
      //   - ?from=&to= → configuring (visitor explicitly picked a new route)
      //   - ?checkout=1 → checkout (initial state already set this)
      //   - no params + cart has items → checkout (returning to finalize)
      //   - no params + empty cart → configuring (default)
      if (!wantsAdd && !hasUrlRoute && !wantsCheckout && items.length > 0) {
        setView("checkout");
      }
      return;
    }
    // After Add to Cart: ALWAYS go to checkout. Used to branch — first
    // trip → checkout, subsequent → /routes (a browsing surface for
    // building multi-leg trips). But Diego reported on production that
    // the second-trip branch caused a bouncy redirect where the visitor
    // landed at checkout still seeing only the previous trip (cart
    // localStorage race when navigating away and back). Simpler win:
    // every add goes straight to checkout. Multi-leg planners still
    // get there via the explicit "+ Add another trip" button in the
    // OrderSummarySidebar — they don't need the /routes detour.
    //
    // Order matters: setView before any router.push so the calculator
    // view doesn't flicker if Next.js skips the navigation (e.g. when
    // URL is already /book?checkout=1 from a prior session leg).
    if (items.length > prevItemsCount.current) {
      setView("checkout");
      prevItemsCount.current = items.length;
      if (!wantsCheckout) {
        router.push("/book?checkout=1");
      }
      return;
    }
    // Cart just emptied (cleared or last trip removed) — send them back to
    // /routes to start fresh. /book with no items leaves them stranded with
    // a half-built calculator state inherited from URL params.
    if (items.length === 0 && prevItemsCount.current > 0) {
      router.push("/routes");
      return;
    }
    prevItemsCount.current = items.length;
  }, [items.length, hydrated, hasUrlRoute, wantsCheckout, wantsAdd, router]);

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
      {/* overflow-visible (not -hidden) so the LocationInput dropdown can
          extend past the section bottom without getting clipped. */}
      <section className="relative w-full">
        <NextImage
          src="/principal.jpg"
          alt="Costa Rica private shuttle on a coastal road"
          fill
          priority
          sizes="100vw"
          quality={65}
          className="object-cover object-center -z-[1]"
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
              <div className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-amber-500/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50 overflow-visible">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2">
                  <LocationInput
                    value={heroFrom}
                    onChange={handleHeroFrom}
                    placeholder="Where from?"
                    locations={locations}
                    hotels={hotels}
                    onHotelPick={handlePickupHotel}
                  />
                  <ArrowRight size={20} className="text-amber-400 self-center hidden md:block shrink-0" />
                  <LocationInput
                    value={heroTo}
                    onChange={handleHeroTo}
                    placeholder="Where to?"
                    locations={locations}
                    hotels={hotels}
                    onHotelPick={handleDropoffHotel}
                  />
                </div>
                <RoutePricePreview from={heroFrom} to={heroTo} />
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
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_440px] gap-8 lg:gap-10">
            <div className="min-w-0 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-gray-900/95 to-black/95 shadow-2xl shadow-black/40">
              <BookingForm
                onBack={() => {
                  // Same reset as the desktop "Add another trip" CTA —
                  // both surfaces are the user saying "I want a fresh
                  // calculator", not "edit the trip already in my cart".
                  //
                  // Important: we DO NOT touch the URL here. The earlier
                  // version called pushRouteParams("", "", null, null) to
                  // strip ?checkout=1, but on the production build that
                  // triggered useSearchParams + the URL-sync effect to
                  // bounce the view back to "checkout" (a different
                  // batching pattern from dev). View stays "configuring"
                  // and URL stays /book?checkout=1 — that's fine; reload
                  // brings them back to checkout, which matches intent.
                  setHeroFrom("");
                  setHeroTo("");
                  setHeroPickupHotel(null);
                  setHeroDropoffHotel(null);
                  setView("configuring");
                }}
              />
            </div>
            <OrderSummarySidebar
              items={items}
              totalPrice={totalPrice}
              onAddAnotherTrip={() => {
                // Reset the hero search inputs so the visitor lands on a
                // clean calculator. We deliberately do NOT call
                // pushRouteParams here — in production builds the URL
                // change triggered the URL-sync useEffect to bounce
                // view back to "checkout", making the button feel dead
                // (Diego saw a brief flash then nothing). Keeping URL
                // at /book?checkout=1 is fine; a reload returns the
                // visitor to checkout, which matches intent.
                setHeroFrom("");
                setHeroTo("");
                setHeroPickupHotel(null);
                setHeroDropoffHotel(null);
                setView("configuring");
              }}
            />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <QuoteCalculatorV2 locations={locations} hotels={hotels} />
          </div>
        )}
      </section>
    </>
  );
}

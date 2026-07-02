"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, ArrowLeftRight, Star, ExternalLink, Shield, Zap, CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { reviewStats } from "@/lib/reviews-data";
import { matchScore } from "@/lib/locations";
import { popularDirectUrl } from "@/lib/popular-route-slugs";
import GoogleGLogo from "@/components/GoogleGLogo";
import LocationInput from "@/components/LocationInput";
import RoutePricePreview from "@/components/RoutePricePreview";

// User may type free-text without clicking a suggestion ("la fortuna" lowercase,
// "fortuna", etc.). Resolve to the best DB name via the same alias-aware match
// the dropdown uses, so the booking flow always gets a canonical location.
function resolveLocation(input: string, locations: string[]): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (locations.includes(trimmed)) return trimmed;
  const best = locations
    .map((l) => ({ l, s: matchScore(l, trimmed) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)[0];
  return best?.l ?? trimmed;
}

type Props = {
  locations: string[];
  hotels?: import("@/lib/types").Hotel[];
  // Live Google review count / rating from getGoogleReviews(). Falls
  // back to the hardcoded reviewStats values when undefined (e.g.
  // when the Places API is unreachable at build time). Without these
  // props the hero showed a stale 190 even when the rest of the page
  // had refreshed to the real count — Diego flagged this 2026-06-22.
  liveGoogleCount?: number;
  liveGoogleRating?: number;
};

export default function Hero({
  locations,
  hotels = [],
  liveGoogleCount,
  liveGoogleRating,
}: Props) {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  // When the customer picks a hotel suggestion (not just a location), we
  // remember it so the checkout step can pre-fill the pickup/dropoff
  // address field with the hotel name. Saves them from re-typing it.
  const [pickupHotel, setPickupHotel] = useState<import("@/lib/types").Hotel | null>(null);
  const [dropoffHotel, setDropoffHotel] = useState<import("@/lib/types").Hotel | null>(null);
  const [isPending, startTransition] = useTransition();
  // Inline feedback when the visitor typed a place name that doesn't
  // match anything in the locations list. Without this, the Continue
  // button silently returned and the visitor wondered why it "didn't
  // work" — they'd bounce. Now we tell them: "We don't recognize that
  // place — pick one from the list".
  const [resolveError, setResolveError] = useState<"pickup" | "dropoff" | null>(null);

  const canContinue = pickup.trim().length > 0 && dropoff.trim().length > 0;

  const handleContinue = () => {
    if (!canContinue || isPending) return;
    // Resolve free-text to a canonical DB location so /book can match the
    // route. Without this, "la fortuna" (lowercase, no suggestion clicked)
    // never finds the row and the wizard renders empty.
    const resolvedPickup = resolveLocation(pickup, locations);
    const resolvedDropoff = resolveLocation(dropoff, locations);
    if (!resolvedPickup) {
      setResolveError("pickup");
      return;
    }
    if (!resolvedDropoff) {
      setResolveError("dropoff");
      return;
    }
    setResolveError(null);

    // Fast path: popular pair we know exists in the DB → direct to the SEO
    // landing page, skipping the /book → server-redirect round-trip
    // (~200–500ms saved on ~80% of bookings).
    //
    // Skip this fast path when a hotel was picked: the landing page is a
    // server component and can't relay the hotel param down to /book, so
    // the pre-fill context would be lost. Go straight to /book instead.
    const directUrl =
      pickupHotel || dropoffHotel
        ? null
        : popularDirectUrl(resolvedPickup, resolvedDropoff);

    // Build URL with hotel names if user picked hotel suggestions. The
    // /book wizard reads these to pre-fill the pickup/dropoff address
    // fields in the checkout step.
    const params = new URLSearchParams();
    params.set("from", resolvedPickup);
    params.set("to", resolvedDropoff);
    if (pickupHotel) params.set("pickupHotel", pickupHotel.name);
    if (dropoffHotel) params.set("dropoffHotel", dropoffHotel.name);
    // Skip the /book → /routes/<slug> server-redirect when we have a hotel
    // param, otherwise the redirect strips the query string and the hotel
    // context is lost before QuoteCalculator can read it.
    if (pickupHotel || dropoffHotel) params.set("direct", "1");

    const target = directUrl ?? `/book?${params.toString()}`;

    // useTransition keeps isPending=true until the destination route's data
    // is ready, so the button can show a spinner during the navigation.
    startTransition(() => {
      router.push(target);
    });
  };

  return (
    <section className="relative z-20 min-h-[85vh] md:min-h-screen w-full flex items-center justify-center isolate">
      {/*
        LCP-critical image. Self-hosted in /public so Next/Image can serve
        responsive AVIF/WebP variants (~50-80 KB on mobile vs the old
        ~800 KB JPG from imgix). `priority` instructs Next to preload it
        and skip lazy-loading.
      */}
      {/*
        Hero LCP optimization: q=40 AVIF (~30 KB on mobile vs 44 KB at
        q=50, 95 KB at q=75) + a low-quality base64 blur placeholder so
        the area paints instantly with the dominant colors while the
        real image is still downloading. Visual quality at q=40 is
        indistinguishable on mobile with the dark gradient overlay
        sitting on top.
      */}
      <Image
        src="/principal.jpg"
        alt="Costa Rica private shuttle on a coastal road"
        fill
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1920px"
        quality={40}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAJAA8DASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAUGB//EACAQAAEDBAIDAAAAAAAAAAAAAAECAwQABRESBiETIzH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AmIcJ7VOcahx3pTYUUq8aSdAfwK6Wcv5VHQGvgPa1AGzVCEr2YIIK7HE7yPe5/9k="
        className="object-cover object-center -z-[1]"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/30 to-black/75 z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.25),transparent_50%)] z-[2]" />

      <div className="relative z-10 container mx-auto px-4 py-20 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/*
            LCP perf: drop the framer-motion fade-up on the above-the-fold
            text. The H1 is the LCP candidate; delaying it 0.2-1.0s by
            animating from opacity 0 was holding mobile LCP at ~5.9s.
            Static markup now → H1 paints as soon as the HTML is parsed.
          */}
          <h1
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 md:mb-8 tracking-tight leading-[1.1]"
          >
            {t.hero.titlePart1}{" "}
            <span className="block bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent mt-2 md:mt-3">
              {t.hero.titlePart2}
            </span>
          </h1>

          <p
            className="text-base md:text-2xl text-gray-200 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed px-2"
          >
            {t.hero.subtitle}
          </p>

          <a
            href={reviewStats.google.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 px-7 py-4 rounded-full bg-black/60 border border-white/10 hover:border-amber-400/40 backdrop-blur-sm transition-colors mb-10 md:mb-12 shadow-2xl shadow-black/40"
          >
            <GoogleGLogo size={32} className="shrink-0" />
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={20} className="fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 text-base md:text-lg font-bold text-white">
                  {(liveGoogleRating ?? reviewStats.google.rating).toFixed(1)}
                </span>
              </div>
              <span className="text-xs md:text-sm text-gray-300">
                <strong className="text-white">
                  {liveGoogleCount ?? reviewStats.google.count}+
                </strong>{" "}
                Google Reviews
              </span>
            </div>
            <ExternalLink size={14} className="text-white/40" />
          </a>

          <div
            className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-amber-500/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50 text-left overflow-visible"
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-5 text-center">
              {lang === "en" ? "Where are you headed?" : "¿A dónde vas?"}
            </h2>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2">
              <LocationInput
                value={pickup}
                onChange={(v) => {
                  setPickup(v);
                  if (resolveError === "pickup") setResolveError(null);
                }}
                placeholder={lang === "en" ? "Where from?" : "¿De dónde?"}
                locations={locations}
                hotels={hotels}
                onHotelPick={setPickupHotel}
              />
              {/* Swap button — swaps From ↔ To (plus the paired hotel
                  picks so pickupHotel/dropoffHotel stay aligned with
                  their locations). Diego requested 2026-07-01: mimics
                  the airline-style swap arrow he saw on a competitor
                  site. Circular amber button, static horizontal arrow
                  icon on desktop; on mobile it collapses to a compact
                  vertical dividerbutton with an up-down arrow that
                  matches the stacked layout. */}
              <button
                type="button"
                onClick={() => {
                  setPickup(dropoff);
                  setDropoff(pickup);
                  const nextPickupHotel = dropoffHotel;
                  const nextDropoffHotel = pickupHotel;
                  setPickupHotel(nextPickupHotel);
                  setDropoffHotel(nextDropoffHotel);
                  if (resolveError) setResolveError(null);
                }}
                aria-label={lang === "en" ? "Swap pickup and drop-off" : "Intercambiar origen y destino"}
                title={lang === "en" ? "Swap pickup and drop-off" : "Intercambiar origen y destino"}
                className="self-center shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full border border-amber-500/30 bg-black/60 hover:bg-amber-500/20 hover:border-amber-500/60 text-amber-400 transition-colors"
              >
                <ArrowLeftRight size={16} className="hidden md:block" />
                <ArrowLeftRight size={16} className="rotate-90 md:hidden" />
              </button>
              <LocationInput
                value={dropoff}
                onChange={(v) => {
                  setDropoff(v);
                  if (resolveError === "dropoff") setResolveError(null);
                }}
                placeholder={lang === "en" ? "Where to?" : "¿A dónde?"}
                locations={locations}
                hotels={hotels}
                onHotelPick={setDropoffHotel}
              />
            </div>

            <RoutePricePreview from={pickup} to={dropoff} />

            {resolveError && (
              <div className="mt-3 rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-2.5 text-center text-xs text-amber-200">
                {lang === "en"
                  ? `We don't recognize that ${resolveError === "pickup" ? "pickup" : "drop-off"} location. Pick one from the dropdown so we can quote it.`
                  : `No reconocemos ese ${resolveError === "pickup" ? "punto de recogida" : "destino"}. Escogé uno de la lista para cotizarlo.`}
              </div>
            )}

            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue || isPending}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 h-12 md:h-14 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm md:text-base shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {lang === "en" ? "Loading..." : "Cargando..."}
                </>
              ) : (
                <>
                  {lang === "en" ? "Continue to booking" : "Continuar con la reserva"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-5 pt-5 border-t border-white/5 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Zap size={12} className="text-amber-400" />
                {lang === "en" ? "Instant pricing" : "Precio al instante"}
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={12} className="text-amber-400" />
                {lang === "en" ? "Free cancellation" : "Cancelación gratis"}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-amber-400" />
                {lang === "en" ? "No hidden fees" : "Sin cargos ocultos"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

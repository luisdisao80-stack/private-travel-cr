"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, ArrowLeftRight, Star, ExternalLink, Shield, Zap, CheckCircle2, Loader2, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useCart } from "@/lib/CartContext";
import { reviewStats } from "@/lib/reviews-data";
import { resolveLocation } from "@/lib/locations";
import { popularDirectUrl } from "@/lib/popular-route-slugs";
import { getVehicleForPax, getVehicleName, MAX_TOTAL_PAX } from "@/lib/quote-helpers";
import GoogleGLogo from "@/components/GoogleGLogo";
import LocationInput from "@/components/LocationInput";
import RoutePricePreview, { type RouteQuote } from "@/components/RoutePricePreview";
import PaxSelector, {
  BigGroupNotice,
  DEFAULT_ADULTS,
  DEFAULT_CHILDREN,
} from "@/components/PaxSelector";

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
  const { addItem, setCartOpen } = useCart();
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  // When the customer picks a hotel suggestion (not just a location), we
  // remember it so the checkout step can pre-fill the pickup/dropoff
  // address field with the hotel name. Saves them from re-typing it.
  const [pickupHotel, setPickupHotel] = useState<import("@/lib/types").Hotel | null>(null);
  const [dropoffHotel, setDropoffHotel] = useState<import("@/lib/types").Hotel | null>(null);
  // Pasajeros elegidos en el buscador. Alimentan la cotización de arriba
  // (RoutePricePreview ya acepta `adults` y consulta el tramo correcto) y
  // viajan tal cual al carrito.
  const [adults, setAdults] = useState(DEFAULT_ADULTS);
  const [children, setChildren] = useState(DEFAULT_CHILDREN);
  const totalPax = adults + children;
  const [isPending, startTransition] = useTransition();
  // Inline feedback when the visitor typed a place name that doesn't
  // match anything in the locations list. Without this, the Continue
  // button silently returned and the visitor wondered why it "didn't
  // work" — they'd bounce. Now we tell them: "We don't recognize that
  // place — pick one from the list".
  const [resolveError, setResolveError] = useState<"pickup" | "dropoff" | null>(null);
  // Separate error for the case where pickup and dropoff resolve to the
  // same canonical location. Without this guard, a visitor could pick
  // "La Fortuna" in both fields, land on /book?from=La+Fortuna&to=La+Fortuna
  // and see a broken "Custom route" nothing-state. Silent dead-end.
  const [sameLocationError, setSameLocationError] = useState<boolean>(false);
  // Price already fetched by RoutePricePreview below. We reuse it instead
  // of firing a second identical request from here. `null` = no usable
  // price yet (still loading, unknown pair, or network error).
  const [quote, setQuote] = useState<RouteQuote | null>(null);
  // Stable identity so RoutePricePreview's effect doesn't see a "new"
  // callback on every Hero render.
  const handleQuote = useCallback((q: RouteQuote | null) => setQuote(q), []);

  // Live equality check for disabling Continue as the visitor types —
  // uses the raw trimmed strings (case-insensitive) so a match is visible
  // immediately even before resolveLocation runs. handleContinue does the
  // authoritative check on the resolved DB names.
  const rawSameLocation =
    pickup.trim().length > 0 &&
    dropoff.trim().length > 0 &&
    pickup.trim().toLowerCase() === dropoff.trim().toLowerCase();

  // Arriba de 12 hacen falta 2+ vehículos y Diego cotiza a mano. Lo
  // atajamos acá, en el buscador, en vez de dejarlos llenar todo el
  // checkout para recién ahí decirles que no.
  const overCapacity = totalPax > MAX_TOTAL_PAX;

  const canContinue =
    pickup.trim().length > 0 &&
    dropoff.trim().length > 0 &&
    !rawSameLocation &&
    !overCapacity;

  // Con precio en mano agregamos al carrito; sin precio (par sin tarifa
  // fija, error de red o consulta todavía en vuelo) conservamos la
  // navegación de siempre a /book, que es donde vive el CTA de cotización
  // por WhatsApp. Cerrar esa puerta habría dejado sin salida a los pares
  // que no tenemos tarifados.
  const canAddToCart = canContinue && !!quote && quote.basePrice > 0;

  // Resolves + validates both endpoints. Returns null (and sets the
  // matching inline error) when the input can't be trusted — every caller
  // below depends on these guards, they are NOT cosmetic:
  //   - resolveLocation maps free text ("la fortuna") to the canonical DB
  //     name; without it /book never finds the row and renders empty.
  //   - the same-location guard catches "fortuna" vs "La Fortuna"
  //     resolving to one row, which used to produce a dead-end
  //     "Custom route" nothing-state.
  const resolveEndpoints = (): { from: string; to: string } | null => {
    const resolvedPickup = resolveLocation(pickup, locations);
    const resolvedDropoff = resolveLocation(dropoff, locations);
    if (!resolvedPickup) {
      setResolveError("pickup");
      return null;
    }
    if (!resolvedDropoff) {
      setResolveError("dropoff");
      return null;
    }
    setResolveError(null);

    // Same-location guard: two different free-text inputs (e.g. "fortuna"
    // and "La Fortuna") can still resolve to the same DB row. Check after
    // resolution so the guard catches every equivalence, not just literal
    // string matches.
    if (resolvedPickup.toLowerCase() === resolvedDropoff.toLowerCase()) {
      setSameLocationError(true);
      return null;
    }
    setSameLocationError(false);
    return { from: resolvedPickup, to: resolvedDropoff };
  };

  // Nuevo flujo principal (Diego, 2026-08): "en vez de Continue to booking
  // mejor que diga Add to cart y al final sea donde el cliente ponga los
  // detalles". El viaje entra al carrito con fecha/hora vacías y 2 pax por
  // defecto; el checkout (BookingForm) es quien exige completarlos.
  const handleAddToCart = () => {
    if (!canContinue || isPending) return;
    const resolved = resolveEndpoints();
    if (!resolved) return;
    // Sin precio no agregamos nada: un item con basePrice 0 llega al
    // checkout como "Pay $0.00" y Tilopay lo rechaza.
    if (!quote || quote.basePrice <= 0) return;

    const vehicleId = getVehicleForPax(totalPax);
    addItem({
      fromName: resolved.from,
      toName: resolved.to,
      // Vacíos a propósito — se completan en el checkout.
      date: "",
      pickupTime: "",
      passengers: totalPax,
      children,
      // Sólo cuando el visitante eligió un hotel del autocomplete;
      // si no, dejamos el campo vacío para que el checkout lo pida.
      pickupPlace: pickupHotel?.name,
      dropoffPlace: dropoffHotel?.name,
      vehicleId,
      vehicleName: getVehicleName(vehicleId),
      serviceType: "standard",
      extraStopHours: 0,
      basePrice: quote.basePrice,
      // Sin VIP, sin paradas y sin hora todavía, el total ES el precio base.
      totalPrice: quote.basePrice,
      duration: quote.duration,
    });
    // addItem ya abre el drawer, pero lo dejamos explícito: si mañana
    // cambia ese side-effect el hero no se queda sin feedback visual.
    setCartOpen(true);
    // Limpiamos la búsqueda para que un segundo click no duplique el
    // mismo viaje y para que el visitante que cierra el drawer vea el
    // buscador listo para la siguiente pierna.
    setPickup("");
    setDropoff("");
    setPickupHotel(null);
    setDropoffHotel(null);
    setQuote(null);
    // Los pasajeros NO se reinician a propósito: el caso normal de un
    // segundo viaje es la misma gente volviéndose (aeropuerto → hotel,
    // hotel → aeropuerto). Obligarlos a volver a poner "6" cada vez sería
    // pura fricción.
  };

  const handleContinue = () => {
    if (!canContinue || isPending) return;
    const resolved = resolveEndpoints();
    if (!resolved) return;
    const resolvedPickup = resolved.from;
    const resolvedDropoff = resolved.to;

    // Fast path: popular pair we know exists in the DB → direct to the SEO
    // landing page, skipping the /book → server-redirect round-trip
    // (~200–500ms saved on ~80% of bookings).
    //
    // Skip this fast path when a hotel was picked: the landing page is a
    // server component and can't relay the hotel param down to /book, so
    // the pre-fill context would be lost. Go straight to /book instead.
    //
    // Mismo motivo para los pasajeros: si el visitante movió el contador,
    // la landing SEO tampoco puede pasarle ese número a /book y el grupo
    // de 8 llegaría al checkout otra vez como 2. Sólo tomamos el atajo
    // cuando el conteo sigue siendo el de por defecto, que es lo que
    // /book asume igual.
    const paxIsDefault =
      adults === DEFAULT_ADULTS && children === DEFAULT_CHILDREN;
    const directUrl =
      pickupHotel || dropoffHotel || !paxIsDefault
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
    // `adults` acá es el grupo TOTAL, no sólo los adultos: es lo que el
    // endpoint de precio espera para elegir el tramo de vehículo (mismo
    // criterio que usan las tarjetas de tramo en RouteDetail).
    params.set("adults", String(totalPax));
    // Skip the /book → /routes/<slug> server-redirect when we have a hotel
    // param, otherwise the redirect strips the query string and the hotel
    // context is lost before QuoteCalculator can read it. Un conteo de
    // pasajeros distinto al default necesita el mismo trato.
    if (pickupHotel || dropoffHotel || !paxIsDefault) params.set("direct", "1");

    const target = directUrl ?? `/book?${params.toString()}`;

    // useTransition keeps isPending=true until the destination route's data
    // is ready, so the button can show a spinner during the navigation.
    startTransition(() => {
      router.push(target);
    });
  };

  return (
    <section className="sobre-foto relative z-20 min-h-[85vh] md:min-h-screen w-full flex items-center justify-center isolate">
      {/*
        LCP-critical image. Self-hosted in /public so Next/Image can serve
        responsive AVIF/WebP variants (~50-80 KB on mobile vs the old
        ~800 KB JPG from imgix). `priority` instructs Next to preload it
        and skip lazy-loading.
      */}
      {/*
        Foto: la van con el Arenal detrás, en La Fortuna. Original de Diego
        (iPhone 13, 4032x3024), reescalada a 3840 y con el EXIF botado —no
        conviene publicar las coordenadas GPS del lugar.

        Reemplaza a principal.jpg, que eran 1600x1200 y por eso se veía
        pixeleada en computadora aunque en teléfono se viera bien: con el
        `sizes` de abajo, una pantalla retina de 1440 px pide el breakpoint
        de 3840, así que el navegador estiraba la foto a más del doble.

        El 3840 no es un número redondo cualquiera: es el deviceSize más
        grande que sirve Next por defecto. A menos resolución de fuente ese
        breakpoint vuelve a estirar, que es justo el problema que se está
        arreglando.

        Recorte: la foto es 4:3 y el hero ocupa toda la pantalla, así que en
        móvil (relación casi 1:2) object-cover recorta a los lados y se comía
        el volcán, dejando pura van blanca. Por eso el object-position va
        corrido a la izquierda en móvil y centrado de tablet para arriba, que
        es donde ya caben los dos.

        quality=50: comparado contra 60 a tamaño real —la foto de 3840
        mostrada a 2880 px físicos, que es lo que ve una retina— no se
        distingue: ni en el detalle fino (emblema, parrilla, placa) ni en
        el cielo, donde sería de esperar bandas. Diferencia media de 1,2
        sobre 255, y encima lleva el degradado oscuro de abajo. A cambio
        son 158 KB menos en 3840 y 66 KB menos en 1920.

        Lo que se veía mal nunca fue la compresión sino la resolución de
        origen, así que la calidad se puede gastar en otra parte.

        Ojo: tiene que ser uno de los valores de `images.qualities` en
        next.config.ts. Un valor fuera de esa lista NO se ignora ni cae al
        default: el optimizador responde error y el hero se queda sin imagen.
        Con 55 (que no está en la lista) devolvía
        '"q" parameter (quality) of 55 is not allowed'.
      */}
      <Image
        src="/hero-arenal-van.jpg"
        alt="Private Travel CR van parked with the Arenal Volcano behind it in La Fortuna, Costa Rica"
        fill
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1920px"
        quality={50}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABIMDRANCxIQDhAUExIVGywdGxgYGzYnKSAsQDlEQz85Pj1HUGZXR0thTT0+WXlaYWltcnNyRVV9hnxvhWZwcm7/2wBDARMUFBsXGzQdHTRuST5Jbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAT/xAAeEAACAgICAwAAAAAAAAAAAAABAgADBBEiMUFRkf/EABQBAQAAAAAAAAAAAAAAAAAAAAL/xAAZEQADAAMAAAAAAAAAAAAAAAAAAQIDETH/2gAMAwEAAhEDEQA/ADWXVh3y3pVCOJWsnR9dyY5bkko2MV8E7Gx9iI1krXQOJP/Z"
        className="object-cover object-[18%_50%] md:object-center -z-[1]"
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
            className="buscador-claro bg-gradient-to-br from-gray-900/95 to-black/95 border border-amber-500/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50 text-left overflow-visible"
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
                  if (sameLocationError) setSameLocationError(false);
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
                  // Skip when the two fields are equal (case-insensitive) —
                  // swapping A ↔ A is a no-op that would leave the same-
                  // same state in place; clearing the error and doing
                  // nothing else would falsely suggest the problem was
                  // resolved.
                  if (
                    pickup.trim().toLowerCase() ===
                      dropoff.trim().toLowerCase() &&
                    pickup.trim().length > 0
                  ) {
                    return;
                  }
                  setPickup(dropoff);
                  setDropoff(pickup);
                  const nextPickupHotel = dropoffHotel;
                  const nextDropoffHotel = pickupHotel;
                  setPickupHotel(nextPickupHotel);
                  setDropoffHotel(nextDropoffHotel);
                  if (resolveError) setResolveError(null);
                  if (sameLocationError) setSameLocationError(false);
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
                  if (sameLocationError) setSameLocationError(false);
                }}
                placeholder={lang === "en" ? "Where to?" : "¿A dónde?"}
                locations={locations}
                hotels={hotels}
                onHotelPick={setDropoffHotel}
              />
            </div>

            <PaxSelector
              adults={adults}
              childrenCount={children}
              onAdultsChange={setAdults}
              onChildrenCountChange={setChildren}
              lang={lang}
              className="mt-3"
            />

            {overCapacity && (
              <BigGroupNotice
                totalPax={totalPax}
                from={pickup}
                to={dropoff}
                lang={lang}
                className="mt-3"
              />
            )}

            {/* onQuote nos devuelve el precio que este componente ya
                consultó — el hero no vuelve a pegarle a la API.
                `adults` es el grupo TOTAL (adultos + niños): el precio es
                por vehículo, y un niño ocupa un asiento igual que un
                adulto, así que para elegir el tramo cuentan los dos. */}
            <RoutePricePreview
              from={pickup}
              to={dropoff}
              adults={totalPax}
              onQuote={handleQuote}
            />

            {resolveError && (
              <div className="mt-3 rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-2.5 text-center text-xs text-amber-200">
                {lang === "en"
                  ? `We don't recognize that ${resolveError === "pickup" ? "pickup" : "drop-off"} location. Pick one from the dropdown so we can quote it.`
                  : `No reconocemos ese ${resolveError === "pickup" ? "punto de recogida" : "destino"}. Escogé uno de la lista para cotizarlo.`}
              </div>
            )}

            {(sameLocationError || rawSameLocation) && (
              <div className="mt-3 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-center text-xs text-red-200">
                {lang === "en"
                  ? "Pickup and drop-off can't be the same place. Please pick a different drop-off location."
                  : "El origen y el destino no pueden ser iguales. Elegí un destino diferente."}
              </div>
            )}

            {/* Un solo botón, dos comportamientos:
                  con precio  → "Add to cart" (el 99% de los casos)
                  sin precio  → "Continue to booking", la navegación de
                                siempre a /book, que ofrece la cotización
                                manual por WhatsApp para pares sin tarifa.
                No podemos agregar al carrito algo que no sabemos cuánto
                cuesta, y tampoco queremos dejar sin salida a esos pares. */}
            <button
              type="button"
              onClick={canAddToCart ? handleAddToCart : handleContinue}
              disabled={!canContinue || isPending}
              title={
                rawSameLocation
                  ? lang === "en"
                    ? "Pickup and drop-off can't be the same place"
                    : "El origen y el destino no pueden ser iguales"
                  : undefined
              }
              className="mt-4 w-full inline-flex items-center justify-center gap-2 h-12 md:h-14 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm md:text-base shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {lang === "en" ? "Loading..." : "Cargando..."}
                </>
              ) : canAddToCart ? (
                <>
                  <ShoppingCart size={18} />
                  {lang === "en" ? "Add to cart" : "Agregar al carrito"}
                </>
              ) : (
                <>
                  {lang === "en" ? "Continue to booking" : "Continuar con la reserva"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {canAddToCart && (
              <p className="mt-2 text-center text-[11px] text-gray-400">
                {/* Ya no decimos "y pasajeros": se eligen acá arriba. */}
                {lang === "en"
                  ? "Pick your date and time at checkout."
                  : "Elegís fecha y hora en el checkout."}
              </p>
            )}

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

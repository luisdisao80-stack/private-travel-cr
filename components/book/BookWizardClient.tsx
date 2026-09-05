"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextImage from "next/image";
import { ArrowLeftRight, CheckCircle2, Shield, X, Zap, ShoppingCart } from "lucide-react";
import QuoteCalculatorV2 from "@/components/QuoteCalculatorV2";
import BookingForm from "@/components/BookingForm";
import WizardProgress from "@/components/book/WizardProgress";
import OrderSummarySidebar from "@/components/book/OrderSummarySidebar";
import LocationInput from "@/components/LocationInput";
import RoutePricePreview, { type RouteQuote } from "@/components/RoutePricePreview";
import PaxSelector, {
  BigGroupNotice,
  DEFAULT_ADULTS,
  DEFAULT_CHILDREN,
  PAX_CEILING,
} from "@/components/PaxSelector";
import { useCart } from "@/lib/CartContext";
import { useLanguage } from "@/lib/LanguageContext";
import { resolveLocation } from "@/lib/locations";
import { getVehicleForPax, getVehicleName, MAX_TOTAL_PAX } from "@/lib/quote-helpers";
import type { Hotel } from "@/lib/types";

type Props = { locations: string[]; hotels?: Hotel[] };
type View = "configuring" | "checkout";

export default function BookWizardClient({ locations, hotels = [] }: Props) {
  const { items, isCartOpen, setCartOpen, hydrated, totalPrice, addItem, removeItem } =
    useCart();
  const { lang } = useLanguage();

  // "2026-09-03" → "Sep 3, 2026" / "3 sept 2026". Mismo formato corto que
  // usa el panel del carrito, para que el mismo viaje no se lea distinto
  // en dos pantallas. El "T00:00:00" es obligatorio: sin él, `new Date`
  // interpreta la fecha suelta como UTC y en Costa Rica (UTC-6) la
  // muestra un día antes.
  const formatTripDate = useCallback(
    (iso: string) =>
      new Date(iso + "T00:00:00").toLocaleDateString(
        lang === "en" ? "en-US" : "es-ES",
        { year: "numeric", month: "short", day: "numeric" }
      ),
    [lang]
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasUrlRoute = !!searchParams.get("from") || !!searchParams.get("to");
  const wantsCheckout = searchParams.get("checkout") === "1";
  // `?add=1` is set by the "Add another trip" CTA in the cart sidebar.
  // Without it, the hydration effect below sees the populated cart and
  // bounces the visitor right back to the checkout view they came from —
  // the very thing they were trying to leave to add a new leg.
  const wantsAdd = searchParams.get("add") === "1";
  // `?adults=N` llega cuando el visitante ya eligió el tamaño del grupo
  // antes de caer acá: desde el buscador de la home, o al tocar una
  // tarjeta de tramo en una página de ruta. Sólo SIEMBRA el contador —
  // de ahí en adelante manda el contador, no la URL.
  const seededAdults = (() => {
    const raw = searchParams.get("adults");
    const n = raw ? parseInt(raw, 10) : NaN;
    return !Number.isNaN(n) && n >= 1 && n <= PAX_CEILING ? n : DEFAULT_ADULTS;
  })();

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

  // Counter we bump whenever the visitor clicks "Add another trip" — used
  // as the `key` on QuoteCalculatorV2 below so React unmounts the old
  // calculator and mounts a fresh one. Without this, the calculator
  // retains every field from the trip the visitor just added (route,
  // date, time, addresses, pax, child seats, service tier) and they
  // start their next leg with stale data they have to manually clear.
  const [calcResetKey, setCalcResetKey] = useState(0);
  const resetCalculator = () => setCalcResetKey((k) => k + 1);

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
  // Pasajeros del buscador de /book. ANTES no existían: este buscador
  // metía TODOS los viajes al carrito como 2 pasajeros fijos, aunque la
  // tarjeta de precio de arriba estuviera cotizando otro tramo por el
  // `?adults=` de la URL. O sea, el carrito guardaba el precio de 7
  // personas con "2 pasajeros" adentro. Diego lo reportó el 2026-08-30
  // con captura del segundo viaje.
  const [heroAdults, setHeroAdults] = useState(seededAdults);
  const [heroChildren, setHeroChildren] = useState(DEFAULT_CHILDREN);
  const heroTotalPax = heroAdults + heroChildren;

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

  // Hero search inputs are now PURELY local state. Used to also call
  // pushRouteParams on every keystroke to mirror them into the URL so
  // the QuoteCalculator below could pick them up — but that broke the
  // "Add another trip" flow: typing into the hero stripped ?checkout=1,
  // which then triggered the URL-sync effects and bounced the multi-trip
  // user back to checkout mid-typing. Multi-trip planners now fill the
  // calculator below directly; the hero remains as a visual element +
  // optional shortcut, just doesn't double-write to the URL anymore.
  const handleHeroFrom = (val: string) => {
    setHeroFrom(val);
  };
  const handleHeroTo = (val: string) => {
    setHeroTo(val);
  };
  const handlePickupHotel = (hotel: Hotel | null) => {
    setHeroPickupHotel(hotel);
  };
  const handleDropoffHotel = (hotel: Hotel | null) => {
    setHeroDropoffHotel(hotel);
  };

  // ---- Quick-add del buscador de /book -------------------------------
  //
  // Diego, 2026-08-29, con captura: "me sigue pidiendo la informacion en
  // el segundo viaje". El primer viaje se agrega desde el hero de la home
  // con un click; el segundo caía acá, donde este mismo buscador SÓLO
  // mostraba el precio y obligaba a bajar al formulario largo de Trip
  // Details. Mismo buscador, misma cotización, pero sin botón: por eso
  // se sentía que le pedíamos todo de nuevo.
  //
  // Le damos el mismo botón que el hero. El formulario de abajo sigue
  // existiendo para quien quiera configurar el viaje en detalle (VIP,
  // paradas extra, sillas de bebé) — pero ya no es el único camino.
  const [heroQuote, setHeroQuote] = useState<RouteQuote | null>(null);
  // Bandera de un solo uso: la levantamos justo antes de meter el viaje
  // al carrito desde ESTE buscador, y el efecto de `items.length` la lee
  // para NO saltar al checkout.
  //
  // Diego, 2026-08-30: "haz que la persona agregue los viajes pero siga
  // en el mismo buscador del inicio". Antes, cada viaje agregado tiraba
  // al visitante al formulario de checkout; para meter el segundo tenía
  // que devolverse a mano. Los agregados desde el carrito o desde el
  // formulario de abajo SÍ siguen yendo al checkout — sólo cambia el
  // camino que arranca acá arriba.
  const addedFromSearchCard = useRef(false);
  // Qué acabamos de agregar, para el aviso verde de abajo. Sin esto el
  // visitante toca "Add another trip to cart", ve los campos vaciarse y
  // no le queda ninguna señal de que el viaje entró.
  const [justAdded, setJustAdded] = useState<{ from: string; to: string } | null>(
    null,
  );
  // Ref-estable: RoutePricePreview mete onQuote en un ref, pero pasarle
  // una arrow inline igual re-renderiza de más.
  const handleHeroQuote = useCallback((q: RouteQuote | null) => setHeroQuote(q), []);
  const [addError, setAddError] = useState<"same" | null>(null);
  // Formulario largo de Trip Details: abierto o plegado.
  //
  // Diego, 2026-08-30, con captura del segundo viaje: agregás un tramo,
  // te sale el aviso verde… y justo debajo reaparece el formulario
  // entero (origen, destino, dirección, fecha, hora, pasajeros, paradas,
  // sillas, tipo de servicio) en blanco. Se lee como "llenálo todo otra
  // vez", que es literalmente la queja que trajo el 2026-08-29.
  //
  // Con el carrito vacío el formulario sigue abierto: ahí SÍ es el
  // camino principal (es lo que se pre-llena cuando entrás desde una
  // página de ruta con ?from=&to=). Con viajes ya adentro se pliega
  // detrás de una línea, porque a esa altura el buscador de arriba ya
  // hace el trabajo en un click y esto pasa a ser el caso raro: VIP,
  // paradas extra, sillas de bebé.
  const [showDetailedForm, setShowDetailedForm] = useState(false);

  const rawSameLocation =
    heroFrom.trim().length > 0 &&
    heroTo.trim().length > 0 &&
    heroFrom.trim().toLowerCase() === heroTo.trim().toLowerCase();

  // Arriba de 12 hacen falta 2+ vehículos y se cotiza a mano — mismo
  // tope que el buscador de la home.
  const heroOverCapacity = heroTotalPax > MAX_TOTAL_PAX;

  // Sin precio no agregamos: un item con basePrice 0 llega al checkout
  // como "Pay $0.00" y Tilopay lo rechaza.
  const canQuickAdd =
    heroFrom.trim().length > 0 &&
    heroTo.trim().length > 0 &&
    !rawSameLocation &&
    !heroOverCapacity &&
    !!heroQuote &&
    heroQuote.basePrice > 0;

  const handleQuickAdd = () => {
    if (!canQuickAdd || !heroQuote) return;
    const from = resolveLocation(heroFrom, locations);
    const to = resolveLocation(heroTo, locations);
    // El guard de igualdad se repite sobre los nombres YA resueltos:
    // "fortuna" y "La Fortuna" son textos distintos pero la misma fila.
    if (!from || !to || from.toLowerCase() === to.toLowerCase()) {
      setAddError("same");
      return;
    }
    setAddError(null);
    const vehicleId = getVehicleForPax(heroTotalPax);
    // Se levanta ANTES del addItem: el efecto que reacciona a
    // items.length corre en el mismo commit que este handler.
    addedFromSearchCard.current = true;
    addItem({
      fromName: from,
      toName: to,
      // Vacíos a propósito — se completan en el checkout.
      date: "",
      pickupTime: "",
      passengers: heroTotalPax,
      children: heroChildren,
      pickupPlace: heroPickupHotel?.name,
      dropoffPlace: heroDropoffHotel?.name,
      vehicleId,
      vehicleName: getVehicleName(vehicleId),
      serviceType: "standard",
      extraStopHours: 0,
      basePrice: heroQuote.basePrice,
      // Sin VIP, sin paradas y sin hora todavía, el total ES el base.
      totalPrice: heroQuote.basePrice,
      duration: heroQuote.duration ?? "",
    });
    // addItem abre el drawer del carrito. Acá lo cerramos: el visitante
    // se queda en el buscador y la confirmación se la damos abajo, en la
    // misma tarjeta. Un panel que se abre encima es justamente sacarlo
    // del buscador.
    setCartOpen(false);
    setJustAdded({ from, to });
    // Limpiamos el buscador para que un segundo click no duplique el
    // mismo viaje y para que quede listo para la siguiente pierna.
    setHeroFrom("");
    setHeroTo("");
    setHeroPickupHotel(null);
    setHeroDropoffHotel(null);
    setHeroQuote(null);
    // Si lo tenía abierto, se pliega: acaba de agregar por el camino
    // corto, dejarle el formulario largo abierto y en blanco debajo es
    // exactamente el "me lo pide todo de nuevo" que estamos quitando.
    setShowDetailedForm(false);
    // Los pasajeros NO se reinician a propósito: el caso normal de un
    // segundo viaje es la misma gente volviéndose (aeropuerto → hotel,
    // hotel → aeropuerto). Obligarlos a poner "6" otra vez es fricción.
  };

  // Único camino explícito al checkout desde el buscador. Antes era
  // automático después de cada "add"; ahora lo decide el visitante.
  const goToCheckout = () => {
    setJustAdded(null);
    setView("checkout");
    router.push("/book?checkout=1");
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
      // First settle: el buscador, SIEMPRE. Sólo `?checkout=1` abre el
      // formulario de pago (y eso ya lo hizo el useState inicial).
      //
      // Acá había una regla de más: "sin parámetros + carrito con viajes
      // → checkout". La idea era que quien se fue a media compra volviera
      // directo a pagar. En la práctica hacía otra cosa: `/book` a secas
      // es el destino de ~15 botones de "Cotizar / Reservar" repartidos
      // por todo el sitio (footer, flota, nosotros, blog, páginas de
      // aeropuerto, 404). Con dos viajes ya en el carrito, tocar
      // cualquiera de esos botones para armar el tercero te tiraba al
      // formulario de pago, sin buscador a la vista y sin forma de
      // volver salvo adivinando la URL `?add=1`.
      //
      // Diego, 2026-08-30: "solo me deja agregar 2 viajes y despues me
      // manda al checkout". No había tope de 2 — había un rebote.
      //
      // Nadie pierde el camino a pagar: los botones que SÍ significan
      // "ya terminé" (el carrito, la barra del checkout, el CTA de
      // /routes) navegan a `/book?checkout=1`, un refresh conserva ese
      // parámetro, y el aviso de abajo le deja el botón "Continuar al
      // pago" a la vista a quien llega con el carrito lleno.
      return;
    }
    // Después de agregar al carrito: al checkout, EXCEPTO cuando el
    // viaje entró por el buscador de esta misma página.
    //
    // Ese "excepto" es el pedido de Diego del 2026-08-30. Armar un
    // ida-y-vuelta requería: buscar → agregar → el sitio te tiraba al
    // formulario → "Add another trip" → volver arriba → buscar otra vez.
    // Cuatro pasos de los cuales dos eran sólo deshacer lo que el sitio
    // acababa de hacer. Ahora el buscador se queda donde está, muestra
    // la confirmación y el visitante decide cuándo pasar a pagar.
    //
    // El resto de los caminos (formulario de Trip Details abajo) siguen
    // yendo al checkout: ahí el visitante ya llenó fecha, hora y
    // direcciones, así que lo que sigue es pagar.
    //
    // Order matters: setView before any router.push so the calculator
    // view doesn't flicker if Next.js skips the navigation (e.g. when
    // URL is already /book?checkout=1 from a prior session leg).
    if (items.length > prevItemsCount.current) {
      prevItemsCount.current = items.length;
      if (addedFromSearchCard.current) {
        addedFromSearchCard.current = false;
        return;
      }
      setView("checkout");
      if (!wantsCheckout) {
        router.push("/book?checkout=1");
      }
      return;
    }
    // Cart just emptied (cleared or last trip removed). Instead of
    // bouncing the visitor away to /routes (which felt like a crash —
    // they removed one trip and suddenly the whole page changed), flip
    // back to the configuring view with a clean calculator so they can
    // either pick a new route or browse via the navbar.
    if (items.length === 0 && prevItemsCount.current > 0) {
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/book?add=1");
      }
      setHeroFrom("");
      setHeroTo("");
      setHeroPickupHotel(null);
      setHeroDropoffHotel(null);
      // El aviso decía "1 viaje en el carrito" y el carrito ya está
      // vacío: se va con él.
      setJustAdded(null);
      resetCalculator();
      setView("configuring");
      prevItemsCount.current = 0;
      return;
    }
    prevItemsCount.current = items.length;
    // `hasUrlRoute` y `wantsAdd` salieron de las dependencias junto con la
    // regla del primer asentamiento: ya no se leen adentro del efecto.
  }, [items.length, hydrated, wantsCheckout, router]);

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
      <section className="sobre-foto relative w-full">
        {/* 50 y no 65: la foto de origen subió a 3840 px, y con sizes=100vw
            una pantalla retina pide justo ese tamaño. A 65 serían ~500 KB
            para algo que va debajo del degradado negro de dos líneas abajo. */}
        <NextImage
          src="/hero-arenal-van.jpg"
          alt="Private Travel CR van parked with the Arenal Volcano behind it in La Fortuna, Costa Rica"
          fill
          priority
          sizes="100vw"
          quality={50}
          className="object-cover object-center -z-[1]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black z-[1]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.18),transparent_60%)] z-[2]" />
        <div className="relative z-10 container mx-auto px-4 pt-24 pb-10 md:pt-28 md:pb-12">
          {view === "checkout" ? (
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
                {lang === "en" ? "Confirm your booking" : "Confirmá tu reserva"}
              </h1>
              <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto">
                {lang === "en"
                  ? "Enter your details and we'll handle the rest"
                  : "Poné tus datos y del resto nos encargamos nosotros"}
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {/* Mismos textos EXACTOS que el buscador de la home. Este
                  buscador estaba entero en inglés dentro del sitio en
                  español — la copia a mano se llevó el maquetado pero no
                  las traducciones. */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-5 text-center">
                {lang === "en" ? "Where are you headed?" : "¿A dónde vas?"}
              </h1>
              <div className="buscador-claro bg-gradient-to-br from-gray-900/95 to-black/95 border border-amber-500/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50 overflow-visible">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2">
                  <LocationInput
                    value={heroFrom}
                    onChange={handleHeroFrom}
                    placeholder={lang === "en" ? "Where from?" : "¿De dónde?"}
                    locations={locations}
                    hotels={hotels}
                    onHotelPick={handlePickupHotel}
                  />
                  {/* Swap From ↔ To (plus paired hotel picks). Same
                      styling + behavior as Hero, RoutesPageClient and
                      QuoteCalculatorV2 (Diego 2026-07-01). */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextFrom = heroTo;
                      const nextTo = heroFrom;
                      const nextPickupHotel = heroDropoffHotel;
                      const nextDropoffHotel = heroPickupHotel;
                      setHeroFrom(nextFrom);
                      setHeroTo(nextTo);
                      setHeroPickupHotel(nextPickupHotel);
                      setHeroDropoffHotel(nextDropoffHotel);
                    }}
                    aria-label={
                      lang === "en"
                        ? "Swap pickup and drop-off"
                        : "Intercambiar origen y destino"
                    }
                    title={
                      lang === "en"
                        ? "Swap pickup and drop-off"
                        : "Intercambiar origen y destino"
                    }
                    className="self-center shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full border border-amber-500/30 bg-black/60 hover:bg-amber-500/20 hover:border-amber-500/60 text-amber-400 transition-colors"
                  >
                    <ArrowLeftRight size={16} className="hidden md:block" />
                    <ArrowLeftRight size={16} className="rotate-90 md:hidden" />
                  </button>
                  <LocationInput
                    value={heroTo}
                    onChange={handleHeroTo}
                    placeholder={lang === "en" ? "Where to?" : "¿A dónde?"}
                    locations={locations}
                    hotels={hotels}
                    onHotelPick={handleDropoffHotel}
                  />
                </div>
                {/* El mismo contador que el buscador de la home, no una
                    copia: ver el comentario de PaxSelector. Va antes del
                    precio porque el precio depende de él. */}
                <PaxSelector
                  adults={heroAdults}
                  childrenCount={heroChildren}
                  onAdultsChange={setHeroAdults}
                  onChildrenCountChange={setHeroChildren}
                  lang={lang}
                  className="mt-3"
                />
                {/* `heroTotalPax`, NO `heroAdults`: el precio es por
                    vehículo y los niños también ocupan asiento. Con
                    adultos sueltos, 4 adultos + 3 niños cotizaba como
                    Staria y llegaban 7 personas a un carro de 5. */}
                <RoutePricePreview
                  from={heroFrom}
                  to={heroTo}
                  adults={heroTotalPax}
                  onQuote={handleHeroQuote}
                />
                {heroOverCapacity ? (
                  <BigGroupNotice
                    totalPax={heroTotalPax}
                    from={heroFrom}
                    to={heroTo}
                    lang={lang}
                    className="mt-3"
                  />
                ) : null}
                {rawSameLocation || addError === "same" ? (
                  <p className="mt-3 text-xs text-amber-300/90 text-center">
                    {lang === "en"
                      ? "Pickup and drop-off can't be the same place. Please pick a different drop-off location."
                      : "El origen y el destino no pueden ser iguales. Elegí un destino diferente."}
                  </p>
                ) : null}
                {/* Mismo quick-add que el hero de la home: con precio en
                    mano, un click y al carrito. Sin precio no mostramos
                    el botón — el formulario de abajo tiene el CTA de
                    cotizar por WhatsApp para los pares sin tarifa. */}
                {canQuickAdd ? (
                  <button
                    type="button"
                    onClick={handleQuickAdd}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold py-4 rounded-xl transition-colors"
                  >
                    <ShoppingCart size={18} />
                    {items.length > 0
                      ? lang === "en"
                        ? "Add another trip to cart"
                        : "Agregar otro viaje al carrito"
                      : lang === "en"
                        ? "Add to cart"
                        : "Agregar al carrito"}
                  </button>
                ) : null}
                {/* El itinerario que se va armando, acá mismo debajo del
                    buscador.
                    Antes esta caja decía sólo "3 viajes · $670 en total":
                    el visitante que arma un circuito de varios tramos no
                    tenía cómo ver QUÉ llevaba sin abrir el panel lateral,
                    y en el panel ya no puede seguir buscando. Al listarlos
                    acá, cada viaje que agrega se apila a la vista y el
                    buscador de arriba sigue disponible — que es justo el
                    ir y venir que hace quien reserva 3 o 4 traslados.
                    El total y el botón de pagar cierran la lista, como en
                    cualquier carrito. */}
                {items.length > 0 ? (
                  <div className="mt-4 overflow-hidden rounded-xl border border-amber-500/30 bg-black/40">
                    <div className="flex items-center justify-between border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
                          {lang === "en" ? "My trip" : "Mi viaje"}
                        </div>
                        <div className="text-sm font-bold text-white">
                          {items.length}{" "}
                          {items.length === 1
                            ? lang === "en"
                              ? "shuttle"
                              : "traslado"
                            : lang === "en"
                              ? "shuttles"
                              : "traslados"}
                        </div>
                      </div>
                      {/* Sólo cuando acaba de agregar: confirma que el
                          click hizo algo, sin robarle el lugar al
                          itinerario. */}
                      {justAdded ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-green-300">
                          <CheckCircle2 size={14} className="shrink-0" />
                          {lang === "en" ? "Added" : "Agregado"}
                        </span>
                      ) : null}
                    </div>

                    <ul className="divide-y divide-white/10">
                      {items.map((it, i) => (
                        <li
                          key={it.id}
                          className="flex items-start gap-3 px-4 py-3 text-left"
                        >
                          <span className="mt-0.5 shrink-0 text-xs font-bold text-amber-400/70">
                            #{i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-white break-words">
                              {it.fromName} → {it.toName}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400">
                              <span>
                                {it.passengers}{" "}
                                {it.passengers === 1
                                  ? lang === "en"
                                    ? "traveler"
                                    : "pasajero"
                                  : lang === "en"
                                    ? "travelers"
                                    : "pasajeros"}
                              </span>
                              <span>·</span>
                              <span>{it.vehicleName}</span>
                              {it.duration ? (
                                <>
                                  <span>·</span>
                                  <span>{it.duration}</span>
                                </>
                              ) : null}
                            </div>
                            {/* La fecha puede venir vacía a propósito: el
                                quick-add del hero mete el viaje al carrito
                                sin pedirla y el checkout la exige después.
                                Decirlo acá evita que crea que se le perdió
                                un dato que nunca escribió. */}
                            <div className="mt-0.5 text-xs">
                              {it.date ? (
                                <span className="text-gray-400">
                                  {formatTripDate(it.date)}
                                </span>
                              ) : (
                                <span className="text-amber-300/80">
                                  {lang === "en"
                                    ? "Date at checkout"
                                    : "Fecha en el pago"}
                                </span>
                              )}
                              {it.extraStopNames?.length ? (
                                <span className="text-amber-300/80">
                                  {" · "}
                                  {it.extraStopNames.join(" · ")}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-sm font-bold text-amber-400">
                              ${it.totalPrice.toLocaleString("en-US")}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeItem(it.id)}
                              aria-label={
                                lang === "en"
                                  ? `Remove ${it.fromName} to ${it.toName}`
                                  : `Quitar ${it.fromName} a ${it.toName}`
                              }
                              className="rounded p-1 text-gray-500 transition-colors hover:bg-white/5 hover:text-red-400"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between border-t border-amber-500/20 bg-amber-500/5 px-4 py-3">
                      <span className="text-sm font-bold text-white">
                        {lang === "en" ? "Total" : "Total"}
                      </span>
                      <span className="text-lg font-extrabold text-amber-400">
                        ${totalPrice.toLocaleString("en-US")}
                      </span>
                    </div>

                    <div className="px-4 pb-4">
                      <button
                        type="button"
                        onClick={goToCheckout}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-bold text-black transition-colors hover:bg-amber-600"
                      >
                        {lang === "en"
                          ? "Finish details & check out"
                          : "Completar datos y pagar"}
                      </button>
                      <p className="mt-2 text-center text-[11px] text-gray-500">
                        {lang === "en"
                          ? "Or search another trip above to keep adding."
                          : "O buscá otro viaje arriba para seguir agregando."}
                      </p>
                    </div>
                  </div>
                ) : null}
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
          )}
        </div>
      </section>

      <WizardProgress current={currentStep} />

      <section className="container mx-auto px-4 py-8 md:py-12">
        {view === "checkout" ? (
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_440px] gap-8 lg:gap-10">
            <div className="min-w-0 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-gray-900/95 to-black/95 shadow-2xl shadow-black/40">
              <BookingForm
                hotels={hotels}
                onBack={() => {
                  // Both "add another trip" surfaces use this same handler
                  // — the visitor is asking for a clean calculator, not
                  // an edit of the trip already in cart.
                  //
                  // Strip ?from / ?to from the URL via history.replaceState
                  // BEFORE we bump the calculator's key — otherwise the
                  // freshly-mounted QuoteCalculator runs its syncFromUrl
                  // effect, reads the leftover from/to params, and
                  // instantly repopulates the very fields we just tried
                  // to clear. Keep ?add=1 so the URL-sync effect lands on
                  // its "configuring" branch (preventing the bounce-back
                  // to checkout we hit when using a plain /book).
                  if (typeof window !== "undefined") {
                    window.history.replaceState({}, "", "/book?add=1");
                  }
                  setHeroFrom("");
                  setHeroTo("");
                  setHeroPickupHotel(null);
                  setHeroDropoffHotel(null);
                  resetCalculator();
                  setView("configuring");
                }}
              />
            </div>
            <OrderSummarySidebar
              items={items}
              totalPrice={totalPrice}
              onAddAnotherTrip={() => {
                // Strip ?from / ?to via history.replaceState BEFORE the
                // calculator's key bump — otherwise its syncFromUrl reads
                // the leftover params on the new mount and instantly
                // repopulates the previous trip's route. Keep ?add=1 so
                // the URL-sync effect hits its "configuring" branch and
                // doesn't bounce back to checkout. replaceState (vs
                // router.replace) skips Next.js's useSearchParams update
                // — that update is what was triggering the bouncy effect
                // chain in production before.
                if (typeof window !== "undefined") {
                  window.history.replaceState({}, "", "/book?add=1");
                }
                setHeroFrom("");
                setHeroTo("");
                setHeroPickupHotel(null);
                setHeroDropoffHotel(null);
                resetCalculator();
                setView("configuring");
              }}
            />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Con viajes ya en el carrito el formulario largo arranca
                plegado — ver el comentario de `showDetailedForm`. Sin
                viajes queda abierto, que es el caso de quien llega desde
                una página de ruta y lo encuentra pre-llenado. */}
            {items.length > 0 && !showDetailedForm ? (
              <button
                type="button"
                onClick={() => setShowDetailedForm(true)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4 text-center text-sm text-gray-400 transition-colors hover:border-amber-500/40 hover:text-amber-300"
              >
                {lang === "en"
                  ? "Need to customize a trip? VIP, extra stops, child seats"
                  : "¿Querés configurar un viaje en detalle? VIP, paradas extra, sillas de bebé"}
              </button>
            ) : (
              /* heroFrom / heroTo flow down so the calculator stays in
                 sync with the "Where are you headed?" search card above.
                 We used to mirror that through the URL but the URL
                 bounce caused the multi-trip flow to break. Direct prop
                 wiring is simpler and avoids that whole problem. */
              <QuoteCalculatorV2
                key={calcResetKey}
                locations={locations}
                hotels={hotels}
                heroFrom={heroFrom}
                heroTo={heroTo}
              />
            )}
          </div>
        )}
      </section>
    </>
  );
}

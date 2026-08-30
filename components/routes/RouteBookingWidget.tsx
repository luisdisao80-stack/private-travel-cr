"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { enUS, es as esLocale } from "date-fns/locale";
import {
  Calendar,
  CheckCircle2,
  ShoppingCart,
  ArrowRight,
  Car,
  MapPinned,
  Info,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import PaxSelector, {
  BigGroupNotice,
  DEFAULT_ADULTS,
  DEFAULT_CHILDREN,
} from "@/components/PaxSelector";
import Price from "@/components/Price";
import { useCart } from "@/lib/CartContext";
import { useLanguage } from "@/lib/LanguageContext";
import { getMinPickupCRDate } from "@/lib/booking-rules";
import {
  MAX_TOTAL_PAX,
  EXTRA_STOP_PRICE_USD,
  getPriceForGroupSize,
  getVehicleForPax,
  getVehicleName,
  type RoutePrices,
} from "@/lib/quote-helpers";
import { totalStopHours, type RouteStop } from "@/lib/route-stops";

type Props = {
  /**
   * Nombres crudos de Supabase (`routes.origen` / `routes.destino`). Son
   * los que van al carrito y a `/book?from=&to=`: el buscador hace match
   * contra el texto exacto de la tabla, no contra el nombre bonito.
   */
  origen: string;
  destino: string;
  /** Nombres para mostrar ("San Jose Airport"), ya pasados por displayLocation. */
  originName: string;
  destName: string;
  prices: RoutePrices;
  duracion: string | null;
  /**
   * Paradas con nombre que se pueden agregar en esta ruta. Casi siempre
   * viene vacío (ver getStopsForRoute) y entonces el bloque ni aparece.
   */
  stops?: RouteStop[];
};

/**
 * El buscador de reserva, metido directo en la página de la ruta.
 *
 * Hasta ahora estas ~590 páginas no tenían UN solo campo de reserva:
 * mostraban el precio y un botón "Book Now" que te mandaba a /book a
 * empezar de cero — a re-elegir el origen y el destino que ya estaban
 * escritos en el H1 de la página que acabás de leer. Diego trajo la
 * página de la competencia (2026-08-30) justamente por eso: ahí la fecha
 * y los pasajeros se piden arriba, en la misma página.
 *
 * Acá la ruta ya se sabe (es el título de la página), así que lo único
 * que falta preguntar es CUÁNDO y CUÁNTOS. Con esos dos datos el precio
 * ya es firme y el viaje entra al carrito sin cambiar de página.
 *
 * El precio se calcula en el cliente con `getPriceForGroupSize` — sin
 * llamada a la red, sin spinner: los cuatro precios de la ruta ya
 * vinieron con el HTML. Tocar "+" en pasajeros mueve el número al
 * instante, que es lo que hace creíble el precio.
 */
export default function RouteBookingWidget({
  origen,
  destino,
  originName,
  destName,
  prices,
  duracion,
  stops = [],
}: Props) {
  const { lang } = useLanguage();
  const { addItem, setCartOpen, items } = useCart();
  const en = lang === "en";

  const [date, setDate] = useState("");
  const [adults, setAdults] = useState(DEFAULT_ADULTS);
  const [childrenCount, setChildrenCount] = useState(DEFAULT_CHILDREN);
  // Lo que se agregó, congelado. No se lee del carrito: el visitante
  // puede seguir tocando los "+" después de agregar, y la confirmación
  // tiene que seguir diciendo lo que REALMENTE entró.
  const [stopIds, setStopIds] = useState<string[]>([]);
  const [added, setAdded] = useState<{
    date: string;
    pax: number;
    price: number;
    stopNames: string[];
  } | null>(null);

  const totalPax = adults + childrenCount;
  const basePrice = getPriceForGroupSize(prices, totalPax);
  const vehicleId = getVehicleForPax(totalPax);

  // Las paradas se cobran con la MISMA regla de siempre —horas por
  // EXTRA_STOP_PRICE_USD— y no con un precio propio. Es lo que hace que
  // el total de acá calce exacto con el que recalcula el checkout: si
  // acá inventáramos un precio de paquete, BookingForm lo volvería a
  // calcular por horas y el visitante vería cambiar el número entre una
  // pantalla y la otra.
  const chosenStops = stops.filter((s) => stopIds.includes(s.id));
  const extraHours = totalStopHours(chosenStops);
  const stopsExtra = extraHours * EXTRA_STOP_PRICE_USD;
  const price = basePrice + stopsExtra;

  const toggleStop = (id: string) =>
    setStopIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // Arriba de 12 no se vende por web: hacen falta dos vehículos y Diego
  // los cotiza a mano. Mismo criterio que el buscador de la home.
  const tooManyPax = totalPax > MAX_TOTAL_PAX;
  const canAdd = Boolean(date) && price > 0 && !tooManyPax;

  const locale = en ? enUS : esLocale;
  const prettyDate = (iso: string) =>
    format(new Date(iso + "T00:00:00"), "PPP", { locale });

  const handleAdd = () => {
    if (!canAdd) return;
    addItem({
      fromName: origen,
      toName: destino,
      date,
      // La hora se elige en el checkout. El carrito acepta "" como
      // estado intermedio a propósito (ver CartItem.pickupTime) y
      // BookingForm es el que obliga a completarla antes de pagar.
      pickupTime: "",
      passengers: totalPax,
      children: childrenCount,
      vehicleId,
      vehicleName: getVehicleName(vehicleId),
      serviceType: "standard",
      extraStopHours: extraHours,
      // Los nombres van al lado de las horas para que el chofer sepa a
      // dónde los lleva. `undefined` y no `[]` cuando no eligió ninguna:
      // así el item no carga un arreglo vacío hasta el JSONB.
      extraStopNames: chosenStops.length
        ? chosenStops.map((s) => s.name)
        : undefined,
      // OJO: `basePrice` es el precio del traslado SOLO. El checkout
      // recalcula con computeTripTotal({ basePrice, extraStopHours, ... }),
      // así que si acá mandáramos el precio ya sumado, las paradas se
      // cobrarían dos veces.
      basePrice,
      // Sin VIP y sin hora todavía, el total es el traslado + las paradas.
      totalPrice: price,
      duration: duracion ?? "",
    });
    // addItem abre el panel del carrito encima de la página. Lo cerramos:
    // la confirmación va acá abajo, en el mismo lugar donde estaba el
    // botón, y el visitante no pierde de vista dónde está.
    setCartOpen(false);
    setAdded({
      date,
      pax: totalPax,
      price,
      stopNames: chosenStops.map((s) => s.name),
    });
  };

  if (added) {
    return (
      <div className="rounded-2xl border border-green-500/40 bg-green-500/10 p-5 md:p-6">
        <p className="flex items-center gap-2 text-base font-bold text-green-300">
          <CheckCircle2 size={18} className="shrink-0" />
          {en ? "Added to your trip" : "Agregado a tu viaje"}
        </p>
        <p className="mt-2 text-sm text-gray-200">
          {originName} → {destName}
        </p>
        <p className="mt-1 text-sm text-gray-400">
          {prettyDate(added.date)} · {added.pax}{" "}
          {en
            ? added.pax === 1
              ? "passenger"
              : "passengers"
            : added.pax === 1
              ? "pasajero"
              : "pasajeros"}{" "}
          · <Price usd={added.price} className="font-semibold text-amber-400" />
        </p>
        {added.stopNames.length ? (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-gray-400">
            <MapPinned size={13} className="mt-0.5 shrink-0 text-amber-400/70" />
            <span>
              {en ? "Stopping at: " : "Con parada en: "}
              {added.stopNames.join(" · ")}
            </span>
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/book?checkout=1"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 px-6 text-center font-bold text-black transition-colors hover:bg-amber-600"
          >
            {en ? "Continue to checkout" : "Continuar al pago"}
            <ArrowRight size={16} />
          </Link>
          {/* `?add=1` cae en el buscador de /book, no en el pago: el
              segundo tramo casi siempre es OTRA ruta (el regreso), así
              que acá no sirve repetir este mismo widget. */}
          <Link
            href="/book?add=1"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-black/40 py-3 px-6 text-center font-bold text-amber-300 transition-colors hover:bg-amber-500/20"
          >
            {en ? "Add another trip" : "Agregar otro viaje"}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setAdded(null)}
          className="mt-4 w-full text-center text-xs text-gray-400 underline underline-offset-2 transition-colors hover:text-amber-300"
        >
          {en
            ? "Book this route again with other dates"
            : "Reservar esta misma ruta con otra fecha"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-5 md:p-6">
      <p className="mb-4 text-sm font-semibold text-white">
        {en
          ? "Check availability and price for your group"
          : "Mirá la disponibilidad y el precio de tu grupo"}
      </p>

      <div className="mb-3">
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-400">
          <Calendar size={16} />
          {en ? "Travel date" : "Fecha del viaje"}
        </label>
        <DatePicker
          value={date}
          onChange={setDate}
          placeholder={en ? "Select date..." : "Elegí la fecha..."}
          lang={en ? "en" : "es"}
          // Nadie puede escoger un día que ya no cumple las 12 horas de
          // anticipación: mejor esconder el día que dejar que llene todo
          // y que el checkout lo rebote al final.
          minDate={getMinPickupCRDate()}
        />
      </div>

      <PaxSelector
        adults={adults}
        childrenCount={childrenCount}
        onAdultsChange={setAdults}
        onChildrenCountChange={setChildrenCount}
        lang={lang}
        className="mb-4"
      />

      {tooManyPax ? (
        <BigGroupNotice
          totalPax={totalPax}
          from={originName}
          to={destName}
          lang={lang}
          className="mb-4"
        />
      ) : (
        <>
          {/* Paradas con nombre. Sólo aparece en las rutas que pasan por
              algo que valga la pena parar a ver (ver getStopsForRoute);
              en el resto este bloque no existe.

              Es el mismo "Extra Stops (optional)" del cotizador, con la
              misma cuenta de $/hora — pero diciendo qué se ve en esas
              horas en vez de vender tiempo suelto. */}
          {stops.length ? (
            <div className="mb-4 border-t border-white/10 pt-4">
              <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-amber-400">
                <MapPinned size={16} />
                {en ? "Stop along the way?" : "¿Parás en el camino?"}
              </p>
              <p className="mb-3 text-xs text-gray-400">
                {en
                  ? "These are right on your route — your driver waits while you visit."
                  : "Quedan de paso en tu ruta — el chofer te espera mientras la visitás."}
              </p>

              <div className="space-y-2">
                {stops.map((s) => {
                  const on = stopIds.includes(s.id);
                  const warn = en ? s.warningEn : s.warningEs;
                  return (
                    <label
                      key={s.id}
                      className={
                        "flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors " +
                        (on
                          ? "border-amber-500/60 bg-amber-500/10"
                          : "border-white/10 bg-black/30 hover:border-amber-500/30")
                      }
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleStop(s.id)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-amber-500"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline justify-between gap-x-2">
                          <span className="text-sm font-semibold text-white">
                            {s.name}
                          </span>
                          <span className="text-xs font-semibold text-amber-400">
                            +{s.hours}h · +
                            <Price usd={s.hours * EXTRA_STOP_PRICE_USD} />
                          </span>
                        </span>
                        <span className="mt-1 block text-xs leading-snug text-gray-400">
                          {en ? s.blurbEn : s.blurbEs}
                        </span>
                        {/* El aviso del Poás (reserva previa obligatoria)
                            va ACÁ, pegado a la casilla y antes de
                            agregarla — no en la letra chica de abajo. Si
                            se entera después de pagar, el reclamo le
                            llega a Diego. */}
                        {warn ? (
                          <span className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-snug text-amber-300/90">
                            <Info size={12} className="mt-0.5 shrink-0" />
                            <span>{warn}</span>
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Diego, 2026-08-30: "solo ofrece las paradas, no almuerzo,
                  y que ellos deben pagar las entradas". Se dice antes de
                  pagar y en la misma caja donde se elige. */}
              <p className="mt-3 text-[11px] leading-snug text-gray-500">
                {en
                  ? "The price above covers your driver's time and the wait. Entrance fees are not included — you pay those directly at each place. Meals aren't included either."
                  : "El precio de arriba cubre el tiempo del chofer y la espera. Las entradas NO están incluidas: esas las pagás vos directamente en cada lugar. Las comidas tampoco van incluidas."}
              </p>
            </div>
          ) : null}

          <div className="mb-4 flex items-end justify-between gap-3 border-t border-white/10 pt-4">
            <div>
              <div className="text-xs text-gray-400">
                {en ? "Total for your group" : "Total por tu grupo"}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-500">
                <Car size={12} className="text-amber-400/70" />
                {getVehicleName(vehicleId)}
                {duracion ? ` · ${duracion}` : ""}
              </div>
              {/* Con paradas elegidas se desglosa. Ver saltar el total de
                  $220 a $325 sin explicación se lee como un cobro
                  escondido, aunque lo acabe de elegir él mismo. */}
              {extraHours > 0 ? (
                <div className="mt-1 text-[11px] text-gray-500">
                  {en ? "Transfer " : "Traslado "}
                  <Price usd={basePrice} />
                  {en ? ` + ${extraHours}h of stops ` : ` + ${extraHours}h de paradas `}
                  <Price usd={stopsExtra} />
                </div>
              ) : null}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-amber-400">
                <Price usd={price} />
              </div>
              <div className="text-[11px] text-gray-500">
                {en ? "per vehicle, not per person" : "por vehículo, no por persona"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-4 font-bold text-black transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingCart size={18} />
            {items.length > 0
              ? en
                ? "Add another trip"
                : "Agregar otro viaje"
              : en
                ? "Add to my trip"
                : "Agregar a mi viaje"}
          </button>
          {/* El botón deshabilitado sin explicación se lee como "está
              roto". Esta línea dice qué falta — y sólo aparece cuando
              falta, para no ensuciar el caso normal. */}
          {!date ? (
            <p className="mt-2 text-center text-xs text-gray-500">
              {en
                ? "Pick a date to add this trip"
                : "Elegí la fecha para agregar el viaje"}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

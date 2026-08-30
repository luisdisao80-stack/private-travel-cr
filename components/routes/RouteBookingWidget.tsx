"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { enUS, es as esLocale } from "date-fns/locale";
import { Calendar, CheckCircle2, ShoppingCart, ArrowRight, Car } from "lucide-react";
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
  getPriceForGroupSize,
  getVehicleForPax,
  getVehicleName,
  type RoutePrices,
} from "@/lib/quote-helpers";

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
  const [added, setAdded] = useState<{
    date: string;
    pax: number;
    price: number;
  } | null>(null);

  const totalPax = adults + childrenCount;
  const price = getPriceForGroupSize(prices, totalPax);
  const vehicleId = getVehicleForPax(totalPax);

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
      extraStopHours: 0,
      basePrice: price,
      // Sin VIP, sin paradas extra y sin hora todavía, el total ES el base.
      totalPrice: price,
      duration: duracion ?? "",
    });
    // addItem abre el panel del carrito encima de la página. Lo cerramos:
    // la confirmación va acá abajo, en el mismo lugar donde estaba el
    // botón, y el visitante no pierde de vista dónde está.
    setCartOpen(false);
    setAdded({ date, pax: totalPax, price });
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

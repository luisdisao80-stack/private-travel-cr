"use client";

import { Users, Minus, Plus } from "lucide-react";
import { MAX_TOTAL_PAX } from "@/lib/quote-helpers";
import { WHATSAPP_URGENT_URL } from "@/lib/booking-rules";

// Punto de partida de los dos buscadores (el de la home y el de /book).
// El precio NO es por persona: es por vehículo, y el vehículo cambia por
// tramos (<=5 Staria, 6-9 Hiace, 10-12 Maxus). Por eso preguntamos los
// pasajeros ANTES de mostrar el precio.
export const DEFAULT_ADULTS = 2;
export const DEFAULT_CHILDREN = 0;

// Hasta dónde deja subir el contador. OJO: es a propósito MÁS alto que
// MAX_TOTAL_PAX (12), que es lo máximo que se puede comprar por la web.
//
// La primera versión frenaba el "+" justo en 12. Un grupo de 14 llegaba,
// el botón dejaba de responder y nadie le explicaba por qué: se iba
// pensando que no los podemos llevar. Sí los podemos llevar — sólo que
// hacen falta dos vehículos y Diego lo cotiza a mano. Así que los dejamos
// pasar de 12 y ahí les mostramos el WhatsApp: en vez de una pared muda,
// un contacto.
export const PAX_CEILING = 18;

/**
 * Un contador -/N/+ para adultos o niños.
 *
 * Los botones se deshabilitan en vez de esconderse: un botón que
 * desaparece hace saltar el layout y el dedo termina tocando otra cosa.
 *
 * `aria-live="polite"` en el número para que quien usa lector de pantalla
 * escuche el conteo nuevo — si no, el botón dice "un adulto más" y no hay
 * forma de saber en cuánto quedó.
 */
function PaxStepper({
  label,
  hint,
  value,
  onDec,
  onInc,
  canDec,
  canInc,
  decLabel,
  incLabel,
}: {
  label: string;
  hint: string;
  value: number;
  onDec: () => void;
  onInc: () => void;
  canDec: boolean;
  canInc: boolean;
  decLabel: string;
  incLabel: string;
}) {
  const btn =
    "inline-flex items-center justify-center w-8 h-8 rounded-full border border-amber-500/30 bg-black/60 text-amber-400 transition-colors hover:bg-amber-500/20 hover:border-amber-500/60 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-black/60 disabled:hover:border-amber-500/30";
  return (
    // En celular cada contador ocupa su propia fila con la etiqueta a la
    // izquierda y los botones a la derecha (`justify-between`): los dos
    // lado a lado no caben en 375 px y el "+" de Niños quedaba cortado
    // fuera de la pantalla. Desde `sm` sí caben en una sola línea.
    <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start sm:gap-2">
      <div className="leading-tight">
        <div className="text-xs font-medium text-gray-300">{label}</div>
        <div className="text-[10px] text-gray-500">{hint}</div>
      </div>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={onDec} disabled={!canDec} aria-label={decLabel} className={btn}>
          <Minus size={14} />
        </button>
        <span
          aria-live="polite"
          className="w-5 text-center text-sm font-bold text-white tabular-nums"
        >
          {value}
        </span>
        <button type="button" onClick={onInc} disabled={!canInc} aria-label={incLabel} className={btn}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

/**
 * Caja "¿Cuántos pasajeros?" con los dos contadores.
 *
 * Vive acá y no dentro del Hero porque hay DOS buscadores: el de la home
 * y el de /book ("Add another trip to cart"). Cuando esto era código
 * suelto dentro del Hero, /book se quedó sin contador y metía todos los
 * viajes al carrito como 2 pasajeros — con el precio de otro tramo.
 * Diego lo reportó el 2026-08-30 con captura. Un solo componente para
 * los dos buscadores es lo que impide que se vuelvan a separar.
 */
// OJO con el nombre `childrenCount`: NO se puede llamar `children` a
// secas. React reserva ese prop para el contenido anidado, y `<PaxSelector
// children={2} />` es a la vez un error de lint (react/no-children-prop) y
// una trampa — el día que alguien envuelva algo dentro del componente, el
// contador de niños se sobreescribe con nodos JSX.
export default function PaxSelector({
  adults,
  childrenCount,
  onAdultsChange,
  onChildrenCountChange,
  lang,
  className = "",
}: {
  adults: number;
  childrenCount: number;
  onAdultsChange: (n: number) => void;
  onChildrenCountChange: (n: number) => void;
  lang: string;
  className?: string;
}) {
  const totalPax = adults + childrenCount;
  return (
    // Va ANTES del precio a propósito: el precio de abajo cambia según
    // este número, así que el orden de lectura tiene que ser "cuántos
    // somos" → "cuánto cuesta". Botones +/- en vez de un campo de número
    // porque en celular escribir un dígito abre el teclado y tapa media
    // pantalla.
    <div className={`rounded-xl border border-white/10 bg-black/40 px-4 py-3 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
          <Users size={15} className="text-amber-400" />
          {lang === "en" ? "How many passengers?" : "¿Cuántos pasajeros?"}
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
          <PaxStepper
            label={lang === "en" ? "Adults" : "Adultos"}
            hint="12+"
            value={adults}
            // Nunca menos de 1 adulto: un viaje de puros niños no existe,
            // y con 0 pasajeros el precio no tiene sentido.
            onDec={() => onAdultsChange(Math.max(1, adults - 1))}
            onInc={() => onAdultsChange(adults + 1)}
            canDec={adults > 1}
            canInc={totalPax < PAX_CEILING}
            decLabel={lang === "en" ? "One adult less" : "Un adulto menos"}
            incLabel={lang === "en" ? "One adult more" : "Un adulto más"}
          />
          <PaxStepper
            label={lang === "en" ? "Children" : "Niños"}
            hint="0-11"
            value={childrenCount}
            onDec={() => onChildrenCountChange(Math.max(0, childrenCount - 1))}
            onInc={() => onChildrenCountChange(childrenCount + 1)}
            canDec={childrenCount > 0}
            canInc={totalPax < PAX_CEILING}
            decLabel={lang === "en" ? "One child less" : "Un niño menos"}
            incLabel={lang === "en" ? "One child more" : "Un niño más"}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Aviso + WhatsApp para grupos arriba de MAX_TOTAL_PAX.
 *
 * No es un error: es una venta que va por otro canal. El mensaje llega a
 * WhatsApp ya escrito con la ruta y la cantidad de gente para que Diego
 * no tenga que preguntar todo de nuevo.
 */
export function BigGroupNotice({
  totalPax,
  from,
  to,
  lang,
  className = "",
}: {
  totalPax: number;
  from: string;
  to: string;
  lang: string;
  className?: string;
}) {
  // Metemos la ruta sólo si ya la eligieron: un texto que diga "de  a "
  // se ve roto.
  const route =
    from.trim() && to.trim()
      ? lang === "en"
        ? ` from ${from.trim()} to ${to.trim()}`
        : ` de ${from.trim()} a ${to.trim()}`
      : "";
  const msg =
    lang === "en"
      ? `Hi! I need a private transfer${route} for ${totalPax} passengers. Could you quote it?`
      : `¡Hola! Necesito un traslado privado${route} para ${totalPax} pasajeros. ¿Me lo pueden cotizar?`;
  const url = `${WHATSAPP_URGENT_URL}?text=${encodeURIComponent(msg)}`;

  return (
    <div
      className={`rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-center text-xs text-amber-200 ${className}`}
    >
      <p>
        {lang === "en"
          ? `Groups over ${MAX_TOTAL_PAX} travel in more than one vehicle, so we quote those by hand.`
          : `Los grupos de más de ${MAX_TOTAL_PAX} viajan en más de un vehículo, así que esos los cotizamos a mano.`}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 px-4 py-2 font-bold text-white transition-colors"
      >
        {lang === "en"
          ? `WhatsApp us for a ${totalPax}-passenger quote`
          : `Cotizar ${totalPax} pasajeros por WhatsApp`}
      </a>
    </div>
  );
}

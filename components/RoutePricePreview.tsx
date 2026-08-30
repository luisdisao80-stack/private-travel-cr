"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Loader2 } from "lucide-react";
import Price from "@/components/Price";
import { getPriceTier, PRICE_TIER_LABELS } from "@/lib/quote-helpers";

export type RouteQuote = { basePrice: number; duration?: string };

type Props = {
  from: string;
  to: string;
  // Group size to quote. When set (e.g. 6 because the visitor clicked
  // the "6-9 Hiace" tier card), the preview shows that tier's price so
  // the top of the page matches the calculator below. Defaults to 2.
  adults?: number;
  // Lets the parent reuse the price this component already fetched
  // instead of firing a second identical request. The Hero needs it to
  // build the cart item on "Add to cart". `null` means "no usable price
  // right now" (idle / loading / notFound / network error) — the parent
  // must not add to cart in that state.
  onQuote?: (quote: RouteQuote | null) => void;
};

type ApiResponse =
  | { found: true; basePrice: number; duration: string; adults?: number }
  | { found: false }
  | { error: string };

export default function RoutePricePreview({ from, to, adults, onQuote }: Props) {
  // Callback held in a ref on purpose: parents pass an inline arrow, so
  // putting `onQuote` in the effect's dependency array would re-run the
  // fetch on every parent render (infinite request loop).
  const onQuoteRef = useRef(onQuote);
  useEffect(() => {
    onQuoteRef.current = onQuote;
  }, [onQuote]);

  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "found"; basePrice: number; duration: string; adults: number }
    | { status: "notFound" }
    // "error" is reserved for network / server failures so we can show
    // a different (retry-friendly) message than the "we just don't quote
    // that pair yet" notFound state. Previously both collapsed into the
    // same "continue and we'll quote it" copy, which was misleading on
    // flaky connections — visitors thought they were getting a free
    // quote when really nothing reached the server.
    | { status: "error" }
  >({ status: "idle" });

  // Último precio confirmado, para NO desmontar la tarjeta mientras se
  // recotiza. Antes el estado "loading" reemplazaba la tarjeta (~90 px)
  // por una línea de texto (~20 px) y todo lo de abajo pegaba un brinco,
  // dos veces por cada toque del contador. Diego lo reportó el
  // 2026-08-30. Guardamos el dato anterior y lo dejamos puesto, atenuado,
  // mientras llega el nuevo: el alto no cambia nunca.
  const [lastFound, setLastFound] = useState<{
    basePrice: number;
    duration: string;
    adults: number;
  } | null>(null);

  // Clave de lo ÚLTIMO que quedó resuelto (ruta + tramo). Sirve para
  // saltarse la consulta cuando el visitante mueve el contador dentro del
  // mismo tramo: de 2 a 5 el precio es EXACTAMENTE el mismo (es por
  // vehículo, no por persona), así que pedirlo de nuevo es red gastada y
  // un parpadeo regalado.
  //
  // Se marca cuando la respuesta LLEGA, no cuando sale. Si se marcara al
  // salir, este caso rompe: consulta en vuelo → el visitante toca otra
  // vez dentro del mismo tramo → React aborta la consulta anterior y el
  // efecto nuevo se saltaría la consulta por "ya está pedida" → se queda
  // cargando para siempre.
  const settledKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const f = from.trim();
    const t = to.trim();
    if (!f || !t) {
      setState({ status: "idle" });
      setLastFound(null);
      settledKeyRef.current = null;
      onQuoteRef.current?.(null);
      return;
    }

    const pax = adults && adults >= 1 ? adults : 2;
    const key = `${f}|${t}|${getPriceTier(pax)}`;
    if (settledKeyRef.current === key) return;

    // Cambió la RUTA (no sólo el tramo): el precio viejo es de otro viaje
    // y dejarlo puesto sería mentir. Ahí sí lo soltamos y mostramos el
    // esqueleto, que igual mide lo mismo que la tarjeta.
    const routeChanged = settledKeyRef.current?.startsWith(`${f}|${t}|`) !== true;
    if (routeChanged) setLastFound(null);

    let cancelled = false;
    setState({ status: "loading" });
    // Invalidate the parent's cached quote as soon as the pair changes,
    // so a stale price from the previous route can never be added to the
    // cart while this request is still in flight. Esto es lo que impide
    // que el precio atenuado que sigue en pantalla se pueda comprar.
    onQuoteRef.current?.(null);

    const controller = new AbortController();
    const adultsQs = `&adults=${pax}`;
    fetch(
      `/api/quote/route-price?from=${encodeURIComponent(f)}&to=${encodeURIComponent(t)}${adultsQs}`,
      { signal: controller.signal },
    )
      .then((r) => r.json() as Promise<ApiResponse>)
      .then((data) => {
        if (cancelled) return;
        if ("error" in data) {
          setState({ status: "error" });
          setLastFound(null);
          onQuoteRef.current?.(null);
          return;
        }
        if (data.found) {
          const found = {
            basePrice: data.basePrice,
            duration: data.duration,
            adults: data.adults ?? pax,
          };
          settledKeyRef.current = key;
          setLastFound(found);
          setState({ status: "found", ...found });
          onQuoteRef.current?.({
            basePrice: data.basePrice,
            duration: data.duration,
          });
        } else {
          // Marcamos resuelto igual: si esta ruta no tiene tarifa, tocar
          // el contador dentro del mismo tramo no debe volver a
          // preguntar lo mismo para recibir el mismo "no".
          settledKeyRef.current = key;
          setState({ status: "notFound" });
          setLastFound(null);
          onQuoteRef.current?.(null);
        }
      })
      .catch(() => {
        if (cancelled) return;
        // Fetch threw — almost always a network failure (offline, blocked
        // request, etc.). Distinct from a successful 200 with notFound.
        // No marcamos settledKey: un fallo de red SÍ se debe reintentar
        // en el próximo cambio.
        setState({ status: "error" });
        setLastFound(null);
        onQuoteRef.current?.(null);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [from, to, adults]);

  if (state.status === "idle") return null;

  // Mientras recotiza: si ya había un precio lo dejamos puesto y sólo lo
  // atenuamos, y si no, pintamos un esqueleto con la MISMA estructura de
  // la tarjeta. En los dos casos el alto es idéntico al del resultado, que
  // es justo lo que evita el brinco. Ojo: el precio atenuado NO se puede
  // comprar — arriba ya le avisamos al padre con onQuote(null).
  if (state.status === "loading") {
    if (!lastFound) {
      return (
        <PriceCardShell busy>
          {/* Mismas dos columnas y mismas líneas que PriceCard: es lo que
              hace que el alto coincida. Las líneas que no tienen nada que
              mostrar van con texto transparente en vez de vacías, porque
              un div vacío colapsa a 0 y volvería a descuadrar el alto. */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">
              From
            </div>
            <div className="text-2xl font-bold leading-none">
              <span className="inline-block h-6 w-20 animate-pulse rounded bg-white/15 align-middle" />
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-400">
              <Loader2 size={11} className="animate-spin text-amber-400" />
              Checking price…
            </div>
            <div className="text-[10px] text-transparent select-none" aria-hidden>
              Standard
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1 text-xs text-gray-300">
              <Clock size={12} className="text-amber-400/40" />
              <span className="inline-block h-3 w-6 animate-pulse rounded bg-white/15" />
            </div>
            <div className="text-[10px] text-gray-500 mt-1">Approx. travel time</div>
          </div>
        </PriceCardShell>
      );
    }
    return <PriceCard data={lastFound} stale />;
  }

  if (state.status === "notFound") {
    return (
      <div className="mt-4 text-center text-xs text-amber-300/80">
        We don&apos;t have a direct price for that pair yet — continue and we&apos;ll quote it.
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mt-4 text-center text-xs text-red-300">
        Couldn&apos;t reach the pricing server. Check your connection and try again.
      </div>
    );
  }

  return <PriceCard data={state} />;
}

/**
 * Caja de la tarjeta de precio. El estado de carga y el de resultado
 * comparten ESTE mismo contenedor a propósito: mismas clases, mismo
 * padding, misma cantidad de líneas. Si cada estado armara su propio
 * marco, cualquier retoque futuro a uno de los dos volvería a
 * desalinearlos y el brinco regresaría sin que nadie lo note.
 */
function PriceCardShell({
  children,
  busy = false,
  stale = false,
}: {
  children: React.ReactNode;
  busy?: boolean;
  stale?: boolean;
}) {
  return (
    <div
      aria-busy={busy || stale}
      className={`mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-center justify-between gap-3 transition-opacity duration-150 ${
        stale ? "opacity-40" : "opacity-100"
      }`}
    >
      {children}
    </div>
  );
}

function PriceCard({
  data,
  stale = false,
}: {
  data: { basePrice: number; duration: string; adults: number };
  stale?: boolean;
}) {
  return (
    <PriceCardShell stale={stale}>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">
          From
        </div>
        <div className="text-2xl font-bold text-white leading-none">
          <Price usd={data.basePrice} />
        </div>
        <div className="text-[10px] text-green-400 mt-1">Taxes included</div>
        <div className="text-[10px] text-gray-400">
          {/* El tramo sale de quote-helpers, la misma función que decide
              el precio. Antes estaba escrito acá con un ternario aparte y
              nada garantizaba que coincidiera con lo que cobrábamos. */}
          Standard · {PRICE_TIER_LABELS[getPriceTier(data.adults)]}
        </div>
      </div>
      <div className="text-right">
        <div className="inline-flex items-center gap-1 text-xs text-gray-300">
          <Clock size={12} className="text-amber-400" />
          {data.duration}
        </div>
        <div className="text-[10px] text-gray-500 mt-1">Approx. travel time</div>
      </div>
    </PriceCardShell>
  );
}

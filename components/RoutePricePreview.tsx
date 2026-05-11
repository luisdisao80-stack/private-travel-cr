"use client";

import { useEffect, useState } from "react";
import { Clock, Loader2 } from "lucide-react";

type Props = {
  from: string;
  to: string;
};

type ApiResponse =
  | { found: true; basePrice: number; duration: string }
  | { found: false }
  | { error: string };

export default function RoutePricePreview({ from, to }: Props) {
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "found"; basePrice: number; duration: string }
    | { status: "notFound" }
  >({ status: "idle" });

  useEffect(() => {
    const f = from.trim();
    const t = to.trim();
    if (!f || !t) {
      setState({ status: "idle" });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    const controller = new AbortController();
    fetch(`/api/quote/route-price?from=${encodeURIComponent(f)}&to=${encodeURIComponent(t)}`, {
      signal: controller.signal,
    })
      .then((r) => r.json() as Promise<ApiResponse>)
      .then((data) => {
        if (cancelled) return;
        if ("error" in data) {
          setState({ status: "notFound" });
          return;
        }
        if (data.found) {
          setState({
            status: "found",
            basePrice: data.basePrice,
            duration: data.duration,
          });
        } else {
          setState({ status: "notFound" });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setState({ status: "notFound" });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [from, to]);

  if (state.status === "idle") return null;

  if (state.status === "loading") {
    return (
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
        <Loader2 size={14} className="animate-spin text-amber-400" />
        Checking price…
      </div>
    );
  }

  if (state.status === "notFound") {
    return (
      <div className="mt-4 text-center text-xs text-amber-300/80">
        We don&apos;t have a direct price for that pair yet — continue and we&apos;ll quote it.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-center justify-between gap-3">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">
          From
        </div>
        <div className="text-2xl font-bold text-white leading-none">
          ${state.basePrice}
          <span className="text-xs text-gray-400 font-normal ml-1">USD</span>
        </div>
        <div className="text-[10px] text-gray-400 mt-1">Standard · up to 6 pax</div>
      </div>
      <div className="text-right">
        <div className="inline-flex items-center gap-1 text-xs text-gray-300">
          <Clock size={12} className="text-amber-400" />
          {state.duration}
        </div>
        <div className="text-[10px] text-gray-500 mt-1">Approx. travel time</div>
      </div>
    </div>
  );
}

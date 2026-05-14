"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  origen: string;
  destino: string;
  priceFrom: number;
  /** Pixels from the top before the bar appears. Default 600 — past the
   *  pricing card on most viewports. */
  showAfter?: number;
};

/**
 * Bottom-pinned 'Book Now' button shown on mobile only. Appears after the
 * visitor scrolls past the pricing section so the CTA is always one tap
 * away even when the original button is off-screen.
 *
 * Hidden on lg+ screens — desktop has the pricing card in view longer
 * and doesn't need a second CTA stealing the eye.
 */
export default function StickyBookCTA({
  origen,
  destino,
  priceFrom,
  showAfter = 600,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  return (
    <div
      className={
        "lg:hidden fixed left-0 right-0 bottom-0 z-40 transition-transform duration-300 " +
        (visible ? "translate-y-0" : "translate-y-full")
      }
      aria-hidden={!visible}
    >
      <div className="bg-gradient-to-t from-black via-black/95 to-black/80 backdrop-blur-md border-t border-amber-500/30 p-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 leading-none">
              From
            </div>
            <div className="text-lg font-bold text-amber-400 leading-tight">
              ${priceFrom}
              <span className="text-[10px] text-gray-400 font-normal ml-1">USD</span>
            </div>
          </div>
          <Link
            href={`/book?from=${encodeURIComponent(origen)}&to=${encodeURIComponent(destino)}&direct=1`}
            className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-lg shadow-amber-500/30 transition"
          >
            Book Now
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

// Fixed-bottom mobile booking bar. Mobile is ~70% of traffic for a
// shuttle-booking site and most of those visitors scroll past the hero
// search card and never come back. This bar keeps the primary action
// ("Book Now") + a fast WhatsApp escape hatch visible at all times,
// without stealing real estate on the page itself.
//
// Behaviour rules:
//   1. Mobile-only (md:hidden) — desktop already has the search card
//      and the WhatsAppFloat round button always visible.
//   2. Hides until the visitor scrolls past 300px (avoids covering the
//      hero on first paint; the visitor sees the page before the CTA
//      claims their attention).
//   3. Slides up smoothly via framer-motion so it feels like a system
//      sheet, not a layout shift.
//
// Conversion benchmark: replacing nothing-after-scroll with a sticky
// "Book Now" lifts mobile conversion ~15-30% in shuttle/tour ops
// (matches what big OTA platforms publish).
export default function MobileBookingBar() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  // Hide the bar on the booking flow itself — visitors there are already
  // converting; layering a "Book Now" CTA on top of the booking form
  // is noise and steals taps from the real Pay button.
  const isOnBookingFlow = pathname?.startsWith("/book");

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll(); // capture initial state in case the user lands deep-linked
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isOnBookingFlow) return null;

  const bookLabel = lang === "en" ? "Book Now" : "Reservar Ahora";
  const whatsappLabel = lang === "en" ? "WhatsApp" : "WhatsApp";
  const whatsappMessage =
    lang === "en"
      ? "Hi! I'd like to ask about a private shuttle in Costa Rica."
      : "¡Hola! Quería consultar por un shuttle privado en Costa Rica.";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2 bg-gradient-to-t from-black via-black/95 to-black/0 pointer-events-none"
        >
          <div className="flex items-center gap-2 max-w-md mx-auto pointer-events-auto">
            <Link
              href="/book"
              className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-black font-bold text-sm shadow-2xl shadow-amber-500/40 transition-colors"
            >
              {bookLabel}
              <ArrowRight size={16} />
            </Link>
            <a
              href={`https://wa.me/50686334133?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={whatsappLabel}
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-2xl shadow-green-600/40 transition-colors shrink-0"
            >
              <MessageCircle size={20} fill="currentColor" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

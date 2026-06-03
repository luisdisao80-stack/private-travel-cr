"use client";

import { motion } from "framer-motion";
import {
  Check,
  X,
  Sparkles,
  Car,
  Bus,
  Smartphone,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { reviewStats } from "@/lib/reviews-data";

// Visible head-to-head against the alternatives a traveler is weighing.
// Helps fence-sitters convert by surfacing the hidden costs of rental car
// (insurance, parking, navigation stress) and bus (no luggage room, no
// door-to-door) that the bookers don't price-compare for in the moment.

type Cell =
  | { kind: "yes"; note?: string }
  | { kind: "no"; note?: string }
  | { kind: "warn"; note: string }
  | { kind: "text"; text: string };

type Row = {
  feature: { en: string; es: string };
  shuttle: Cell;
  rental: Cell;
  uber: Cell;
  bus: Cell;
};

const ROWS: Row[] = [
  {
    feature: { en: "Door-to-door pickup", es: "Pickup puerta a puerta" },
    shuttle: { kind: "yes" },
    rental: { kind: "warn", note: "Need to find parking" },
    uber: { kind: "warn", note: "App availability varies" },
    bus: { kind: "no", note: "Bus stations only" },
  },
  {
    feature: { en: "Bilingual driver", es: "Chofer bilingüe" },
    shuttle: { kind: "yes" },
    rental: { kind: "text", text: "n/a" },
    uber: { kind: "warn", note: "Sometimes" },
    bus: { kind: "no" },
  },
  {
    feature: {
      en: "Full insurance included",
      es: "Seguro completo incluido",
    },
    shuttle: { kind: "yes" },
    rental: { kind: "no", note: "$20–40 / day extra" },
    uber: { kind: "warn", note: "Limited coverage" },
    bus: { kind: "text", text: "n/a" },
  },
  {
    feature: {
      en: "Free child seats",
      es: "Sillas para niños gratis",
    },
    shuttle: { kind: "yes" },
    rental: { kind: "no", note: "$10 / day extra" },
    uber: { kind: "no" },
    bus: { kind: "no" },
  },
  {
    feature: { en: "Luggage space guaranteed", es: "Espacio garantizado para equipaje" },
    shuttle: { kind: "yes" },
    rental: { kind: "warn", note: "Depends on car size" },
    uber: { kind: "no", note: "Often too small" },
    bus: { kind: "no", note: "Limited overhead" },
  },
  {
    feature: { en: "Local driver knows the roads", es: "Chofer local conoce las rutas" },
    shuttle: { kind: "yes" },
    rental: { kind: "no", note: "You navigate" },
    uber: { kind: "warn", note: "Driver dependent" },
    bus: { kind: "yes" },
  },
  {
    feature: { en: "Flexible scenic stops", es: "Paradas escénicas flexibles" },
    shuttle: { kind: "yes", note: "+$35/hr or VIP" },
    rental: { kind: "yes" },
    uber: { kind: "no" },
    bus: { kind: "no" },
  },
  {
    feature: { en: "Total stress level", es: "Nivel de estrés total" },
    shuttle: { kind: "text", text: "😌 Low" },
    rental: { kind: "text", text: "😰 High" },
    uber: { kind: "text", text: "😐 Medium" },
    bus: { kind: "text", text: "😐 Medium" },
  },
];

function CellRender({ cell }: { cell: Cell }) {
  if (cell.kind === "yes") {
    return (
      <div className="flex flex-col items-center gap-1">
        <Check size={18} className="text-amber-400 shrink-0" />
        {cell.note ? (
          <span className="text-[10px] text-gray-500 text-center leading-tight">
            {cell.note}
          </span>
        ) : null}
      </div>
    );
  }
  if (cell.kind === "no") {
    return (
      <div className="flex flex-col items-center gap-1">
        <X size={18} className="text-red-400/70 shrink-0" />
        {cell.note ? (
          <span className="text-[10px] text-gray-500 text-center leading-tight">
            {cell.note}
          </span>
        ) : null}
      </div>
    );
  }
  if (cell.kind === "warn") {
    return (
      <div className="flex flex-col items-center gap-1">
        <span
          aria-label="partially"
          className="text-yellow-400/80 text-base leading-none"
        >
          ⚠️
        </span>
        <span className="text-[10px] text-gray-500 text-center leading-tight">
          {cell.note}
        </span>
      </div>
    );
  }
  return (
    <span className="text-xs text-gray-300 text-center block">{cell.text}</span>
  );
}

export default function WhyUsComparison() {
  const { lang } = useLanguage();

  return (
    <section
      className="relative py-20 md:py-24 px-4 bg-gradient-to-br from-black via-gray-950 to-black overflow-hidden"
      aria-labelledby="why-us-heading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.06),transparent_60%)]" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
            <span className="text-amber-400 text-sm font-medium tracking-wider">
              {lang === "en" ? "✦ COMPARE YOUR OPTIONS" : "✦ COMPARÁ TUS OPCIONES"}
            </span>
          </div>
          <h2
            id="why-us-heading"
            className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight"
          >
            {lang === "en" ? "Why a private shuttle" : "Por qué un shuttle privado"}{" "}
            <span className="block bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent mt-2">
              {lang === "en"
                ? "beats every alternative"
                : "le gana a cualquier alternativa"}
            </span>
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            {lang === "en"
              ? "Honest side-by-side with rental cars, Uber, and public bus — including the hidden costs travelers don't see when booking."
              : "Comparación honesta vs alquilar carro, Uber y bus público — incluyendo los costos ocultos que no se ven al reservar."}
          </p>
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="overflow-x-auto"
        >
          <div className="min-w-[640px] md:min-w-0 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-gray-900/80 to-black overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-amber-500/5 border-b border-amber-500/20">
                <tr>
                  <th className="text-left p-4 text-gray-400 font-medium text-xs uppercase tracking-wider">
                    {lang === "en" ? "Feature" : "Característica"}
                  </th>
                  <th className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Sparkles size={18} className="text-amber-400" />
                      <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">
                        {lang === "en" ? "Our Shuttle" : "Nuestro Shuttle"}
                      </span>
                    </div>
                  </th>
                  <th className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1 opacity-70">
                      <Car size={18} className="text-gray-400" />
                      <span className="text-gray-400 font-medium text-xs uppercase tracking-wider">
                        {lang === "en" ? "Rental Car" : "Rent a Car"}
                      </span>
                    </div>
                  </th>
                  <th className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1 opacity-70">
                      <Smartphone size={18} className="text-gray-400" />
                      <span className="text-gray-400 font-medium text-xs uppercase tracking-wider">
                        Uber / inDriver
                      </span>
                    </div>
                  </th>
                  <th className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1 opacity-70">
                      <Bus size={18} className="text-gray-400" />
                      <span className="text-gray-400 font-medium text-xs uppercase tracking-wider">
                        {lang === "en" ? "Public Bus" : "Bus Público"}
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-white/5 last:border-0 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}
                  >
                    <td className="p-4 text-gray-300 font-medium">
                      {lang === "en" ? row.feature.en : row.feature.es}
                    </td>
                    <td className="p-4 text-center bg-amber-500/[0.04]">
                      <CellRender cell={row.shuttle} />
                    </td>
                    <td className="p-4 text-center">
                      <CellRender cell={row.rental} />
                    </td>
                    <td className="p-4 text-center">
                      <CellRender cell={row.uber} />
                    </td>
                    <td className="p-4 text-center">
                      <CellRender cell={row.bus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Closing note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-gray-500 text-xs mt-6 max-w-2xl mx-auto"
        >
          {lang === "en"
            ? "All-inclusive pricing means no surprises: insurance, fuel, tolls, water, WiFi and child seats are always included."
            : "Precio todo-incluido: seguro, combustible, peajes, agua, WiFi y sillas para niños siempre van incluidas."}
        </motion.p>

        {/* Trust indicators (relocated from the removed BenefitsSection
            so the social-proof row survives the section merge). */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-12"
        >
          {/* The two Google-sourced stats link out to the Google reviews
              page — both 5.0 ⭐ and the 190+ count are exactly what a
              skeptical visitor wants to verify, and they read clickable
              already. */}
          <a
            href={reviewStats.google.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-colors"
          >
            <span className="text-2xl">⭐</span>
            <span className="text-sm">
              <strong className="text-white">{reviewStats.google.rating.toFixed(1)}</strong>{" "}
              {lang === "en" ? "on Google Reviews" : "en Google Reviews"}
            </span>
          </a>

          <div className="w-px h-8 bg-white/10 hidden md:block" />

          <a
            href={reviewStats.google.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-colors"
          >
            <span className="text-2xl">🚐</span>
            <span className="text-sm">
              <strong className="text-white">{reviewStats.google.count}+</strong>{" "}
              {lang === "en" ? "happy travelers" : "viajeros felices"}
            </span>
          </a>

          <div className="w-px h-8 bg-white/10 hidden md:block" />

          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-2xl">🛡️</span>
            <span className="text-sm">
              <strong className="text-white">
                {lang === "en" ? "Insurance" : "Seguro"}
              </strong>{" "}
              {lang === "en" ? "included" : "incluido"}
            </span>
          </div>

          <div className="w-px h-8 bg-white/10 hidden md:block" />

          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-2xl">🇨🇷</span>
            <span className="text-sm">
              <strong className="text-white">100%</strong>{" "}
              {lang === "en" ? "Costa Rican" : "Costarricense"}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

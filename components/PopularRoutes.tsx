"use client";

import { motion } from "framer-motion";
import { Clock, ArrowRight, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";

type Route = {
  from: string;
  to: string;
  fromDb: string;
  toDb: string;
  priceFrom: number;
  duration: string;
  popular?: boolean;
};

const popularRoutes: Route[] = [
  { from: "SJO Airport", to: "La Fortuna", fromDb: "SJO - Juan Santamaria Int. Airport", toDb: "La Fortuna (Arenal)", priceFrom: 220, duration: "3h", popular: true },
  { from: "LIR Airport", to: "La Fortuna", fromDb: "LIR - Liberia Int. Airport", toDb: "La Fortuna (Arenal)", priceFrom: 225, duration: "3h", popular: true },
  { from: "La Fortuna", to: "Monteverde", fromDb: "La Fortuna (Arenal)", toDb: "Monteverde (Cloud Forest)", priceFrom: 245, duration: "4h", popular: true },
  { from: "La Fortuna", to: "Tamarindo", fromDb: "La Fortuna (Arenal)", toDb: "Tamarindo (Guanacaste)", priceFrom: 305, duration: "4h 30min" },
  { from: "La Fortuna", to: "Manuel Antonio", fromDb: "La Fortuna (Arenal)", toDb: "Manuel Antonio / Quepos", priceFrom: 320, duration: "5h 30min" },
  { from: "SJO Airport", to: "Manuel Antonio", fromDb: "SJO - Juan Santamaria Int. Airport", toDb: "Manuel Antonio / Quepos", priceFrom: 220, duration: "3h" },
  { from: "SJO Airport", to: "Puerto Viejo", fromDb: "SJO - Juan Santamaria Int. Airport", toDb: "Puerto Viejo (Caribbean Coast)", priceFrom: 310, duration: "4h 30min" },
  { from: "SJO Airport", to: "Tamarindo", fromDb: "SJO - Juan Santamaria Int. Airport", toDb: "Tamarindo (Guanacaste)", priceFrom: 335, duration: "5h" },
];

export default function PopularRoutes() {
  const { t, lang } = useLanguage();

  const scrollToQuote = (from?: string, to?: string) => {
    if (from && to) {
      const url = new URL(window.location.href);
      url.searchParams.set("from", from);
      url.searchParams.set("to", to);
      window.history.replaceState({}, "", url.toString());
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
    setTimeout(() => {
      const quoteSection = document.getElementById("cotizador");
      if (quoteSection) {
        quoteSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <section
      id="rutas"
      key={lang}
      className="relative py-24 px-4 bg-gradient-to-br from-black via-gray-950 to-black overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.08),transparent_70%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
            <span className="text-amber-400 text-sm font-medium tracking-wider">
              {t.routes.badge}
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            {t.routes.titlePart1}
            <span className="block bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              {t.routes.titlePart2}
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t.routes.subtitle}
          </p>
        </motion.div>

        {/* Grid de rutas - forzado con style inline */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {popularRoutes.map((route, index) => (
            <motion.button
              key={`${route.from}-${route.to}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              onClick={() => scrollToQuote(route.fromDb, route.toDb)}
              className="group relative text-left"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-500/0 to-amber-600/0 group-hover:from-amber-500/30 group-hover:to-amber-600/10 rounded-2xl blur-xl transition-all duration-500" />

              <div
                className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-5 hover:border-amber-500/40 transition-all duration-300"
                style={{ display: "flex", flexDirection: "column", height: "100%" }}
              >
                {/* Top */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.05))",
                      border: "1px solid rgba(245,158,11,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MapPin size={16} color="#fbbf24" strokeWidth={1.5} />
                  </div>

                  {route.popular && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        background: "rgba(245,158,11,0.2)",
                        border: "1px solid rgba(245,158,11,0.4)",
                        color: "#fbbf24",
                        fontSize: "9px",
                        fontWeight: 700,
                      }}
                    >
                      <Sparkles size={8} />
                      {t.routes.popular}
                    </span>
                  )}
                </div>

                {/* Ruta */}
                <div style={{ marginBottom: "12px", flexGrow: 1 }}>
                  <div style={{ color: "#fbbf24", fontWeight: 600, fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                    Private Shuttle
                  </div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: "14px", marginBottom: "6px", lineHeight: "1.2" }}>
                    {route.from}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "6px 0" }}>
                    <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, rgba(245,158,11,0.4), transparent)" }} />
                    <ArrowRight size={12} color="#fbbf24" />
                    <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, rgba(245,158,11,0.4), transparent)" }} />
                  </div>

                  <div style={{ color: "white", fontWeight: 700, fontSize: "14px", lineHeight: "1.2" }}>
                    {route.to}
                  </div>
                </div>

                {/* Meta info */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#9ca3af", marginBottom: "12px" }}>
                  <Clock size={10} color="rgba(245,158,11,0.7)" />
                  <span>{route.duration}</span>
                  <span style={{ color: "#4b5563" }}>·</span>
                  <span>{t.routes.private}</span>
                </div>

                {/* Precio y CTA */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "9px", color: "#6b7280", lineHeight: "1", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {t.routes.from}
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "#fbbf24", lineHeight: "1.2" }}>
                      ${route.priceFrom}
                    </div>
                  </div>
                  <span
                    className="group-hover:translate-x-1 transition-transform"
                    style={{
                      fontSize: "11px",
                      color: "#fbbf24",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>Book Now</span>
                    <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 mb-5">
            {t.routes.noDestination}{" "}
            <span className="text-amber-400 font-semibold">{t.routes.routesAvailable}</span>{" "}
            {t.routes.inCostaRica}
          </p>
          <Button
            onClick={() => scrollToQuote()}
            size="lg"
            className="h-14 px-8 bg-amber-500 hover:bg-amber-600 text-black font-bold shadow-2xl shadow-amber-500/30"
          >
            {t.routes.seeAll}
            <ArrowRight className="ml-2" size={18} />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

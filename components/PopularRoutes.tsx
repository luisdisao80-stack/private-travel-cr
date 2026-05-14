"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ArrowRight, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";

type Route = {
  from: string;
  to: string;
  slug: string;
  // Whether this slug lives under /private-shuttle/ (both endpoints popular)
  // or /routes/ (long-tail). Matches the routing in app/sitemap.ts.
  hub: "private-shuttle" | "routes";
  priceFrom: number;
  duration: string;
  popular?: boolean;
};

// Slugs verificados contra data/migration/new-route-slugs.txt
const popularRoutes: Route[] = [
  { from: "San Jose Airport", to: "La Fortuna", slug: "sjo-to-la-fortuna", hub: "private-shuttle", priceFrom: 220, duration: "3h", popular: true },
  { from: "Liberia Airport", to: "La Fortuna", slug: "lir-to-la-fortuna", hub: "private-shuttle", priceFrom: 225, duration: "3h", popular: true },
  { from: "La Fortuna", to: "Monteverde", slug: "la-fortuna-to-monteverde", hub: "private-shuttle", priceFrom: 245, duration: "4h", popular: true },
  { from: "La Fortuna", to: "Tamarindo", slug: "la-fortuna-to-tamarindo", hub: "private-shuttle", priceFrom: 305, duration: "4h 30min" },
  { from: "La Fortuna", to: "Manuel Antonio", slug: "la-fortuna-to-manuel-antonio", hub: "private-shuttle", priceFrom: 320, duration: "5h 30min" },
  { from: "San Jose Airport", to: "Manuel Antonio", slug: "sjo-to-manuel-antonio", hub: "private-shuttle", priceFrom: 220, duration: "3h" },
  { from: "San Jose Airport", to: "Puerto Viejo", slug: "sjo-to-puerto-viejo", hub: "private-shuttle", priceFrom: 310, duration: "4h 30min" },
  { from: "San Jose Airport", to: "Tamarindo", slug: "sjo-to-tamarindo", hub: "private-shuttle", priceFrom: 335, duration: "5h" },
];

export default function PopularRoutes() {
  const { t, lang } = useLanguage();

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

        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {popularRoutes.map((route, index) => (
            <motion.div
              key={route.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
            <Link
              href={`/${route.hub}/${route.slug}`}
              className="group relative text-left block"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-500/0 to-amber-600/0 group-hover:from-amber-500/30 group-hover:to-amber-600/10 rounded-2xl blur-xl transition-all duration-500" />

              <div className="relative flex h-full flex-col bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-5 hover:border-amber-500/40 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/30 flex items-center justify-center">
                    <MapPin size={16} className="text-amber-400" strokeWidth={1.5} />
                  </div>

                  {route.popular && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[9px] font-bold">
                      <Sparkles size={8} />
                      {t.routes.popular}
                    </span>
                  )}
                </div>

                <div className="mb-3 flex-1">
                  <div className="text-amber-400 font-semibold text-[10px] tracking-[0.08em] uppercase mb-2">
                    Private Shuttle
                  </div>
                  <div className="text-white font-bold text-sm leading-tight mb-1.5">
                    {route.from}
                  </div>

                  <div className="flex items-center gap-2 my-1.5">
                    <div className="flex-1 h-px bg-gradient-to-r from-amber-500/40 to-transparent" />
                    <ArrowRight size={12} className="text-amber-400" />
                    <div className="flex-1 h-px bg-gradient-to-l from-amber-500/40 to-transparent" />
                  </div>

                  <div className="text-white font-bold text-sm leading-tight">
                    {route.to}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-3">
                  <Clock size={10} className="text-amber-400/70" />
                  <span>{route.duration}</span>
                  <span className="text-gray-600">·</span>
                  <span>{t.routes.private}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <div className="text-[9px] text-gray-500 leading-none tracking-[0.05em] uppercase">
                      {t.routes.from}
                    </div>
                    <div className="text-xl font-bold text-amber-400 leading-tight">
                      ${route.priceFrom}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Book Now</span>
                    <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            </Link>
            </motion.div>
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
          <Link href="/routes">
            <Button
              size="lg"
              className="h-14 px-8 bg-amber-500 hover:bg-amber-600 text-black font-bold shadow-2xl shadow-amber-500/30"
            >
              {t.routes.seeAll}
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

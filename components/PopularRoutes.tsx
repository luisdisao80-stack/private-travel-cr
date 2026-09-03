"use client";

import Link from "next/link";
import { Clock, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import Price from "@/components/Price";
import type { HomeRoute } from "@/lib/routes-db";

/**
 * Las rutas ya no viven acá.
 *
 * Estaban escritas a mano, con precio y duración copiados de la base. Copiar un
 * dato garantiza que tarde o temprano se desactualiza: al corregir La Fortuna ↔
 * Monteverde a 3,5 H, la página de la ruta pasó a decir 3,5 H y esta tarjeta
 * siguió diciendo 4h — el sitio contradiciéndose solo. Ahora las manda la home
 * desde getTopRoutesForHome(), que las lee de `routes`.
 *
 * También se fue el badge de "popular". Marcaba 3 de 8 tarjetas; ahora las 17
 * son las que más venden, así que un badge en algunas no distingue nada.
 */
export default function PopularRoutes({ routes }: { routes: HomeRoute[] }) {
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
        <div className="reveal text-center mb-16">
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
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {routes.map((route, index) => (
            <div
              key={route.slug}
              className={`reveal reveal-d${Math.min(index + 1, 4)}`}
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
                      <Price usd={route.priceFrom} />
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Book Now</span>
                    <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            </Link>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="reveal mt-12 text-center">
          <p className="text-gray-400 mb-5">
            {t.routes.noDestination}{" "}
            <span className="text-white font-semibold">{t.routes.routesAvailable}</span>{" "}
            {t.routes.inCostaRica}
          </p>
          {/* In-content contextual link to the money landing page. Editorial
              body links carry more weight than the footer link, and the
              exact-keyword anchor ("private transportation in Costa Rica")
              reinforces the ranking signal for the generic queries that were
              stuck at position ~10 in GSC (2026-07). */}
          <p className="text-gray-400 mb-5 text-sm">
            {lang === "en" ? (
              <>
                Learn more about our{" "}
                <Link
                  href="/private-transportation-costa-rica"
                  className="text-amber-400 font-semibold underline-offset-4 hover:underline"
                >
                  private transportation in Costa Rica
                </Link>{" "}
                and{" "}
                <Link
                  href="/costa-rica-airport-transfers"
                  className="text-amber-400 font-semibold underline-offset-4 hover:underline"
                >
                  Costa Rica airport transfers
                </Link>{" "}
                — door-to-door private transfers from SJO &amp; LIR airports.
              </>
            ) : (
              <>
                Conocé más sobre nuestro{" "}
                <Link
                  href="/private-transportation-costa-rica"
                  className="text-amber-400 font-semibold underline-offset-4 hover:underline"
                >
                  transporte privado en Costa Rica
                </Link>{" "}
                y los{" "}
                <Link
                  href="/costa-rica-airport-transfers"
                  className="text-amber-400 font-semibold underline-offset-4 hover:underline"
                >
                  traslados desde el aeropuerto
                </Link>{" "}
                — traslados puerta a puerta desde los aeropuertos SJO y LIR.
              </>
            )}
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
        </div>
      </div>
    </section>
  );
}

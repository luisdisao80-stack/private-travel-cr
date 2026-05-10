"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, ArrowRight, Users, Clock } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import type { Route } from "@/lib/types";

interface Props {
  routes: Route[];
}

export default function RoutesPageClient({ routes }: Props) {
  const { lang } = useLanguage();
  const [search, setSearch] = useState("");

  const filteredRoutes = useMemo(() => {
    const tokens = search
      .toLowerCase()
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && t !== "to" && t !== "a");

    if (tokens.length === 0) return routes;

    return routes.filter((r) => {
      const haystack = `${r.origen} ${r.destino}`.toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    });
  }, [routes, search]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
            <span className="text-amber-400 text-sm font-medium tracking-wider">
              {lang === "en" ? "ALL ROUTES" : "TODAS LAS RUTAS"}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            {lang === "en" ? "Costa Rica" : "Rutas en"}{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              {lang === "en" ? "Shuttle Routes" : "Costa Rica"}
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {lang === "en"
              ? `Browse our ${routes.length}+ private shuttle routes. Door-to-door service with bilingual drivers.`
              : `Explora nuestras ${routes.length}+ rutas de shuttle privado. Puerta a puerta con choferes bilingües.`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 max-w-3xl mx-auto"
        >
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" />
            <input
              type="text"
              placeholder={lang === "en" ? "e.g. La Fortuna to Tamarindo" : "ej. La Fortuna a Tamarindo"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-amber-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition"
            />
          </div>
        </motion.div>

        <p className="text-center text-gray-400 text-sm mb-8">
          {lang === "en"
            ? `Showing ${filteredRoutes.length} routes`
            : `Mostrando ${filteredRoutes.length} rutas`}
        </p>

        {filteredRoutes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">
              {lang === "en" ? "No routes found. Try a different search." : "No se encontraron rutas. Probá otra búsqueda."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoutes.map((route, i) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.01, 0.5) }}
              >
                <Link
                  href={`/routes/${route.slug}`}
                  className="group block bg-gray-900/50 border border-amber-500/10 hover:border-amber-500/40 rounded-xl p-5 transition-all hover:bg-gray-900"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin size={16} className="text-amber-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium leading-tight truncate">{route.origen}</p>
                      <ArrowRight size={14} className="text-amber-400 my-1" />
                      <p className="text-white font-medium leading-tight truncate">{route.destino}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-amber-500/10">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {route.duracion && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {route.duracion}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        1-9
                      </span>
                    </div>
                    <div className="text-amber-400 font-bold">
                      ${route.precio1a6}
                      <span className="text-xs font-normal text-gray-500"> USD</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

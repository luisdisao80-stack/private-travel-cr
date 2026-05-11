"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  ArrowRight,
  Users,
  Clock,
  Shield,
  Wifi,
  Baby,
  Briefcase,
  Zap,
  Coffee,
  CheckCircle2,
  ExternalLink,
  Star,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useCart } from "@/lib/CartContext";
import type { Route } from "@/lib/types";
import { reviewStats } from "@/lib/reviews-data";
import { isPopularRoute } from "@/lib/popular-routes";
import GoogleGLogo from "@/components/GoogleGLogo";

interface Props {
  routes: Route[];
}

type LocationInputProps = {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  locations: string[];
};

function LocationInput({ value, onChange, placeholder, locations }: LocationInputProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (!value) return locations.slice(0, 8);
    const lv = value.toLowerCase();
    return locations.filter((l) => l.toLowerCase().includes(lv)).slice(0, 8);
  }, [value, locations]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative flex-1 min-w-0">
      <MapPin
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full pl-12 pr-9 py-4 bg-black/60 border border-amber-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 transition"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-xl leading-none"
        >
          ×
        </button>
      )}
      {open && suggestions.length > 0 && (
        <div className="absolute z-30 w-full mt-1 bg-gray-900 border border-amber-500/30 rounded-lg shadow-2xl max-h-72 overflow-y-auto">
          {suggestions.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => {
                onChange(loc);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-white hover:bg-amber-500/20 transition-colors text-sm"
            >
              {loc}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoutesPageClient({ routes }: Props) {
  const { lang } = useLanguage();
  const { items: cartItems } = useCart();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  const origenes = useMemo(
    () => Array.from(new Set(routes.map((r) => r.origen))).sort(),
    [routes]
  );
  const destinos = useMemo(
    () => Array.from(new Set(routes.map((r) => r.destino))).sort(),
    [routes]
  );

  const hasSearch = pickup.trim().length > 0 || dropoff.trim().length > 0;

  const filteredRoutes = useMemo(() => {
    if (!hasSearch) return [];
    const p = pickup.trim().toLowerCase();
    const d = dropoff.trim().toLowerCase();
    return routes.filter((r) => {
      const matchOrigen = !p || r.origen.toLowerCase().includes(p);
      const matchDestino = !d || r.destino.toLowerCase().includes(d);
      return matchOrigen && matchDestino;
    });
  }, [routes, pickup, dropoff, hasSearch]);

  const perks = lang === "en"
    ? [
        { icon: Shield, label: "Licensed & insured" },
        { icon: Users, label: "Private — just your group" },
        { icon: Baby, label: "Free child seats" },
        { icon: Briefcase, label: "Luggage included" },
        { icon: Wifi, label: "Free WiFi" },
        { icon: Zap, label: "Phone chargers" },
        { icon: Coffee, label: "Complimentary water" },
        { icon: CheckCircle2, label: "No hidden fees" },
      ]
    : [
        { icon: Shield, label: "Licenciados y asegurados" },
        { icon: Users, label: "Privado — solo tu grupo" },
        { icon: Baby, label: "Sillas para niños gratis" },
        { icon: Briefcase, label: "Equipaje incluido" },
        { icon: Wifi, label: "WiFi gratis" },
        { icon: Zap, label: "Cargadores de teléfono" },
        { icon: Coffee, label: "Agua de cortesía" },
        { icon: CheckCircle2, label: "Sin cargos ocultos" },
      ];

  return (
    <main className="min-h-screen bg-black">
      {/* HERO + SEARCH */}
      <section className="relative w-full overflow-hidden">
        <img
          src="https://privatecr2.imgix.net/principal.jpeg?auto=format,compress&cs=srgb&q=60&w=2000"
          alt="Costa Rica private shuttle"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black z-[1]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.18),transparent_60%)] z-[2]" />

        <div className="relative z-10 container mx-auto px-4 pt-24 pb-6 md:pt-24 md:pb-8">
          <div className="max-w-5xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.05] mb-4"
            >
              {lang === "en" ? "Private Shuttle Routes" : "Rutas de Shuttle Privado"}
              <span className="block bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent mt-1">
                {lang === "en" ? "in Costa Rica" : "en Costa Rica"}
              </span>
            </motion.h1>

            <motion.a
              href={reviewStats.google.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-black/60 border border-white/10 hover:border-amber-400/40 backdrop-blur-sm transition-colors mb-6"
            >
              <GoogleGLogo size={20} className="shrink-0" />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-white">
                <strong>{reviewStats.google.rating.toFixed(1)}</strong>{" "}
                {lang === "en" ? "on Google Reviews" : "en Google Reviews"}
              </span>
              <ExternalLink size={12} className="text-white/40" />
            </motion.a>

            {/* SEARCH CARD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-amber-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-black/50"
            >
              <h2 className="text-xl md:text-2xl font-bold text-white mb-5">
                {lang === "en" ? "Where are you headed?" : "¿A dónde vas?"}
              </h2>

              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2">
                <LocationInput
                  value={pickup}
                  onChange={setPickup}
                  placeholder={lang === "en" ? "Where from?" : "¿De dónde?"}
                  locations={origenes}
                />
                <ArrowRight size={20} className="text-amber-400 self-center hidden md:block shrink-0" />
                <LocationInput
                  value={dropoff}
                  onChange={setDropoff}
                  placeholder={lang === "en" ? "Where to?" : "¿A dónde?"}
                  locations={destinos}
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-5 pt-5 border-t border-white/5 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Zap size={12} className="text-amber-400" />
                  {lang === "en" ? "Stripe payment processor" : "Procesador de pagos Stripe"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield size={12} className="text-amber-400" />
                  {lang === "en" ? "Free cancellation" : "Cancelación gratis"}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-amber-400" />
                  {lang === "en" ? "No hidden fees" : "Sin cargos ocultos"}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SEARCH RESULTS — only visible when searching */}
      {hasSearch && (
        <section className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-5xl mx-auto">
            <p className="text-amber-400 text-sm font-bold tracking-wider uppercase mb-6">
              {lang === "en"
                ? `${filteredRoutes.length} ${filteredRoutes.length === 1 ? "route" : "routes"} found`
                : `${filteredRoutes.length} ${filteredRoutes.length === 1 ? "ruta encontrada" : "rutas encontradas"}`}
            </p>

            {filteredRoutes.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400">
                  {lang === "en"
                    ? "No routes found. Try a different search."
                    : "No se encontraron rutas. Probá otra búsqueda."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredRoutes.map((route, i) => (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
                    className="relative bg-gradient-to-br from-gray-900/95 to-black/95 border border-amber-500/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                      {/* Left: route + duration */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                          style={{ width: "44px", height: "44px" }}
                          className="rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0"
                        >
                          <MapPin size={18} className="text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base md:text-lg font-bold text-white leading-tight">
                            {route.origen} <span className="text-amber-400">→</span>{" "}
                            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                              {route.destino}
                            </span>
                          </h3>
                          {route.duracion && (
                            <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400">
                              <Clock size={11} />
                              {route.duracion}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: price */}
                      <div className="md:text-right shrink-0">
                        <div className="text-[10px] text-gray-400 uppercase tracking-[0.18em]">
                          {lang === "en" ? "From" : "Desde"}
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-white leading-none">
                          ${route.precio1a6}
                          <span className="text-xs text-gray-400 font-normal ml-1">USD</span>
                        </div>
                        <div className="text-[10px] text-amber-400 mt-0.5">
                          {lang === "en" ? "All taxes included" : "Todos los impuestos incluidos"}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 pt-5 border-t border-white/5 flex flex-col sm:flex-row gap-2.5">
                      <Link
                        href={`/book?from=${encodeURIComponent(route.origen)}&to=${encodeURIComponent(route.destino)}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm transition-colors shadow shadow-amber-500/20"
                      >
                        {lang === "en" ? "Book Now" : "Reservar"}
                        <ArrowRight size={14} />
                      </Link>
                      <Link
                        href={
                          isPopularRoute(route.origen, route.destino)
                            ? `/private-shuttle/${route.slug}`
                            : `/routes/${route.slug}`
                        }
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-colors"
                      >
                        {lang === "en" ? "View route details" : "Ver detalles"}
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* INCLUDED IN EVERY SHUTTLE */}
      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase">
              {lang === "en" ? "Included in every shuttle" : "Incluido en cada shuttle"}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 tracking-tight">
              {lang === "en" ? "Everything you need." : "Todo lo que necesitás."}
              <span className="block bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                {lang === "en" ? "Nothing extra to pay." : "Sin pagar nada extra."}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {perks.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-gray-900/40 border border-white/5 hover:border-amber-500/30 transition-colors"
              >
                <div
                  style={{ width: "44px", height: "44px" }}
                  className="rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0"
                >
                  <Icon size={20} className="text-amber-400" strokeWidth={1.75} />
                </div>
                <span className="text-white text-sm md:text-base font-medium leading-tight">
                  {label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* READY TO BOOK — only when there are search results */}
      {hasSearch && filteredRoutes.length > 0 && (
        <section className="container mx-auto px-4 pb-10 md:pb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-3xl p-8 md:p-10"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {lang === "en" ? "Ready to book?" : "¿Listo para reservar?"}
            </h3>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              {lang === "en"
                ? "Get an instant quote and complete your booking in minutes."
                : "Obtené una cotización al instante y completá tu reserva en minutos."}
            </p>
            <Link
              href={
                cartItems.length > 0
                  ? "/book?checkout=1"
                  : `/book?from=${encodeURIComponent(pickup)}&to=${encodeURIComponent(dropoff)}`
              }
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-base shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all"
            >
              {lang === "en" ? "Continue to booking" : "Continuar con la reserva"}
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </section>
      )}
    </main>
  );
}

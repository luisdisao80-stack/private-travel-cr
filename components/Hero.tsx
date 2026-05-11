"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Star, ExternalLink, Shield, Zap, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { reviewStats } from "@/lib/reviews-data";
import GoogleGLogo from "@/components/GoogleGLogo";
import LocationInput from "@/components/LocationInput";
import RoutePricePreview from "@/components/RoutePricePreview";

type Props = {
  locations: string[];
};

export default function Hero({ locations }: Props) {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  const canContinue = pickup.trim().length > 0 && dropoff.trim().length > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    router.push(
      `/book?from=${encodeURIComponent(pickup)}&to=${encodeURIComponent(dropoff)}`
    );
  };

  return (
    <section className="relative min-h-[85vh] md:min-h-screen w-full flex items-center justify-center overflow-hidden">
      <img
        src="https://privatecr2.imgix.net/principal.jpeg?auto=format,compress&cs=srgb&q=60&w=2000"
        alt="Costa Rica"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90 z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.25),transparent_50%)] z-[2]" />

      <div className="relative z-10 container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-[1.1]"
          >
            {t.hero.titlePart1}
            <span className="block bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent mt-1 md:mt-2">
              {t.hero.titlePart2}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base md:text-2xl text-gray-200 mb-3 md:mb-4 max-w-2xl mx-auto leading-relaxed px-2"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.a
            href={reviewStats.google.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="inline-flex items-center gap-4 px-7 py-4 rounded-full bg-black/60 border border-white/10 hover:border-amber-400/40 backdrop-blur-sm transition-colors mb-8 shadow-2xl shadow-black/40"
          >
            <GoogleGLogo size={32} className="shrink-0" />
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={20} className="fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 text-base md:text-lg font-bold text-white">
                  {reviewStats.google.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs md:text-sm text-gray-300">
                <strong className="text-white">{reviewStats.google.count}+</strong> Google Reviews
              </span>
            </div>
            <ExternalLink size={14} className="text-white/40" />
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-amber-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-black/50 text-left"
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-5 text-center">
              {lang === "en" ? "Where are you headed?" : "¿A dónde vas?"}
            </h2>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2">
              <LocationInput
                value={pickup}
                onChange={setPickup}
                placeholder={lang === "en" ? "Where from?" : "¿De dónde?"}
                locations={locations}
              />
              <ArrowRight size={20} className="text-amber-400 self-center hidden md:block shrink-0" />
              <LocationInput
                value={dropoff}
                onChange={setDropoff}
                placeholder={lang === "en" ? "Where to?" : "¿A dónde?"}
                locations={locations}
              />
            </div>

            <RoutePricePreview from={pickup} to={dropoff} />

            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 h-12 md:h-14 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm md:text-base shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {lang === "en" ? "Continue to booking" : "Continuar con la reserva"}
              <ArrowRight size={18} />
            </button>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-5 pt-5 border-t border-white/5 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Zap size={12} className="text-amber-400" />
                {lang === "en" ? "Instant pricing" : "Precio al instante"}
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
  );
}

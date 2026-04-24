"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowDown, MessageCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function Hero() {
  const { t, lang } = useLanguage();

  const scrollToQuote = () => {
    const quoteSection = document.getElementById("cotizador");
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openWhatsApp = () => {
    const greetingMsg =
      lang === "en"
        ? "Hello! I'm interested in your private transportation service in Costa Rica."
        : "¡Hola! Me interesa su servicio de transporte privado en Costa Rica.";
    window.open(
      "https://wa.me/50686334133?text=" + encodeURIComponent(greetingMsg),
      "_blank"
    );
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <img
        src="https://privatecr2.imgix.net/principal.jpeg?auto=format,compress&cs=srgb&q=60&w=2000"
        alt="Costa Rica"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90 z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.25),transparent_50%)] z-[2]" />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 backdrop-blur-sm mb-8"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-amber-400 text-sm font-medium tracking-wide">
              {t.hero.badge}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-[1.1]"
          >
            {t.hero.titlePart1}
            <span className="block bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent mt-2">
              {t.hero.titlePart2}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-200 mb-4 max-w-2xl mx-auto leading-relaxed"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-base md:text-lg text-gray-400 mb-10 max-w-xl mx-auto"
          >
            {t.hero.features}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              onClick={scrollToQuote}
              size="lg"
              className="h-14 px-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-base shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all w-full sm:w-auto"
            >
              {t.hero.ctaQuote}
              <ArrowDown className="ml-2 animate-bounce" size={18} />
            </Button>

            <Button
              onClick={openWhatsApp}
              size="lg"
              variant="outline"
              className="h-14 px-8 border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm font-semibold text-base w-full sm:w-auto"
            >
              <MessageCircle className="mr-2" size={18} />
              {t.hero.ctaWhatsapp}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16 grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-400">5★</div>
              <div className="text-xs md:text-sm text-gray-400 mt-1">TripAdvisor</div>
            </div>
            <div className="text-center border-x border-white/10">
              <div className="text-3xl md:text-4xl font-bold text-amber-400">24/7</div>
              <div className="text-xs md:text-sm text-gray-400 mt-1">{t.hero.statAvailable}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-400">100%</div>
              <div className="text-xs md:text-sm text-gray-400 mt-1">
                {lang === "en" ? "On-Time" : "Puntualidad"}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-xs tracking-widest">{t.hero.scroll}</span>
          <ArrowDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  );
}

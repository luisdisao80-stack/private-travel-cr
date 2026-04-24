"use client";

import { motion } from "framer-motion";
import { Check, Crown, ArrowRight, Sparkles, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";

export default function ServiceComparison() {
  const { t } = useLanguage();

  const scrollToQuote = (service: "standard" | "vip") => {
    const event = new CustomEvent("set-service-type", { detail: service });
    window.dispatchEvent(event);
    const quoteSection = document.getElementById("cotizador");
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Iconos especiales para los primeros 3 features del VIP
  const vipIcons = [Clock, MapPin, Sparkles, Check, Check, Check];

  return (
    <section
      id="servicios"
      className="relative py-24 px-4 bg-gradient-to-br from-black via-gray-950 to-black overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.1),transparent_60%)]" />

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
              {t.services.badge}
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            {t.services.titlePart1}
            <span className="block bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              {t.services.titlePart2}
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t.services.subtitle}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch">
          {/* STANDARD CARD */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex"
          >
            <div className="w-full flex flex-col bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-300">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 self-start">
                <span className="text-gray-300 text-xs font-medium tracking-wider">
                  {t.services.standard.badge}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-4xl font-bold text-white mb-3">{t.services.standard.name}</h3>
              <p className="text-gray-400 mb-6">
                {t.services.standard.description}
              </p>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-white/10">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  {t.services.standard.priceLabel}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">$90</span>
                  <span className="text-gray-400">USD</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t.services.standard.priceNote}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8 flex-grow">
                {t.services.standard.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} className="text-white" />
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button
                onClick={() => scrollToQuote("standard")}
                size="lg"
                variant="outline"
                className="w-full h-14 border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold mt-auto"
              >
                {t.services.standard.cta}
                <ArrowRight className="ml-2" size={18} />
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                {t.services.standard.ideal}
              </p>
            </div>
          </motion.div>

          {/* VIP CARD */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative flex"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl opacity-30 blur-2xl" />

            <div className="relative w-full flex flex-col bg-gradient-to-br from-amber-500/10 via-gray-900 to-black border-2 border-amber-500/50 rounded-3xl p-8 transition-all duration-300">
              {/* Badge MOST POPULAR */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-black text-xs font-bold tracking-wider shadow-lg whitespace-nowrap">
                {t.services.vip.badgePopular}
              </div>

              {/* Badge top */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 mb-6 self-start">
                <Crown size={12} className="text-amber-400" />
                <span className="text-amber-400 text-xs font-bold tracking-wider">
                  {t.services.vip.badgeTop}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-4xl font-bold text-white mb-3 flex items-center gap-2">
                {t.services.vip.name}
                <Crown size={28} className="text-amber-400" />
              </h3>
              <p className="text-gray-300 mb-6">
                {t.services.vip.description}
              </p>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-amber-500/20">
                <div className="text-xs text-amber-400 uppercase tracking-wider mb-1">
                  {t.services.vip.priceLabel}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                    $160
                  </span>
                  <span className="text-gray-400">USD</span>
                </div>
                <p className="text-xs text-amber-400/80 mt-1">
                  {t.services.vip.priceNote}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8 flex-grow">
                {t.services.vip.features.map((feature, idx) => {
                  const IconComp = vipIcons[idx];
                  const isHighlighted = idx < 3;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <IconComp size={12} className="text-amber-400" />
                      </div>
                      <span className={isHighlighted ? "text-white" : "text-gray-300"}>
                        <strong>{feature.label}</strong>
                        {feature.sub && (
                          <span className="text-gray-400"> {feature.sub}</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <Button
                onClick={() => scrollToQuote("vip")}
                size="lg"
                className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-base shadow-2xl shadow-amber-500/40 mt-auto"
              >
                {t.services.vip.cta}
                <Crown className="ml-2" size={18} />
              </Button>

              <p className="text-xs text-amber-400/70 text-center mt-4">
                {t.services.vip.ideal}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 text-sm">
            {t.services.notSure}{" "}
            <a
              href="https://wa.me/50686334133"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              {t.services.chatWhatsapp}
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

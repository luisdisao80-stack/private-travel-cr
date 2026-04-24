"use client";

import { motion } from "framer-motion";
import { DoorOpen, Users, Handshake, Headphones } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function BenefitsSection() {
  const { t } = useLanguage();

  // Mapeo de iconos en el orden correcto
  const icons = [DoorOpen, Users, Handshake, Headphones];

  return (
    <section
      id="beneficios"
      className="relative py-24 px-4 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden"
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
              {t.benefits.badge}
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            {t.benefits.titlePart1}
            <span className="block bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              {t.benefits.titlePart2}
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t.benefits.subtitle}
          </p>
        </motion.div>

        {/* Grid de beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.benefits.items.map((benefit, index) => {
            const Icon = icons[index];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                {/* Glow on hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-500/0 to-amber-600/0 group-hover:from-amber-500/30 group-hover:to-amber-600/10 rounded-2xl blur-xl transition-all duration-500 pointer-events-none" />

                <div className="relative h-full bg-gradient-to-br from-gray-900/80 to-black border border-white/5 rounded-2xl p-6 hover:border-amber-500/40 transition-all duration-300">
                  {/* Icon container */}
                  <div
                    style={{ width: "56px", height: "56px" }}
                    className="rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/5 border border-amber-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                  >
                    <Icon size={28} className="text-amber-400" strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3">
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {benefit.description}
                  </p>

                  {/* Accent line */}
                  <div className="mt-5 h-0.5 w-12 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-6 md:gap-12"
        >
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-2xl">⭐</span>
            <span className="text-sm">
              <strong className="text-white">5.0</strong> {t.benefits.trust.google}
            </span>
          </div>

          <div className="w-px h-8 bg-white/10 hidden md:block" />

          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-2xl">🚐</span>
            <span className="text-sm">
              <strong className="text-white">190+</strong> {t.benefits.trust.travelers}
            </span>
          </div>

          <div className="w-px h-8 bg-white/10 hidden md:block" />

          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-2xl">🛡️</span>
            <span className="text-sm">
              <strong className="text-white">{t.benefits.trust.insurance}</strong>{" "}
              {t.benefits.trust.insuranceLabel}
            </span>
          </div>

          <div className="w-px h-8 bg-white/10 hidden md:block" />

          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-2xl">🇨🇷</span>
            <span className="text-sm">
              <strong className="text-white">100%</strong> {t.benefits.trust.costaRican}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

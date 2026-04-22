"use client";

import { motion } from "framer-motion";
import { DoorOpen, Users, Handshake, Headphones } from "lucide-react";

type Benefit = {
  icon: React.ElementType;
  title: string;
  description: string;
};

const benefits: Benefit[] = [
  {
    icon: DoorOpen,
    title: "Puerta a Puerta",
    description:
      "Te recogemos exactamente donde estés y te llevamos directo a tu destino. Sin paradas innecesarias, sin desvíos.",
  },
  {
    icon: Users,
    title: "100% Privado",
    description:
      "Tu propio vehículo con chofer dedicado solo para ti y tu grupo. Sin compartir con desconocidos, total privacidad.",
  },
  {
    icon: Handshake,
    title: "Meet & Greet",
    description:
      "Tu chofer te recibe con un cartel con tu nombre y te ayuda con el equipaje. Llegada sin estrés garantizada.",
  },
  {
    icon: Headphones,
    title: "Soporte 24/7",
    description:
      "Estamos disponibles antes, durante y después de tu viaje. Responde rápido vía WhatsApp a cualquier hora.",
  },
];

export default function BenefitsSection() {
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
              ✦ POR QUÉ ELEGIRNOS
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Por qué los viajeros
            <span className="block bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              nos prefieren
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Más que un shuttle, una experiencia premium diseñada para que tu viaje
            por Costa Rica empiece sin estrés.
          </p>
        </motion.div>

        {/* Grid de beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
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
                  {/* Icon container - CUADRADO PEQUEÑO */}
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
              <strong className="text-white">5.0</strong> en Google Reviews
            </span>
          </div>

          <div className="w-px h-8 bg-white/10 hidden md:block" />

          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-2xl">🚐</span>
            <span className="text-sm">
              <strong className="text-white">190+</strong> viajeros satisfechos
            </span>
          </div>

          <div className="w-px h-8 bg-white/10 hidden md:block" />

          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-2xl">🛡️</span>
            <span className="text-sm">
              <strong className="text-white">Seguros</strong> incluidos
            </span>
          </div>

          <div className="w-px h-8 bg-white/10 hidden md:block" />

          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-2xl">🇨🇷</span>
            <span className="text-sm">
              <strong className="text-white">100%</strong> costarricense
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

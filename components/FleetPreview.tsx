"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users, ArrowRight, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";

export default function FleetPreview() {
  const { t, lang } = useLanguage();

  const vehicles = [
    {
      id: "staria",
      name: "Hyundai Staria",
      model: "Premium SUV",
      paxRange: `1 - 5 ${t.fleet.paxLabel}`,
      image: "/staria.webp",
      priceFrom: 90,
      badge: t.fleet.mostPopular,
    },
    {
      id: "hiace",
      name: "Toyota Hiace",
      model: "High Roof Van",
      paxRange: `6 - 9 ${t.fleet.paxLabel}`,
      image: "/hiace.png",
      priceFrom: 120,
      badge: t.fleet.largeGroups,
    },
    {
      id: "maxus",
      name: "Maxus V90",
      model: "Executive Van",
      paxRange: `10 - 12 ${t.fleet.paxLabel}`,
      image: "/maxus-v90.webp",
      priceFrom: 180,
      badge: lang === "en" ? "XL GROUPS" : "GRUPOS XL",
    },
  ];

  return (
    <section
      id="flota"
      key={lang}
      className="relative py-24 px-4 bg-gradient-to-br from-gray-950 via-black to-gray-950 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.1),transparent_60%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
            <span className="text-amber-400 text-sm font-medium tracking-wider">
              {t.fleet.badge}
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            {t.fleet.titlePart1}
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              {" "}{t.fleet.titlePart2}
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t.fleet.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href="/fleet" className="group block">
                <div className="relative bg-gradient-to-br from-gray-900 to-black border border-amber-500/20 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-500">

                  <div className="relative h-48 md:h-56 overflow-hidden bg-white p-4">
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />

                    {vehicle.badge && (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-bold tracking-wider shadow-lg">
                        {vehicle.badge}
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10">
                      <Users size={14} className="text-amber-400" />
                      <span className="text-white text-sm font-medium">{vehicle.paxRange}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-amber-400 text-xs tracking-widest font-medium mb-1">
                      {vehicle.model.toUpperCase()}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                      {vehicle.name}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">
                          {t.fleet.from}
                        </div>
                        <div className="text-2xl font-bold text-white">
                          ${vehicle.priceFrom}
                          <span className="text-sm text-gray-400 font-normal ml-1">USD</span>
                        </div>
                      </div>

                      <span className="text-amber-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        {lang === "en" ? "View details" : "Ver detalles"}
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-8 mx-auto max-w-3xl rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-center"
        >
          <p className="text-sm md:text-base text-gray-300">
            {lang === "en"
              ? "Traveling with more than 12 passengers? Contact us for a custom quote:"
              : "¿Viajan más de 12 personas? Contáctanos para una cotización personalizada:"}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/50686334133"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors text-sm font-medium"
            >
              <MessageCircle size={14} />
              WhatsApp
            </a>
            <a
              href="mailto:info@privatetravelcr.com"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors text-sm font-medium"
            >
              <Mail size={14} />
              info@privatetravelcr.com
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Link href="/fleet">
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold h-12 px-8">
              {lang === "en" ? "View Full Fleet" : "Ver Toda la Flota"}
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

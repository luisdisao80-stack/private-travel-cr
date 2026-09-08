"use client";

import { motion } from "framer-motion";
import { Users, Wifi, Droplet, Snowflake, Package, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import Price from "@/components/Price";

export default function FleetSection() {
  const { t, lang } = useLanguage();

  const scrollToQuote = () => {
    const quoteSection = document.getElementById("cotizador");
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Datos de vehiculos con descripciones bilingues
  const vehicleCards = [
    {
      id: "staria",
      name: "Hyundai Staria",
      model: "Premium SUV",
      paxRange: `1 - 5 ${t.fleet.paxLabel}`,
      image: "/staria.webp",
      description: t.fleet.stariaDesc,
      priceFrom: 90,
      badge: t.fleet.mostPopular,
      features: [
        { icon: <Snowflake size={16} />, label: lang === "en" ? "Premium A/C" : "A/C Premium" },
        { icon: <Wifi size={16} />, label: lang === "en" ? "Onboard WiFi" : "WiFi a bordo" },
        { icon: <Droplet size={16} />, label: lang === "en" ? "Free water" : "Agua gratis" },
        { icon: <Package size={16} />, label: lang === "en" ? "Large luggage" : "Gran equipaje" },
      ],
    },
    {
      id: "hiace",
      name: "Toyota Hiace",
      model: "High Roof Van",
      paxRange: `6 - 9 ${t.fleet.paxLabel}`,
      image: "/hiace.png",
      description: t.fleet.hiaceDesc,
      priceFrom: 120,
      badge: t.fleet.largeGroups,
      features: [
        { icon: <Snowflake size={16} />, label: lang === "en" ? "Dual A/C" : "A/C Dual" },
        { icon: <Wifi size={16} />, label: lang === "en" ? "Onboard WiFi" : "WiFi a bordo" },
        { icon: <Droplet size={16} />, label: lang === "en" ? "Free water" : "Agua gratis" },
        { icon: <Package size={16} />, label: lang === "en" ? "Large capacity" : "Gran capacidad" },
      ],
    },
  ];

  return (
    <section
      id="flota"
      key={lang}
      className="relative py-24 px-4 bg-slate-50 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.1),transparent_60%)]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(245,158,11,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.5) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 border border-slate-200 mb-4">
            <span className="text-orange-600 text-sm font-medium tracking-wider">
              {t.fleet.badge}
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-blue-900 mb-4 tracking-tight">
            {t.fleet.titlePart1}
            <span className="text-orange-600">
              {" "}{t.fleet.titlePart2}
            </span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            {t.fleet.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {vehicleCards.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-orange-600 rounded-3xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />

              <div className="relative bg-white border border-slate-200 rounded-3xl overflow-hidden group-hover:border-orange-300 transition-all duration-500">
                <div className="relative h-56 md:h-72 overflow-hidden bg-white p-4">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                  />

                  {vehicle.badge && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-orange-600 text-white text-xs font-bold tracking-wider shadow-lg">
                      {vehicle.badge}
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/20">
                    <Users size={14} className="text-orange-600" />
                    <span className="text-white text-sm font-medium">{vehicle.paxRange}</span>
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-5">
                  <div>
                    <div className="text-orange-600 text-xs tracking-widest font-medium mb-1">
                      {vehicle.model.toUpperCase()}
                    </div>
                    <h3 className="text-3xl font-bold text-blue-900">{vehicle.name}</h3>
                  </div>

                  <p className="text-slate-500 leading-relaxed">{vehicle.description}</p>

                  <div className="grid grid-cols-2 gap-3 py-4 border-y border-slate-200">
                    {vehicle.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-600 text-sm">
                        <span className="text-orange-600">{feature.icon}</span>
                        <span>{feature.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">
                        {t.fleet.from}
                      </div>
                      <div className="text-3xl font-bold text-blue-900">
                        <Price usd={vehicle.priceFrom} />
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {lang === "en" ? "Taxes included" : "Impuestos incluidos"}
                      </div>
                    </div>

                    <Button
                      onClick={scrollToQuote}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 px-6 shadow-lg shadow-orange-600/25"
                    >
                      {t.fleet.cta}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-6 px-6 py-4 bg-orange-50 border border-slate-200 rounded-full">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Check size={16} className="text-orange-600" />
              <span>{t.fleet.guarantees}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

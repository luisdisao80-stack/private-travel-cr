"use client";

import { motion } from "framer-motion";
import { Users, Wifi, Droplet, Snowflake, Package, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type VehicleCard = {
  id: string;
  name: string;
  model: string;
  paxRange: string;
  image: string;
  description: string;
  priceFrom: number;
  features: { icon: React.ReactNode; label: string }[];
  badge?: string;
};

const vehicleCards: VehicleCard[] = [
  {
    id: "staria",
    name: "Hyundai Staria",
    model: "Premium SUV",
    paxRange: "1 - 5 Pasajeros",
    image: "/staria.webp",
    description: "Viaje ultra cómodo con tecnología de vanguardia y amplio espacio para equipaje. Ideal para parejas, familias pequeñas y grupos de hasta 5 personas.",
    priceFrom: 90,
    badge: "MÁS POPULAR",
    features: [
      { icon: <Snowflake size={16} />, label: "A/C Premium" },
      { icon: <Wifi size={16} />, label: "WiFi a bordo" },
      { icon: <Droplet size={16} />, label: "Agua gratis" },
      { icon: <Package size={16} />, label: "Gran equipaje" },
    ],
  },
  {
    id: "hiace",
    name: "Toyota Hiace",
    model: "High Roof Van",
    paxRange: "6 - 9 Pasajeros",
    image: "/hiace.png",
    description: "Opción de techo alto que garantiza máxima libertad y visibilidad panorámica. Perfecta para grupos grandes y familias numerosas.",
    priceFrom: 117,
    badge: "GRUPOS GRANDES",
    features: [
      { icon: <Snowflake size={16} />, label: "A/C Dual" },
      { icon: <Wifi size={16} />, label: "WiFi a bordo" },
      { icon: <Droplet size={16} />, label: "Agua gratis" },
      { icon: <Package size={16} />, label: "Gran capacidad" },
    ],
  },
];

export default function FleetSection() {
  const scrollToQuote = () => {
    const quoteSection = document.getElementById("cotizador");
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="flota" className="relative py-24 px-4 bg-gradient-to-br from-gray-950 via-black to-gray-950 overflow-hidden">
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
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
            <span className="text-amber-400 text-sm font-medium tracking-wider">✦ NUESTRA FLOTA</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Vehículos
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent"> Premium</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Modernos, cómodos y equipados con todo lo necesario para que disfrutes el viaje desde el primer kilómetro.
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
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />

              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-amber-500/20 rounded-3xl overflow-hidden group-hover:border-amber-500/50 transition-all duration-500">
                <div className="relative h-64 md:h-80 overflow-hidden bg-gray-900">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {vehicle.badge && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-bold tracking-wider shadow-lg">
                      {vehicle.badge}
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10">
                    <Users size={14} className="text-amber-400" />
                    <span className="text-white text-sm font-medium">{vehicle.paxRange}</span>
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-5">
                  <div>
                    <div className="text-amber-400 text-xs tracking-widest font-medium mb-1">
                      {vehicle.model.toUpperCase()}
                    </div>
                    <h3 className="text-3xl font-bold text-white">{vehicle.name}</h3>
                  </div>

                  <p className="text-gray-400 leading-relaxed">{vehicle.description}</p>

                  <div className="grid grid-cols-2 gap-3 py-4 border-y border-white/5">
                    {vehicle.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                        <span className="text-amber-400">{feature.icon}</span>
                        <span>{feature.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Desde</div>
                      <div className="text-3xl font-bold text-white">
                        ${vehicle.priceFrom}
                        <span className="text-sm text-gray-400 font-normal ml-1">USD</span>
                      </div>
                    </div>

                    <Button
                      onClick={scrollToQuote}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold h-12 px-6 shadow-lg shadow-amber-500/30"
                    >
                      Cotizar
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
          <div className="inline-flex flex-wrap items-center justify-center gap-6 px-6 py-4 bg-amber-500/5 border border-amber-500/20 rounded-full">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Check size={16} className="text-amber-400" />
              <span>Flota renovada</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-amber-400/50" />
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Check size={16} className="text-amber-400" />
              <span>Revisión técnica al día</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-amber-400/50" />
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Check size={16} className="text-amber-400" />
              <span>Seguros incluidos</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

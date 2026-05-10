"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Wifi, Droplet, Snowflake, Package, Check, ArrowRight, Mountain, Shield, Star, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { useLanguage } from "@/lib/LanguageContext";

export default function FleetPage() {
  const { t, lang } = useLanguage();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">

        {/* HERO */}
        <section className="relative pt-32 pb-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.15),transparent_60%)]" />

          <div className="relative z-10 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
                <span className="text-amber-400 text-sm font-medium tracking-wider">
                  {lang === "en" ? "OUR FLEET" : "NUESTRA FLOTA"}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                {lang === "en" ? "Modern vehicles," : "Vehículos modernos,"}{" "}
                <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                  {lang === "en" ? "total comfort" : "comodidad total"}
                </span>
              </h1>

              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                {lang === "en"
                  ? "Premium vehicles for groups of 1 to 12 passengers. Air-conditioned, comfortable, and always driven by professional bilingual drivers."
                  : "Vehículos premium para grupos de 1 a 12 pasajeros. Aire acondicionado, cómodos y siempre con choferes profesionales bilingües."}
              </p>
            </motion.div>

          </div>
        </section>

        {/* STARIA */}
        <section className="py-16 px-4 border-t border-amber-500/10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid lg:grid-cols-2 gap-10 items-center"
            >
              {/* Foto */}
              <div className="relative bg-white rounded-2xl p-6 border border-amber-500/20">
                <img
                  src="/staria.webp"
                  alt="Hyundai Staria - Private Travel Costa Rica"
                  className="w-full h-auto object-contain"
                />
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-bold tracking-wider shadow-lg">
                  {lang === "en" ? "MOST POPULAR" : "MÁS POPULAR"}
                </div>
              </div>

              {/* Info */}
              <div>
                <div className="text-amber-400 text-xs tracking-widest font-medium mb-2">
                  PREMIUM SUV
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">Hyundai Staria</h2>

                <div className="flex items-center gap-2 mb-6">
                  <Users size={18} className="text-amber-400" />
                  <span className="text-white font-medium">1 - 5 {lang === "en" ? "passengers" : "pasajeros"}</span>
                </div>

                <p className="text-gray-400 leading-relaxed mb-6">
                  {lang === "en"
                    ? "Our flagship vehicle. Spacious, comfortable, and equipped with everything a traveler needs. Perfect for couples, families, or small groups exploring Costa Rica in style."
                    : "Nuestro vehículo insignia. Espacioso, cómodo y equipado con todo lo que un viajero necesita. Perfecto para parejas, familias o grupos pequeños que exploran Costa Rica con estilo."}
                </p>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-3 mb-6 py-4 border-y border-white/5">
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Snowflake size={16} className="text-amber-400" />
                    <span>{lang === "en" ? "Premium A/C" : "A/C Premium"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Wifi size={16} className="text-amber-400" />
                    <span>{lang === "en" ? "Onboard WiFi" : "WiFi a bordo"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Droplet size={16} className="text-amber-400" />
                    <span>{lang === "en" ? "Free water" : "Agua gratis"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Package size={16} className="text-amber-400" />
                    <span>{lang === "en" ? "Large luggage" : "Gran equipaje"}</span>
                  </div>
                </div>

                {/* Tech specs */}
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6">
                  <h4 className="text-white font-semibold mb-3 text-sm">
                    {lang === "en" ? "Technical specifications" : "Especificaciones técnicas"}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === "en" ? "Year:" : "Año:"}</span>
                      <span className="text-gray-300">2023+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === "en" ? "Type:" : "Tipo:"}</span>
                      <span className="text-gray-300">SUV</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === "en" ? "Seats:" : "Asientos:"}</span>
                      <span className="text-gray-300">5 + {lang === "en" ? "driver" : "chofer"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === "en" ? "Luggage:" : "Equipaje:"}</span>
                      <span className="text-gray-300">5 {lang === "en" ? "large" : "grandes"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">
                      {lang === "en" ? "Starting from" : "Desde"}
                    </div>
                    <div className="text-3xl font-bold text-white">
                      $90 <span className="text-sm text-gray-400 font-normal">USD</span>
                    </div>
                  </div>

                  <Link href="/book">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold h-12 px-6">
                      {lang === "en" ? "Get a Quote" : "Cotizar"}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* HIACE */}
        <section className="py-16 px-4 border-t border-amber-500/10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid lg:grid-cols-2 gap-10 items-center"
            >
              {/* Info (orden invertido en desktop) */}
              <div className="lg:order-2">
                <div className="text-amber-400 text-xs tracking-widest font-medium mb-2">
                  HIGH ROOF VAN
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">Toyota Hiace</h2>

                <div className="flex items-center gap-2 mb-6">
                  <Users size={18} className="text-amber-400" />
                  <span className="text-white font-medium">6 - 9 {lang === "en" ? "passengers" : "pasajeros"}</span>
                </div>

                <p className="text-gray-400 leading-relaxed mb-6">
                  {lang === "en"
                    ? "Designed for larger groups. Toyota Hiace offers ample space, comfortable high-roof seating, and reliability for longer journeys. The trusted choice for family reunions, wedding parties, or business groups."
                    : "Diseñada para grupos más grandes. La Toyota Hiace ofrece amplio espacio, asientos cómodos con techo alto y confiabilidad para trayectos largos. La elección confiable para reuniones familiares, bodas o grupos de negocios."}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6 py-4 border-y border-white/5">
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Snowflake size={16} className="text-amber-400" />
                    <span>{lang === "en" ? "Dual A/C" : "A/C Dual"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Wifi size={16} className="text-amber-400" />
                    <span>{lang === "en" ? "Onboard WiFi" : "WiFi a bordo"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Droplet size={16} className="text-amber-400" />
                    <span>{lang === "en" ? "Free water" : "Agua gratis"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Package size={16} className="text-amber-400" />
                    <span>{lang === "en" ? "Large capacity" : "Gran capacidad"}</span>
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6">
                  <h4 className="text-white font-semibold mb-3 text-sm">
                    {lang === "en" ? "Technical specifications" : "Especificaciones técnicas"}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === "en" ? "Year:" : "Año:"}</span>
                      <span className="text-gray-300">2022+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === "en" ? "Type:" : "Tipo:"}</span>
                      <span className="text-gray-300">Van</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === "en" ? "Seats:" : "Asientos:"}</span>
                      <span className="text-gray-300">9 + {lang === "en" ? "driver" : "chofer"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === "en" ? "Luggage:" : "Equipaje:"}</span>
                      <span className="text-gray-300">9 {lang === "en" ? "large" : "grandes"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">
                      {lang === "en" ? "Starting from" : "Desde"}
                    </div>
                    <div className="text-3xl font-bold text-white">
                      $117 <span className="text-sm text-gray-400 font-normal">USD</span>
                    </div>
                  </div>

                  <Link href="/book">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold h-12 px-6">
                      {lang === "en" ? "Get a Quote" : "Cotizar"}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Foto */}
              <div className="relative bg-white rounded-2xl p-6 border border-amber-500/20 lg:order-1">
                <img
                  src="/hiace.png"
                  alt="Toyota Hiace - Private Travel Costa Rica"
                  className="w-full h-auto object-contain"
                />
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-bold tracking-wider shadow-lg">
                  {lang === "en" ? "LARGE GROUPS" : "GRUPOS GRANDES"}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* MAXUS V90 */}
        <section className="py-16 px-4 border-t border-amber-500/10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid lg:grid-cols-2 gap-10 items-center"
            >
              {/* Foto */}
              <div className="relative bg-white rounded-2xl p-6 border border-amber-500/20">
                <img
                  src="/maxus-v90.jpg"
                  alt="Maxus V90 - Private Travel Costa Rica"
                  className="w-full h-auto object-contain"
                />
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-bold tracking-wider shadow-lg">
                  {lang === "en" ? "XL GROUPS" : "GRUPOS XL"}
                </div>
              </div>

              {/* Info */}
              <div>
                <div className="text-amber-400 text-xs tracking-widest font-medium mb-2">
                  EXECUTIVE VAN
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">Maxus V90</h2>

                <div className="flex items-center gap-2 mb-6">
                  <Users size={18} className="text-amber-400" />
                  <span className="text-white font-medium">10 - 12 {lang === "en" ? "passengers" : "pasajeros"}</span>
                </div>

                <p className="text-gray-400 leading-relaxed mb-6">
                  {lang === "en"
                    ? "Our largest vehicle. The Maxus V90 is built for big groups — extended families, corporate teams, or wedding parties. Spacious cabin, panoramic windows, and modern executive comfort throughout the journey."
                    : "Nuestro vehículo más grande. La Maxus V90 está hecha para grupos grandes — familias extendidas, equipos corporativos o bodas. Cabina espaciosa, ventanas panorámicas y comodidad ejecutiva moderna durante todo el viaje."}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6 py-4 border-y border-white/5">
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Snowflake size={16} className="text-amber-400" />
                    <span>{lang === "en" ? "Dual A/C" : "A/C Dual"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Wifi size={16} className="text-amber-400" />
                    <span>{lang === "en" ? "Onboard WiFi" : "WiFi a bordo"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Droplet size={16} className="text-amber-400" />
                    <span>{lang === "en" ? "Free water" : "Agua gratis"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Package size={16} className="text-amber-400" />
                    <span>{lang === "en" ? "XL luggage" : "Equipaje XL"}</span>
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6">
                  <h4 className="text-white font-semibold mb-3 text-sm">
                    {lang === "en" ? "Technical specifications" : "Especificaciones técnicas"}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === "en" ? "Year:" : "Año:"}</span>
                      <span className="text-gray-300">2023+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === "en" ? "Type:" : "Tipo:"}</span>
                      <span className="text-gray-300">{lang === "en" ? "Executive Van" : "Van Ejecutiva"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === "en" ? "Seats:" : "Asientos:"}</span>
                      <span className="text-gray-300">12 + {lang === "en" ? "driver" : "chofer"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === "en" ? "Luggage:" : "Equipaje:"}</span>
                      <span className="text-gray-300">12 {lang === "en" ? "large" : "grandes"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">
                      {lang === "en" ? "Starting from" : "Desde"}
                    </div>
                    <div className="text-3xl font-bold text-white">
                      $180 <span className="text-sm text-gray-400 font-normal">USD</span>
                    </div>
                  </div>

                  <Link href="/book">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold h-12 px-6">
                      {lang === "en" ? "Get a Quote" : "Cotizar"}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 12+ CONTACT NOTE */}
        <section className="py-10 px-4 border-t border-amber-500/10">
          <div className="max-w-3xl mx-auto rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-center">
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
          </div>
        </section>

        {/* COMPARATIVA */}
        <section className="py-16 px-4 border-t border-amber-500/10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {lang === "en" ? "Which one is right for you?" : "¿Cuál es para vos?"}
              </h2>
              <p className="text-gray-400">
                {lang === "en"
                  ? "Quick comparison to help you choose."
                  : "Comparación rápida para ayudarte a elegir."}
              </p>
            </motion.div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-amber-500/20 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-4 text-sm">
                {/* Headers */}
                <div className="p-4 border-b border-amber-500/20">
                  <span className="text-gray-500 text-xs uppercase tracking-wider">
                    {lang === "en" ? "Feature" : "Característica"}
                  </span>
                </div>
                <div className="p-4 border-b border-amber-500/20 text-center">
                  <span className="text-amber-400 font-bold">Staria</span>
                </div>
                <div className="p-4 border-b border-amber-500/20 text-center">
                  <span className="text-amber-400 font-bold">Hiace</span>
                </div>
                <div className="p-4 border-b border-amber-500/20 text-center">
                  <span className="text-amber-400 font-bold">Maxus V90</span>
                </div>

                {/* Filas */}
                {[
                  { label: lang === "en" ? "Passengers" : "Pasajeros", staria: "1-5", hiace: "6-9", maxus: "10-12" },
                  { label: lang === "en" ? "Vehicle type" : "Tipo de vehículo", staria: "SUV", hiace: "Van", maxus: lang === "en" ? "Executive Van" : "Van Ejecutiva" },
                  { label: lang === "en" ? "Air conditioning" : "Aire acondicionado", staria: "Premium", hiace: "Dual", maxus: "Dual" },
                  { label: lang === "en" ? "Luggage capacity" : "Capacidad de equipaje", staria: lang === "en" ? "Large" : "Grande", hiace: lang === "en" ? "Extra large" : "Extra grande", maxus: "XL" },
                  { label: lang === "en" ? "Best for" : "Mejor para", staria: lang === "en" ? "Couples, families" : "Parejas, familias", hiace: lang === "en" ? "Large groups" : "Grupos grandes", maxus: lang === "en" ? "XL groups, events" : "Grupos XL, eventos" },
                  { label: lang === "en" ? "Starting price" : "Precio desde", staria: "$90", hiace: "$117", maxus: "$180" },
                ].map((row, i) => (
                  <div key={i} className="contents">
                    <div className="p-4 border-b border-white/5 text-gray-400">{row.label}</div>
                    <div className="p-4 border-b border-white/5 text-center text-white font-medium">{row.staria}</div>
                    <div className="p-4 border-b border-white/5 text-center text-white font-medium">{row.hiace}</div>
                    <div className="p-4 border-b border-white/5 text-center text-white font-medium">{row.maxus}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* WHY PTCR */}
        <section className="py-16 px-4 border-t border-amber-500/10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {lang === "en" ? "What makes our fleet different" : "Qué hace diferente a nuestra flota"}
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Mountain size={32} />,
                  title: lang === "en" ? "Built for Costa Rica" : "Hechos para Costa Rica",
                  text: lang === "en"
                    ? "Vehicles selected to handle our roads — from highways to mountain routes."
                    : "Vehículos seleccionados para nuestras rutas — de carreteras a montañas.",
                },
                {
                  icon: <Shield size={32} />,
                  title: lang === "en" ? "Always insured" : "Siempre asegurados",
                  text: lang === "en"
                    ? "Full insurance on every trip. Your safety and peace of mind come first."
                    : "Seguro completo en cada viaje. Tu seguridad y tranquilidad primero.",
                },
                {
                  icon: <Star size={32} />,
                  title: lang === "en" ? "Spotless condition" : "Impecables",
                  text: lang === "en"
                    ? "Cleaned and inspected before every ride. Modern fleet, never old."
                    : "Limpios e inspeccionados antes de cada viaje. Flota moderna, nunca vieja.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-gradient-to-br from-gray-900 to-black border border-amber-500/20 rounded-2xl p-6"
                >
                  <div className="text-amber-400 mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20 px-4 border-t border-amber-500/10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-amber-500/5 border border-amber-500/30 rounded-2xl p-8 md:p-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {lang === "en" ? "Ready to ride in comfort?" : "¿Listo para viajar cómodo?"}
              </h2>
              <p className="text-gray-400 mb-6 text-lg">
                {lang === "en"
                  ? "Get your private shuttle quote in seconds. Door-to-door service from SJO and LIR airports."
                  : "Cotizá tu shuttle privado en segundos. Servicio puerta a puerta desde aeropuertos SJO y LIR."}
              </p>
              <Link href="/book">
                <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold h-14 px-10 text-lg">
                  {lang === "en" ? "Get Quote Now" : "Cotizar Ahora"}
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

      </main>
      <WhatsAppFloat />
      <Footer />
    </>
  );
}

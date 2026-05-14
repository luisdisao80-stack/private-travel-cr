"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Users, MapPin, Calendar, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useLanguage } from "@/lib/LanguageContext";

export default function ContactForm() {
  const { t, lang } = useLanguage();

  // Opciones de ruta segun idioma
  const routeOptions = lang === "en"
    ? [
        "San Jose Airport → La Fortuna",
        "San Jose Airport → Manuel Antonio",
        "San Jose Airport → Monteverde",
        "San Jose Airport → Tamarindo",
        "Liberia Airport → La Fortuna",
        "Liberia Airport → Tamarindo",
        "Liberia Airport → Monteverde",
        "La Fortuna → Monteverde",
        "La Fortuna → Manuel Antonio",
        "La Fortuna → Tamarindo",
        "Other route (I'll detail it in the message)",
      ]
    : [
        "San Jose Airport → La Fortuna",
        "San Jose Airport → Manuel Antonio",
        "San Jose Airport → Monteverde",
        "San Jose Airport → Tamarindo",
        "Liberia Airport → La Fortuna",
        "Liberia Airport → Tamarindo",
        "Liberia Airport → Monteverde",
        "La Fortuna → Monteverde",
        "La Fortuna → Manuel Antonio",
        "La Fortuna → Tamarindo",
        "Otra ruta (la detallo en el mensaje)",
      ];

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    whatsapp: "",
    pasajeros: "2",
    ruta: "",
    fecha: "",
    servicio: "standard",
    mensaje: "",
  });

  const [sent, setSent] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.email || !formData.ruta || !formData.fecha) {
      return;
    }

    // Mensaje de WhatsApp bilingue segun el idioma activo
    let mensajeTexto = "";

    if (lang === "en") {
      const servicioTexto = formData.servicio === "vip" ? "VIP (stops + drinks + snacks)" : "Standard";
      const passengerLabel = parseInt(formData.pasajeros) === 1 ? "person" : "people";

      mensajeTexto =
        `Hello Private Travel CR!\n\n` +
        `I want to request a quote for a private shuttle.\n\n` +
        `*Name:* ${formData.nombre}\n` +
        `*Email:* ${formData.email}\n` +
        (formData.whatsapp ? `*WhatsApp:* ${formData.whatsapp}\n` : "") +
        `*Travelers:* ${formData.pasajeros} ${passengerLabel}\n` +
        `*Route:* ${formData.ruta}\n` +
        `*Date:* ${formData.fecha}\n` +
        `*Service:* ${servicioTexto}\n` +
        (formData.mensaje ? `\n*Additional details:*\n${formData.mensaje}\n` : "") +
        `\nWhat would the price and availability be? Thank you!`;
    } else {
      const servicioTexto = formData.servicio === "vip" ? "VIP (con paradas + bebidas + snacks)" : "Standard";
      const passengerLabel = parseInt(formData.pasajeros) === 1 ? "persona" : "personas";

      mensajeTexto =
        `¡Hola Private Travel CR!\n\n` +
        `Quiero cotizar un shuttle privado.\n\n` +
        `*Nombre:* ${formData.nombre}\n` +
        `*Email:* ${formData.email}\n` +
        (formData.whatsapp ? `*WhatsApp:* ${formData.whatsapp}\n` : "") +
        `*Viajeros:* ${formData.pasajeros} ${passengerLabel}\n` +
        `*Ruta:* ${formData.ruta}\n` +
        `*Fecha:* ${formData.fecha}\n` +
        `*Servicio:* ${servicioTexto}\n` +
        (formData.mensaje ? `\n*Detalles adicionales:*\n${formData.mensaje}\n` : "") +
        `\n¿Cuál sería el precio y la disponibilidad? ¡Gracias!`;
    }

    const mensaje = encodeURIComponent(mensajeTexto);

    window.open(`https://wa.me/50686334133?text=${mensaje}`, "_blank");
    setSent(true);

    setTimeout(() => setSent(false), 5000);
  };

  return (
    <section
      id="contacto"
      key={lang}
      className="relative py-24 px-4 bg-gradient-to-br from-black via-gray-950 to-black overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.08),transparent_70%)]" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
            <span className="text-amber-400 text-sm font-medium tracking-wider">
              {t.contact.badge}
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            {t.contact.titlePart1}
            <span className="block bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              {t.contact.titlePart2}
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t.contact.subtitle}
          </p>
        </motion.div>

        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="relative bg-gradient-to-br from-gray-900/80 to-black border-2 border-amber-500/20 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Fila 1: Nombre y Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-amber-400 flex items-center gap-1.5">
                    <User size={14} />
                    {t.contact.name} *
                  </Label>
                  <Input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => handleChange("nombre", e.target.value)}
                    placeholder={t.contact.namePlaceholder}
                    className="bg-black/50 border-amber-500/30 text-white h-12 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-amber-400 flex items-center gap-1.5">
                    <Mail size={14} />
                    {t.contact.email} *
                  </Label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="your@email.com"
                    className="bg-black/50 border-amber-500/30 text-white h-12 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Fila 2: WhatsApp y Pasajeros */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-amber-400 flex items-center gap-1.5">
                    <Phone size={14} />
                    {t.contact.whatsapp}
                  </Label>
                  <Input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    placeholder="+1 555-123-4567"
                    className="bg-black/50 border-amber-500/30 text-white h-12 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-amber-400 flex items-center gap-1.5">
                    <Users size={14} />
                    {t.contact.travelers} *
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={9}
                    required
                    value={formData.pasajeros}
                    onChange={(e) => handleChange("pasajeros", e.target.value)}
                    className="bg-black/50 border-amber-500/30 text-white h-12 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Fila 3: Ruta y Fecha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-amber-400 flex items-center gap-1.5">
                    <MapPin size={14} />
                    {t.contact.route} *
                  </Label>
                  <Select value={formData.ruta} onValueChange={(val) => handleChange("ruta", val)}>
                    <SelectTrigger className="bg-black/50 border-amber-500/30 text-white h-12 focus:border-amber-500">
                      <SelectValue placeholder={t.contact.routePlaceholder} />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-amber-500/30">
                      {routeOptions.map((route) => (
                        <SelectItem key={route} value={route} className="text-white hover:bg-amber-500/10">
                          {route}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-amber-400 flex items-center gap-1.5">
                    <Calendar size={14} />
                    {t.contact.date} *
                  </Label>
                  <DatePicker
                    value={formData.fecha}
                    onChange={(iso) => handleChange("fecha", iso)}
                    lang={lang === "es" ? "es" : "en"}
                  />
                </div>
              </div>

              {/* Tipo de servicio */}
              <div className="space-y-2">
                <Label className="text-amber-400 flex items-center gap-1.5">
                  ✨ {t.contact.serviceType}
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange("servicio", "standard")}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      formData.servicio === "standard"
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-gray-700 bg-black/40 hover:border-gray-600"
                    }`}
                  >
                    <div className="text-white font-bold text-sm">Standard</div>
                    <div className="text-xs text-gray-400">{t.contact.standardDesc}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange("servicio", "vip")}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      formData.servicio === "vip"
                        ? "border-amber-500 bg-gradient-to-br from-amber-500/20 to-amber-600/10"
                        : "border-gray-700 bg-black/40 hover:border-gray-600"
                    }`}
                  >
                    <div className="text-white font-bold text-sm flex items-center gap-1.5">
                      👑 VIP
                    </div>
                    <div className="text-xs text-gray-400">{t.contact.vipDesc}</div>
                  </button>
                </div>
              </div>

              {/* Mensaje */}
              <div className="space-y-2">
                <Label className="text-amber-400 flex items-center gap-1.5">
                  <MessageSquare size={14} />
                  {t.contact.additionalDetails}
                </Label>
                <textarea
                  value={formData.mensaje}
                  onChange={(e) => handleChange("mensaje", e.target.value)}
                  placeholder={t.contact.detailsPlaceholder}
                  rows={4}
                  className="w-full px-4 py-3 rounded-md bg-black/50 border border-amber-500/30 text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              {/* Info de privacidad */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <CheckCircle2 size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400">
                  {t.contact.privacyNote}
                </p>
              </div>

              {/* Botón */}
              <Button
                type="submit"
                disabled={sent}
                className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg shadow-2xl shadow-amber-500/30 disabled:opacity-70"
              >
                {sent ? (
                  <>
                    <CheckCircle2 className="mr-2" size={20} />
                    {t.contact.opening}
                  </>
                ) : (
                  <>
                    <Send className="mr-2" size={18} />
                    {t.contact.sendWhatsapp}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Alternativas de contacto */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400 text-sm mb-4">{t.contact.directContact}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://wa.me/50686334133"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors text-sm"
              >
                <Phone size={14} />
                WhatsApp: +506 8633-4133
              </a>
              <a
                href="mailto:info@privatetravelcr.com"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors text-sm"
              >
                <Mail size={14} />
                info@privatetravelcr.com
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

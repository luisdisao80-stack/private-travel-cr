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
import { getMinPickupCRDate } from "@/lib/booking-rules";

type ContactFormProps = {
  /** When true, render only the form fields — no wrapping <section>, no
   *  header. Use when the form is being embedded inside a larger layout
   *  that has its own hero/title (e.g. the new /contact page). */
  embedded?: boolean;
};

export default function ContactForm({ embedded = false }: ContactFormProps) {
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
      className={
        embedded
          ? ""
          : "relative py-24 px-4 bg-white overflow-hidden"
      }
    >
      {!embedded && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.08),transparent_70%)]" />
      )}

      <div className={embedded ? "" : "relative z-10 max-w-4xl mx-auto"}>
        {!embedded && (
          /* Header — only in standalone mode. The embedded parent has its
             own hero with the same intent. */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 border border-slate-200 mb-4">
              <span className="text-orange-600 text-sm font-medium tracking-wider">
                {t.contact.badge}
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-blue-900 mb-4 tracking-tight">
              {t.contact.titlePart1}
              <span className="block text-orange-600">
                {t.contact.titlePart2}
              </span>
            </h2>

            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              {t.contact.subtitle}
            </p>
          </motion.div>
        )}

        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div
            className={
              embedded
                ? "relative"
                : "relative bg-white shadow-sm border-2 border-slate-200 rounded-3xl p-8 backdrop-blur-sm shadow-2xl"
            }
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Fila 1: Nombre y Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-orange-600 flex items-center gap-1.5">
                    <User size={14} />
                    {t.contact.name} *
                  </Label>
                  <Input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => handleChange("nombre", e.target.value)}
                    placeholder={t.contact.namePlaceholder}
                    className="bg-white border-slate-300 text-slate-900 h-12 focus:border-orange-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-orange-600 flex items-center gap-1.5">
                    <Mail size={14} />
                    {t.contact.email} *
                  </Label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="your@email.com"
                    className="bg-white border-slate-300 text-slate-900 h-12 focus:border-orange-600"
                  />
                </div>
              </div>

              {/* Fila 2: WhatsApp y Pasajeros */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-orange-600 flex items-center gap-1.5">
                    <Phone size={14} />
                    {t.contact.whatsapp}
                  </Label>
                  <Input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    placeholder="+1 555-123-4567"
                    className="bg-white border-slate-300 text-slate-900 h-12 focus:border-orange-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-orange-600 flex items-center gap-1.5">
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
                    className="bg-white border-slate-300 text-slate-900 h-12 focus:border-orange-600"
                  />
                </div>
              </div>

              {/* Fila 3: Ruta y Fecha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-orange-600 flex items-center gap-1.5">
                    <MapPin size={14} />
                    {t.contact.route} *
                  </Label>
                  <Select value={formData.ruta} onValueChange={(val) => handleChange("ruta", val)}>
                    <SelectTrigger className="bg-white border-slate-300 text-slate-900 h-12 focus:border-orange-600">
                      <SelectValue placeholder={t.contact.routePlaceholder} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {routeOptions.map((route) => (
                        <SelectItem key={route} value={route} className="text-slate-700 hover:bg-orange-50">
                          {route}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-orange-600 flex items-center gap-1.5">
                    <Calendar size={14} />
                    {t.contact.date} *
                  </Label>
                  <DatePicker
                    value={formData.fecha}
                    onChange={(iso) => handleChange("fecha", iso)}
                    lang={lang === "es" ? "es" : "en"}
                    // Block past dates in the calendar. Without this the
                    // visitor could pick yesterday and fire a WhatsApp
                    // message with an impossible date. Using the same
                    // 12h-lead-time helper as the booking form so the two
                    // pickers stay in sync.
                    minDate={getMinPickupCRDate()}
                  />
                </div>
              </div>

              {/* Tipo de servicio */}
              <div className="space-y-2">
                <Label className="text-orange-600 flex items-center gap-1.5">
                  ✨ {t.contact.serviceType}
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange("servicio", "standard")}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      formData.servicio === "standard"
                        ? "border-orange-600 bg-orange-50"
                        : "border-slate-300 bg-white hover:border-slate-400"
                    }`}
                  >
                    <div className="text-blue-900 font-bold text-sm">Standard</div>
                    <div className="text-xs text-slate-500">{t.contact.standardDesc}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange("servicio", "vip")}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      formData.servicio === "vip"
                        ? "border-orange-600 bg-gradient-to-br from-orange-100 to-amber-600/10"
                        : "border-slate-300 bg-white hover:border-slate-400"
                    }`}
                  >
                    <div className="text-blue-900 font-bold text-sm flex items-center gap-1.5">
                      👑 VIP
                    </div>
                    <div className="text-xs text-slate-500">{t.contact.vipDesc}</div>
                  </button>
                </div>
              </div>

              {/* Mensaje */}
              <div className="space-y-2">
                <Label className="text-orange-600 flex items-center gap-1.5">
                  <MessageSquare size={14} />
                  {t.contact.additionalDetails}
                </Label>
                <textarea
                  value={formData.mensaje}
                  onChange={(e) => handleChange("mensaje", e.target.value)}
                  placeholder={t.contact.detailsPlaceholder}
                  rows={4}
                  className="w-full px-4 py-3 rounded-md bg-white border border-slate-300 text-slate-900 focus:border-orange-600 focus:outline-none resize-none"
                />
              </div>

              {/* Info de privacidad */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-slate-200">
                <CheckCircle2 size={14} className="text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500">
                  {t.contact.privacyNote}
                </p>
              </div>

              {/* Botón */}
              <Button
                type="submit"
                disabled={sent}
                className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg shadow-2xl shadow-orange-600/25 disabled:opacity-70"
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

          {/* Alternativas de contacto — only shown in standalone mode. In
              embedded mode, the parent page surfaces these as the 3 hero
              cards at the top, so showing them again would be redundant. */}
          {!embedded && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-slate-500 text-sm mb-4">{t.contact.directContact}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://wa.me/50686334133"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-600/40 text-green-700 hover:bg-green-100 transition-colors text-sm"
              >
                <Phone size={14} />
                WhatsApp: +506 8633-4133
              </a>
              <a
                href="mailto:info@privatetravelcr.com"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-slate-200 text-orange-600 hover:bg-orange-50 transition-colors text-sm"
              >
                <Mail size={14} />
                info@privatetravelcr.com
              </a>
            </div>
          </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

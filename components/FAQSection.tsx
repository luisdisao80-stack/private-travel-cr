"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

type FAQ = {
  question: string;
  answer: string;
};

const faqsEs: FAQ[] = [
  {
    question: "¿Es seguro viajar con Private Travel CR?",
    answer:
      "Absolutamente. Nuestra flota está compuesta por vehículos nuevos, con revisión técnica al día y seguros completos. Todos nuestros choferes son profesionales bilingües con años de experiencia manejando en Costa Rica. Contamos con más de 190 reseñas de 5 estrellas en Google que respaldan nuestro servicio.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos pago con tarjeta de crédito de forma segura. Al confirmar tu reserva por WhatsApp, te enviamos el link de pago para procesar la transacción. Es rápido, seguro y puedes pagar desde cualquier parte del mundo antes de tu viaje.",
  },
  {
    question: "¿Qué pasa si mi vuelo se retrasa o se cancela?",
    answer:
      "No te preocupes. Al hacer tu reserva te pedimos tu número de vuelo y monitoreamos su estado en tiempo real. Si tu vuelo se retrasa, ajustamos automáticamente la hora de recogida sin costo extra. Si se cancela, reagendamos tu servicio para la nueva fecha.",
  },
  {
    question: "¿Puedo cancelar mi reserva?",
    answer:
      "Sí. Ofrecemos cancelación gratuita con 48 horas de anticipación al viaje. Simplemente escríbenos por WhatsApp al +506 8633-4133 y procesamos tu cancelación sin complicaciones. Queremos que reserves con total tranquilidad.",
  },
  {
    question: "¿Ofrecen sillas para niños?",
    answer:
      "Sí, ofrecemos sillas para niños completamente gratis bajo solicitud. Solo indícanos al reservar la edad y cantidad de niños que viajarán, y preparamos el vehículo con las sillas apropiadas. La seguridad de tu familia es nuestra prioridad.",
  },
  {
    question: "¿Con cuánto tiempo debo reservar?",
    answer:
      "Recomendamos reservar con al menos 24 horas de anticipación para garantizar disponibilidad, especialmente en temporada alta (diciembre a abril). Para reservas de último minuto, contáctanos por WhatsApp y haremos todo lo posible por ayudarte.",
  },
  {
    question: "¿Cuánto equipaje puedo llevar?",
    answer:
      "Cada pasajero puede llevar una maleta grande y un equipaje de mano sin costo adicional. Si viajas con equipo especial (tablas de surf, bicicletas, equipo de buceo), avísanos al reservar para confirmar el espacio disponible en el vehículo correcto.",
  },
  {
    question: "¿Pueden hacer paradas durante el viaje?",
    answer:
      "¡Por supuesto! Paradas cortas (baño, café, fotos) están incluidas sin costo. Si quieres una experiencia más completa con paradas turísticas de 1-2 horas (cataratas, cafetales, miradores), te recomendamos nuestro servicio VIP por solo $80 extra, que incluye paradas flexibles, bebidas y snacks.",
  },
  {
    question: "¿El precio es por persona o por vehículo?",
    answer:
      "El precio es por VEHÍCULO completo, no por persona. Esto significa que viajas en privado con tu grupo, sin compartir con desconocidos. Hasta 5 pasajeros van en Hyundai Staria y de 6 a 9 pasajeros en Toyota Hiace, al mismo precio.",
  },
  {
    question: "¿Cuál es la diferencia entre Standard y VIP?",
    answer:
      "El Standard es un traslado directo, rápido y cómodo. El VIP (+$80) incluye 1-2 horas de parada turística flexible, Welcome Kit con cervezas locales, sodas, aguas y snacks, WiFi a bordo, cargadores y servicio Concierge donde tu chofer te recomienda los mejores lugares. Perfecto para lunas de miel o viajes especiales.",
  },
];

const faqsEn: FAQ[] = [
  {
    question: "Is it safe to travel with Private Travel CR?",
    answer:
      "Absolutely. Our fleet consists of new vehicles with up-to-date technical inspections and full insurance coverage. All our drivers are professional bilingual drivers with years of experience driving in Costa Rica. We have over 190 5-star reviews on Google that back up our service.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept secure credit card payments. When you confirm your booking via WhatsApp, we send you a payment link to process the transaction. It's fast, secure, and you can pay from anywhere in the world before your trip.",
  },
  {
    question: "What happens if my flight is delayed or cancelled?",
    answer:
      "Don't worry. When you book, we ask for your flight number and monitor its status in real time. If your flight is delayed, we automatically adjust the pickup time at no extra cost. If it's cancelled, we reschedule your service for the new date.",
  },
  {
    question: "Can I cancel my reservation?",
    answer:
      "Yes. We offer free cancellation up to 48 hours before your trip. Just message us on WhatsApp at +506 8633-4133 and we'll process your cancellation hassle-free. We want you to book with total peace of mind.",
  },
  {
    question: "Do you offer child seats?",
    answer:
      "Yes, we offer child seats completely free upon request. Just let us know the age and number of children traveling when you book, and we'll prepare the vehicle with the appropriate seats. Your family's safety is our priority.",
  },
  {
    question: "How far in advance should I book?",
    answer:
      "We recommend booking at least 24 hours in advance to guarantee availability, especially during high season (December to April). For last-minute bookings, contact us via WhatsApp and we'll do our best to help you.",
  },
  {
    question: "How much luggage can I bring?",
    answer:
      "Each passenger can bring one large suitcase and one carry-on at no additional cost. If you're traveling with special equipment (surfboards, bicycles, diving gear), let us know when booking to confirm available space in the right vehicle.",
  },
  {
    question: "Can you make stops during the trip?",
    answer:
      "Of course! Short stops (restroom, coffee, photos) are included at no cost. If you want a more complete experience with 1-2 hour tourist stops (waterfalls, coffee plantations, lookout points), we recommend our VIP service for just $80 extra, which includes flexible stops, drinks, and snacks.",
  },
  {
    question: "Is the price per person or per vehicle?",
    answer:
      "The price is per COMPLETE VEHICLE, not per person. This means you travel privately with your group, without sharing with strangers. Up to 5 passengers go in the Hyundai Staria and 6 to 9 passengers in the Toyota Hiace, at the same price.",
  },
  {
    question: "What's the difference between Standard and VIP?",
    answer:
      "Standard is a direct, fast, and comfortable transfer. VIP (+$80) includes 1-2 hours of flexible tourist stops, a Welcome Kit with local beers, sodas, water and snacks, onboard WiFi, chargers, and Concierge service where your driver recommends the best places. Perfect for honeymoons or special trips.",
  },
];

export default function FAQSection() {
  const { t, lang } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = lang === "en" ? faqsEn : faqsEs;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Mensaje y URL de WhatsApp segun idioma
  const whatsappMessage =
    lang === "en"
      ? encodeURIComponent("Hello! I have a question about the service")
      : encodeURIComponent("Hola! Tengo una pregunta sobre el servicio");

  return (
    <section
      id="faq"
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
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
            <span className="text-amber-400 text-sm font-medium tracking-wider">
              {t.faq.badge}
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            {t.faq.titlePart1}
            <span className="block bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              {t.faq.titlePart2}
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t.faq.subtitle}
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group"
            >
              <div
                className={`bg-gradient-to-br from-gray-900/80 to-black border rounded-2xl transition-all duration-300 ${
                  openIndex === index
                    ? "border-amber-500/40"
                    : "border-white/5 hover:border-white/20"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      style={{ width: "36px", height: "36px" }}
                      className={`rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        openIndex === index
                          ? "bg-amber-500/20 border border-amber-500/40"
                          : "bg-white/5 border border-white/10"
                      }`}
                    >
                      <HelpCircle
                        size={18}
                        className={
                          openIndex === index ? "text-amber-400" : "text-gray-400"
                        }
                      />
                    </div>
                    <h3
                      className={`font-semibold pt-1.5 transition-colors ${
                        openIndex === index ? "text-amber-400" : "text-white"
                      }`}
                    >
                      {faq.question}
                    </h3>
                  </div>

                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown
                      size={20}
                      className={
                        openIndex === index ? "text-amber-400" : "text-gray-500"
                      }
                    />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pl-20">
                        <p className="text-gray-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30">
            <MessageCircle size={24} className="text-amber-400 flex-shrink-0" />
            <p className="text-gray-300 text-sm">
              {t.faq.ctaText}{" "}
              <a
                href={`https://wa.me/50686334133?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 font-semibold"
              >
                {t.faq.ctaLink}
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

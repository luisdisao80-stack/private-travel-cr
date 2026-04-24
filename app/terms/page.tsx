"use client";

import { motion } from "framer-motion";
import { Gavel, Mail, Phone, ArrowLeft, Scale, Calendar, CreditCard, AlertTriangle, Heart, Compass, ShieldAlert, FileEdit, HelpCircle } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  const { lang } = useLanguage();

  const content = {
    en: {
      backHome: "Back to Home",
      legalInfo: "Legal Information",
      title: "Terms and Conditions",
      icon: "📜",
      company: "Private Travel Costa Rica",
      lastUpdated: "Last Updated: December 3, 2025",
      intro: "Welcome to Private Travel Costa Rica. By accessing our website, booking our services, or communicating with us, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully, as they define your rights and responsibilities.",
      sections: [
        {
          title: "1. General Information",
          content: [
            "Private Travel Costa Rica provides private transportation services, guided tours, and personalized travel assistance throughout Costa Rica.",
            "• All services are strictly subject to availability.",
            "• Services may be subject to change or modification based on weather conditions, road accessibility, and safety considerations, which are paramount.",
          ],
        },
        {
          title: "2. Booking & Payments",
          subsections: [
            {
              subtitle: "2.1 Reservations",
              text: "All reservations must be confirmed through our official communication channels (website form, email, or official WhatsApp/phone).",
            },
            {
              subtitle: "2.2 Payment Schedule",
              text: "• A deposit may be required to secure your booking.\n• Full payment is due before or on the day the service is rendered unless an alternative written agreement has been established.",
            },
            {
              subtitle: "2.3 Pricing",
              text: "• Prices are listed in U.S. dollars (USD).\n• Rates may vary based on distance, group size, travel season, or any special requests requiring additional resources.",
            },
            {
              subtitle: "2.4 Payment Methods",
              text: "We accept payments via bank transfer, credit card, or other pre-approved methods as determined by Private Travel Costa Rica.",
            },
          ],
        },
        {
          title: "3. Cancellations & Refunds",
          subsections: [
            {
              subtitle: "3.1 Client Cancellations (Transportation & Tours)",
              isTable: true,
              tableHeaders: ["Timing Before Service", "Refund Policy"],
              tableRows: [
                ["48 hours or more", "Full Refund of the amount paid."],
                ["Within 48 hours", "Non-refundable. The deposit or full payment will be retained."],
                ["No-shows or Last-Minute Changes", "Non-refundable."],
              ],
            },
            {
              subtitle: "3.2 Service Provider Cancellations",
              text: "If Private Travel Costa Rica must cancel a service due to severe weather, road closures, safety concerns, or any unforeseen circumstances beyond our control, the client will receive a full refund or the option to reschedule the service at no extra cost.",
            },
          ],
        },
        {
          title: "4. Travel Conditions & Responsibilities",
          subsections: [
            {
              subtitle: "4.1 Safety Guidelines",
              text: "Passengers must follow the driver's and guide's safety instructions at all times during the service.",
            },
            {
              subtitle: "4.2 Delays and Unforeseen Events",
              text: "Private Travel Costa Rica is not responsible for delays caused by circumstances beyond our immediate control, including but not limited to heavy traffic, adverse road conditions, severe weather events, or governmental checkpoints/controls.",
            },
            {
              subtitle: "4.3 Client Information Accuracy",
              text: "Clients are responsible for ensuring they provide accurate pick-up locations, drop-off destinations, and correct arrival/departure flight information. Failure to provide accurate details may result in service interruption or cancellation without refund.",
            },
            {
              subtitle: "4.4 Personal Belongings",
              text: "Any personal belongings, luggage, or valuables left in the vehicle or at tour locations remain the sole responsibility of the client.",
            },
          ],
        },
        {
          title: "5. Health & Safety",
          subsections: [
            {
              subtitle: "5.1 Vehicle Standards",
              text: "Our vehicles are regularly maintained to high operational and safety standards.",
            },
            {
              subtitle: "5.2 Mandatory Safety",
              text: "Seat belts must be worn at all times while the vehicle is in motion, as required by Costa Rican law.",
            },
            {
              subtitle: "5.3 Medical Conditions",
              text: "If travelers have pre-existing medical conditions, allergies, or mobility limitations that may affect the service (especially during tours), they must inform us at the time of booking to allow for necessary accommodations or advice.",
            },
          ],
        },
        {
          title: "6. Tours & Activities",
          subsections: [
            {
              subtitle: "6.1 Condition Dependence",
              text: "All tours and activities depend on prevailing weather conditions and internal safety protocols.",
            },
            {
              subtitle: "6.2 Risk and Participation",
              text: "Some activities may involve moderate physical effort. Participation in any tour or activity is voluntary and strictly at the client's own risk.",
            },
            {
              subtitle: "6.3 Wildlife Guarantee",
              text: "Wildlife sightings (including sloths, monkeys, and birds) cannot be guaranteed, as all animals are observed in their wild, natural habitat. Our guides will maximize opportunities but cannot control animal behavior.",
            },
          ],
        },
        {
          title: "7. Liability Disclaimer",
          content: [
            "Clients acknowledge and agree that Private Travel Costa Rica is not liable for:",
            "• Loss, theft, or damage to personal items.",
            "• Accidents, injuries, or illness resulting from client negligence or failure to follow instructions.",
            "• Delays, cancellations, or changes to itinerary beyond our control (e.g., strikes, acts of nature, landslides, road closures, etc.).",
            "Clients agree to utilize our transportation services and participate in associated activities at their own risk.",
          ],
        },
        {
          title: "8. Changes to These Terms",
          content: [
            "Private Travel Costa Rica reserves the right to update or modify these Terms and Conditions at any time without prior notice. Changes will be effective immediately upon posting on this page with a revised \"Last Updated\" date. Continued use of our services constitutes acceptance of the revised terms.",
          ],
        },
        {
          title: "9. Need Assistance?",
          content: ["For any questions or clarifications regarding these Terms."],
          contact: true,
        },
      ],
    },
    es: {
      backHome: "Volver al Inicio",
      legalInfo: "Información Legal",
      title: "Términos y Condiciones",
      icon: "📜",
      company: "Private Travel Costa Rica",
      lastUpdated: "Última Actualización: 3 de Diciembre, 2025",
      intro: "Bienvenido a Private Travel Costa Rica. Al acceder a nuestro sitio web, reservar nuestros servicios o comunicarse con nosotros, usted acepta cumplir y estar sujeto a los siguientes Términos y Condiciones. Léalos cuidadosamente, ya que definen sus derechos y responsabilidades.",
      sections: [
        {
          title: "1. Información General",
          content: [
            "Private Travel Costa Rica ofrece servicios de transporte privado, tours guiados y asistencia personalizada de viaje en toda Costa Rica.",
            "• Todos los servicios están estrictamente sujetos a disponibilidad.",
            "• Los servicios pueden estar sujetos a cambios o modificaciones según las condiciones climáticas, la accesibilidad de las carreteras y las consideraciones de seguridad, que son primordiales.",
          ],
        },
        {
          title: "2. Reservas y Pagos",
          subsections: [
            {
              subtitle: "2.1 Reservas",
              text: "Todas las reservas deben confirmarse a través de nuestros canales oficiales de comunicación (formulario del sitio web, email o WhatsApp/teléfono oficial).",
            },
            {
              subtitle: "2.2 Calendario de Pagos",
              text: "• Puede requerirse un depósito para asegurar su reserva.\n• El pago completo vence antes o el día en que se presta el servicio, a menos que se haya establecido un acuerdo escrito alternativo.",
            },
            {
              subtitle: "2.3 Precios",
              text: "• Los precios están indicados en dólares estadounidenses (USD).\n• Las tarifas pueden variar según la distancia, el tamaño del grupo, la temporada de viaje o cualquier solicitud especial que requiera recursos adicionales.",
            },
            {
              subtitle: "2.4 Métodos de Pago",
              text: "Aceptamos pagos mediante transferencia bancaria, tarjeta de crédito u otros métodos preaprobados según determine Private Travel Costa Rica.",
            },
          ],
        },
        {
          title: "3. Cancelaciones y Reembolsos",
          subsections: [
            {
              subtitle: "3.1 Cancelaciones del Cliente (Transporte y Tours)",
              isTable: true,
              tableHeaders: ["Tiempo Antes del Servicio", "Política de Reembolso"],
              tableRows: [
                ["48 horas o más", "Reembolso Completo del monto pagado."],
                ["Menos de 48 horas", "No reembolsable. Se retendrá el depósito o pago completo."],
                ["No presentarse o Cambios de Último Minuto", "No reembolsable."],
              ],
            },
            {
              subtitle: "3.2 Cancelaciones del Proveedor de Servicios",
              text: "Si Private Travel Costa Rica debe cancelar un servicio debido a clima severo, cierres de carreteras, preocupaciones de seguridad o cualquier circunstancia imprevista más allá de nuestro control, el cliente recibirá un reembolso completo o la opción de reprogramar el servicio sin costo adicional.",
            },
          ],
        },
        {
          title: "4. Condiciones de Viaje y Responsabilidades",
          subsections: [
            {
              subtitle: "4.1 Pautas de Seguridad",
              text: "Los pasajeros deben seguir las instrucciones de seguridad del conductor y el guía en todo momento durante el servicio.",
            },
            {
              subtitle: "4.2 Retrasos y Eventos Imprevistos",
              text: "Private Travel Costa Rica no es responsable por retrasos causados por circunstancias fuera de nuestro control inmediato, incluyendo pero no limitado a tráfico pesado, condiciones adversas de la carretera, eventos climáticos severos o puestos de control/controles gubernamentales.",
            },
            {
              subtitle: "4.3 Exactitud de la Información del Cliente",
              text: "Los clientes son responsables de asegurar que proporcionan ubicaciones precisas de recogida, destinos de entrega e información correcta del vuelo de llegada/salida. No proporcionar detalles precisos puede resultar en interrupción del servicio o cancelación sin reembolso.",
            },
            {
              subtitle: "4.4 Pertenencias Personales",
              text: "Cualquier pertenencia personal, equipaje u objetos de valor dejados en el vehículo o en ubicaciones de tour permanecen como responsabilidad única del cliente.",
            },
          ],
        },
        {
          title: "5. Salud y Seguridad",
          subsections: [
            {
              subtitle: "5.1 Estándares del Vehículo",
              text: "Nuestros vehículos se mantienen regularmente con altos estándares operativos y de seguridad.",
            },
            {
              subtitle: "5.2 Seguridad Obligatoria",
              text: "Los cinturones de seguridad deben usarse en todo momento mientras el vehículo esté en movimiento, según lo requiere la ley costarricense.",
            },
            {
              subtitle: "5.3 Condiciones Médicas",
              text: "Si los viajeros tienen condiciones médicas preexistentes, alergias o limitaciones de movilidad que pueden afectar el servicio (especialmente durante tours), deben informarnos al momento de la reserva para permitir las acomodaciones o consejos necesarios.",
            },
          ],
        },
        {
          title: "6. Tours y Actividades",
          subsections: [
            {
              subtitle: "6.1 Dependencia de Condiciones",
              text: "Todos los tours y actividades dependen de las condiciones climáticas prevalecientes y protocolos internos de seguridad.",
            },
            {
              subtitle: "6.2 Riesgo y Participación",
              text: "Algunas actividades pueden implicar esfuerzo físico moderado. La participación en cualquier tour o actividad es voluntaria y estrictamente bajo el propio riesgo del cliente.",
            },
            {
              subtitle: "6.3 Garantía de Vida Silvestre",
              text: "No se pueden garantizar los avistamientos de vida silvestre (incluyendo perezosos, monos y aves), ya que todos los animales son observados en su hábitat natural y salvaje. Nuestros guías maximizarán las oportunidades pero no pueden controlar el comportamiento animal.",
            },
          ],
        },
        {
          title: "7. Descargo de Responsabilidad",
          content: [
            "Los clientes reconocen y aceptan que Private Travel Costa Rica no es responsable de:",
            "• Pérdida, robo o daño a artículos personales.",
            "• Accidentes, lesiones o enfermedades resultantes de negligencia del cliente o falta de seguir instrucciones.",
            "• Retrasos, cancelaciones o cambios al itinerario fuera de nuestro control (ej. huelgas, actos de la naturaleza, deslizamientos, cierres de carreteras, etc.).",
            "Los clientes aceptan utilizar nuestros servicios de transporte y participar en actividades asociadas bajo su propio riesgo.",
          ],
        },
        {
          title: "8. Cambios a Estos Términos",
          content: [
            "Private Travel Costa Rica se reserva el derecho de actualizar o modificar estos Términos y Condiciones en cualquier momento sin previo aviso. Los cambios serán efectivos inmediatamente al publicarse en esta página con una fecha revisada de \"Última Actualización\". El uso continuado de nuestros servicios constituye aceptación de los términos revisados.",
          ],
        },
        {
          title: "9. ¿Necesitas Ayuda?",
          content: ["Para cualquier pregunta o aclaración sobre estos Términos."],
          contact: true,
        },
      ],
    },
  };

  const t = lang === "en" ? content.en : content.es;

  // Iconos para cada seccion
  const sectionIcons = [
    <Scale key="scale" size={20} />,
    <Calendar key="calendar" size={20} />,
    <CreditCard key="card" size={20} />,
    <AlertTriangle key="alert" size={20} />,
    <Heart key="heart" size={20} />,
    <Compass key="compass" size={20} />,
    <ShieldAlert key="shield" size={20} />,
    <FileEdit key="edit" size={20} />,
    <HelpCircle key="help" size={20} />,
  ];

  return (
    <main key={lang} className="min-h-screen bg-black">
      <Navbar />

      {/* Hero de la pagina */}
      <section className="relative pt-32 pb-12 px-4 bg-gradient-to-br from-black via-gray-950 to-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.1),transparent_70%)]" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={14} />
            {t.backHome}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
              <span className="text-amber-400 text-sm font-medium tracking-wider">
                ✦ {t.legalInfo}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 tracking-tight">
              {t.title}
            </h1>

            <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
              <span className="text-3xl">{t.icon}</span>
              <span className="text-lg font-medium">{t.company}</span>
            </div>

            <p className="text-sm text-gray-500">{t.lastUpdated}</p>
          </motion.div>
        </div>
      </section>

      {/* Contenido */}
      <section className="relative py-12 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-2xl p-6 mb-10"
          >
            <p className="text-gray-300 leading-relaxed">{t.intro}</p>
          </motion.div>

          {/* Secciones */}
          <div className="space-y-6">
            {t.sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-gradient-to-br from-gray-900/80 to-black border border-white/5 rounded-2xl p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400">
                    {sectionIcons[index]}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    {section.title}
                  </h2>
                </div>

                {/* Contenido simple */}
                {section.content && (
                  <div className="space-y-3 text-gray-300 leading-relaxed ml-13">
                    {section.content.map((paragraph, i) => (
                      <p key={i} className="text-sm md:text-base">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}

                {/* Subsecciones */}
                {section.subsections && (
                  <div className="space-y-5 ml-0 md:ml-13">
                    {section.subsections.map((sub, i) => (
                      <div key={i}>
                        <h3 className="text-amber-400 font-semibold text-base mb-2">
                          {sub.subtitle}
                        </h3>

                        {sub.text && (
                          <p className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
                            {sub.text}
                          </p>
                        )}

                        {sub.isTable && sub.tableRows && (
                          <div className="overflow-x-auto mt-2">
                            <table className="w-full border border-amber-500/20 rounded-lg overflow-hidden">
                              <thead className="bg-amber-500/10">
                                <tr>
                                  {sub.tableHeaders!.map((header, hi) => (
                                    <th
                                      key={hi}
                                      className="text-left p-3 text-amber-400 font-semibold text-sm border-b border-amber-500/20"
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {sub.tableRows.map((row, ri) => (
                                  <tr
                                    key={ri}
                                    className="border-b border-white/5 last:border-0 hover:bg-white/5"
                                  >
                                    {row.map((cell, ci) => (
                                      <td
                                        key={ci}
                                        className="p-3 text-gray-300 text-sm"
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Contacto en la ultima seccion */}
                {section.contact && (
                  <div className="ml-0 md:ml-13 mt-4 flex flex-col gap-3">
                    <a
                      href="mailto:info@privatetravelcr.com"
                      className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <Mail size={16} />
                      info@privatetravelcr.com
                    </a>
                    <a
                      href="tel:+50686334133"
                      className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <Phone size={16} />
                      +506 8633-4133
                    </a>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

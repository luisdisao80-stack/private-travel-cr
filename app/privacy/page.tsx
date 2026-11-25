"use client";

import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/lib/site-config";
import { useLanguage } from "@/lib/LanguageContext";

type Block =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | {
      kind: "deflist";
      /** "period" renders "Term. Text" (default); "dash" renders "Term — Text". */
      sep?: "period" | "dash";
      items: { term: string; text: string }[];
    };

type Section = { title: string; blocks: Block[] };

export default function PrivacyPolicyPage() {
  const { lang } = useLanguage();
  const business = siteConfig.business;

  const content: Record<
    "en" | "es",
    {
      backHome: string;
      title: string;
      lastUpdated: string;
      intro: string;
      introLinkLabel: string;
      sections: Section[];
      contactLead: string;
      contactOr: string;
    }
  > = {
    en: {
      backHome: "Back to Home",
      title: "Privacy Policy",
      lastUpdated: "Last updated: November 25, 2026",
      intro:
        'respects your privacy. This policy explains what personal information we collect when you visit {LINK} or book one of our private shuttle services, why we collect it, how we use it, and the choices you have about it.',
      introLinkLabel: siteConfig.siteUrl,
      sections: [
        {
          title: "1. Information we collect",
          blocks: [
            { kind: "p", text: "When you book a trip we ask for:" },
            {
              kind: "list",
              items: [
                "Full name, email address, phone number (with country code)",
                "Pickup and drop-off addresses, travel date, time, passenger count",
                "Flight number and arrival time (for airport pickups)",
                "Any special requests you choose to share (child seats, accessibility needs, etc.)",
              ],
            },
            {
              kind: "p",
              text: "When you pay we collect, through our payment processor (Tilopay):",
            },
            {
              kind: "list",
              items: [
                "Last four digits of the card and an authorization code",
                "Transaction ID and amount",
              ],
            },
            {
              kind: "p",
              text: "We never see and never store the full card number, the expiration date, or the security code (CVV). Those details are typed directly into the payment processor's PCI-DSS compliant gateway and never reach our servers, our database, or our staff. The only card information we retain is the last four digits and the authorization code, which we need in order to identify the transaction and to issue a refund if one is due.",
            },
            {
              kind: "p",
              text: "When you browse the site we collect (via cookies and analytics):",
            },
            {
              kind: "list",
              items: [
                "IP address and approximate location (country/region)",
                "Browser, device, and operating system",
                "Pages visited, time on page, referring site",
                "Search and route preferences (origin/destination pairs you query)",
              ],
            },
          ],
        },
        {
          title: "2. How we use it",
          blocks: [
            {
              kind: "list",
              items: [
                "To provide the shuttle service you booked (assign a driver, coordinate pickup).",
                "To send booking confirmations, pickup reminders, and post-trip follow-ups by email and WhatsApp.",
                "To process payments.",
                "To improve the site (which routes are most searched, where visitors drop off in the booking flow).",
                "To comply with legal obligations (tax records, accounting).",
              ],
            },
          ],
        },
        {
          title: "3. Who we share it with",
          blocks: [
            {
              kind: "p",
              text: "We do not sell, rent, trade, or otherwise commercialize your personal data, and we do not share or transfer it to third parties without your authorization or a corresponding legal basis. We share it only with the service providers strictly necessary to deliver the service you booked, each of whom may use it for that purpose alone:",
            },
            {
              kind: "deflist",
              sep: "dash",
              items: [
                { term: "Tilopay", text: "payment processing (Costa Rica)." },
                { term: "Supabase", text: "database hosting (United States)." },
                { term: "Resend", text: "transactional email delivery (United States)." },
                { term: "Vercel", text: "site hosting and basic analytics (United States)." },
                { term: "Google Analytics", text: "site analytics (when consent is given)." },
                {
                  term: "Our drivers",
                  text: "only the trip-specific info needed to do the pickup (name, pickup address, time, flight number, contact phone).",
                },
              ],
            },
            {
              kind: "p",
              text: "We may also disclose information if required by Costa Rican law or to defend our legal rights.",
            },
          ],
        },
        {
          title: "4. How we protect it",
          blocks: [
            {
              kind: "p",
              text: "We apply the following security measures to protect your personal information against loss, misuse, and unauthorized access, alteration, or disclosure:",
            },
            {
              kind: "deflist",
              items: [
                {
                  term: "Encryption in transit",
                  text: "The entire site is served over HTTPS (TLS). Everything you submit in the booking form travels encrypted between your device and our servers.",
                },
                {
                  term: "Encryption at rest",
                  text: "Our database encrypts stored data, and backups are encrypted as well.",
                },
                {
                  term: "Card data never touches our systems",
                  text: "Payments are processed entirely inside the payment gateway's PCI-DSS certified environment. We do not store the full card number, the expiration date, or the CVV at any point.",
                },
                {
                  term: "Access control",
                  text: "Access to booking records is limited to authorized personnel through individual accounts with strong authentication, and row-level security rules in the database prevent one customer's records from being read by another.",
                },
                {
                  term: "Minimum necessary disclosure",
                  text: "Drivers receive only the trip-specific details needed to perform the pickup — never any payment information.",
                },
                {
                  term: "Vetted providers",
                  text: "We rely on established infrastructure providers with their own recognized security programs, and we keep our software and its dependencies up to date.",
                },
                {
                  term: "Retention limits",
                  text: "We keep personal data only for as long as described in section 6 below, and delete or anonymize it afterwards.",
                },
              ],
            },
            {
              kind: "p",
              text: "No system can be guaranteed to be perfectly secure. If we ever become aware of a breach affecting your personal data, we will notify you and the competent authorities as required by Costa Rican law.",
            },
          ],
        },
        {
          title: "5. Cookies and tracking",
          blocks: [
            { kind: "p", text: "We use two kinds of cookies / similar storage:" },
            {
              kind: "deflist",
              items: [
                {
                  term: "Essential",
                  text: "Required for the site to work — for example, your shopping cart, your language preference, and your cookie-consent choice. These cannot be turned off.",
                },
                {
                  term: "Analytics",
                  text: "Vercel Analytics and (if consent is given) Google Analytics 4. They help us see which pages are popular and where visitors get stuck.",
                },
              ],
            },
            {
              kind: "p",
              text: "You can decline analytics cookies from the banner that appears on your first visit, or by clearing the ptcr_cookie_consent key in localStorage and reloading.",
            },
          ],
        },
        {
          title: "6. How long we keep it",
          blocks: [
            {
              kind: "deflist",
              sep: "dash",
              items: [
                { term: "Booking records", text: "7 years (Costa Rican tax requirement)." },
                { term: "Analytics data", text: "14 months (Google Analytics default)." },
                { term: "Cookie consent choice", text: "12 months, then we ask again." },
              ],
            },
          ],
        },
        {
          title: "7. Your rights",
          blocks: [
            { kind: "p", text: "Wherever you live, you can ask us to:" },
            {
              kind: "list",
              items: [
                "Send you a copy of the personal data we hold about you.",
                "Correct anything that's wrong.",
                "Delete your data (subject to the legal retention rules above).",
                "Stop sending you marketing communications.",
              ],
            },
            {
              kind: "p",
              text: "If you're in the EU/UK, you also have the rights under GDPR / UK GDPR, including the right to lodge a complaint with your local data-protection authority.",
            },
            {
              kind: "p",
              text: `To exercise any of these, write to ${business.email} from the same email address you used to book. We respond within 30 days.`,
            },
          ],
        },
        {
          title: "8. Children",
          blocks: [
            {
              kind: "p",
              text: "Our services are intended for adults booking on behalf of themselves or their travel group, which may include children. We do not knowingly collect personal data directly from anyone under 16. If you believe a child has submitted information, please contact us and we will delete it.",
            },
          ],
        },
        {
          title: "9. International transfers",
          blocks: [
            {
              kind: "p",
              text: "Some of our service providers (Supabase, Resend, Vercel, Google) process data in the United States. By using the site, you consent to your personal data being processed outside Costa Rica or your country of residence, with the protections offered by each provider's privacy program.",
            },
          ],
        },
        {
          title: "10. Changes to this policy",
          blocks: [
            {
              kind: "p",
              text: 'We may update this policy occasionally. When we do, we\'ll change the "Last updated" date at the top. Material changes will be flagged via a notice on the site.',
            },
          ],
        },
      ],
      contactLead: "Questions about this policy or your data?",
      contactOr: "or WhatsApp",
    },
    es: {
      backHome: "Volver al Inicio",
      title: "Política de Privacidad",
      lastUpdated: "Última actualización: 25 de noviembre de 2026",
      intro:
        "respeta su privacidad. Esta política explica cuáles datos personales recopilamos cuando usted visita {LINK} o reserva uno de nuestros servicios de transporte privado, con qué finalidad los recopilamos, cómo los utilizamos y qué opciones tiene usted al respecto.",
      introLinkLabel: siteConfig.siteUrl,
      sections: [
        {
          title: "1. Datos que recopilamos",
          blocks: [
            { kind: "p", text: "Cuando usted reserva un viaje le solicitamos:" },
            {
              kind: "list",
              items: [
                "Nombre completo, correo electrónico y número de teléfono (con código de país)",
                "Direcciones de recogida y de destino, fecha y hora del viaje, cantidad de pasajeros",
                "Número de vuelo y hora de llegada (para recogidas en el aeropuerto)",
                "Cualquier solicitud especial que usted decida compartir (sillas para niños, necesidades de accesibilidad, etc.)",
              ],
            },
            {
              kind: "p",
              text: "Cuando usted paga, recopilamos, por medio de nuestro procesador de pagos (Tilopay):",
            },
            {
              kind: "list",
              items: [
                "Los últimos cuatro dígitos de la tarjeta y un código de autorización",
                "El número de transacción y el monto",
              ],
            },
            {
              kind: "p",
              text: "Nunca vemos ni almacenamos la numeración completa del plástico, la fecha de vencimiento ni el código de seguridad (CVV). Esos datos se digitan directamente en la pasarela de pago certificada bajo la norma PCI-DSS y nunca llegan a nuestros servidores, a nuestra base de datos ni a nuestro personal. Lo único que conservamos son los últimos cuatro dígitos y el código de autorización, que necesitamos para identificar la transacción y para tramitar una devolución si corresponde.",
            },
            {
              kind: "p",
              text: "Cuando usted navega por el sitio recopilamos (mediante cookies y analítica):",
            },
            {
              kind: "list",
              items: [
                "Dirección IP y ubicación aproximada (país o región)",
                "Navegador, dispositivo y sistema operativo",
                "Páginas visitadas, tiempo en cada página y sitio de procedencia",
                "Preferencias de búsqueda y de rutas (los pares de origen y destino que consulta)",
              ],
            },
          ],
        },
        {
          title: "2. Finalidad con la que los utilizamos",
          blocks: [
            {
              kind: "list",
              items: [
                "Para prestar el servicio de transporte que usted reservó (asignar un chofer y coordinar la recogida).",
                "Para enviarle confirmaciones de reserva, recordatorios de recogida y seguimiento posterior al viaje, por correo electrónico y WhatsApp.",
                "Para procesar los pagos.",
                "Para mejorar el sitio (cuáles rutas se buscan más y en qué punto del proceso de reserva se retiran los visitantes).",
                "Para cumplir con obligaciones legales (registros tributarios y contables).",
              ],
            },
          ],
        },
        {
          title: "3. Con quién la compartimos",
          blocks: [
            {
              kind: "p",
              text: "No vendemos, alquilamos, intercambiamos ni comercializamos de ninguna forma sus datos personales, y no los compartimos ni los transferimos a terceros sin la debida autorización del titular o sin el sustento legal correspondiente. Únicamente los compartimos con los proveedores de servicios estrictamente necesarios para prestar el servicio que usted reservó, y cada uno de ellos puede utilizarlos solo con esa finalidad:",
            },
            {
              kind: "deflist",
              sep: "dash",
              items: [
                { term: "Tilopay", text: "procesamiento de pagos (Costa Rica)." },
                { term: "Supabase", text: "alojamiento de la base de datos (Estados Unidos)." },
                { term: "Resend", text: "envío de correos transaccionales (Estados Unidos)." },
                { term: "Vercel", text: "alojamiento del sitio y analítica básica (Estados Unidos)." },
                { term: "Google Analytics", text: "analítica del sitio (cuando se otorga el consentimiento)." },
                {
                  term: "Nuestros choferes",
                  text: "únicamente la información del viaje necesaria para realizar la recogida (nombre, dirección de recogida, hora, número de vuelo y teléfono de contacto).",
                },
              ],
            },
            {
              kind: "p",
              text: "También podríamos divulgar información si así lo exige la legislación costarricense o para defender nuestros derechos legales.",
            },
          ],
        },
        {
          title: "4. Medidas de seguridad implementadas",
          blocks: [
            {
              kind: "p",
              text: "Aplicamos las siguientes medidas de seguridad para proteger sus datos personales contra pérdida, uso indebido y acceso, alteración o divulgación no autorizados:",
            },
            {
              kind: "deflist",
              items: [
                {
                  term: "Cifrado en tránsito",
                  text: "Todo el sitio se sirve mediante HTTPS (TLS). Todo lo que usted envía en el formulario de reserva viaja cifrado entre su dispositivo y nuestros servidores.",
                },
                {
                  term: "Cifrado en reposo",
                  text: "Nuestra base de datos cifra la información almacenada, y los respaldos también están cifrados.",
                },
                {
                  term: "Los datos de tarjeta nunca pasan por nuestros sistemas",
                  text: "Los pagos se procesan en su totalidad dentro del entorno certificado PCI-DSS de la pasarela de pago. En ningún momento almacenamos la numeración completa del plástico, la fecha de vencimiento ni el CVV.",
                },
                {
                  term: "Control de acceso",
                  text: "El acceso a los registros de reservas está limitado al personal autorizado mediante cuentas individuales con autenticación robusta, y reglas de seguridad a nivel de fila en la base de datos impiden que los registros de un cliente sean leídos por otro.",
                },
                {
                  term: "Divulgación mínima necesaria",
                  text: "Los choferes reciben únicamente los datos del viaje necesarios para realizar la recogida; nunca información de pago.",
                },
                {
                  term: "Proveedores evaluados",
                  text: "Trabajamos con proveedores de infraestructura consolidados que cuentan con sus propios programas de seguridad reconocidos, y mantenemos nuestro software y sus dependencias actualizados.",
                },
                {
                  term: "Límites de conservación",
                  text: "Conservamos los datos personales únicamente durante los plazos descritos en la sección 6, y luego los eliminamos o los anonimizamos.",
                },
              ],
            },
            {
              kind: "p",
              text: "Ningún sistema puede garantizarse como perfectamente seguro. Si llegáramos a tener conocimiento de una brecha que afecte sus datos personales, se lo notificaremos a usted y a las autoridades competentes conforme lo exige la legislación costarricense.",
            },
          ],
        },
        {
          title: "5. Cookies y seguimiento",
          blocks: [
            { kind: "p", text: "Utilizamos dos tipos de cookies o almacenamiento similar:" },
            {
              kind: "deflist",
              items: [
                {
                  term: "Esenciales",
                  text: "Necesarias para que el sitio funcione; por ejemplo, su carrito de compras, su preferencia de idioma y su elección sobre el consentimiento de cookies. Estas no se pueden desactivar.",
                },
                {
                  term: "De analítica",
                  text: "Vercel Analytics y, si usted otorga su consentimiento, Google Analytics 4. Nos permiten ver cuáles páginas son populares y en qué punto se quedan los visitantes.",
                },
              ],
            },
            {
              kind: "p",
              text: "Usted puede rechazar las cookies de analítica desde el aviso que aparece en su primera visita, o borrando la clave ptcr_cookie_consent del almacenamiento local de su navegador y recargando la página.",
            },
          ],
        },
        {
          title: "6. Por cuánto tiempo los conservamos",
          blocks: [
            {
              kind: "deflist",
              sep: "dash",
              items: [
                { term: "Registros de reservas", text: "7 años (requisito tributario costarricense)." },
                { term: "Datos de analítica", text: "14 meses (valor predeterminado de Google Analytics)." },
                { term: "Elección sobre cookies", text: "12 meses, y después volvemos a consultarle." },
              ],
            },
          ],
        },
        {
          title: "7. Sus derechos",
          blocks: [
            { kind: "p", text: "Viva donde viva, usted puede solicitarnos que:" },
            {
              kind: "list",
              items: [
                "Le enviemos una copia de los datos personales que tenemos sobre usted.",
                "Corrijamos cualquier dato incorrecto.",
                "Eliminemos sus datos (sujeto a los plazos legales de conservación indicados arriba).",
                "Dejemos de enviarle comunicaciones de mercadeo.",
              ],
            },
            {
              kind: "p",
              text: "Si usted se encuentra en la Unión Europea o el Reino Unido, cuenta además con los derechos del RGPD, incluido el derecho a presentar una queja ante su autoridad local de protección de datos.",
            },
            {
              kind: "p",
              text: `Para ejercer cualquiera de estos derechos, escríbanos a ${business.email} desde la misma dirección de correo que utilizó para reservar. Respondemos en un plazo de 30 días.`,
            },
          ],
        },
        {
          title: "8. Menores de edad",
          blocks: [
            {
              kind: "p",
              text: "Nuestros servicios están dirigidos a personas adultas que reservan por sí mismas o en nombre de su grupo de viaje, el cual puede incluir menores. No recopilamos de forma consciente datos personales directamente de personas menores de 16 años. Si usted considera que un menor nos ha enviado información, contáctenos y la eliminaremos.",
            },
          ],
        },
        {
          title: "9. Transferencias internacionales",
          blocks: [
            {
              kind: "p",
              text: "Algunos de nuestros proveedores de servicios (Supabase, Resend, Vercel y Google) procesan datos en los Estados Unidos. Al utilizar el sitio, usted consiente que sus datos personales sean procesados fuera de Costa Rica o de su país de residencia, con las protecciones que ofrece el programa de privacidad de cada proveedor.",
            },
          ],
        },
        {
          title: "10. Cambios a esta política",
          blocks: [
            {
              kind: "p",
              text: 'Podemos actualizar esta política de vez en cuando. Cuando lo hagamos, cambiaremos la fecha de "Última actualización" que aparece al inicio. Los cambios sustanciales se señalarán mediante un aviso en el sitio.',
            },
          ],
        },
      ],
      contactLead: "¿Tiene preguntas sobre esta política o sobre sus datos?",
      contactOr: "o por WhatsApp al",
    },
  };

  const t = content[lang === "es" ? "es" : "en"];
  const contactTitle = lang === "es" ? "11. Contacto" : "11. Contact";

  const renderBlock = (block: Block, i: number) => {
    if (block.kind === "p") {
      return (
        <p key={i} className="mb-2 last:mb-0">
          {block.text}
        </p>
      );
    }
    if (block.kind === "list") {
      return (
        <ul key={i} className="list-disc pl-6 space-y-1 mb-3 last:mb-0">
          {block.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    }
    const dash = block.sep === "dash";
    return (
      <ul key={i} className="list-disc pl-6 space-y-1 mb-3 last:mb-0">
        {block.items.map((item, j) => (
          <li key={j}>
            <strong>{item.term}</strong>
            {dash ? " — " : ". "}
            {item.text}
          </li>
        ))}
      </ul>
    );
  };

  const [introBefore, introAfter] = t.intro.split("{LINK}");

  return (
    <main className="min-h-screen bg-white text-slate-600">
      <Navbar />
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 mb-6"
          >
            <ArrowLeft size={14} />
            {t.backHome}
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-orange-600" size={28} />
            <h1 className="text-3xl md:text-4xl font-bold">{t.title}</h1>
          </div>
          <p className="text-xs text-slate-500 mb-10">{t.lastUpdated}</p>

          <div className="space-y-8 text-slate-600 leading-relaxed">
            <section>
              <p>
                {siteConfig.name}{" "}
                {introBefore}
                <Link href="/" className="text-orange-600 hover:text-orange-700">
                  {t.introLinkLabel}
                </Link>
                {introAfter}
              </p>
            </section>

            {t.sections.map((section, i) => (
              <section key={i}>
                <h2 className="text-xl font-bold text-blue-900 mb-3">
                  {section.title}
                </h2>
                {section.blocks.map(renderBlock)}
              </section>
            ))}

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-3">
                {contactTitle}
              </h2>
              <p>
                {t.contactLead}{" "}
                <a
                  className="text-orange-600 hover:text-orange-700"
                  href={`mailto:${business.email}`}
                >
                  {business.email}
                </a>{" "}
                {t.contactOr}{" "}
                <a
                  className="text-orange-600 hover:text-orange-700"
                  href={business.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {business.phone}
                </a>
                .
              </p>
              <p className="mt-3 text-sm text-slate-500">
                {siteConfig.name} · {business.address.city},{" "}
                {business.address.region}, {business.address.countryName}
              </p>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

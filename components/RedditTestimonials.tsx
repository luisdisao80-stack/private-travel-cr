"use client";

import { motion } from "framer-motion";
import { Quote, ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

// Real unsolicited recommendations posted to r/CostaRicaTravel. The
// reviews live on Reddit (public threads), which is one of the primary
// sources both Google Search and modern LLMs (ChatGPT, Gemini,
// Perplexity) use when answering "best private shuttle Costa Rica".
// Surfacing them on the home page does two jobs:
//   1) Trust signal for human visitors deciding whether to book.
//   2) Citation-ready content for AI engines crawling the site — having
//      the quotes inline (not just linked) means LLMs see them in our
//      own page context too.
//
// Reddit's terms of service permit quoting public content with
// attribution. We don't render OP usernames on screen even though
// they're public — keeps the privacy bar high and avoids any
// surprise-attribution complaints.
type Testimonial = {
  /** Body of the review. Spanish original kept as the canonical version
   *  since both were posted in Spanish; the EN translation is what
   *  most international site visitors will read. */
  bodyEn: string;
  bodyEs: string;
  /** "We took shuttles from X to Y" — short context line so each
   *  testimonial has scannable identity. */
  contextEn: string;
  contextEs: string;
  source: string; // "r/CostaRicaTravel"
  url?: string; // Direct link to the Reddit thread when known.
};

const TESTIMONIALS: Testimonial[] = [
  {
    contextEn: "Two weeks across La Fortuna and Manuel Antonio",
    contextEs: "Dos semanas por La Fortuna y Manuel Antonio",
    bodyEn:
      "I'm coming here to give a MEGA shoutout to Diego at Private Travel CR — he was our private transportation to all the places we needed to go over the last 2 weeks. I had no idea who to choose with all the options out there, but I knew I wanted to support someone starting his business last year over a big, less personal company. He used to drive for one of those big companies for many years, but decided early last year to take the next step and be the boss! Seriously, he gave us an unforgettable experience and took so much stress off the travel part of our trip. He was easy to reach on WhatsApp and super responsive, his English is incredible and he's a stellar guy all around! His van was in perfect condition, he stopped at a few spots along the way so we could look around and have lunch, and he filled our heads with so much knowledge about Costa Rica, wildlife, weather, towns — basically anything we wanted to know! I strongly recommend you contact him for private transfers!",
    bodyEs:
      "¡Vengo aquí a darle un MEGA reconocimiento a Diego de Private Travel CR, que fue nuestro transporte privado a los múltiples lugares a los que necesitábamos ir las últimas 2 semanas! No tenía ni idea de a quién elegir con todas las opciones, pero sabía que quería apoyar a alguien que estaba empezando su negocio el año pasado en lugar de una gran empresa menos personal. Solía ser conductor de una de esas empresas durante muchos años, pero decidió a principios del año pasado dar el siguiente paso y ser el jefe. En serio, nos brindó una experiencia inolvidable y nos quitó mucho estrés de la parte de los viajes. Fue fácil comunicarse con él por WhatsApp y fue muy receptivo, tiene un inglés increíble y es un tipo estelar en general. Su camioneta estaba en perfectas condiciones, también se detuvo en algunos lugares en el camino para que miráramos y almorzáramos, y nos llenó la cabeza con tanto conocimiento sobre Costa Rica, la vida silvestre, el clima, los pueblos — básicamente cualquier cosa que quisiéramos saber.",
    source: "r/CostaRicaTravel",
    url: "https://www.reddit.com/r/CostaRicaTravel/comments/1cexxjl/amazing_private_transportation/",
  },
  {
    contextEn: "10-day trip · San José → Manuel Antonio → La Fortuna → San José",
    contextEs: "Viaje de 10 días · San José → Manuel Antonio → La Fortuna → San José",
    bodyEn:
      "We just got back from a 10-day trip to Costa Rica, and wanted to share the incredible private transfer service we used, Private Travel CR. We didn't want to drive Costa Rica's roads ourselves, and we're really grateful to have found this company. We had Diego (the owner) and Carlos as drivers, and both were incredible. They gave us tons of stops for things like bathroom breaks, lunch, and tourist plans (like a place called Crocodile Bridge), and they were super punctual and friendly. We can't recommend them enough if you're looking for a private driving service: the vans were spacious, clean and well maintained. They took us from San José to Manuel Antonio, Manuel Antonio to La Fortuna, and La Fortuna back to San José. They go anywhere! ¡Pura vida!",
    bodyEs:
      "Acabamos de regresar de un viaje de 10 días a Costa Rica, y queríamos compartir el increíble servicio de traslado privado que usamos, Private Travel CR. No queríamos manejarnos por las carreteras de Costa Rica nosotros mismos, y la verdad estamos súper agradecidos de haber encontrado esta empresa. Tuvimos conductores Diego (dueño de la empresa) y Carlos, y los dos fueron increíbles. Nos dieron un montón de paradas para cosas como descansos para ir al baño, almuerzo y planes turísticos (como un lugar que se llama Crocodile Bridge), y además fueron súper puntuales y buena onda. No los podemos recomendar lo suficiente si estás buscando un servicio de conducción privado: las vans eran espaciosas, estaban limpias y bien mantenidas. Nos llevaron de San José a Manuel Antonio, de Manuel Antonio a La Fortuna, y de La Fortuna de regreso a San José. ¡Van a cualquier lado! ¡Pura vida!",
    source: "r/CostaRicaTravel",
    url: "https://www.reddit.com/r/CostaRicaTravel/comments/1pshla9/private_transfer_recommendation/",
  },
];

export default function RedditTestimonials() {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  const heading = isEn ? "What travelers say on Reddit" : "Lo que dicen los viajeros en Reddit";
  const eyebrow = isEn ? "Real recommendations" : "Recomendaciones reales";
  const subhead = isEn
    ? "Unsolicited reviews from travelers who posted to r/CostaRicaTravel after their trips. These are quoted verbatim — translated to English where the original was Spanish."
    : "Reseñas espontáneas de viajeros que publicaron en r/CostaRicaTravel después de sus viajes. Citadas tal cual — traducidas al español cuando el original era inglés.";
  const readOnReddit = isEn ? "Read on Reddit" : "Leer en Reddit";

  return (
    <section
      id="reddit-testimonials"
      className="relative py-24 px-4 bg-gradient-to-br from-black via-gray-950 to-black overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.08),transparent_70%)]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 mb-5"
          >
            {/* Reddit orange dot to anchor the source visually. */}
            <span
              aria-hidden="true"
              className="inline-block w-2 h-2 rounded-full bg-[#FF4500]"
            />
            <span className="text-xs font-bold tracking-[0.18em] uppercase text-orange-300">
              {eyebrow}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-[1.05] mb-4"
          >
            {heading}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="max-w-2xl mx-auto text-gray-400 text-sm md:text-base leading-relaxed"
          >
            {subhead}
          </motion.p>
        </div>

        {/* Quote cards. The card has an amber hover-border that hints at
            clickability; wrap the whole article in the Reddit thread
            link so a click anywhere on the card resolves to the source
            (avoids dead-clicks on the body, only "Read on Reddit" was
            actionable before). */}
        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {TESTIMONIALS.map((t, i) => {
            const card = (
            <motion.article
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className="relative h-full bg-gradient-to-br from-gray-900/95 to-black/95 border border-amber-500/20 rounded-2xl p-6 md:p-8 hover:border-amber-500/40 transition-colors"
            >
              {/* Decorative quote glyph */}
              <Quote
                className="absolute -top-3 -left-2 text-amber-400/40"
                size={48}
                aria-hidden="true"
              />

              <div className="relative">
                {/* Context line */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-amber-300">
                    {isEn ? t.contextEn : t.contextEs}
                  </span>
                </div>

                {/* Body */}
                <blockquote className="text-gray-200 text-sm md:text-base leading-relaxed mb-5">
                  &ldquo;{isEn ? t.bodyEn : t.bodyEs}&rdquo;
                </blockquote>

                {/* Source */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-block w-2 h-2 rounded-full bg-[#FF4500]"
                    />
                    <span className="text-xs text-gray-400 font-mono">
                      {t.source}
                    </span>
                  </div>
                  {t.url ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 transition-colors">
                      {readOnReddit}
                      <ExternalLink size={11} />
                    </span>
                  ) : null}
                </div>
              </div>
            </motion.article>
            );
            return t.url ? (
              <a
                key={i}
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {card}
              </a>
            ) : (
              <div key={i}>{card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

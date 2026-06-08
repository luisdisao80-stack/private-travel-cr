"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

// "Meet Diego" homepage section — the personal-story moment that
// differentiates a family-run operator from faceless booking platforms
// (Bookaway, Daytrip, ILT). Sits high in the home stack (right after
// TrustStrip, before Reviews) so a visitor learns "this is a real
// person with 20+ years of experience" within 2 scrolls of landing.
//
// Layout: two-column on desktop (story left, photo collage right),
// stacked on mobile. Photos are deliberately tilted polaroid-style
// to feel like a personal album rather than a corporate team page.
// That informal aesthetic is the whole point — pristine layouts read
// as agency/template, the slight chaos reads as authentic and human.

type Photo = {
  src: string;
  altEn: string;
  altEs: string;
  rotate: number; // degrees
};

const PHOTOS: Photo[] = [
  {
    src: "/meet-diego/diego-van-couple.jpg",
    altEn: "Diego with happy travelers in front of a Private Travel CR shuttle van",
    altEs: "Diego con viajeros felices frente a una van de Private Travel CR",
    rotate: -2.5,
  },
  {
    src: "/meet-diego/diego-coconuts.jpg",
    altEn: "Diego in his Private Travel CR polo with travelers enjoying fresh coconuts in Costa Rica",
    altEs: "Diego con su polo Private Travel CR junto a viajeros disfrutando cocos frescos en Costa Rica",
    rotate: 3,
  },
  {
    src: "/meet-diego/diego-waterfall.jpg",
    altEn: "Diego with customers at the Río Celeste waterfall in Costa Rica",
    altEs: "Diego con clientes en la catarata del Río Celeste en Costa Rica",
    rotate: 1.5,
  },
  {
    src: "/meet-diego/diego-group-six.jpg",
    altEn: "Diego with a group of six travelers and the Private Travel CR shuttle",
    altEs: "Diego con un grupo de seis viajeros y la van de Private Travel CR",
    rotate: -3,
  },
  {
    src: "/meet-diego/diego-van-family.jpg",
    altEn: "Diego with a family at the Private Travel CR shuttle in La Fortuna",
    altEs: "Diego con una familia en la van de Private Travel CR en La Fortuna",
    rotate: 2,
  },
  {
    src: "/meet-diego/diego-group-four.jpg",
    altEn: "Diego with international travelers in front of the Private Travel CR van",
    altEs: "Diego con viajeros internacionales frente a la van de Private Travel CR",
    rotate: -1,
  },
];

export default function MeetDiego() {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  return (
    <section
      aria-label={isEn ? "Meet Diego — founder of Private Travel CR" : "Conocé a Diego — fundador de Private Travel CR"}
      className="relative py-20 md:py-28 px-4 bg-gradient-to-b from-black via-gray-950 to-black border-y border-amber-500/10 overflow-hidden"
    >
      {/* Subtle amber glow blob behind content for warmth */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none"
      />

      <div className="max-w-6xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column — story */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-4">
              {isEn ? "✦ MEET DIEGO" : "✦ CONOCÉ A DIEGO"}
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {isEn ? (
                <>
                  20+ years driving<br />
                  <span className="text-amber-400">Costa Rica.</span>
                </>
              ) : (
                <>
                  20+ años manejando<br />
                  <span className="text-amber-400">Costa Rica.</span>
                </>
              )}
            </h2>

            <div className="space-y-4 text-white/70 text-lg leading-relaxed">
              {isEn ? (
                <>
                  <p>
                    Hi, I&apos;m Diego — founder of Private Travel CR. I started driving travelers across Costa Rica in 2006. After 16 years at two of the country&apos;s largest transportation companies, I decided to build something different — a service focused on trust, flexibility, and real local experience, not just rides.
                  </p>
                  <p>
                    Private Travel CR isn&apos;t a platform. It&apos;s me, my cousin Anthony, and a small team of bilingual drivers I personally trained. I answer every WhatsApp myself. I still drive several routes per week from La Fortuna. When you book with us, you&apos;re not a confirmation number — you&apos;re a guest in my country.
                  </p>
                  <p className="text-amber-300/90 italic">Pura vida.</p>
                </>
              ) : (
                <>
                  <p>
                    Hola, soy Diego — fundador de Private Travel CR. Empecé a manejar viajeros por Costa Rica en el 2006. Después de 16 años en dos de las empresas de transporte más grandes del país, decidí construir algo distinto — un servicio enfocado en confianza, flexibilidad y experiencia local real, no solo viajes.
                  </p>
                  <p>
                    Private Travel CR no es una plataforma. Somos yo, mi primo Anthony, y un equipo pequeño de choferes bilingües que entrené personalmente. Yo contesto cada WhatsApp. Todavía manejo varias rutas por semana desde La Fortuna. Cuando reservás con nosotros, no sos un número de confirmación — sos un huésped en mi país.
                  </p>
                  <p className="text-amber-300/90 italic">Pura vida.</p>
                </>
              )}
            </div>

            {/* Signature + role */}
            <div className="mt-8 flex items-end gap-4 border-t border-white/10 pt-6">
              <div>
                <div className="text-2xl font-bold text-white" style={{ fontFamily: "cursive" }}>
                  Diego Salas Oviedo
                </div>
                <div className="text-sm text-white/50 mt-1">
                  {isEn ? "Founder & Lead Driver · La Fortuna" : "Fundador y Chofer Principal · La Fortuna"}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-6 rounded-xl transition"
              >
                {isEn ? "Read our story" : "Leé nuestra historia"}
              </Link>
              <a
                href="https://wa.me/50686334133"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold py-3 px-6 rounded-xl transition"
              >
                <MessageCircle size={18} />
                {isEn ? "Message Diego" : "Escribile a Diego"}
              </a>
            </div>
          </motion.div>

          {/* Right column — Polaroid photo collage */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-1 lg:order-2"
          >
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {PHOTOS.map((photo, idx) => (
                <motion.div
                  key={photo.src}
                  initial={{ opacity: 0, y: 20, rotate: 0 }}
                  whileInView={{ opacity: 1, y: 0, rotate: photo.rotate }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: 0.15 + idx * 0.08 }}
                  whileHover={{ rotate: 0, scale: 1.05, zIndex: 10 }}
                  className="relative bg-white p-2 md:p-3 pb-6 md:pb-8 shadow-2xl shadow-black/50"
                  style={{ willChange: "transform" }}
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-200">
                    <Image
                      src={photo.src}
                      alt={isEn ? photo.altEn : photo.altEs}
                      fill
                      sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 250px"
                      className="object-cover"
                      quality={65}
                      // Below-the-fold — let the browser lazy-load all 6.
                      // Never use priority here; the LCP element is the hero
                      // photo, and stealing its priority budget would tank
                      // mobile Lighthouse scores.
                      loading="lazy"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Caption under collage */}
            <p className="text-center text-white/40 text-xs mt-6 italic">
              {isEn
                ? "Real customers, real trips — La Fortuna, Río Celeste, and beyond."
                : "Clientes reales, viajes reales — La Fortuna, Río Celeste y más."}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

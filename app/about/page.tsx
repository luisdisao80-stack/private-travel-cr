"use client";

import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Compass,
  Users,
  MessageCircle,
  Calendar,
  MapPin,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { useLanguage } from "@/lib/LanguageContext";

export default function AboutPage() {
  const { t, lang } = useLanguage();

  const whatsappNumber = "50686334133";
  const whatsappMessage = encodeURIComponent(
    lang === "es"
      ? "¡Hola Private Travel CR! Vi su página y quiero cotizar un shuttle privado."
      : "Hello Private Travel CR! I saw your website and want to book a private shuttle."
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <main key={lang} className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-amber-500/30 bg-amber-500/5">
            <Heart className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
              {t.about.hero.badge}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            {t.about.hero.titlePart1}
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              {t.about.hero.titlePart2}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            {t.about.hero.subtitle}
          </p>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="relative px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
              {t.about.story.badge}
            </span>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold">
              {t.about.story.title}
            </h2>
          </div>

          {/* Photo placeholder */}
          <div className="mb-12 mx-auto max-w-2xl">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-950">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Users className="w-10 h-10 text-amber-400" />
                  </div>
                  <p className="text-sm text-white/40 italic">
                    {lang === "es"
                      ? "Foto de Diego y Anthony — La Fortuna, Costa Rica"
                      : "Photo of Diego and Anthony — La Fortuna, Costa Rica"}
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(251,191,36,0.15),transparent_50%)]" />
            </div>
          </div>

          {/* Story chapters */}
          <div className="space-y-12">
            {/* Chapter 1: 2006 */}
            <article className="relative pl-8 md:pl-12 border-l-2 border-amber-500/30">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-400 tracking-widest uppercase">
                  2006
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {t.about.story.chapter1.title}
              </h3>
              <p className="text-white/70 text-lg leading-relaxed">
                {t.about.story.chapter1.body}
              </p>
            </article>

            {/* Chapter 2: 15 años */}
            <article className="relative pl-8 md:pl-12 border-l-2 border-amber-500/30">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
              <div className="flex items-center gap-2 mb-3">
                <Compass className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-400 tracking-widest uppercase">
                  {t.about.story.chapter2.eyebrow}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {t.about.story.chapter2.title}
              </h3>
              <p className="text-white/70 text-lg leading-relaxed">
                {t.about.story.chapter2.body}
              </p>
            </article>

            {/* Chapter 3: 2021 */}
            <article className="relative pl-8 md:pl-12 border-l-2 border-amber-500/30">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-400 tracking-widest uppercase">
                  2021
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {t.about.story.chapter3.title}
              </h3>
              <p className="text-white/70 text-lg leading-relaxed">
                {t.about.story.chapter3.body}
              </p>
            </article>

            {/* Chapter 4: Hoy */}
            <article className="relative pl-8 md:pl-12 border-l-2 border-amber-500/30">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-400 tracking-widest uppercase">
                  {t.about.story.chapter4.eyebrow}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {t.about.story.chapter4.title}
              </h3>
              <p className="text-white/70 text-lg leading-relaxed">
                {t.about.story.chapter4.body}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* VALUES SECTION */}
      <section className="relative px-4 py-16 md:py-24 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
              {t.about.values.badge}
            </span>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold">
              {t.about.values.title}
            </h2>
            <p className="mt-4 text-white/60 max-w-2xl mx-auto">
              {t.about.values.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="group relative p-8 rounded-2xl border border-white/10 bg-zinc-950/50 hover:border-amber-500/40 transition-all duration-300">
              <div className="w-12 h-12 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <Heart className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.about.values.family.title}</h3>
              <p className="text-white/60 leading-relaxed">
                {t.about.values.family.description}
              </p>
            </div>

            <div className="group relative p-8 rounded-2xl border border-white/10 bg-zinc-950/50 hover:border-amber-500/40 transition-all duration-300">
              <div className="w-12 h-12 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <Compass className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.about.values.purpose.title}</h3>
              <p className="text-white/60 leading-relaxed">
                {t.about.values.purpose.description}
              </p>
            </div>

            <div className="group relative p-8 rounded-2xl border border-white/10 bg-zinc-950/50 hover:border-amber-500/40 transition-all duration-300">
              <div className="w-12 h-12 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <MapPin className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                {t.about.values.costaRica.title}
              </h3>
              <p className="text-white/60 leading-relaxed">
                {t.about.values.costaRica.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative px-4 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-zinc-950 to-zinc-950 p-8 md:p-16 text-center">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                {t.about.cta.title}
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                {t.about.cta.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-amber-400 text-black font-bold text-lg hover:bg-amber-300 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t.about.cta.whatsapp}
                </a>
                <Link
                  href="/#cotizador"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/20 text-white font-bold text-lg hover:bg-white/5 transition-colors"
                >
                  {t.about.cta.quote}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </main>
  );
}

"use client";

import Link from "next/link";
import { Check, Crown, ArrowRight, Sparkles, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import Price from "@/components/Price";

export default function ServiceComparison() {
  const { t } = useLanguage();

  // Iconos especiales para los primeros 3 features del VIP. Length
  // must match (or exceed) t.services.vip.features.length — adding a
  // feature without bumping this array makes vipIcons[idx] undefined
  // and the IconComp render explodes the build. Padding with Check
  // catches any future additions safely.
  const vipIcons = [Clock, MapPin, Sparkles, Check, Check, Check, Check, Check];

  return (
    <section
      id="servicios"
      className="relative py-24 px-4 bg-white overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.1),transparent_60%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="reveal text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 border border-slate-200 mb-4">
            <span className="text-orange-600 text-sm font-medium tracking-wider">
              {t.services.badge}
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-blue-900 mb-4 tracking-tight">
            {t.services.titlePart1}
            <span className="block text-orange-600">
              {t.services.titlePart2}
            </span>
          </h2>

          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            {t.services.subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch">
          {/* STANDARD CARD */}
          <div className="reveal reveal-d1 relative flex">
            <div className="w-full flex flex-col bg-white border border-slate-200 rounded-3xl p-8 hover:border-slate-300 transition-all duration-300">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 mb-6 self-start">
                <span className="text-slate-600 text-xs font-medium tracking-wider">
                  {t.services.standard.badge}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-4xl font-bold text-blue-900 mb-3">{t.services.standard.name}</h3>
              <p className="text-slate-500 mb-6">
                {t.services.standard.description}
              </p>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-slate-200">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  {t.services.standard.priceLabel}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-blue-900"><Price usd={90} /></span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {t.services.standard.priceNote}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8 flex-grow">
                {t.services.standard.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} className="text-slate-600" />
                    </div>
                    <span className="text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full h-14 border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900 font-semibold mt-auto"
              >
                <Link href="/routes">
                  {t.services.standard.cta}
                  <ArrowRight className="ml-2" size={18} />
                </Link>
              </Button>

              <p className="text-xs text-slate-500 text-center mt-4">
                {t.services.standard.ideal}
              </p>
            </div>
          </div>

          {/* VIP CARD */}
          <div className="reveal reveal-d2 relative flex">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-orange-600 rounded-3xl opacity-30 blur-2xl" />

            <div className="relative w-full flex flex-col bg-orange-50 border-2 border-orange-300 rounded-3xl p-8 transition-all duration-300">
              {/* Badge MOST POPULAR */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-orange-600 text-white text-xs font-bold tracking-wider shadow-lg whitespace-nowrap">
                {t.services.vip.badgePopular}
              </div>

              {/* Badge top */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-300 mb-6 self-start">
                <Crown size={12} className="text-orange-600" />
                <span className="text-orange-600 text-xs font-bold tracking-wider">
                  {t.services.vip.badgeTop}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-4xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                {t.services.vip.name}
                <Crown size={28} className="text-orange-600" />
              </h3>
              <p className="text-slate-600 mb-6">
                {t.services.vip.description}
              </p>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-slate-200">
                <div className="text-xs text-orange-600 uppercase tracking-wider mb-1">
                  {t.services.vip.priceLabel}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-orange-600">
                    <Price usd={160} />
                  </span>
                </div>
                <p className="text-xs text-orange-600/80 mt-1">
                  {t.services.vip.priceNote}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8 flex-grow">
                {t.services.vip.features.map((feature, idx) => {
                  // Fall back to Check if the icon array hasn't been
                  // updated for a newly-added feature — better a generic
                  // check than a crashed page.
                  const IconComp = vipIcons[idx] ?? Check;
                  const isHighlighted = idx < 3;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <IconComp size={12} className="text-orange-600" />
                      </div>
                      <span className={isHighlighted ? "text-slate-900" : "text-slate-600"}>
                        <strong>{feature.label}</strong>
                        {feature.sub && (
                          <span className="text-slate-500"> {feature.sub}</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <Button
                asChild
                size="lg"
                className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold text-base shadow-2xl shadow-orange-600/25 mt-auto"
              >
                <Link href="/routes">
                  {t.services.vip.cta}
                  <Crown className="ml-2" size={18} />
                </Link>
              </Button>

              <p className="text-xs text-orange-600/70 text-center mt-4">
                {t.services.vip.ideal}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom info */}
        <div className="reveal reveal-d3 mt-12 text-center">
          <p className="text-slate-500 text-sm">
            {t.services.notSure}{" "}
            <a
              href="https://wa.me/50686334133"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              {t.services.chatWhatsapp}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

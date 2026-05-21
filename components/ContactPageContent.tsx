"use client";

import Link from "next/link";
import {
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { siteConfig } from "@/lib/site-config";
import ContactForm from "@/components/ContactForm";

export default function ContactPageContent() {
  const { t } = useLanguage();

  const whatsappUrl =
    "https://wa.me/50686334133?text=" +
    encodeURIComponent("Hello Private Travel CR! I have a question.");

  return (
    <>
      {/* HERO with background image */}
      <section className="relative isolate min-h-[55vh] flex items-center justify-center overflow-hidden">
        <img
          src="/blog/manuel-antonio-jungle-coast.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/85 z-[1]" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-amber-500/15 border border-amber-500/40 backdrop-blur-sm">
            <MessageCircle className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-xs font-semibold tracking-widest text-amber-300 uppercase">
              {t.contact.pageBadge}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight leading-[1.1]">
            {t.contact.pageTitle}
          </h1>
          <p className="text-base md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
            {t.contact.pageSubtitle}
          </p>
        </div>
      </section>

      {/* 3 floating contact cards — overlap the hero bottom */}
      <section className="relative z-20 -mt-16 md:-mt-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-green-500/30 hover:border-green-500/60 transition-all shadow-2xl shadow-black/50"
          >
            <div className="flex items-center gap-4 mb-3">
              <div
                style={{ width: "48px", height: "48px" }}
                className="rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center group-hover:bg-green-500/25 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">
                  {t.contact.cardWhatsappLabel}
                </h3>
                <p className="text-xs text-gray-400">
                  {t.contact.cardWhatsappTagline}
                </p>
              </div>
            </div>
            <p className="text-green-400 font-semibold text-sm mt-2">
              +506 8633-4133
            </p>
          </a>

          {/* Email */}
          <a
            href={`mailto:${siteConfig.business.email}`}
            className="group p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-amber-500/30 hover:border-amber-500/60 transition-all shadow-2xl shadow-black/50"
          >
            <div className="flex items-center gap-4 mb-3">
              <div
                style={{ width: "48px", height: "48px" }}
                className="rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-500/25 transition-colors"
              >
                <Mail className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">
                  {t.contact.cardEmailLabel}
                </h3>
                <p className="text-xs text-gray-400">
                  {t.contact.cardEmailTagline}
                </p>
              </div>
            </div>
            <p className="text-amber-400 font-semibold text-sm mt-2 break-all">
              {siteConfig.business.email}
            </p>
          </a>

          {/* Phone */}
          <a
            href="tel:+50686334133"
            className="group p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-orange-500/30 hover:border-orange-500/60 transition-all shadow-2xl shadow-black/50"
          >
            <div className="flex items-center gap-4 mb-3">
              <div
                style={{ width: "48px", height: "48px" }}
                className="rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center group-hover:bg-orange-500/25 transition-colors"
              >
                <Phone className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">
                  {t.contact.cardPhoneLabel}
                </h3>
                <p className="text-xs text-gray-400">
                  {t.contact.cardPhoneTagline}
                </p>
              </div>
            </div>
            <p className="text-orange-400 font-semibold text-sm mt-2">
              +506 8633-4133
            </p>
          </a>
        </div>
      </section>

      {/* 2-column: form + info */}
      <section className="relative px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT — Form (3 columns wide on desktop) */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 md:p-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                {t.contact.formSectionTitle}
              </h2>
              {/* The existing form component handles everything inside.
                  embedded=true skips its built-in section, header and the
                  duplicate WhatsApp/Email links at the bottom (those are
                  already in the 3 hero cards above). */}
              <ContactForm embedded />
            </div>
          </div>

          {/* RIGHT — Location + FAQ CTA (2 columns wide) */}
          <aside className="lg:col-span-2 space-y-6">
            {/* Location card */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-4 mb-4">
                <div
                  style={{ width: "48px", height: "48px" }}
                  className="rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center"
                >
                  <MapPin className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">
                    {t.contact.sidebarLocationTitle}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {t.contact.sidebarLocationSubtitle}
                  </p>
                </div>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {t.contact.sidebarLocationDescription}
              </p>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                <span aria-hidden="true" className="text-base shrink-0">
                  📍
                </span>
                <p className="text-amber-300 text-sm leading-relaxed">
                  {t.contact.sidebarServingBanner}
                </p>
              </div>
            </div>

            {/* FAQ CTA card */}
            <div className="bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/40 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-3">
                <div
                  style={{ width: "40px", height: "40px" }}
                  className="rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center"
                >
                  <HelpCircle className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="text-white font-bold text-xl">
                  {t.contact.sidebarFaqTitle}
                </h3>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed mb-5">
                {t.contact.sidebarFaqDescription}
              </p>
              <Link
                href="/#faq"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors"
              >
                {t.contact.sidebarFaqButton}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

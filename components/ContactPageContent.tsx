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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-orange-50 border border-orange-300 backdrop-blur-sm">
            <MessageCircle className="w-3.5 h-3.5 text-orange-600" />
            <span className="text-xs font-semibold tracking-widest text-orange-600 uppercase">
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
            className="group p-6 rounded-2xl bg-white border border-green-600/30 hover:border-green-600/60 transition-all shadow-lg shadow-slate-900/10"
          >
            <div className="flex items-center gap-4 mb-3">
              <div
                style={{ width: "48px", height: "48px" }}
                className="rounded-xl bg-green-50 border border-green-200 flex items-center justify-center group-hover:bg-green-100 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-blue-900 font-bold text-lg">
                  {t.contact.cardWhatsappLabel}
                </h3>
                <p className="text-xs text-slate-500">
                  {t.contact.cardWhatsappTagline}
                </p>
              </div>
            </div>
            <p className="text-green-700 font-semibold text-sm mt-2">
              +506 8633-4133
            </p>
          </a>

          {/* Email */}
          <a
            href={`mailto:${siteConfig.business.email}`}
            className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-400 transition-all shadow-lg shadow-slate-900/10"
          >
            <div className="flex items-center gap-4 mb-3">
              <div
                style={{ width: "48px", height: "48px" }}
                className="rounded-xl bg-orange-50 border border-slate-200 flex items-center justify-center group-hover:bg-orange-100 transition-colors"
              >
                <Mail className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-blue-900 font-bold text-lg">
                  {t.contact.cardEmailLabel}
                </h3>
                <p className="text-xs text-slate-500">
                  {t.contact.cardEmailTagline}
                </p>
              </div>
            </div>
            <p className="text-orange-600 font-semibold text-sm mt-2 break-all">
              {siteConfig.business.email}
            </p>
          </a>

          {/* Phone */}
          <a
            href="tel:+50686334133"
            className="group p-6 rounded-2xl bg-white border border-orange-200 hover:border-orange-400 transition-all shadow-lg shadow-slate-900/10"
          >
            <div className="flex items-center gap-4 mb-3">
              <div
                style={{ width: "48px", height: "48px" }}
                className="rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center group-hover:bg-orange-100 transition-colors"
              >
                <Phone className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-blue-900 font-bold text-lg">
                  {t.contact.cardPhoneLabel}
                </h3>
                <p className="text-xs text-slate-500">
                  {t.contact.cardPhoneTagline}
                </p>
              </div>
            </div>
            <p className="text-orange-600 font-semibold text-sm mt-2">
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
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10">
              <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6">
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
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-4 mb-4">
                <div
                  style={{ width: "48px", height: "48px" }}
                  className="rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center"
                >
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-blue-900 font-bold text-xl">
                    {t.contact.sidebarLocationTitle}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {t.contact.sidebarLocationSubtitle}
                  </p>
                </div>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {t.contact.sidebarLocationDescription}
              </p>

              <div className="p-4 rounded-xl bg-orange-50 border border-slate-200 flex items-start gap-2">
                <span aria-hidden="true" className="text-base shrink-0">
                  📍
                </span>
                <p className="text-orange-700 text-sm leading-relaxed">
                  {t.contact.sidebarServingBanner}
                </p>
              </div>
            </div>

            {/* FAQ CTA card */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-3">
                <div
                  style={{ width: "40px", height: "40px" }}
                  className="rounded-xl bg-orange-100 border border-orange-300 flex items-center justify-center"
                >
                  <HelpCircle className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-blue-900 font-bold text-xl">
                  {t.contact.sidebarFaqTitle}
                </h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">
                {t.contact.sidebarFaqDescription}
              </p>
              <Link
                href="/#faq"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-colors"
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

"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { FAQS_EN, FAQS_ES } from "@/lib/faqs";

export default function FAQSection() {
  const { t, lang } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = lang === "en" ? FAQS_EN : FAQS_ES;

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
      className="relative py-24 px-4 bg-white overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.08),transparent_70%)]" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="reveal text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 border border-slate-200 mb-4">
            <span className="text-orange-600 text-sm font-medium tracking-wider">
              {t.faq.badge}
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-blue-900 mb-4 tracking-tight">
            {t.faq.titlePart1}
            <span className="block text-orange-600">
              {t.faq.titlePart2}
            </span>
          </h2>

          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            {t.faq.subtitle}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`reveal reveal-d${Math.min(index + 1, 4)} group`}
            >
              <div
                className={`bg-white shadow-sm border rounded-2xl transition-all duration-300 ${
                  openIndex === index
                    ? "border-orange-300"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      style={{ width: "36px", height: "36px" }}
                      className={`rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        openIndex === index
                          ? "bg-orange-100 border border-orange-300"
                          : "bg-slate-50 border border-slate-200"
                      }`}
                    >
                      <HelpCircle
                        size={18}
                        className={
                          openIndex === index ? "text-orange-600" : "text-slate-500"
                        }
                      />
                    </div>
                    <h3
                      className={`font-semibold pt-1.5 transition-colors ${
                        openIndex === index ? "text-orange-600" : "text-slate-900"
                      }`}
                    >
                      {faq.question}
                    </h3>
                  </div>

                  {/* El giro del chevron ahora es una clase CSS en vez de
                      un motion.div animado. */}
                  <div
                    className={`flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown
                      size={20}
                      className={
                        openIndex === index ? "text-orange-600" : "text-slate-500"
                      }
                    />
                  </div>
                </button>

                {/* Answer stays in the DOM so Google indexes every Q&A,
                    even when visually collapsed. We use the grid-rows trick
                    (0fr → 1fr) for the height animation instead of
                    AnimatePresence's conditional mount. */}
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-hidden={openIndex !== index}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    openIndex === index
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pl-20">
                      <p className="text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="reveal mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-600/5 border border-slate-200">
            <MessageCircle size={24} className="text-orange-600 flex-shrink-0" />
            <p className="text-slate-600 text-sm">
              {t.faq.ctaText}{" "}
              <a
                href={`https://wa.me/50686334133?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                {t.faq.ctaLink}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

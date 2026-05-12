"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

"use client";

import { motion } from "framer-motion";
import { Award, Clock, ShieldCheck, Heart } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

// A compact 4-up trust-signal strip that sits between the Hero and the
// Reviews block. Built specifically to close the gap against legacy
// competitors (ILT, Interbus, etc.) who lead with "Since 2015" /
// "24/7 support" / "Licensed & insured" — claims modern visitors expect
// to see communicated explicitly.
//
// Each cell intentionally answers a different buyer-trust question:
//   1. How long have you been in business?           → Since 2022
//   2. What if my flight is delayed at 2 AM?         → 24/7 support
//   3. Are you a legit operator?                     → Licensed + insured
//   4. Am I supporting a local family business?      → 100% Costa Rican
//
// Kept as a client component because of the framer-motion fade-up.
// Below-the-fold so the JS chunk is dynamically imported from app/page.tsx.

type Badge = {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  titleEn: string;
  titleEs: string;
  subEn: string;
  subEs: string;
};

const BADGES: Badge[] = [
  {
    Icon: Award,
    titleEn: "Since 2022",
    titleEs: "Desde 2022",
    subEn: "Owner-operated, 1,000+ trips driven",
    subEs: "Operado por el dueño, 1.000+ viajes",
  },
  {
    Icon: Clock,
    titleEn: "24/7 Support",
    titleEs: "Soporte 24/7",
    subEn: "Driver tracks your flight — even at 2 AM",
    subEs: "Monitoreamos tu vuelo — incluso a las 2 AM",
  },
  {
    Icon: ShieldCheck,
    titleEn: "Licensed & Insured",
    titleEs: "Licenciados y asegurados",
    subEn: "Costa Rica MOPT-certified tourist transport",
    subEs: "Transporte turístico certificado por MOPT",
  },
  {
    Icon: Heart,
    titleEn: "100% Costa Rican",
    titleEs: "100% costarricense",
    subEn: "Family-owned, not a faceless agency",
    subEs: "Empresa familiar, no una agencia sin rostro",
  },
];

export default function TrustStrip() {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  return (
    <section
      aria-label={isEn ? "Trust signals" : "Señales de confianza"}
      className="relative py-12 md:py-16 px-4 bg-gradient-to-b from-black via-gray-950 to-black border-y border-amber-500/10"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {BADGES.map(({ Icon, titleEn, titleEs, subEn, subEs }, i) => (
            <motion.div
              key={titleEn}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col items-center text-center gap-2 md:gap-3"
            >
              <div
                style={{ width: "56px", height: "56px" }}
                className="rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0"
              >
                <Icon size={26} className="text-amber-400" />
              </div>
              <div>
                <div className="text-sm md:text-base font-bold text-white leading-tight">
                  {isEn ? titleEn : titleEs}
                </div>
                <div className="text-[11px] md:text-xs text-gray-400 leading-snug mt-1 max-w-[180px] mx-auto">
                  {isEn ? subEn : subEs}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

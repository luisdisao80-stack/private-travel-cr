"use client";

import QuoteCalculatorV2 from "@/components/QuoteCalculatorV2";
import { useLanguage } from "@/lib/LanguageContext";

type Props = { locations: string[] };

export default function QuoteSectionClient({ locations }: Props) {
  const { t, lang } = useLanguage();

  return (
    <section
      id="cotizador"
      className="relative py-20 px-4 bg-slate-50"
      key={lang}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.1),transparent_70%)]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 border border-slate-200 mb-4">
            <span className="text-orange-600 text-sm font-medium">
              {t.quote.sectionBadge}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            {t.quote.sectionTitle}
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            {t.quote.sectionSubtitle}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <QuoteCalculatorV2 locations={locations} />
        </div>
      </div>
    </section>
  );
}

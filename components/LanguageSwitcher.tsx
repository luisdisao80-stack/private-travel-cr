"use client";

import { useLanguage } from "@/lib/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="inline-flex items-center gap-0.5 p-1 rounded-full bg-white border border-slate-200 backdrop-blur-sm">
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider transition-all ${
          lang === "en"
            ? "bg-orange-600 text-white shadow-md"
            : "text-slate-500 hover:text-slate-900"
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => setLang("es")}
        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider transition-all ${
          lang === "es"
            ? "bg-orange-600 text-white shadow-md"
            : "text-slate-500 hover:text-slate-900"
        }`}
        aria-label="Cambiar a Español"
      >
        ES
      </button>
    </div>
  );
}

"use client";

import { useLanguage } from "@/lib/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="inline-flex items-center gap-0.5 p-1 rounded-full bg-black/40 border border-amber-500/20 backdrop-blur-sm">
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider transition-all ${
          lang === "en"
            ? "bg-amber-500 text-black shadow-md"
            : "text-gray-400 hover:text-white"
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => setLang("es")}
        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider transition-all ${
          lang === "es"
            ? "bg-amber-500 text-black shadow-md"
            : "text-gray-400 hover:text-white"
        }`}
        aria-label="Cambiar a Español"
      >
        ES
      </button>
    </div>
  );
}

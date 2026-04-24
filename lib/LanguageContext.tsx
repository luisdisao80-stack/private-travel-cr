"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, type Language } from "@/lib/translations";

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.en;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Inglés por defecto
  const [lang, setLangState] = useState<Language>("en");

  // Al cargar, verificar si hay idioma guardado en localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ptcr-lang") as Language | null;
    if (saved === "en" || saved === "es") {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("ptcr-lang", newLang);
  };

  const value: LanguageContextType = {
    lang,
    setLang,
    t: translations[lang],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

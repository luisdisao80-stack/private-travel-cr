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
  // Empezamos con ingles por defecto
  const [lang, setLangState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  // Solo al montar el componente, leemos localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ptcr-lang") as Language | null;
    if (saved === "en" || saved === "es") {
      setLangState(saved);
    }
    setMounted(true);
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

  // Hasta que no este montado, usamos el idioma por defecto (en)
  // Esto evita el doble renderizado que causa el bug de letras superpuestas
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ lang: "en", setLang, t: translations.en }}>
        {children}
      </LanguageContext.Provider>
    );
  }

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

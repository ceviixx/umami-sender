"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations, Language } from "./index";

const DEFAULT_LANG: Language = "en";
const STORAGE_KEY = "lang";

type I18nContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  locale: typeof translations["en"];
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>(DEFAULT_LANG);

  useEffect(() => {
    const storedLang = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (storedLang && translations[storedLang]) {
      setLangState(storedLang);
    }
  }, []);

  const setLang = (newLang: Language) => {
    localStorage.setItem(STORAGE_KEY, newLang);
    setLangState(newLang);
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, locale: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
};

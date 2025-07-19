// SESSION STORAGE
/*
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "./index";

const DEFAULT_LANG: Language = "en";

type I18nContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations["en"];
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>(DEFAULT_LANG);

  // Beim Laden initialisieren
  useEffect(() => {
    const storedLang = sessionStorage.getItem("lang") as Language | null;
    if (storedLang && translations[storedLang]) {
      setLangState(storedLang);
    }
  }, []);

  const setLang = (newLang: Language) => {
    sessionStorage.setItem("lang", newLang);
    setLangState(newLang);
  };

  const value: I18nContextType = {
    lang,
    setLang,
    t: translations[lang],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
*/


// LOCAL STORAGE
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

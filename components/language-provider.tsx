"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { normalizeLocale, requiredMessages, t, type Locale, type TranslationKey } from "@/lib/i18n";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  tr: (key: TranslationKey) => string;
  requiredMessage: string;
  apiLocale: "en" | "hi" | "hinglish";
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    const cookieLocale = document.cookie.match(/(?:^|;\s*)naksharix-language=([^;]+)/)?.[1];
    return normalizeLocale(window.localStorage.getItem("naksharix-language") ?? cookieLocale);
  });

  useEffect(() => {
    const cookieLocale = document.cookie.match(/(?:^|;\s*)naksharix-language=([^;]+)/)?.[1];
    const saved = window.localStorage.getItem("naksharix-language") ?? cookieLocale;
    updateLocale(normalizeLocale(saved), false);
    const listener = (event: StorageEvent) => {
      if (event.key === "naksharix-language") updateLocale(normalizeLocale(event.newValue), false);
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  function updateLocale(nextLocale: Locale, persist = true) {
    setLocaleState(nextLocale);
    document.documentElement.lang = nextLocale === "hi" ? "hi" : nextLocale === "hinglish" ? "hi-Latn" : "en";
    if (persist) {
      window.localStorage.setItem("naksharix-language", nextLocale);
      document.cookie = `naksharix-language=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent("naksharix-language-change", { detail: nextLocale }));
    }
  }

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    setLocale: (nextLocale) => updateLocale(nextLocale),
    tr: (key) => t(locale, key),
    requiredMessage: requiredMessages[locale],
    apiLocale: locale
  }), [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}

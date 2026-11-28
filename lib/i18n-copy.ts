import {normalizeLocale, type Locale} from "@/lib/i18n";

export type LocalizedCopy = readonly [string, string, string];

/** Exact dictionary keys; wording is never inferred from arbitrary server text. */
export function selectCopy<T extends Record<string, LocalizedCopy>>(dictionary: T, locale: Locale): {[K in keyof T]: string} {
  const index = locale === "hi" ? 1 : locale === "hinglish" ? 2 : 0;
  return Object.fromEntries(Object.entries(dictionary).map(([key, value]) => [key, value[index]])) as {[K in keyof T]: string};
}

/** LanguageProvider keeps the document language aligned with the current UI. */
export function currentClientLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const language = document.documentElement.lang.toLowerCase();
  if (language === "hi") return "hi";
  if (language === "hi-latn") return "hinglish";
  return normalizeLocale(document.cookie.match(/(?:^|;\s*)naksharix-language=([^;]+)/)?.[1]);
}

/** Only actual, published translations may be listed as hreflang alternates. */
export const publishedSeoPairs = [
  { en: "/", hi: "/hi" },
  { en: "/free-kundli", hi: "/hi/free-kundli" },
  { en: "/kundli-matching", hi: "/hi/kundli-milan" }
] as const;

/** Expansion inventory; these are NOT published or advertised language pages. */
export const seoLocaleExpansion = {
  indian: ["bn", "mr", "ta", "te", "gu", "kn", "ml", "pa", "or", "as", "ur", "ne", "sa", "kok", "mai", "sd", "ks", "doi", "mni", "brx", "sat"],
  international: ["es", "fr", "de", "pt", "ar", "id", "ja", "ko", "zh", "ru", "it", "tr", "th", "vi", "sw", "nl"]
} as const;

export function publishedSeoAlternates(path: string, siteUrl: string): Record<string, string> | undefined {
  const pair = publishedSeoPairs.find((item) => item.en === path || item.hi === path);
  if (!pair) return undefined;
  const origin = siteUrl.replace(/\/+$/, "");
  return { en: origin + pair.en, hi: origin + pair.hi, "x-default": origin + pair.en };
}

export function publishedDestinationForLocale(path: string, locale: "en" | "hi" | "hinglish"): string | undefined {
  const pair = publishedSeoPairs.find((item) => item.en === path || item.hi === path);
  return pair ? (locale === "hi" ? pair.hi : pair.en) : undefined;
}

import type { Locale } from "@/lib/i18n";

export type HoroscopePageKind =
  | "daily"
  | "weekly"
  | "monthly"
  | "weekly-love"
  | "yearly-2026"
  | "chinese-2026"
  | "numerology-monthly";

export type HoroscopeSelectorType = "zodiac" | "chinese" | "number";

export type HoroscopeOption = {
  slug: string;
  value: string;
  labels: Record<Locale, string>;
};

export type HoroscopeContent = {
  title: string;
  subtitle: string;
  overview: string;
  sections: Array<{ title: string; body: string }>;
  luckyColor: string;
  luckyNumber: string;
  luckyTime?: string;
  remedy: string;
  dos: string[];
  donts: string[];
};

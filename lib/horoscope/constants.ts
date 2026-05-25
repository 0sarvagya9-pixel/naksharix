import type { HoroscopeOption, HoroscopePageKind, HoroscopeSelectorType } from "@/lib/horoscope/types";
import type { Locale } from "@/lib/i18n";

export const zodiacOptions: HoroscopeOption[] = [
  { slug: "aries", value: "Aries", labels: { en: "Aries / Mesh", hi: "मेष", hinglish: "Aries / Mesh" } },
  { slug: "taurus", value: "Taurus", labels: { en: "Taurus / Vrishabh", hi: "वृषभ", hinglish: "Taurus / Vrishabh" } },
  { slug: "gemini", value: "Gemini", labels: { en: "Gemini / Mithun", hi: "मिथुन", hinglish: "Gemini / Mithun" } },
  { slug: "cancer", value: "Cancer", labels: { en: "Cancer / Kark", hi: "कर्क", hinglish: "Cancer / Kark" } },
  { slug: "leo", value: "Leo", labels: { en: "Leo / Singh", hi: "सिंह", hinglish: "Leo / Singh" } },
  { slug: "virgo", value: "Virgo", labels: { en: "Virgo / Kanya", hi: "कन्या", hinglish: "Virgo / Kanya" } },
  { slug: "libra", value: "Libra", labels: { en: "Libra / Tula", hi: "तुला", hinglish: "Libra / Tula" } },
  { slug: "scorpio", value: "Scorpio", labels: { en: "Scorpio / Vrishchik", hi: "वृश्चिक", hinglish: "Scorpio / Vrishchik" } },
  { slug: "sagittarius", value: "Sagittarius", labels: { en: "Sagittarius / Dhanu", hi: "धनु", hinglish: "Sagittarius / Dhanu" } },
  { slug: "capricorn", value: "Capricorn", labels: { en: "Capricorn / Makar", hi: "मकर", hinglish: "Capricorn / Makar" } },
  { slug: "aquarius", value: "Aquarius", labels: { en: "Aquarius / Kumbh", hi: "कुंभ", hinglish: "Aquarius / Kumbh" } },
  { slug: "pisces", value: "Pisces", labels: { en: "Pisces / Meen", hi: "मीन", hinglish: "Pisces / Meen" } }
];

export const chineseOptions: HoroscopeOption[] = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"].map((name) => ({
  slug: name.toLowerCase(),
  value: name,
  labels: { en: name, hi: name, hinglish: name }
}));

export const numerologyOptions: HoroscopeOption[] = Array.from({ length: 9 }, (_, index) => {
  const value = String(index + 1);
  return { slug: value, value, labels: { en: value, hi: value, hinglish: value } };
});

export const horoscopePageConfig: Record<HoroscopePageKind, {
  path: string;
  selectorType: HoroscopeSelectorType;
  defaultSlug: string;
  reportHref: string;
  titles: Record<Locale, string>;
  subtitles: Record<Locale, string>;
  selectorLabel: Record<Locale, string>;
  metadata: { title: string; description: string; keywords: string[] };
}> = {
  daily: {
    path: "/daily-horoscope",
    selectorType: "zodiac",
    defaultSlug: "aries",
    reportHref: "/reports/yearly-horoscope-report",
    titles: { en: "Daily Horoscope", hi: "दैनिक राशिफल", hinglish: "Daily Horoscope" },
    subtitles: {
      en: "Select your zodiac/rashi for calm daily sign-based guidance.",
      hi: "सामान्य दैनिक राशि-आधारित मार्गदर्शन के लिए अपनी राशि चुनें।",
      hinglish: "Calm daily sign-based guidance ke liye apni rashi select karein."
    },
    selectorLabel: { en: "Select zodiac/rashi", hi: "राशि चुनें", hinglish: "Rashi select karein" },
    metadata: { title: "Daily Horoscope | Naksharix", description: "Read general daily horoscope guidance by zodiac/rashi with love, career, money, wellness, remedy, and trust notes.", keywords: ["Daily Horoscope", "Aaj Ka Rashifal"] }
  },
  weekly: {
    path: "/weekly-horoscope",
    selectorType: "zodiac",
    defaultSlug: "aries",
    reportHref: "/reports/yearly-horoscope-report",
    titles: { en: "Weekly Horoscope", hi: "साप्ताहिक राशिफल", hinglish: "Weekly Horoscope" },
    subtitles: { en: "Choose one zodiac/rashi and review the week with practical reflection points.", hi: "एक राशि चुनें और सप्ताह के लिए व्यावहारिक मार्गदर्शन देखें।", hinglish: "Ek rashi choose karein aur week ke practical guidance points dekhein." },
    selectorLabel: { en: "Select zodiac/rashi", hi: "राशि चुनें", hinglish: "Rashi select karein" },
    metadata: { title: "Weekly Horoscope | Naksharix", description: "Explore weekly zodiac/rashi guidance with relationship, work, money, family, remedy, do's and don'ts.", keywords: ["Weekly Horoscope"] }
  },
  monthly: {
    path: "/monthly-horoscope",
    selectorType: "zodiac",
    defaultSlug: "aries",
    reportHref: "/reports/yearly-horoscope-report",
    titles: { en: "Monthly Horoscope", hi: "मासिक राशिफल", hinglish: "Monthly Horoscope" },
    subtitles: { en: "A focused monthly view for your selected zodiac/rashi.", hi: "चुनी हुई राशि के लिए मासिक मार्गदर्शन।", hinglish: "Selected rashi ke liye monthly guidance." },
    selectorLabel: { en: "Select zodiac/rashi", hi: "राशि चुनें", hinglish: "Rashi select karein" },
    metadata: { title: "Monthly Horoscope | Naksharix", description: "Read monthly horoscope guidance by zodiac/rashi for love, career, finance, wellness, family, and remedies.", keywords: ["Monthly Horoscope"] }
  },
  "weekly-love": {
    path: "/weekly-love-horoscope",
    selectorType: "zodiac",
    defaultSlug: "aries",
    reportHref: "/reports/love-report",
    titles: { en: "Weekly Love Horoscope", hi: "साप्ताहिक प्रेम राशिफल", hinglish: "Weekly Love Horoscope" },
    subtitles: { en: "Relationship-focused weekly guidance for your zodiac/rashi.", hi: "आपकी राशि के लिए संबंध-केंद्रित साप्ताहिक मार्गदर्शन।", hinglish: "Aapki rashi ke liye relationship-focused weekly guidance." },
    selectorLabel: { en: "Select zodiac/rashi", hi: "राशि चुनें", hinglish: "Rashi select karein" },
    metadata: { title: "Weekly Love Horoscope | Naksharix", description: "Read weekly love horoscope guidance for singles, couples, emotional clarity, communication, and practical relationship care.", keywords: ["Weekly Love Horoscope", "Love Horoscope"] }
  },
  "yearly-2026": {
    path: "/yearly-horoscope-2026",
    selectorType: "zodiac",
    defaultSlug: "aries",
    reportHref: "/reports/yearly-horoscope-report",
    titles: { en: "Yearly Horoscope 2026", hi: "वार्षिक राशिफल 2026", hinglish: "Yearly Horoscope 2026" },
    subtitles: { en: "General 2026 sign-based themes for planning and self-reflection.", hi: "2026 के लिए सामान्य राशि-आधारित योजना और चिंतन संकेत।", hinglish: "2026 ke general sign-based planning aur reflection themes." },
    selectorLabel: { en: "Select zodiac/rashi", hi: "राशि चुनें", hinglish: "Rashi select karein" },
    metadata: { title: "Yearly Horoscope 2026 | Naksharix", description: "Explore general 2026 yearly horoscope guidance by zodiac/rashi with practical, non-fear-based advice.", keywords: ["Yearly Horoscope 2026"] }
  },
  "chinese-2026": {
    path: "/chinese-horoscope-2026",
    selectorType: "chinese",
    defaultSlug: "rat",
    reportHref: "/reports/yearly-horoscope-report",
    titles: { en: "Chinese Horoscope 2026", hi: "चीनी राशिफल 2026", hinglish: "Chinese Horoscope 2026" },
    subtitles: { en: "Choose one Chinese zodiac animal for general 2026 reflection.", hi: "2026 के सामान्य मार्गदर्शन के लिए चीनी zodiac animal चुनें।", hinglish: "2026 ke general reflection ke liye Chinese zodiac animal select karein." },
    selectorLabel: { en: "Select Chinese zodiac", hi: "चीनी zodiac चुनें", hinglish: "Chinese zodiac select karein" },
    metadata: { title: "Chinese Horoscope 2026 | Naksharix", description: "Read general Chinese Horoscope 2026 guidance by animal sign with career, wealth, love, wellness, and practical advice.", keywords: ["Chinese Horoscope 2026"] }
  },
  "numerology-monthly": {
    path: "/numerology-monthly-horoscope",
    selectorType: "number",
    defaultSlug: "1",
    reportHref: "/reports/numerology-lo-shu-report",
    titles: { en: "Numerology Monthly Horoscope", hi: "अंक ज्योतिष मासिक राशिफल", hinglish: "Numerology Monthly Horoscope" },
    subtitles: { en: "Select a numerology number from 1 to 9 for general monthly guidance.", hi: "सामान्य मासिक मार्गदर्शन के लिए 1 से 9 तक अंक चुनें।", hinglish: "General monthly guidance ke liye 1 se 9 tak number select karein." },
    selectorLabel: { en: "Select numerology number", hi: "अंक चुनें", hinglish: "Numerology number select karein" },
    metadata: { title: "Numerology Monthly Horoscope | Naksharix", description: "Explore monthly numerology guidance for numbers 1 to 9 with career, planning, relationships, energy, and remedies.", keywords: ["Numerology Monthly Horoscope"] }
  }
};

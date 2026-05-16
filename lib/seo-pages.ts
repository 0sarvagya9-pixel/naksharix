import type { LucideIcon } from "lucide-react";
import { CalendarDays, Gem, MoonStar, Sparkles, Star, WandSparkles } from "lucide-react";

export type SeoLandingPage = {
  slug: string;
  keyword: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  path: string;
  icon: LucideIcon;
  related: string[];
  faqs: { question: string; answer: string }[];
};

export const seoLandingPages: SeoLandingPage[] = [
  {
    slug: "astrology",
    keyword: "Astrology",
    title: "Astrology Platform for Personalized Cosmic Guidance",
    description: "Explore Naksharix Astrology for AI-powered horoscope, kundli, numerology, tarot reading, panchang, remedies, and premium cosmic reports.",
    h1: "Premium Astrology Guidance",
    intro: "Naksharix brings modern AI assistance to traditional astrology workflows, helping users understand timing, personality, compatibility, daily rituals, and cosmic opportunities.",
    path: "/astrology",
    icon: WandSparkles,
    related: ["Horoscope", "Kundli", "Numerology", "Tarot Reading", "Panchang"],
    faqs: [
      { question: "What is Naksharix Astrology?", answer: "Naksharix Astrology combines horoscope, kundli, tarot, numerology, panchang, and AI guidance in one premium astrology platform." },
      { question: "Is the astrology guidance personalized?", answer: "Yes. Naksharix can use birth details, preferences, and historical readings to generate more personalized insights." }
    ]
  },
  {
    slug: "horoscope",
    keyword: "Horoscope",
    title: "Horoscope Readings for Daily, Weekly, Monthly and Yearly Predictions",
    description: "Get Naksharix Horoscope readings for love, career, finance, health, daily horoscope, weekly horoscope, monthly horoscope, and yearly horoscope.",
    h1: "AI Horoscope Readings",
    intro: "Generate horoscope guidance by zodiac sign, category, and time period, with lucky number, lucky color, gemstone, and practical daily direction.",
    path: "/horoscope",
    icon: Star,
    related: ["Astrology", "Kundli", "Panchang"],
    faqs: [
      { question: "Can I get a daily horoscope?", answer: "Yes. Naksharix supports daily, weekly, monthly, yearly, love, career, finance, and health horoscope readings." },
      { question: "Does Naksharix support personalized horoscope?", answer: "Yes. Horoscope generation can use date of birth, time, and place for more personalized context." }
    ]
  },
  {
    slug: "kundli",
    keyword: "Kundli",
    title: "Kundli Generator with Lagna, Navamsa, Dasha and Manglik Analysis",
    description: "Create a Naksharix Kundli with planets, houses, lagna chart, navamsa chart, dasha system, yog analysis, dosha analysis, manglik analysis, and panchang.",
    h1: "Kundli Generator",
    intro: "Build detailed Vedic astrology birth charts with birth date, time, and place, then review charts, planetary positions, dashas, doshas, and report-ready insights.",
    path: "/kundli",
    icon: MoonStar,
    related: ["Astrology", "Horoscope", "Panchang"],
    faqs: [
      { question: "What details are needed to generate a Kundli?", answer: "Naksharix uses name, date of birth, birth time, birth place, latitude, longitude, and timezone." },
      { question: "Does the Kundli include Manglik analysis?", answer: "Yes. The Kundli module includes manglik, dosha, yog, dasha, lagna, navamsa, and panchang data." }
    ]
  },
  {
    slug: "numerology",
    keyword: "Numerology",
    title: "Numerology Calculator for Life Path, Destiny and Name Numbers",
    description: "Use Naksharix Numerology for life path number, destiny number, soul urge number, personality number, name numerology, mobile numerology, and daily predictions.",
    h1: "Numerology Calculator",
    intro: "Understand the vibration of your name and birth date through life path, destiny, soul urge, personality, mobile, and vehicle numerology insights.",
    path: "/numerology",
    icon: Gem,
    related: ["Astrology", "Horoscope", "Tarot Reading"],
    faqs: [
      { question: "What numerology numbers does Naksharix calculate?", answer: "Naksharix calculates life path, destiny, soul urge, personality, and name vibration numbers." },
      { question: "Can I use numerology for mobile or vehicle numbers?", answer: "Yes. The system includes extension points for mobile number and vehicle number numerology." }
    ]
  },
  {
    slug: "tarot-reading",
    keyword: "Tarot Reading",
    title: "Tarot Reading with AI Interpretation and Interactive Spreads",
    description: "Try Naksharix Tarot Reading for daily tarot, love tarot, career tarot, three-card spreads, Celtic cross spreads, and AI card interpretation.",
    h1: "Tarot Reading",
    intro: "Draw animated tarot spreads and receive reflective AI interpretations for daily guidance, love, career, choices, and personal clarity.",
    path: "/tarot",
    icon: Sparkles,
    related: ["Astrology", "Numerology", "Horoscope"],
    faqs: [
      { question: "Does Naksharix support multiple tarot spreads?", answer: "Yes. Naksharix supports daily, love, career, three-card, and Celtic cross tarot spreads." },
      { question: "Are tarot meanings AI-generated?", answer: "Yes. Tarot interpretations can be generated by AI while keeping guidance reflective and practical." }
    ]
  },
  {
    slug: "panchang",
    keyword: "Panchang",
    title: "Panchang with Tithi, Nakshatra, Rahu Kaal and Muhurat",
    description: "View Naksharix Panchang for tithi, nakshatra, rahu kaal, choghadiya, sunrise, sunset, festivals, Hindu calendar, and muhurat finder.",
    h1: "Daily Panchang",
    intro: "Review daily panchang details including tithi, nakshatra, rahu kaal, choghadiya, sunrise, sunset, festivals, and auspicious muhurat windows.",
    path: "/panchang",
    icon: CalendarDays,
    related: ["Astrology", "Kundli", "Horoscope"],
    faqs: [
      { question: "What does the Naksharix Panchang include?", answer: "It includes tithi, nakshatra, rahu kaal, choghadiya, sunrise, sunset, festival, and muhurat details." },
      { question: "Can Panchang be location-based?", answer: "Yes. Panchang calculations can use date, latitude, and longitude for location-aware results." }
    ]
  }
];

export function getSeoLandingPage(slug: string) {
  return seoLandingPages.find((page) => page.slug === slug);
}

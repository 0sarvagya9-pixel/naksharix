export type GrowthPage = {
  slug: string;
  path: string;
  title: string;
  description: string;
  h1: string;
  h2: string;
  intro: string;
  ctas: { label: string; href: string }[];
  faqs: { question: string; answer: string }[];
};

export const growthPages: Record<string, GrowthPage> = {
  "free-kundli": {
    slug: "free-kundli",
    path: "/free-kundli",
    title: "Free Kundli Generator - Naksharix",
    description: "Generate a free Kundli with birth details, planet positions, dasha themes, panchang snapshot, and premium report upgrade options.",
    h1: "Free Kundli Generator",
    h2: "Create a birth chart summary before choosing a premium report",
    intro: "Enter your name, date of birth, birth time, and birth place to generate a free Kundli summary on Naksharix.",
    ctas: [{ label: "Generate Free Kundli", href: "/kundli" }, { label: "AI Astrologer Coming Soon", href: "/ai-astrologer" }],
    faqs: [
      { question: "Is the free Kundli enough to start?", answer: "Yes. It gives a readable summary first, then offers a premium report for deeper detail." },
      { question: "What birth details are required?", answer: "Name, gender, date, time, place, latitude, longitude, timezone, and optional contact details." }
    ]
  },
  "kundli-matching": {
    slug: "kundli-matching",
    path: "/kundli-matching",
    title: "Kundli Matching Online - Naksharix",
    description: "Compare bride and groom birth details with compatibility score, Guna Milan, Manglik status, emotional fit, and remedies.",
    h1: "Kundli Matching Online",
    h2: "Compare compatibility with a clean match report",
    intro: "Use Naksharix kundli matching for Guna Milan, Manglik context, relationship patterns, and practical marriage recommendations.",
    ctas: [{ label: "Generate Match", href: "/matchmaking" }, { label: "View Couple Report", href: "/reports/couple-kundli" }],
    faqs: [
      { question: "Does matching include Manglik review?", answer: "Yes. The match result includes Manglik compatibility context and remedies." },
      { question: "Can AI explain the result?", answer: "Yes. Gemini can generate a human-readable relationship interpretation when configured." }
    ]
  },
  "daily-horoscope": {
    slug: "daily-horoscope",
    path: "/daily-horoscope",
    title: "Daily Horoscope - Naksharix",
    description: "Read daily horoscope for all zodiac signs with lucky number, lucky color, gemstone, category, and Hindi/English support.",
    h1: "Daily Horoscope",
    h2: "Your daily cosmic guidance by zodiac sign",
    intro: "Choose your zodiac sign, category, period, and language to get a clean daily horoscope without raw JSON or technical output.",
    ctas: [{ label: "Open Horoscope", href: "/horoscope" }, { label: "All Signs Today", href: "/horoscope/all-signs/today" }],
    faqs: [
      { question: "Can I read horoscope in Hindi?", answer: "Yes. Hindi output uses Devanagari text, not Roman Hindi." },
      { question: "Can I choose love or career?", answer: "Yes. Categories include general, love, career, finance, health, education, family, and travel." }
    ]
  },
  "weekly-horoscope": {
    slug: "weekly-horoscope",
    path: "/weekly-horoscope",
    title: "Weekly Horoscope - Naksharix",
    description: "Plan your week with Naksharix weekly horoscope for career, love, finance, health, and daily focus.",
    h1: "Weekly Horoscope",
    h2: "Plan your week with calmer astrological context",
    intro: "Weekly horoscope helps you understand themes, timing, and practical choices across love, work, family, travel, and finance.",
    ctas: [{ label: "Horoscope Coming Soon", href: "/horoscope" }, { label: "AI Astrologer Coming Soon", href: "/ai-astrologer" }],
    faqs: [
      { question: "Is weekly horoscope personalized?", answer: "It can use zodiac and birth context when available." },
      { question: "Can I upgrade after reading?", answer: "Yes. Premium yearly and career reports are available." }
    ]
  },
  "monthly-horoscope": {
    slug: "monthly-horoscope",
    path: "/monthly-horoscope",
    title: "Monthly Horoscope - Naksharix",
    description: "Get monthly horoscope insights for zodiac signs, career planning, relationships, money, health, and remedies.",
    h1: "Monthly Horoscope",
    h2: "Understand the larger themes of your month",
    intro: "Monthly horoscope gives a wider planning view with practical signals for routines, decisions, and relationships.",
    ctas: [{ label: "Horoscope Coming Soon", href: "/horoscope" }, { label: "View Yearly Report", href: "/reports/yearly-horoscope-report" }],
    faqs: [
      { question: "Does it include remedies?", answer: "Yes. The generated guidance includes a gentle practical remedy." },
      { question: "Does it show lucky details?", answer: "Yes. Horoscope results include lucky number, color, and gemstone." }
    ]
  },
  "yearly-horoscope-2026": {
    slug: "yearly-horoscope-2026",
    path: "/yearly-horoscope-2026",
    title: "Yearly Horoscope 2026 - Naksharix",
    description: "Explore Yearly Horoscope 2026 with career, love, finance, health, lucky periods, and premium AI yearly prediction report.",
    h1: "Yearly Horoscope 2026",
    h2: "A broader planning view for the year ahead",
    intro: "Use the yearly horoscope route for annual themes and upgrade to a personalized 2026 prediction report when you need depth.",
    ctas: [{ label: "Horoscope Coming Soon", href: "/horoscope" }, { label: "View Yearly Report", href: "/reports/yearly-horoscope-report" }],
    faqs: [
      { question: "Is this for all signs?", answer: "Yes. You can choose your zodiac sign in the horoscope tool." },
      { question: "Can I get a detailed yearly PDF?", answer: "Yes. The Yearly Prediction Report includes structured sections and sample preview." }
    ]
  },
  "love-compatibility": {
    slug: "love-compatibility",
    path: "/love-compatibility",
    title: "Love Compatibility Astrology - Naksharix",
    description: "Check love compatibility through kundli matching, emotional fit, Manglik context, relationship guidance, and remedies.",
    h1: "Love Compatibility Astrology",
    h2: "Understand connection, timing, and communication patterns",
    intro: "Naksharix blends compatibility scoring with human-readable guidance so relationships can be approached with clarity, not fear.",
    ctas: [{ label: "Check Compatibility", href: "/matchmaking" }, { label: "View Couple Report", href: "/reports/couple-kundli" }],
    faqs: [
      { question: "Does astrology decide a relationship?", answer: "No. It offers reflection and context. Real compatibility needs communication and consent." },
      { question: "Can I ask AI about love?", answer: "Yes. Use the AI astrologer for follow-up questions." }
    ]
  },
  "career-astrology": {
    slug: "career-astrology",
    path: "/career-astrology",
    title: "Career Astrology - Naksharix",
    description: "Use career astrology to understand strengths, timing, professional patterns, and focused career report recommendations.",
    h1: "Career Astrology",
    h2: "Use your chart as a planning mirror for work",
    intro: "Career astrology can highlight working style, decision timing, communication patterns, and areas for conscious effort.",
    ctas: [{ label: "AI Astrologer Coming Soon", href: "/ai-astrologer" }, { label: "View Career Report", href: "/reports/career-report" }],
    faqs: [
      { question: "Can astrology guarantee a job?", answer: "No. Naksharix avoids deterministic claims and focuses on reflection and planning." },
      { question: "Does career report include remedies?", answer: "Yes. It includes practical and spiritual habit suggestions." }
    ]
  },
  "marriage-astrology": {
    slug: "marriage-astrology",
    path: "/marriage-astrology",
    title: "Marriage Astrology - Naksharix",
    description: "Explore marriage astrology with kundli matching, compatibility score, Manglik context, timing themes, and relationship remedies.",
    h1: "Marriage Astrology",
    h2: "Approach marriage questions with clarity and care",
    intro: "Marriage astrology on Naksharix helps frame compatibility, timing, family themes, communication patterns, and remedies.",
    ctas: [{ label: "Start Matching", href: "/matchmaking" }, { label: "View Couple Report", href: "/reports/couple-kundli" }],
    faqs: [
      { question: "Does this include Guna Milan?", answer: "Yes. The matchmaking module includes Guna Milan score and compatibility themes." },
      { question: "Is human consultation available?", answer: "Astrologer profiles and booking CTAs are ready for consultation workflows." }
    ]
  }
};

export const nakshatras = [
  "ashwini",
  "bharani",
  "krittika",
  "rohini",
  "mrigashira",
  "ardra",
  "punarvasu",
  "pushya",
  "ashlesha",
  "magha",
  "purva-phalguni",
  "uttara-phalguni",
  "hasta",
  "chitra",
  "swati",
  "vishakha",
  "anuradha",
  "jyeshtha",
  "mula",
  "purva-ashadha",
  "uttara-ashadha",
  "shravana",
  "dhanishta",
  "shatabhisha",
  "purva-bhadrapada",
  "uttara-bhadrapada",
  "revati"
];

export function titleFromSlug(slug: string) {
  return slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

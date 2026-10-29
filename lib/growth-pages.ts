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
  highlights?: string[];
  sections?: { heading: string; body: string }[];
};

export const growthPages: Record<string, GrowthPage> = {
  "free-kundli": {
    slug: "free-kundli",
    path: "/free-kundli",
    title: "Free Kundli Online | Vedic Birth Chart & Lagna Guide - Naksharix",
    description: "Start a free Janam Kundli with your birth date, time and place. Learn what lagna, rashi, nakshatra and dasha mean before reading a birth chart.",
    h1: "Free Kundli Online — Janam Kundli & Birth Chart",
    h2: "What a Vedic birth chart can tell you",
    intro: "A Kundli (Janam Kundali or birth chart) is a traditional Vedic astrology map based on birth date, local time and place. Start with the free chart, then explore the meaning of its houses, planetary placements, lagna, rashi and dasha cycles.",
    ctas: [{ label: "Generate Free Kundli", href: "/kundli" }, { label: "Read the Kundli Guide", href: "/learn/kundli-explained" }],
    highlights: ["Birth date, time and place", "Lagna, rashi and houses explained", "Interpretation is traditional guidance, not a guaranteed prediction"],
    sections: [
      { heading: "Which birth details matter?", body: "Enter the recorded date, time and birthplace as precisely as you know them. The location helps determine the local time zone; even a small birth-time error may affect a rising sign or the house boundaries near a transition. If the exact time is unknown, avoid treating fine-grained timing as certain." },
      { heading: "Lagna, rashi and nakshatra are different", body: "Lagna is the ascendant, or the zodiac sign rising at the eastern horizon for a particular moment and place. Rashi often refers to the Moon sign in Indian astrology. Nakshatra divides the ecliptic into lunar mansion segments. These describe different chart dimensions and should not be used interchangeably." },
      { heading: "How should I read a free chart?", body: "Start with the chart date, local time, birthplace and calculation conventions. Then review the ascendant, twelve houses and placements together rather than relying on one planet or an isolated dosha. Astrology is a cultural interpretive practice, not an established scientific method for predicting personal events." }
    ],
    faqs: [
      { question: "Is the free Kundli enough to start?", answer: "Yes. It gives a readable summary first, then offers a premium report for deeper detail." },
      { question: "What birth details are required?", answer: "Provide your birth date, recorded time and birthplace. The app resolves location coordinates internally where available; you do not need to calculate latitude and longitude yourself." },
      { question: "Is a Kundli scientifically proven to predict the future?", answer: "No. Astrology is a traditional interpretive practice. Use a chart for reflection and cultural interest, not as evidence or a substitute for professional decisions." }
    ]
  },
  "kundli-matching": {
    slug: "kundli-matching",
    path: "/kundli-matching",
    title: "Kundli Matching Online | Guna Milan & Manglik Guide - Naksharix",
    description: "Understand Kundli matching, 36-point Ashtakoota Guna Milan, nakshatra and Manglik concepts before using the optional Vedic compatibility calculator.",
    h1: "Kundli Matching Online — Guna Milan Explained",
    h2: "How the traditional Guna Milan system is read",
    intro: "Kundli matching (Kundali Milan) compares two traditional birth charts. Ashtakoota matching adds eight factors to a conventional total of 36 points. The result is one cultural reference point, never a guarantee of marriage success or a substitute for shared values, consent and conversation.",
    ctas: [{ label: "Generate Match", href: "/matchmaking" }, { label: "What is a Kundli?", href: "/learn/kundli-explained" }],
    highlights: ["Ashtakoota compares eight traditional factors", "The classical total is 36 Guna points", "A score alone cannot decide a relationship"],
    sections: [
      { heading: "What does a score out of 36 mean?", body: "The eight conventional kootas are Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot and Nadi. Their point totals are conventionally weighted to sum to 36. Different schools may interpret thresholds differently, and a single total hides the individual factor breakdown." },
      { heading: "What about Manglik and other chart factors?", body: "Manglik assessment is a separate traditional consideration, not one of the eight Guna factors. The result depends on calculation choices and is not a medical, psychological or relationship diagnosis. Read the explanation and limitations rather than accepting alarmist labels." },
      { heading: "What matters beyond a chart?", body: "A respectful partnership depends on personal compatibility, informed consent, communication, safety and shared expectations. Never use a Guna score or dosha label to pressure someone into or out of a marriage." }
    ],
    faqs: [
      { question: "What is Ashtakoota matching?", answer: "It is a traditional eight-factor comparison commonly scored out of 36 Guna points. The breakdown offers context beyond a single total." },
      { question: "Is Manglik part of the 36-point score?", answer: "No. Manglik is a separate traditional chart assessment. Treat its interpretation cautiously, not as a definitive label." },
      { question: "Can a score decide whether a couple should marry?", answer: "No. Relationship choices require mutual consent, compatibility, respect and informed judgment; astrology cannot guarantee an outcome." }
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
    ctas: [{ label: "Explore Horoscopes", href: "/horoscope" }, { label: "Explore AI Astrologer", href: "/ai-astrologer" }],
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
    ctas: [{ label: "Explore Horoscopes", href: "/horoscope" }, { label: "View Yearly Report", href: "/reports/yearly-horoscope-report" }],
    faqs: [
      { question: "Does it include remedies?", answer: "Yes. The generated guidance includes a gentle practical remedy." },
      { question: "Does it show lucky details?", answer: "Yes. Horoscope results include lucky number, color, and gemstone." }
    ]
  },
  "yearly-horoscope-2026": {
    slug: "yearly-horoscope-2026",
    path: "/yearly-horoscope-2026",
    title: "Yearly Horoscope 2026 - Naksharix",
    description: "Explore Yearly Horoscope 2026 with career, love, finance, health, lucky periods, and premium yearly prediction report.",
    h1: "Yearly Horoscope 2026",
    h2: "A broader planning view for the year ahead",
    intro: "Use the yearly horoscope route for annual themes and upgrade to a personalized 2026 prediction report when you need depth.",
    ctas: [{ label: "Explore Horoscopes", href: "/horoscope" }, { label: "View Yearly Report", href: "/reports/yearly-horoscope-report" }],
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
    ctas: [{ label: "Explore AI Astrologer", href: "/ai-astrologer" }, { label: "View Career Report", href: "/reports/career-report" }],
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

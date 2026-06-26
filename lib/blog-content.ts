export const blogPosts = [
  {
    slug: "daily-horoscope-personalization",
    title: "How daily horoscope personalization works",
    description: "Learn how Naksharix connects daily horoscope readings with birth context, astrology timing, and reviewed report workflows.",
    category: "horoscope",
    tags: ["Daily Horoscope", "Personalized Horoscope", "Horoscope"],
    body: "Personalized horoscope work combines sign-level timing, birth context, current transits, and reviewed interpretation that turns symbolic patterns into practical guidance."
  },
  {
    slug: "kundli-matching-score",
    title: "Kundli matching beyond a single score",
    description: "Understand Naksharix Kundli matching with Gun Milan, manglik balance, compatibility, and relationship analysis.",
    category: "kundli",
    tags: ["Kundli", "Kundli Matching", "Gun Milan"],
    body: "Gun Milan is useful, but production matchmaking should also surface manglik balance, emotional rhythm, family expectations, financial compatibility, and practical communication cues."
  },
  {
    slug: "tarot-reflection",
    title: "Tarot prompts for reflective decisions",
    description: "Explore Tarot Reading prompts that support clarity, agency, and practical reflection with Naksharix.",
    category: "tarot",
    tags: ["Tarot Reading", "Daily Tarot", "Reflective Tarot"],
    body: "Tarot works best as a structured reflection tool. Interpretation should support agency, identify options, and avoid turning uncertainty into false certainty."
  }
] as const;

export const blogCategories = [
  { slug: "horoscope", name: "Horoscope", description: "Daily, weekly, monthly, yearly, love, career, finance, and health horoscope guidance." },
  { slug: "kundli", name: "Kundli", description: "Birth chart, matchmaking, Gun Milan, dosha, dasha, and Vedic astrology explainers." },
  { slug: "tarot", name: "Tarot", description: "Tarot reading prompts, spreads, and reflective decision guides." },
  { slug: "numerology", name: "Numerology", description: "Life path, destiny, soul urge, name, mobile number, and daily numerology content." },
  { slug: "panchang", name: "Panchang", description: "Tithi, nakshatra, rahu kaal, choghadiya, festivals, muhurat, and Hindu calendar guidance." }
] as const;

export type BlogCategorySlug = (typeof blogCategories)[number]["slug"];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getBlogCategory(slug: string) {
  return blogCategories.find((category) => category.slug === slug);
}

export function getPostsByCategory(slug: string) {
  return blogPosts.filter((post) => post.category === slug);
}

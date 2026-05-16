export const zodiacSigns = [
  { slug: "aries", name: "Aries", element: "Fire", focus: "initiative, courage, and momentum" },
  { slug: "taurus", name: "Taurus", element: "Earth", focus: "stability, comfort, and long-term value" },
  { slug: "gemini", name: "Gemini", element: "Air", focus: "communication, learning, and adaptability" },
  { slug: "cancer", name: "Cancer", element: "Water", focus: "home, intuition, and emotional safety" },
  { slug: "leo", name: "Leo", element: "Fire", focus: "confidence, creativity, and recognition" },
  { slug: "virgo", name: "Virgo", element: "Earth", focus: "health, service, and intelligent refinement" },
  { slug: "libra", name: "Libra", element: "Air", focus: "partnership, harmony, and thoughtful decisions" },
  { slug: "scorpio", name: "Scorpio", element: "Water", focus: "transformation, depth, and emotional truth" },
  { slug: "sagittarius", name: "Sagittarius", element: "Fire", focus: "growth, travel, study, and optimism" },
  { slug: "capricorn", name: "Capricorn", element: "Earth", focus: "discipline, ambition, and practical success" },
  { slug: "aquarius", name: "Aquarius", element: "Air", focus: "innovation, community, and independent thinking" },
  { slug: "pisces", name: "Pisces", element: "Water", focus: "spirituality, empathy, and creative flow" }
] as const;

export type ZodiacSlug = (typeof zodiacSigns)[number]["slug"];

export function getZodiacSign(slug: string) {
  return zodiacSigns.find((sign) => sign.slug === slug);
}

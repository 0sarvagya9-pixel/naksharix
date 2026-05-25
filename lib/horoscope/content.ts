import { chineseOptions, numerologyOptions, zodiacOptions } from "@/lib/horoscope/constants";
import type { HoroscopeContent, HoroscopePageKind, HoroscopeOption } from "@/lib/horoscope/types";

const colors = ["Gold", "Emerald green", "Pearl white", "Royal blue", "Rose", "Saffron", "Silver", "Deep violet", "Sky blue", "Copper", "Turquoise", "Cream"];
const times = ["7:30 AM - 9:00 AM", "10:00 AM - 11:30 AM", "12:15 PM - 1:15 PM", "3:00 PM - 4:30 PM", "5:30 PM - 7:00 PM", "8:00 PM - 9:00 PM"];

const zodiacTone: Record<string, { strength: string; balance: string; work: string; love: string }> = {
  aries: { strength: "initiative", balance: "patience before action", work: "lead with structure", love: "listen before reacting" },
  taurus: { strength: "steady effort", balance: "flexibility", work: "protect quality over speed", love: "express feelings clearly" },
  gemini: { strength: "communication", balance: "focus", work: "prioritize one useful conversation", love: "avoid mixed signals" },
  cancer: { strength: "care", balance: "emotional boundaries", work: "work from a calm plan", love: "share needs gently" },
  leo: { strength: "confidence", balance: "humility", work: "let leadership stay collaborative", love: "show warmth without control" },
  virgo: { strength: "analysis", balance: "self-kindness", work: "refine details without overthinking", love: "appreciate small gestures" },
  libra: { strength: "balance", balance: "clear decisions", work: "avoid delaying important choices", love: "seek fairness and honesty" },
  scorpio: { strength: "depth", balance: "trust", work: "use intensity for research and strategy", love: "keep vulnerability steady" },
  sagittarius: { strength: "vision", balance: "follow-through", work: "turn ideas into a clear next step", love: "speak truth with sensitivity" },
  capricorn: { strength: "discipline", balance: "rest", work: "build slowly and consistently", love: "make time for softness" },
  aquarius: { strength: "original thinking", balance: "emotional presence", work: "share ideas in practical language", love: "stay available, not distant" },
  pisces: { strength: "intuition", balance: "grounding", work: "combine creativity with deadlines", love: "keep compassion and clarity together" }
};

export function getHoroscopeOptions(kind: HoroscopePageKind): HoroscopeOption[] {
  if (kind === "chinese-2026") return chineseOptions;
  if (kind === "numerology-monthly") return numerologyOptions;
  return zodiacOptions;
}

export function getHoroscopeContent(kind: HoroscopePageKind, slug: string): HoroscopeContent {
  if (kind === "chinese-2026") return chineseContent(slug);
  if (kind === "numerology-monthly") return numerologyContent(slug);
  return zodiacContent(kind, slug);
}

function zodiacContent(kind: HoroscopePageKind, slug: string): HoroscopeContent {
  const option = zodiacOptions.find((item) => item.slug === slug) ?? zodiacOptions[0];
  const tone = zodiacTone[option.slug] ?? zodiacTone.aries;
  const label = option.value;
  const index = Math.max(0, zodiacOptions.findIndex((item) => item.slug === option.slug));
  const period = periodLabel(kind);
  const loveMode = kind === "weekly-love";

  if (loveMode) {
    return {
      title: `${label} Weekly Love Horoscope`,
      subtitle: `Relationship-focused guidance for ${label}.`,
      overview: `${label} can use this week to create emotional steadiness through ${tone.love}. Keep expectations realistic and allow important conversations to unfold without pressure.`,
      sections: [
        { title: "Singles", body: `New connections may feel easier when you lead with honesty and avoid rushing chemistry into commitment. Let curiosity reveal compatibility slowly.` },
        { title: "Couples", body: `Shared routines, small appreciation, and patient listening can bring more warmth. If a topic feels sensitive, choose timing carefully.` },
        { title: "Emotional Guidance", body: `Your strongest support comes from ${tone.balance}. Respond from clarity rather than mood, and name what you actually need.` },
        { title: "Communication Advice", body: `Simple language works better than hints. Speak gently, ask directly, and leave room for the other person to process.` }
      ],
      luckyColor: colors[index % colors.length],
      luckyNumber: String((index % 9) + 1),
      remedy: "Offer one sincere word of appreciation and spend a few quiet minutes reflecting before emotional decisions.",
      dos: ["Listen fully before replying", "Keep promises small and real", "Choose warmth over winning"],
      donts: ["Do not test loyalty indirectly", "Avoid old arguments as proof", "Do not rush a private decision"]
    };
  }

  return {
    title: `${label} ${period} Horoscope`,
    subtitle: `General sign-based guidance for ${label}.`,
    overview: `${period} energy supports ${tone.strength} for ${label}, especially when balanced with ${tone.balance}. Use this guidance as a reflective planning tool, not as a fixed prediction.`,
    sections: [
      { title: "Love & Relationships", body: `${tone.love}. Relationship progress looks stronger when expectations are spoken plainly and emotional reactions are not allowed to drive every choice.` },
      { title: "Career & Work", body: `${tone.work}. This is a useful period for organizing priorities, improving consistency, and choosing practical action over scattered effort.` },
      { title: "Money & Finance", body: `Financially, stay measured. Review commitments, avoid impulsive spending, and keep decisions aligned with long-term stability.` },
      { title: "Health & Wellness", body: `Wellness improves through rest, routine, hydration, and balanced movement. This is general guidance and not medical advice.` },
      { title: "Family & Social Life", body: `Family and social matters benefit from calm communication. Give people clarity without turning every difference into a confrontation.` }
    ],
    luckyColor: colors[index % colors.length],
    luckyNumber: String((index % 9) + 1),
    luckyTime: times[index % times.length],
    remedy: "Begin the day with a short grounding prayer, gratitude note, or three minutes of steady breathing.",
    dos: ["Keep plans realistic", "Communicate clearly", "Review one practical priority"],
    donts: ["Avoid fear-based decisions", "Do not overpromise", "Avoid spending to manage emotions"]
  };
}

function chineseContent(slug: string): HoroscopeContent {
  const option = chineseOptions.find((item) => item.slug === slug) ?? chineseOptions[0];
  const index = Math.max(0, chineseOptions.findIndex((item) => item.slug === option.slug));
  return {
    title: `${option.value} Chinese Horoscope 2026`,
    subtitle: `General 2026 guidance for the ${option.value}.`,
    overview: `For ${option.value}, 2026 favors patient planning, practical networking, and steady personal improvement. Treat this as cultural and reflective guidance, not a guaranteed prediction.`,
    sections: [
      { title: "Career & Opportunities", body: "Growth is supported by consistent skill-building and clear professional boundaries. Avoid taking every opportunity before checking capacity." },
      { title: "Wealth & Finance", body: "Money choices benefit from discipline, savings structure, and careful review before large commitments." },
      { title: "Love & Relationships", body: "Relationships improve through honest timing, emotional maturity, and small acts of reliability." },
      { title: "Health & Balance", body: "Balance comes from routine, rest, and stress management. This is general wellness guidance, not medical advice." },
      { title: "2026 Advice", body: "Move steadily, document commitments, and choose relationships and projects that respect your long-term direction." }
    ],
    luckyColor: colors[index % colors.length],
    luckyNumber: String((index % 9) + 1),
    remedy: "Keep a weekly reflection habit and complete one pending responsibility before starting a new one.",
    dos: ["Plan before committing", "Keep communication grounded", "Respect recovery time"],
    donts: ["Avoid risky shortcuts", "Do not ignore practical details", "Do not confuse urgency with destiny"]
  };
}

function numerologyContent(slug: string): HoroscopeContent {
  const number = Number(slug) >= 1 && Number(slug) <= 9 ? Number(slug) : 1;
  const meanings = ["leadership", "cooperation", "expression", "discipline", "adaptability", "responsibility", "reflection", "management", "compassion"];
  const theme = meanings[number - 1];
  return {
    title: `Number ${number} Monthly Numerology Horoscope`,
    subtitle: `General monthly guidance for numerology number ${number}.`,
    overview: `Number ${number} highlights ${theme} this month. Use the month to balance intention with practical follow-through rather than expecting numbers to guarantee outcomes.`,
    sections: [
      { title: "Career & Goals", body: `Your goals benefit from ${theme} expressed through clear priorities and steady effort.` },
      { title: "Money & Planning", body: "Review spending, avoid emotional decisions, and keep future commitments realistic." },
      { title: "Relationships", body: "Relationships improve when communication is direct, patient, and respectful of emotional timing." },
      { title: "Health & Energy", body: "Energy is supported by rhythm, sleep, hydration, and mindful pacing. This is not medical advice." }
    ],
    luckyColor: colors[(number - 1) % colors.length],
    luckyNumber: String(number),
    remedy: "Write one clear intention for the month and review it every Monday with one practical action.",
    dos: ["Choose one priority", "Track habits simply", "Speak with clarity"],
    donts: ["Do not expect instant results", "Avoid scattered effort", "Do not make major changes from fear"]
  };
}

function periodLabel(kind: HoroscopePageKind) {
  if (kind === "daily") return "Daily";
  if (kind === "weekly") return "Weekly";
  if (kind === "monthly") return "Monthly";
  if (kind === "yearly-2026") return "Yearly 2026";
  return "General";
}

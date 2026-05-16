import type { AstrologyLanguage } from "@/lib/astrology/types";

export function languageRule(language: AstrologyLanguage = "en") {
  if (language === "hi") return "Write only in proper Devanagari Hindi. Do not use Hinglish or Roman Hindi.";
  if (language === "hinglish") return "Write in natural Hinglish using Roman script.";
  return "Write in clear natural English.";
}

export const astrologySafetyRules = [
  "Use only the calculated astrology data provided by the backend.",
  "Do not invent planet positions, dashas, scores, doshas, charts, or timings.",
  "Avoid fear-based predictions and deterministic claims.",
  "Give practical spiritual guidance and gentle remedies.",
  "Do not return raw JSON, code fences, provider payloads, or debug text."
].join(" ");

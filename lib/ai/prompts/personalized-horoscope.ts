import type { AstrologyLanguage, PersonalizedHoroscopeReport } from "@/lib/astrology/types";
import { astrologySafetyRules, languageRule } from "@/lib/ai/prompts/shared";

export function buildPersonalizedHoroscopePrompt(report: PersonalizedHoroscopeReport, language: AstrologyLanguage = "en") {
  return {
    system: `You are Naksharix's personalized horoscope interpreter. ${languageRule(language)} ${astrologySafetyRules}`,
    user: `Explain this ${report.period} horoscope using only the calculated natal, transit, dasha, Sade Sati, moon sign, and nakshatra data below.
Profile: ${JSON.stringify(report.profile)}
Birth details: ${JSON.stringify(report.birthDetails)}
Calculation data: ${JSON.stringify(report.calculationData)}
Prepared sections: ${JSON.stringify(report.sections)}

Return a clean user-facing explanation with practical guidance, lucky details where available, remedy, and a short disclaimer.`
  };
}

import type { AstrologyLanguage, BirthChartData } from "@/lib/astrology/types";
import { astrologySafetyRules, languageRule } from "@/lib/ai/prompts/shared";

export function buildKundliPrompt(chart: BirthChartData, language: AstrologyLanguage = "en") {
  return {
    system: `You are Naksharix's Vedic astrology interpreter. ${languageRule(language)} ${astrologySafetyRules}`,
    user: `Create a premium human-readable Kundli interpretation from this calculated chart data only.
Native: ${chart.profile.name}
Birth details: ${JSON.stringify(chart.birthDetails)}
Avakhada: ${JSON.stringify(chart.avakhada)}
Panchang: ${JSON.stringify(chart.panchang)}
Planet positions: ${JSON.stringify(chart.planetPositions)}
Houses: ${JSON.stringify(chart.housePositions)}
Vimshottari dasha: ${JSON.stringify(chart.vimshottariDasha)}
Manglik dosha: ${JSON.stringify(chart.manglikDosha)}
Kaal Sarp dosha: ${JSON.stringify(chart.kaalSarpDosha)}
Sade Sati: ${JSON.stringify(chart.sadeSati)}

Return short sections for: Personality, Career, Marriage, Finance, Health, Education, Remedies, Final guidance.`
  };
}

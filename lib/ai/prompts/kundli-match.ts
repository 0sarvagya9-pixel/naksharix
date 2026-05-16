import type { AstrologyLanguage, KundliMatchReport } from "@/lib/astrology/types";
import { astrologySafetyRules, languageRule } from "@/lib/ai/prompts/shared";

export function buildKundliMatchPrompt(report: KundliMatchReport, language: AstrologyLanguage = "en") {
  return {
    system: `You are Naksharix's Kundli Milan interpreter. ${languageRule(language)} ${astrologySafetyRules}`,
    user: `Explain this calculated Kundli matching report only from the data below.
Bride: ${JSON.stringify(report.brideProfile)}
Groom: ${JSON.stringify(report.groomProfile)}
Guna Milan: ${JSON.stringify(report.gunaMilan)}
Dosha analysis: ${JSON.stringify(report.doshaAnalysis)}
Compatibility: ${JSON.stringify(report.compatibility)}

Return sections for: Overall match, Guna Milan, Ashtakoot highlights, Dosha care, Strengths, Challenges, Remedies, Final advice.`
  };
}

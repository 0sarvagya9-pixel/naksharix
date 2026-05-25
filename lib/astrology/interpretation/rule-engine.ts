import type { InterpretationEngineStatus } from "@/lib/astrology/interpretation/types";

export function getInterpretationEngineStatus(): InterpretationEngineStatus {
  return {
    status: "blocked_until_verified_rules",
    publicPersonalizedPredictionEnabled: false,
    verifiedRulesCount: 0,
    requiredBeforeActivation: [
      "Verified chart data from the ephemeris provider.",
      "Reviewed interpretation rule database with claim boundaries.",
      "Language editorial QA for English, Hindi, and Hinglish.",
      "Safety review for medical, legal, financial, and mental-health boundaries."
    ]
  };
}

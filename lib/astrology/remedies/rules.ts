import type { RemediesEngineStatus } from "@/lib/astrology/remedies/types";

export function getRemediesEngineStatus(): RemediesEngineStatus {
  return {
    status: "blocked_until_reviewed_rules",
    publicRemediesEnabled: false,
    verifiedRulesCount: 0,
    claimBoundaries: [
      "Remedies must not guarantee outcomes.",
      "Remedies must not use fear-selling language.",
      "Gemstone and rudraksha guidance requires extra caution and review.",
      "Remedies must not replace medical, legal, financial, or mental-health advice."
    ]
  };
}

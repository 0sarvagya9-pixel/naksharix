import type { RemedyInputCondition, RemedyRule, RemediesEngineStatus, RemediesResult } from "@/lib/astrology/remedies/types";

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

const caution = "This is gentle spiritual guidance only. It does not guarantee outcomes and does not replace professional advice.";

const safeStarterRemedyRules: RemedyRule[] = [
  {
    id: "safe-manglik-reflection",
    trigger: "manglik",
    category: "spiritual_practice",
    requiredInputs: ["manglik.present"],
    recommendation: "Practice calm communication, patient conflict resolution, and a short grounding prayer or breath practice before important relationship discussions.",
    caution,
    verified: false,
    status: "needs_review"
  },
  {
    id: "safe-dasha-routine",
    trigger: "dasha_related",
    category: "lifestyle",
    requiredInputs: ["dasha.current"],
    recommendation: "Keep a steady routine, document decisions, and avoid rushed commitments during emotionally intense periods.",
    caution,
    verified: false,
    status: "needs_review"
  },
  {
    id: "safe-planet-weakness-service",
    trigger: "planet_weakness",
    category: "daan",
    requiredInputs: ["planetWeakness.present"],
    recommendation: "Consider simple service, charity within your means, and disciplined habits connected with the life area under review.",
    caution,
    verified: false,
    status: "needs_review"
  },
  {
    id: "safe-gemstone-caution",
    trigger: "planet_weakness",
    category: "gemstone_caution",
    requiredInputs: ["planetWeakness.present"],
    recommendation: "Gemstone use should be considered only after expert review of the full chart and personal circumstances.",
    caution: `${caution} Do not buy or wear gemstones based only on an automated result.`,
    verified: false,
    status: "needs_review"
  }
];

export function generateSafeRemedies(conditions: RemedyInputCondition[]): RemediesResult {
  const activeTriggers = new Set(conditions.filter((condition) => condition.present).map((condition) => condition.trigger));
  return {
    suggestions: safeStarterRemedyRules
      .filter((rule) => activeTriggers.has(rule.trigger))
      .map((rule) => ({
        trigger: rule.trigger,
        category: rule.category,
        recommendation: rule.recommendation,
        caution: rule.caution,
        verified: false
      })),
    metadata: {
      ruleset: "safe_starter_remedies",
      verified: false,
      publicRemediesEnabled: false,
      limitations: [
        "Starter remedies are intentionally gentle and non-commercial.",
        "No remedy guarantees results or replaces professional advice.",
        "Public remedies remain disabled until rules are reviewed by qualified experts."
      ]
    }
  };
}

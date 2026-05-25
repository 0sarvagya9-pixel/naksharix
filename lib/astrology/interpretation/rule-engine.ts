import type { InterpretationEngineStatus, InterpretationFactSet, InterpretationResult, InterpretationRule, InterpretationSectionKey } from "@/lib/astrology/interpretation/types";

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

const claimBoundary = "General reflective guidance only. This does not promise outcomes and must not replace professional medical, legal, financial, or mental-health advice.";

const starterRules: InterpretationRule[] = [
  {
    id: "starter-moon-sign-emotional-awareness",
    scope: "rashi",
    language: "en",
    requiredInputs: ["moon.sign"],
    conditions: {},
    text: "The Moon sign can describe emotional processing and instinctive comfort needs. Use it for self-awareness rather than fixed prediction.",
    confidence: "low",
    claimBoundary,
    verified: false,
    status: "needs_review"
  },
  {
    id: "starter-lagna-life-approach",
    scope: "bhava",
    language: "en",
    requiredInputs: ["ascendant.sign"],
    conditions: {},
    text: "The Ascendant gives a starting point for life approach, presentation, and how chart houses are organized.",
    confidence: "low",
    claimBoundary,
    verified: false,
    status: "needs_review"
  },
  {
    id: "starter-dasha-timing-reflection",
    scope: "dasha",
    language: "en",
    requiredInputs: ["dasha.mahadashaLord"],
    conditions: {},
    text: "Dasha periods can be used as timing frameworks for reflection when the Moon longitude and birth time are reliable.",
    confidence: "low",
    claimBoundary,
    verified: false,
    status: "needs_review"
  }
];

export function generateStarterInterpretation(facts: InterpretationFactSet): InterpretationResult {
  const missingInputs: string[] = [];
  const sections = [
    section("overview", "Overview", [
      matchRule("starter-lagna-life-approach", Boolean(facts.ascendant?.sign), missingInputs, "ascendant.sign"),
      matchRule("starter-moon-sign-emotional-awareness", Boolean(facts.moon?.sign), missingInputs, "moon.sign")
    ]),
    section("career", "Career & Work", [
      "Career guidance needs the full house, planet, dignity, Dasha, and divisional context. Current output stays intentionally general until those inputs are verified."
    ]),
    section("relationship", "Relationships", [
      "Relationship tendencies should be reviewed with Moon, Venus, seventh house, matching factors, and lived context. This starter rule avoids absolute conclusions."
    ]),
    section("finance", "Money & Planning", [
      "Financial indications require second, eleventh, Dasha, and strength factors. Use this as a prompt for disciplined planning, not a financial prediction."
    ]),
    section("health_tendency", "Health Tendency", [
      "Health-related astrology must remain reflective and should never replace medical advice."
    ]),
    section("spiritual_guidance", "Spiritual Guidance", [
      matchRule("starter-dasha-timing-reflection", Boolean(facts.dasha?.mahadashaLord), missingInputs, "dasha.mahadashaLord"),
      "Simple grounding practices, ethical conduct, and steady routines are safe spiritual supports while deeper rules remain under review."
    ])
  ];

  return {
    sections,
    metadata: {
      ruleset: "starter_rules",
      verified: false,
      publicPersonalizedPredictionEnabled: false,
      missingInputs: [...new Set(missingInputs)],
      limitations: [
        "Starter rules are general and non-absolute.",
        "They do not claim premium prediction completeness.",
        "Public personalized prediction remains disabled until reviewed rules and verified chart facts exist."
      ]
    }
  };
}

function matchRule(ruleId: string, condition: boolean, missingInputs: string[], missingKey: string) {
  const rule = starterRules.find((item) => item.id === ruleId);
  if (!rule) return "";
  if (!condition) {
    missingInputs.push(missingKey);
    return "";
  }
  return rule.text;
}

function section(key: InterpretationSectionKey, title: string, texts: string[]) {
  return {
    key,
    title,
    text: texts.filter(Boolean).join(" "),
    confidence: "low" as const,
    claimBoundary,
    sourceRuleIds: starterRules.filter((rule) => texts.includes(rule.text)).map((rule) => rule.id)
  };
}

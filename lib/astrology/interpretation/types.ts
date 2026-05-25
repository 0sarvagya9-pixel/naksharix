export type InterpretationScope = "graha" | "rashi" | "bhava" | "nakshatra" | "dasha" | "transit" | "varga";
export type InterpretationLanguage = "en" | "hi" | "hinglish";
export type InterpretationConfidence = "low" | "medium" | "high";

export type InterpretationRule = {
  id: string;
  scope: InterpretationScope;
  language: InterpretationLanguage;
  requiredInputs: string[];
  conditions: Record<string, unknown>;
  text: string;
  confidence: InterpretationConfidence;
  claimBoundary: string;
  verified: boolean;
  status: "draft" | "needs_review" | "verified" | "blocked_until_engine_ready";
};

export type InterpretationEngineStatus = {
  status: "blocked_until_verified_rules";
  publicPersonalizedPredictionEnabled: false;
  verifiedRulesCount: number;
  requiredBeforeActivation: string[];
};

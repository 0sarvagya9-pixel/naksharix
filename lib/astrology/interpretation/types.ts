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

export type InterpretationFactSet = {
  planets?: Array<{ planet: string; sign?: string | null; house?: number | null; nakshatra?: string | null }>;
  moon?: { sign?: string | null; nakshatra?: string | null; pada?: number | null };
  ascendant?: { sign?: string | null };
  dasha?: { mahadashaLord?: string | null; antardashaLord?: string | null };
  transit?: { planet?: string; sign?: string | null }[];
  varga?: { chart: string; available: boolean }[];
};

export type InterpretationSectionKey = "overview" | "career" | "relationship" | "finance" | "health_tendency" | "spiritual_guidance";

export type InterpretationSection = {
  key: InterpretationSectionKey;
  title: string;
  text: string;
  confidence: InterpretationConfidence;
  claimBoundary: string;
  sourceRuleIds: string[];
};

export type InterpretationResult = {
  sections: InterpretationSection[];
  metadata: {
    ruleset: "starter_rules";
    verified: false;
    publicPersonalizedPredictionEnabled: false;
    missingInputs: string[];
    limitations: string[];
  };
};

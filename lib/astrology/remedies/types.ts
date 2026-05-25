export type RemedyCategory = "mantra" | "daan" | "vrat" | "lifestyle" | "spiritual_practice" | "gemstone_caution" | "rudraksha_caution";
export type RemedyTrigger = "manglik" | "kaal_sarp" | "pitra_dosh" | "planet_weakness" | "dasha_related";

export type RemedyRule = {
  id: string;
  trigger: RemedyTrigger;
  category: RemedyCategory;
  requiredInputs: string[];
  recommendation: string;
  caution: string;
  verified: boolean;
  status: "draft" | "needs_review" | "verified" | "blocked_until_engine_ready";
};

export type RemediesEngineStatus = {
  status: "blocked_until_reviewed_rules";
  publicRemediesEnabled: false;
  verifiedRulesCount: number;
  claimBoundaries: string[];
};

export type RemedyInputCondition = {
  trigger: RemedyTrigger;
  present: boolean;
  severity?: "mild" | "moderate" | "strong" | "needs_review";
};

export type RemedySuggestion = {
  trigger: RemedyTrigger;
  category: RemedyCategory;
  recommendation: string;
  caution: string;
  verified: false;
};

export type RemediesResult = {
  suggestions: RemedySuggestion[];
  metadata: {
    ruleset: "safe_starter_remedies";
    verified: false;
    publicRemediesEnabled: false;
    limitations: string[];
  };
};

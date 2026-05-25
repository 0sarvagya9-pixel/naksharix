import type { StrengthFoundationStatus } from "@/lib/astrology/strength/types";

export function getAshtakvargaFoundationStatus(): StrengthFoundationStatus {
  return {
    module: "ashtakvarga",
    verificationLevel: "blocked_until_verified_formula",
    publicEnabled: false,
    verified: false,
    requiredBeforeActivation: [
      "Verified natal planet sign and house placements.",
      "Bhinna Ashtakvarga formula fixtures for each planet.",
      "Sarva Ashtakvarga aggregation fixtures.",
      "Transit overlay rules only after base bindu scores are verified."
    ]
  };
}

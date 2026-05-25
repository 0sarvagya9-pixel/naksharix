import type { CanonicalPlanet } from "@/lib/astrology/ephemeris/types";
import type { PartialAshtakvargaResult, StrengthFoundationStatus } from "@/lib/astrology/strength/types";

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

export function createAshtakvargaDependencyResult(planets: CanonicalPlanet[]): PartialAshtakvargaResult {
  return {
    scores: planets.map((planet) => ({
      planet: planet.planet,
      bhinna: Array.from({ length: 12 }, () => null),
      sarva: undefined,
      verified: false
    })),
    verificationLevel: "blocked_until_verified_formula",
    publicEnabled: false,
    missingDependencies: [
      "Reviewed Bhinna Ashtakvarga bindu rules for every planet.",
      "Trusted external planet-wise bindu fixtures.",
      "Sarva Ashtakvarga aggregation fixtures.",
      "House/sign reference policy for public interpretation."
    ],
    limitations: [
      "This helper validates dependencies and result shape only.",
      "It does not output placeholder bindu values.",
      "Public Ashtakvarga remains disabled until formulas and fixtures are verified."
    ]
  };
}

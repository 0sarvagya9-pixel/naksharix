import type { CanonicalPlanet } from "@/lib/astrology/ephemeris/types";
import type { PartialShadbalaResult, ShadbalaPlanetScore, StrengthFoundationStatus } from "@/lib/astrology/strength/types";

export function getShadbalaFoundationStatus(): StrengthFoundationStatus {
  return {
    module: "shadbala",
    verificationLevel: "blocked_until_provider_ready",
    publicEnabled: false,
    verified: false,
    requiredBeforeActivation: [
      "Verified planet longitude, house, speed, sunrise/sunset, and temporal data.",
      "Formula-by-formula fixtures for Sthana, Dig, Kala, Cheshta, Naisargika, and Drik Bala.",
      "Trusted external score samples for every supported planet.",
      "Public interpretation boundaries that avoid deterministic outcome claims."
    ]
  };
}

const naisargikaBala: Record<ShadbalaPlanetScore["planet"], number> = {
  Sun: 60,
  Moon: 51.43,
  Venus: 42.86,
  Jupiter: 34.29,
  Mercury: 25.71,
  Mars: 17.14,
  Saturn: 8.57
};

export function calculatePartialShadbala(planets: CanonicalPlanet[]): PartialShadbalaResult {
  const scores = planets
    .filter((planet): planet is CanonicalPlanet & { planet: ShadbalaPlanetScore["planet"] } => planet.planet !== "Rahu" && planet.planet !== "Ketu")
    .map((planet) => ({
      planet: planet.planet,
      components: {
        sthanaBala: null,
        digBala: null,
        kalaBala: null,
        cheshtaBala: null,
        naisargikaBala: naisargikaBala[planet.planet],
        drikBala: null
      },
      total: null,
      verified: false
    }));

  return {
    scores,
    verificationLevel: "provider_verified",
    publicEnabled: false,
    missingDependencies: [
      "Verified dignity and varga data for Sthana Bala.",
      "Verified house cusp/reference data for Dig Bala.",
      "Verified temporal formula inputs for Kala Bala.",
      "Verified speed/retrograde model for Cheshta Bala.",
      "Verified aspects for Drik Bala.",
      "External Shadbala score fixtures."
    ],
    limitations: [
      "Only Naisargika Bala constants are populated and provider-regression verified because they are fixed traditional constants.",
      "Total Shadbala is intentionally null until all components are implemented and fixture-verified.",
      "No public Shadbala score should be shown from this partial result."
    ]
  };
}

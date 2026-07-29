import type { CanonicalPlanet } from "@/lib/astrology/ephemeris/types";
import type { AshtakvargaScore, PartialAshtakvargaResult, StrengthFoundationStatus } from "@/lib/astrology/strength/types";

const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"] as const;
type ClassicalPlanet = "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn";
type Reference = ClassicalPlanet | "Ascendant";
type RuleTable = Record<ClassicalPlanet, Record<Reference, readonly number[]>>;

// Classical Parashari-style Bhinna Ashtakavarga contribution houses.
// Output remains evidence-gated until fixtures from independent reference software are imported.
const rules: RuleTable = {
  Sun: {
    Sun: [1, 2, 4, 7, 8, 9, 10, 11], Moon: [3, 6, 10, 11], Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12], Jupiter: [5, 6, 9, 11], Venus: [6, 7, 12],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11], Ascendant: [3, 4, 6, 10, 11, 12]
  },
  Moon: {
    Sun: [3, 6, 7, 8, 10, 11], Moon: [1, 3, 6, 7, 10, 11], Mars: [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11], Jupiter: [1, 4, 7, 8, 10, 11, 12], Venus: [3, 4, 5, 7, 9, 10, 11],
    Saturn: [3, 5, 6, 11], Ascendant: [3, 6, 10, 11]
  },
  Mars: {
    Sun: [3, 5, 6, 10, 11], Moon: [3, 6, 11], Mars: [1, 2, 4, 7, 8, 10, 11], Mercury: [3, 5, 6, 11],
    Jupiter: [6, 10, 11, 12], Venus: [6, 8, 11, 12], Saturn: [1, 4, 7, 8, 9, 10, 11], Ascendant: [1, 3, 6, 10, 11]
  },
  Mercury: {
    Sun: [5, 6, 9, 11, 12], Moon: [2, 4, 6, 8, 10, 11], Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12], Jupiter: [6, 8, 11, 12], Venus: [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11], Ascendant: [1, 2, 4, 6, 8, 10, 11]
  },
  Jupiter: {
    Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11], Moon: [2, 5, 7, 9, 11], Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11], Jupiter: [1, 2, 3, 4, 7, 8, 10, 11], Venus: [2, 5, 6, 9, 10, 11],
    Saturn: [3, 5, 6, 12], Ascendant: [1, 2, 4, 5, 6, 7, 9, 10, 11]
  },
  Venus: {
    Sun: [8, 11, 12], Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12], Mars: [3, 5, 6, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11], Jupiter: [5, 8, 9, 10, 11], Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn: [3, 4, 5, 8, 9, 10, 11], Ascendant: [1, 2, 3, 4, 5, 8, 9, 11]
  },
  Saturn: {
    Sun: [1, 2, 4, 7, 8, 10, 11], Moon: [3, 6, 11], Mars: [3, 5, 6, 10, 11, 12],
    Mercury: [6, 8, 9, 10, 11, 12], Jupiter: [5, 6, 11, 12], Venus: [6, 11, 12],
    Saturn: [3, 5, 6, 11], Ascendant: [1, 3, 4, 6, 10, 11]
  }
};

const expectedTotals: Record<ClassicalPlanet, number> = {
  Sun: 48,
  Moon: 49,
  Mars: 39,
  Mercury: 54,
  Jupiter: 56,
  Venus: 52,
  Saturn: 39
};

export function getAshtakvargaFoundationStatus(): StrengthFoundationStatus {
  return {
    module: "ashtakvarga",
    verificationLevel: "needs_external_validation",
    publicEnabled: false,
    verified: false,
    requiredBeforeActivation: [
      "Independent reference fixtures for all seven Bhinna Ashtakavarga tables.",
      "Sarva Ashtakavarga sign-by-sign comparison against trusted software.",
      "Reviewed Trikona/Ekadhipatya reduction rules before reduced-score features.",
      "Transit interpretation rules only after base bindu scores are externally verified."
    ]
  };
}

function isClassicalPlanet(planet: CanonicalPlanet["planet"]): planet is ClassicalPlanet {
  return planet !== "Rahu" && planet !== "Ketu";
}

function signIndex(sign: string | null | undefined) {
  return signs.findIndex((value) => value === sign);
}

function buildReferenceSigns(planets: CanonicalPlanet[], ascendantSign: string) {
  const result = new Map<Reference, number>();
  for (const planet of planets) {
    if (!isClassicalPlanet(planet.planet)) continue;
    const index = signIndex(planet.sign);
    if (index >= 0) result.set(planet.planet, index);
  }
  const ascendantIndex = signIndex(ascendantSign);
  if (ascendantIndex >= 0) result.set("Ascendant", ascendantIndex);
  return result;
}

function targetSign(referenceSign: number, relativeHouse: number) {
  return (referenceSign + relativeHouse - 1) % 12;
}

export function calculateInternalAshtakvarga(planets: CanonicalPlanet[], ascendantSign: string): PartialAshtakvargaResult {
  const references = buildReferenceSigns(planets, ascendantSign);
  const requiredReferences: Reference[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Ascendant"];
  const missing = requiredReferences.filter((reference) => !references.has(reference));
  if (missing.length) return createAshtakvargaDependencyResult(planets, `Missing sign placement for: ${missing.join(", ")}`);

  const scores: AshtakvargaScore[] = (Object.keys(rules) as ClassicalPlanet[]).map((planet) => {
    const bhinna = Array.from({ length: 12 }, () => 0);
    for (const reference of requiredReferences) {
      const referenceSign = references.get(reference)!;
      for (const house of rules[planet][reference]) bhinna[targetSign(referenceSign, house)] += 1;
    }
    return { planet, bhinna, verified: false };
  });

  const sarva = Array.from({ length: 12 }, (_, sign) => scores.reduce<number>((sum, score) => sum + Number(score.bhinna[sign] ?? 0), 0));
  for (const score of scores) score.sarva = sarva;

  const checksums: Record<string, number> = Object.fromEntries(
    scores.map((score) => [score.planet, score.bhinna.reduce<number>((sum, value) => sum + Number(value ?? 0), 0)])
  );
  checksums.Sarva = sarva.reduce((sum, value) => sum + value, 0);
  const checksumFailures = (Object.keys(expectedTotals) as ClassicalPlanet[]).filter((planet) => checksums[planet] !== expectedTotals[planet]);
  if (checksums.Sarva !== 337) checksumFailures.push("Sun");
  if (checksumFailures.length) throw new Error(`Ashtakavarga rule checksum failed: ${[...new Set(checksumFailures)].join(", ")}`);

  return {
    scores,
    sarva,
    checksums,
    verificationLevel: "needs_external_validation",
    publicEnabled: false,
    missingDependencies: ["Independent reference-software fixtures for sign-by-sign validation."],
    limitations: [
      "Bhinna and Sarva bindu distributions are calculated from the internal classical rule table.",
      "Fixed Bhinna totals and the 337-point Sarva checksum are enforced at runtime.",
      "Results remain non-public until independent chart fixtures agree sign by sign.",
      "Trikona and Ekadhipatya reductions are not applied by this base engine."
    ]
  };
}

export function createAshtakvargaDependencyResult(planets: CanonicalPlanet[], reason = "Ascendant and seven classical planet sign placements are required."): PartialAshtakvargaResult {
  return {
    scores: planets.filter((planet) => isClassicalPlanet(planet.planet)).map((planet) => ({
      planet: planet.planet,
      bhinna: Array.from({ length: 12 }, () => null),
      sarva: undefined,
      verified: false
    })),
    verificationLevel: "blocked_until_verified_formula",
    publicEnabled: false,
    missingDependencies: [reason, "Trusted external planet-wise bindu fixtures."],
    limitations: [
      "No placeholder bindu values are emitted when required chart references are missing.",
      "Public Ashtakavarga remains disabled until formula output is fixture-verified."
    ]
  };
}

export const ASHTAKVARGA_FIXED_TOTALS = { ...expectedTotals, Sarva: 337 } as const;

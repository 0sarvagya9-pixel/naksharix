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
    .map((planet) => {
      const sthanaBala = dignityIndicator(planet.planet, planet.sign);
      const digBala = directionalStrengthIndicator(planet.planet, planet.house);
      const cheshtaBala = typeof planet.retrograde === "boolean" ? (planet.retrograde ? 60 : 15) : null;
      return {
        planet: planet.planet,
        components: {
          sthanaBala,
          digBala,
          kalaBala: null,
          cheshtaBala,
          naisargikaBala: naisargikaBala[planet.planet],
          drikBala: null
        },
        componentStatus: {
          sthanaBala: sthanaBala == null
            ? unavailable("Planet sign is unavailable.")
            : calculated("Dignity-based Sthana indicator from provider sign placement; not the complete classical Sthana Bala stack."),
          digBala: digBala == null
            ? unavailable("Planet house is unavailable.")
            : calculated("Directional strength indicator from whole-sign house placement."),
          kalaBala: unavailable("Kala Bala requires full temporal subcomponents and verified day/night, paksha, hora, and seasonal formula fixtures."),
          cheshtaBala: cheshtaBala == null
            ? unavailable("Retrograde/motion status is unavailable.")
            : calculated("Motion indicator based on provider retrograde status; exact Cheshta Bala speed sub-formula remains pending."),
          naisargikaBala: calculated("Fixed traditional Naisargika Bala constant."),
          drikBala: unavailable("Drik Bala requires a verified aspect model and aspect strength fixtures.")
        },
        total: null,
        verified: false
      };
    });

  return {
    scores,
    verificationLevel: "provider_verified",
    publicEnabled: false,
    missingDependencies: [
      "Complete Sthana Bala subcomponents beyond dignity indicator.",
      "Exact Dig Bala degree-distance formula beyond house indicator.",
      "Verified temporal formula inputs for Kala Bala.",
      "Verified speed model for full Cheshta Bala.",
      "Verified aspects for Drik Bala.",
      "External Shadbala score fixtures."
    ],
    limitations: [
      "Sthana, Dig, Cheshta, and Naisargika indicators are populated from available provider data where possible.",
      "Kala Bala and Drik Bala remain unavailable with explicit reasons.",
      "Total Shadbala is intentionally null until all components are implemented and fixture-verified.",
      "No public Shadbala score should be shown from this partial result."
    ]
  };
}

function calculated(reason: string) {
  return { status: "calculated" as const, reason };
}

function unavailable(reason: string) {
  return { status: "unavailable" as const, reason };
}

const exaltationSigns: Record<ShadbalaPlanetScore["planet"], string> = {
  Sun: "Aries",
  Moon: "Taurus",
  Mars: "Capricorn",
  Mercury: "Virgo",
  Jupiter: "Cancer",
  Venus: "Pisces",
  Saturn: "Libra"
};

const debilitationSigns: Record<ShadbalaPlanetScore["planet"], string> = {
  Sun: "Libra",
  Moon: "Scorpio",
  Mars: "Cancer",
  Mercury: "Pisces",
  Jupiter: "Capricorn",
  Venus: "Virgo",
  Saturn: "Aries"
};

const ownSigns: Record<ShadbalaPlanetScore["planet"], string[]> = {
  Sun: ["Leo"],
  Moon: ["Cancer"],
  Mars: ["Aries", "Scorpio"],
  Mercury: ["Gemini", "Virgo"],
  Jupiter: ["Sagittarius", "Pisces"],
  Venus: ["Taurus", "Libra"],
  Saturn: ["Capricorn", "Aquarius"]
};

function dignityIndicator(planet: ShadbalaPlanetScore["planet"], sign: string | null) {
  if (!sign) return null;
  if (sign === exaltationSigns[planet]) return 60;
  if (sign === debilitationSigns[planet]) return 0;
  if (ownSigns[planet].includes(sign)) return 45;
  return 22.5;
}

const directionalStrengthHouse: Record<ShadbalaPlanetScore["planet"], number> = {
  Sun: 10,
  Mars: 10,
  Moon: 4,
  Venus: 4,
  Jupiter: 1,
  Mercury: 1,
  Saturn: 7
};

function directionalStrengthIndicator(planet: ShadbalaPlanetScore["planet"], house: number | null | undefined) {
  if (!house) return null;
  const strongest = directionalStrengthHouse[planet];
  const distance = Math.min(Math.abs(house - strongest), 12 - Math.abs(house - strongest));
  return Number(Math.max(0, 60 - distance * 10).toFixed(2));
}

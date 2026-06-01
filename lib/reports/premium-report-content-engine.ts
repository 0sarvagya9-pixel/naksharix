import { generateStarterInterpretation } from "@/lib/astrology/interpretation/rule-engine";
import { getPremiumEngineActivationStatus } from "@/lib/astrology/premium-engine/activation-status";
import { generateSafeRemedies } from "@/lib/astrology/remedies/rules";
import { calculatePartialShadbala } from "@/lib/astrology/strength/shadbala";
import { createAshtakvargaDependencyResult } from "@/lib/astrology/strength/ashtakvarga";
import { calculateSupportedVargaCharts } from "@/lib/astrology/varga/engine";
import { calculateNumerologyReport } from "@/lib/numerology";
import type { CanonicalChartResult } from "@/lib/astrology/ephemeris/types";

export type PremiumReportContentSection = {
  key: string;
  title: string;
  status: "provider_verified" | "external_verified" | "available_unverified" | "partial_internal" | "unavailable" | "blocked";
  data: unknown;
  limitations: string[];
};

export type PremiumReportContentResult = {
  sections: PremiumReportContentSection[];
  metadata: {
    reportCompleteness: "provider_verified_partial" | "partial_internal";
    verified: false;
    premiumComplete: false;
    providerVerifiedSections: string[];
    unavailableSections: string[];
    limitations: string[];
  };
};

export function assemblePremiumReportContent(input: {
  chart: CanonicalChartResult;
  includePanchang?: unknown;
  includeTransit?: unknown;
  reportRequest?: {
    questionOrConcern?: string | null;
    preferredLanguage?: string | null;
  };
}): PremiumReportContentResult {
  const chart = input.chart;
  const numerology = calculateNumerologyReport({
    name: chart.normalizedInput.name ?? "Naksharix Native",
    dateOfBirth: chart.normalizedInput.dateOfBirth,
    gender: chart.normalizedInput.gender,
    locale: "en"
  });
  const activation = {
    chart: getPremiumEngineActivationStatus("chart_precision"),
    dasha: getPremiumEngineActivationStatus("dasha"),
    panchang: getPremiumEngineActivationStatus("panchang"),
    transit: getPremiumEngineActivationStatus("transit"),
    varga: getPremiumEngineActivationStatus("varga"),
    strength: getPremiumEngineActivationStatus("shadbala"),
    interpretation: getPremiumEngineActivationStatus("interpretation"),
    remedies: getPremiumEngineActivationStatus("remedies")
  };
  const varga = calculateSupportedVargaCharts(chart.planets);
  const interpretation = generateStarterInterpretation({
    planets: chart.planets.map((planet) => ({ planet: planet.planet, sign: planet.sign, house: planet.house })),
    moon: { sign: chart.moon.sign, nakshatra: chart.nakshatra.name, pada: chart.nakshatra.pada },
    ascendant: { sign: chart.ascendant.sign },
    dasha: { mahadashaLord: chart.dasha?.startingMahadashaLord }
  });
  const remedies = generateSafeRemedies([]);
  const unavailableSections: string[] = [];
  const sections: PremiumReportContentSection[] = [
    {
      key: "cover",
      title: "Cover & Provider Metadata",
      status: "provider_verified",
      data: {
        reportTitle: "Naksharix Kundli Report",
        nativeName: chart.normalizedInput.name,
        generatedAt: new Date().toISOString(),
        provider: chart.metadata.provider,
        precisionLevel: chart.metadata.precisionLevel,
        verificationLevel: chart.metadata.precisionLevel,
        ayanamsa: chart.ayanamsa,
        houseSystem: chart.normalizedInput.houseSystem
      },
      limitations: ["Provider-verified means deterministic Naksharix provider regression tests, not external Swiss/Jagannatha Hora verification."]
    },
    {
      key: "birth-details-summary",
      title: "Birth Details Summary",
      status: "provider_verified",
      data: chart.normalizedInput,
      limitations: ["Birth details are user-provided and should be reviewed before premium delivery.", activation.chart.reason]
    },
    {
      key: "core-kundli-summary",
      title: "Core Kundli Summary",
      status: "provider_verified",
      data: {
        ascendant: chart.ascendant,
        sunSign: chart.planets.find((planet) => planet.planet === "Sun")?.sign,
        moon: chart.moon,
        nakshatra: chart.nakshatra,
        nakshatraLord: chart.dasha?.startingMahadashaLord,
        ayanamsa: chart.ayanamsa,
        birthPanchang: input.includePanchang ?? null
      },
      limitations: chart.metadata.limitations
    },
    {
      key: "planets-table",
      title: "Planets Table",
      status: "provider_verified",
      data: chart.planets,
      limitations: ["Planet positions are provider-regression tested against generated fixtures and still need external fixture validation.", activation.chart.nextRequirement]
    },
    {
      key: "main-chart",
      title: "D1 Lagna Chart & House Summary",
      status: "provider_verified",
      data: {
        ascendant: chart.ascendant,
        houses: chart.houses ?? [],
        houseSummary: (chart.houses ?? []).map((house) => ({
          house: house.house,
          sign: house.sign,
          planets: chart.planets.filter((planet) => planet.house === house.house).map((planet) => planet.planet)
        }))
      },
      limitations: ["D1 is produced from the Naksharix internal provider and whole-sign house mapping."]
    },
    {
      key: "dasha-section",
      title: "Dasha Section",
      status: chart.dasha ? "provider_verified" : "unavailable",
      data: chart.dasha ?? null,
      limitations: ["Dasha timing depends on Moon longitude and is provider-regression tested, not externally verified.", activation.dasha.nextRequirement]
    },
    {
      key: "numerology-section",
      title: "Numerology Section",
      status: "provider_verified",
      data: {
        moolank: numerology.moolank,
        bhagyank: numerology.lifePath,
        nameNumber: numerology.nameNumber,
        soulUrge: numerology.soulUrge,
        personality: numerology.personality
      },
      limitations: [numerology.disclaimer]
    },
    {
      key: "lo-shu-section",
      title: "Lo Shu Grid Section",
      status: "provider_verified",
      data: {
        grid: numerology.loShuGrid,
        missingNumbers: numerology.missingNumbers,
        repeatedNumbers: numerology.repeatedNumbers,
        presentNumbers: numerology.loShuGrid.filter((cell) => cell.present).map((cell) => cell.number)
      },
      limitations: [numerology.disclaimer]
    },
    {
      key: "chinese-zodiac-section",
      title: "Chinese Zodiac Section",
      status: "provider_verified",
      data: chineseZodiacFromDate(String(chart.normalizedInput.dateOfBirth)),
      limitations: ["Chinese zodiac is derived deterministically from birth year and is included as general cultural symbolism, not a personalized prediction."]
    },
    {
      key: "varga-section",
      title: "Varga Section",
      status: "provider_verified",
      data: varga,
      limitations: ["D1, D2, D3, D9, D10, and D12 are provider-regression tested but not externally verified for public chart output.", activation.varga.nextRequirement]
    },
    {
      key: "strength-section",
      title: "Partial Strength Indicators",
      status: "partial_internal",
      data: {
        shadbala: calculatePartialShadbala(chart.planets),
        ashtakvarga: createAshtakvargaDependencyResult(chart.planets)
      },
      limitations: ["Sthana, Dig, Cheshta, and Naisargika indicators are calculated where provider data supports them. No total Shadbala or Ashtakvarga bindu scores are produced.", activation.strength.reason]
    },
    {
      key: "panchang-section",
      title: "Panchang Section",
      status: input.includePanchang ? "provider_verified" : "unavailable",
      data: input.includePanchang ?? null,
      limitations: ["Panchang is provider-regression tested and should be cross-checked for critical Muhurat use.", activation.panchang.nextRequirement]
    },
    {
      key: "transit-section",
      title: "Transit Section",
      status: input.includeTransit ? "provider_verified" : "unavailable",
      data: input.includeTransit ?? null,
      limitations: ["Transit snapshot positions are provider-regression tested; transit prediction pages remain blocked until ingress and retrograde fixtures pass.", activation.transit.nextRequirement]
    },
    {
      key: "interpretation-section",
      title: "Interpretation Section",
      status: "provider_verified",
      data: interpretation,
      limitations: [...interpretation.metadata.limitations, activation.interpretation.reason]
    },
    {
      key: "remedies-section",
      title: "Remedies Section",
      status: "provider_verified",
      data: remedies,
      limitations: [...remedies.metadata.limitations, activation.remedies.reason]
    },
    {
      key: "limitations-trust-note",
      title: "Limitations & Trust Note",
      status: "provider_verified",
      data: "This PDF-ready report content uses Naksharix provider-calculated data and must be reviewed before delivery. Values may vary slightly by source.",
      limitations: ["No external accuracy claim is active.", "Astrology and numerology guidance is for reflection and spiritual insight, not medical, legal, financial, or mental-health advice."]
    },
    {
      key: "final-summary",
      title: "Final Summary",
      status: "provider_verified",
      data: {
        strengths: interpretation.sections.find((section) => section.key === "overview")?.text ? [interpretation.sections.find((section) => section.key === "overview")?.text] : [],
        challenges: interpretation.metadata.missingInputs.length ? interpretation.metadata.missingInputs : ["Use the detailed sections as reflection prompts, not fixed outcomes."],
        bestDirection: "Use chart, Dasha, numerology, and remedies sections together for review-based planning.",
        keyFocusAreas: ["accurate birth details", "current Dasha review", "relationship and career reflection", "spiritual practice without fear-selling"]
      },
      limitations: ["Final summary is assembled from safe starter rules and provider-calculated facts. It is not a guaranteed prediction."]
    }
  ];

  for (const section of sections) {
    if (section.status === "unavailable") unavailableSections.push(section.key);
  }

  return {
    sections,
    metadata: {
      reportCompleteness: "provider_verified_partial",
      verified: false,
      premiumComplete: false,
      providerVerifiedSections: sections.filter((section) => section.status === "provider_verified").map((section) => section.key),
      unavailableSections,
      limitations: [
        "Report content is assembled only from available provider-regression-tested engine outputs.",
        "Unavailable modules are omitted or marked unavailable.",
        "Provider-verified does not mean external Swiss/Jagannatha Hora verification.",
        "This is not an automated deliverable premium PDF."
      ]
    }
  };
}

function chineseZodiacFromDate(dateText: string) {
  const year = new Date(`${String(dateText).slice(0, 10)}T00:00:00.000Z`).getUTCFullYear();
  const animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
  const elements = ["Wood", "Fire", "Earth", "Metal", "Water"];
  const animal = animals[(year - 1900) % 12];
  const element = elements[Math.floor(((year - 4) % 10) / 2)];
  return {
    year,
    animal,
    element,
    summary: `${element} ${animal} symbolism is included as a broad yearly archetype.`
  };
}

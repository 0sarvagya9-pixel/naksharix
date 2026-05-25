import { generateStarterInterpretation } from "@/lib/astrology/interpretation/rule-engine";
import { getPremiumEngineActivationStatus } from "@/lib/astrology/premium-engine/activation-status";
import { generateSafeRemedies } from "@/lib/astrology/remedies/rules";
import { calculatePartialShadbala } from "@/lib/astrology/strength/shadbala";
import { createAshtakvargaDependencyResult } from "@/lib/astrology/strength/ashtakvarga";
import { calculateSupportedVargaCharts } from "@/lib/astrology/varga/engine";
import type { CanonicalChartResult } from "@/lib/astrology/ephemeris/types";

export type PremiumReportContentSection = {
  key: string;
  title: string;
  status: "provider_verified" | "available_unverified" | "partial_internal" | "unavailable";
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
}): PremiumReportContentResult {
  const chart = input.chart;
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
      key: "birth-details-summary",
      title: "Birth Details Summary",
      status: "provider_verified",
      data: chart.normalizedInput,
      limitations: ["Birth details are user-provided and should be reviewed before premium delivery.", activation.chart.reason]
    },
    {
      key: "chart-summary",
      title: "Chart Summary",
      status: "provider_verified",
      data: {
        ascendant: chart.ascendant,
        moon: chart.moon,
        nakshatra: chart.nakshatra,
        ayanamsa: chart.ayanamsa
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
      key: "dasha-section",
      title: "Dasha Section",
      status: chart.dasha ? "provider_verified" : "unavailable",
      data: chart.dasha ?? null,
      limitations: ["Dasha timing depends on Moon longitude and is provider-regression tested, not externally verified.", activation.dasha.nextRequirement]
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
      title: "Strength Section",
      status: "partial_internal",
      data: {
        shadbala: calculatePartialShadbala(chart.planets),
        ashtakvarga: createAshtakvargaDependencyResult(chart.planets)
      },
      limitations: ["Only dependency-safe partial strength data is available. No total Shadbala or bindu scores are produced.", activation.strength.reason]
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
      data: "This internal report content is not a complete premium report. It must be reviewed before PDF generation or delivery.",
      limitations: ["No automatic premium report claim is active."]
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

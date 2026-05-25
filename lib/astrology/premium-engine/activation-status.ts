export type PremiumEngineModule =
  | "chart_precision"
  | "dasha"
  | "panchang"
  | "transit"
  | "transit_snapshot"
  | "varga"
  | "varga_d1"
  | "varga_d2"
  | "varga_d3"
  | "varga_d9"
  | "varga_d10"
  | "varga_d12"
  | "shadbala_partial"
  | "shadbala"
  | "ashtakvarga"
  | "interpretation"
  | "remedies"
  | "premium_report_content"
  | "pdf_generation";

export type PremiumEngineActivationStatus =
  | "public_active_verified"
  | "public_active_provider_verified"
  | "public_active_external_verified"
  | "provider_verified"
  | "external_verified"
  | "internal_verified"
  | "internal_unverified"
  | "blocked_until_formula"
  | "blocked_until_fixture"
  | "blocked_until_provider"
  | "unavailable";

export type PremiumEngineActivationEntry = {
  module: PremiumEngineModule;
  status: PremiumEngineActivationStatus;
  publicEnabled: boolean;
  sitemapEligible: boolean;
  navBadge: "Active" | "Coming Soon" | "Internal" | "Blocked";
  reason: string;
  nextRequirement: string;
};

const PANCHANG_PUBLIC_PROVIDER_VERIFIED = true;

export const premiumEngineActivationMatrix: Record<PremiumEngineModule, PremiumEngineActivationEntry> = {
  chart_precision: {
    module: "chart_precision",
    status: "provider_verified",
    publicEnabled: false,
    sitemapEligible: false,
    navBadge: "Internal",
    reason: "Chart calculation is regression-tested against Naksharix provider-generated fixtures. It is not externally verified.",
    nextRequirement: "Add Swiss Ephemeris/Jagannatha Hora cross-checked fixtures before external precision claims."
  },
  dasha: {
    module: "dasha",
    status: "provider_verified",
    publicEnabled: false,
    sitemapEligible: false,
    navBadge: "Internal",
    reason: "Vimshottari periods and birth balance are regression-tested from provider Moon longitude.",
    nextRequirement: "Add external Dasha balance and transition fixtures for external verification."
  },
  panchang: {
    module: "panchang",
    status: "public_active_provider_verified",
    publicEnabled: PANCHANG_PUBLIC_PROVIDER_VERIFIED,
    sitemapEligible: PANCHANG_PUBLIC_PROVIDER_VERIFIED,
    navBadge: "Active",
    reason: "Core Panchang fields pass deterministic provider fixture regression tests for fixed locations and dates.",
    nextRequirement: "Cross-check Panchang fields with Drik Panchang or Swiss Ephemeris before external accuracy claims."
  },
  transit: {
    module: "transit",
    status: "blocked_until_fixture",
    publicEnabled: false,
    sitemapEligible: false,
    navBadge: "Coming Soon",
    reason: "Current transit snapshot exists internally; ingress and retrograde dates are not verified.",
    nextRequirement: "Add trusted transit ingress/retrograde fixtures and pass qa:transit strict comparisons."
  },
  transit_snapshot: {
    module: "transit_snapshot",
    status: "provider_verified",
    publicEnabled: false,
    sitemapEligible: false,
    navBadge: "Internal",
    reason: "Fixed-date transit planet positions pass provider-generated fixture regression tests.",
    nextRequirement: "Add ingress and retrograde window fixtures before public transit prediction pages."
  },
  varga: {
    module: "varga",
    status: "provider_verified",
    publicEnabled: false,
    sitemapEligible: false,
    navBadge: "Internal",
    reason: "D1, D2, D3, D9, D10, and D12 placements pass provider-generated fixture regression tests.",
    nextRequirement: "Cross-check Varga placements against trusted chart software before public output."
  },
  varga_d1: providerVargaEntry("varga_d1", "D1"),
  varga_d2: providerVargaEntry("varga_d2", "D2"),
  varga_d3: providerVargaEntry("varga_d3", "D3"),
  varga_d9: providerVargaEntry("varga_d9", "D9"),
  varga_d10: providerVargaEntry("varga_d10", "D10"),
  varga_d12: providerVargaEntry("varga_d12", "D12"),
  shadbala_partial: {
    module: "shadbala_partial",
    status: "provider_verified",
    publicEnabled: false,
    sitemapEligible: false,
    navBadge: "Internal",
    reason: "Naisargika Bala constants are deterministic and dependency-safe.",
    nextRequirement: "Implement and verify remaining Bala components before total Shadbala output."
  },
  shadbala: {
    module: "shadbala",
    status: "blocked_until_formula",
    publicEnabled: false,
    sitemapEligible: false,
    navBadge: "Blocked",
    reason: "Only dependency-safe partial strength data exists; full Shadbala needs verified house, aspect, dignity, and motion inputs.",
    nextRequirement: "Implement and verify Sthana, Dig, Kala, Cheshta, Naisargika, and Drik Bala fixtures."
  },
  ashtakvarga: {
    module: "ashtakvarga",
    status: "blocked_until_formula",
    publicEnabled: false,
    sitemapEligible: false,
    navBadge: "Blocked",
    reason: "Bindu scoring is intentionally disabled until formulas and fixtures are verified.",
    nextRequirement: "Add Bhinna and Sarva Ashtakvarga fixture scores from a trusted source."
  },
  interpretation: {
    module: "interpretation",
    status: "provider_verified",
    publicEnabled: false,
    sitemapEligible: false,
    navBadge: "Internal",
    reason: "Safe starter interpretation rules can consume provider-verified chart facts without making deterministic life-event claims.",
    nextRequirement: "Build an editorially reviewed multilingual rule database with claim boundaries."
  },
  remedies: {
    module: "remedies",
    status: "provider_verified",
    publicEnabled: false,
    sitemapEligible: false,
    navBadge: "Internal",
    reason: "Safe starter remedy rules pass safety checks and use guarded input conditions.",
    nextRequirement: "Add reviewed remedy rules for verified chart conditions and language variants."
  },
  premium_report_content: {
    module: "premium_report_content",
    status: "provider_verified",
    publicEnabled: false,
    sitemapEligible: false,
    navBadge: "Internal",
    reason: "Report content assembly can include provider-verified chart, Dasha, Panchang, transit snapshot, and Varga sections.",
    nextRequirement: "Require verified chart fixtures, admin review workflow, and section-level approval."
  },
  pdf_generation: {
    module: "pdf_generation",
    status: "provider_verified",
    publicEnabled: false,
    sitemapEligible: false,
    navBadge: "Internal",
    reason: "Internal PDF bytes can be generated from reviewed provider-backed report content, but no public delivery URL is enabled.",
    nextRequirement: "Persist generated files, attach them to real report requests, and expose downloads only after admin review."
  }
};

function providerVargaEntry(module: Extract<PremiumEngineModule, `varga_${string}`>, chart: string): PremiumEngineActivationEntry {
  return {
    module,
    status: "provider_verified",
    publicEnabled: false,
    sitemapEligible: false,
    navBadge: "Internal",
    reason: `${chart} placement output passes provider-generated fixture regression tests.`,
    nextRequirement: `Cross-check ${chart} with trusted Varga chart software before public chart display.`
  };
}

export function getPremiumEngineActivationStatus(module: PremiumEngineModule) {
  return premiumEngineActivationMatrix[module];
}

export function getPubliclyActivatedPremiumEngineModules() {
  return Object.values(premiumEngineActivationMatrix).filter((entry) => entry.publicEnabled);
}

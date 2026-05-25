import type { AyanamsaOption, AyanamsaKey, EphemerisProviderMetadata } from "@/lib/astrology/ephemeris/types";

export const AYANAMSA_OPTIONS: AyanamsaOption[] = [
  {
    key: "lahiri",
    label: "Lahiri / Chitra Paksha",
    implemented: true,
    verified: false,
    publicSelectable: false,
    notes: "The current internal engine uses Lahiri-style ayanamsa, but production precision still needs external fixture validation."
  },
  {
    key: "raman",
    label: "Raman",
    implemented: false,
    verified: false,
    publicSelectable: false,
    notes: "Planned only. Do not expose publicly until implemented and fixture-verified."
  },
  {
    key: "kp",
    label: "KP",
    implemented: false,
    verified: false,
    publicSelectable: false,
    notes: "Planned only. Do not expose publicly until implemented and fixture-verified."
  },
  {
    key: "fagan_bradley",
    label: "Fagan-Bradley",
    implemented: false,
    verified: false,
    publicSelectable: false,
    notes: "Planned only. Do not expose publicly until implemented and fixture-verified."
  }
];

export function getAyanamsaOption(key: AyanamsaKey | undefined) {
  return AYANAMSA_OPTIONS.find((option) => option.key === key) ?? AYANAMSA_OPTIONS[0];
}

export function currentEphemerisMetadata(): EphemerisProviderMetadata {
  return {
    provider: "naksharix_current_internal_adapter",
    calculationMode: "foundation_only_no_public_precision_claim",
    precisionLevel: "blocked_until_provider_ready",
    verified: false,
    limitations: [
      "External ephemeris fixtures are not verified yet.",
      "CI-safe runtime chart adapter is not wired yet.",
      "Only Lahiri-style internal ayanamsa support is present, and it is not production-verified.",
      "Panchang and transit must remain public hold features until external fixtures pass."
    ]
  };
}

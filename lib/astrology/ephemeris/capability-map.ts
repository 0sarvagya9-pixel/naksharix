import { currentEphemerisMetadata, getAyanamsaOption } from "@/lib/astrology/ephemeris/provider";
import type { AyanamsaKey } from "@/lib/astrology/ephemeris/types";

export type ProviderCapabilityStatus = "supported_unverified" | "unsupported" | "blocked_until_provider_ready";

export type ProviderCapability = {
  key: string;
  label: string;
  status: ProviderCapabilityStatus;
  publicClaimAllowed: false;
  notes: string;
};

export const EPHEMERIS_PROVIDER_CAPABILITIES: ProviderCapability[] = [
  { key: "ascendant", label: "Ascendant degree", status: "blocked_until_provider_ready", publicClaimAllowed: false, notes: "Needs CI-safe provider adapter and verified external chart fixtures." },
  { key: "planetDegrees", label: "Planet degrees", status: "blocked_until_provider_ready", publicClaimAllowed: false, notes: "Requires trusted ephemeris comparison for Sun through Ketu." },
  { key: "moonNakshatraPada", label: "Moon nakshatra and pada", status: "supported_unverified", publicClaimAllowed: false, notes: "Pure mapping is tested; exact Moon longitude remains external-fixture blocked." },
  { key: "dashaBalance", label: "Dasha balance at birth", status: "blocked_until_provider_ready", publicClaimAllowed: false, notes: "Needs verified Moon longitude and transition fixtures." },
  { key: "panchang", label: "Panchang fields", status: "blocked_until_provider_ready", publicClaimAllowed: false, notes: "Public Panchang remains Coming Soon until all required fields are verified." },
  { key: "transit", label: "Transit positions and ingress", status: "blocked_until_provider_ready", publicClaimAllowed: false, notes: "No transit dates are generated or promoted publicly." }
];

export function getEphemerisReadinessSummary(ayanamsa: AyanamsaKey = "lahiri") {
  const selectedAyanamsa = getAyanamsaOption(ayanamsa);
  return {
    metadata: currentEphemerisMetadata(),
    selectedAyanamsa,
    capabilities: EPHEMERIS_PROVIDER_CAPABILITIES,
    strictFixtureStatus: "no_verified_data" as const,
    publicPrecisionClaimAllowed: false
  };
}

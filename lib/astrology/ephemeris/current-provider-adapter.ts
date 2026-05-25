import { currentEphemerisMetadata, getAyanamsaOption } from "@/lib/astrology/ephemeris/provider";
import type { CanonicalChartInput, CanonicalChartResult, EphemerisProvider } from "@/lib/astrology/ephemeris/types";

export const currentEphemerisProvider: EphemerisProvider = {
  id: "naksharix_current_internal_adapter",
  label: "Naksharix Current Internal Adapter",
  async calculateChart(input: CanonicalChartInput): Promise<CanonicalChartResult> {
    const ayanamsa = getAyanamsaOption(input.ayanamsa);
    return {
      normalizedInput: {
        ...input,
        ayanamsa: ayanamsa.key,
        houseSystem: input.houseSystem ?? "Vedic Whole Sign"
      },
      ayanamsa: {
        key: ayanamsa.key,
        label: ayanamsa.label,
        degree: null,
        verified: false
      },
      ascendant: { sign: null, degree: null, absoluteLongitude: null },
      moon: { sign: null, degree: null, absoluteLongitude: null },
      nakshatra: { name: null, pada: null },
      planets: [],
      houses: [],
      dasha: {
        startingMahadashaLord: null,
        balanceAtBirth: null,
        transitions: [],
        verified: false
      },
      metadata: currentEphemerisMetadata()
    };
  }
};

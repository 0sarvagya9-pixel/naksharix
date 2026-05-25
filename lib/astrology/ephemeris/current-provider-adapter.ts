import { calculateInternalChart } from "@/lib/astrology/premium-engine/chart";
import type { CanonicalChartInput, CanonicalChartResult, EphemerisProvider } from "@/lib/astrology/ephemeris/types";

export const currentEphemerisProvider: EphemerisProvider = {
  id: "naksharix_current_internal_adapter",
  label: "Naksharix Current Internal Adapter",
  async calculateChart(input: CanonicalChartInput): Promise<CanonicalChartResult> {
    return calculateInternalChart(input);
  }
};

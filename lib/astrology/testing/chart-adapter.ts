import { calculateInternalChart } from "@/lib/astrology/premium-engine/chart";
import type { CanonicalChartResult } from "@/lib/astrology/ephemeris/types";

export type FixtureChartInput = {
  date: string;
  time: string;
  timezone: string;
  latitude: number;
  longitude: number;
  place?: string;
  ayanamsa?: string;
  house_system?: string;
};

export async function calculateChartForFixture(input: FixtureChartInput): Promise<CanonicalChartResult> {
  return calculateInternalChart({
    date: input.date,
    time: input.time,
    timezone: input.timezone,
    latitude: input.latitude,
    longitude: input.longitude,
    place: input.place,
    birthPlace: input.place ?? "Fixture location",
    ayanamsa: input.ayanamsa === "lahiri" ? "lahiri" : undefined,
    house_system: input.house_system,
    houseSystem: input.house_system ?? "Vedic Whole Sign"
  });
}

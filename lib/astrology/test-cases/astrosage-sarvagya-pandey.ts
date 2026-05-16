import type { AstrologyBirthInput, DashaPeriod, PanchangSnapshot, PlanetPosition } from "@/lib/astrology/types";

type BenchmarkPlanet = {
  sign: string;
  degree: number;
  nakshatra: string;
  pada: number;
  house: number;
};

type BenchmarkRow = {
  Field: string;
  Expected: string;
  Naksharix: string;
  Difference: string;
  Status: "PASS" | "FAIL";
};

type ComputedBenchmarkPlanet = PlanetPosition & {
  absoluteLongitude?: number;
  rashiNumber?: number;
};

export const astrosageSarvagyaPandeyInput: AstrologyBirthInput = {
  name: "Sarvagya Pandey",
  gender: "Male",
  dateOfBirth: "1992-10-19",
  timeOfBirth: "04:20:00",
  birthPlace: "Tikamgarh, Madhya Pradesh, India",
  latitude: 24.75,
  longitude: 79.0,
  timezone: "+5.5",
  language: "en"
};

export const astrosageSarvagyaPandeyBenchmark = {
  ayanamsa: dmsToDecimal(23, 45, 21),
  julianDayDisplay: "2448915",
  panchang: {
    tithi: "Ashtami",
    paksha: "Krishna Paksha",
    vaar: "Monday",
    yoga: "Siddha",
    karan: "Balava",
    sunrise: "06:13:58",
    sunset: "17:43:57"
  },
  dasha: {
    balanceLord: "Jupiter",
    balance: "5 years 0 months 6 days",
    firstMahadasha: "Jupiter",
    firstMahadashaStart: "1992-10-19",
    firstMahadashaEnd: "1997-10-26"
  },
  ascendant: {
    sign: "Virgo",
    degree: dmsToDecimal(5, 28, 55)
  },
  moonSign: "Gemini",
  nakshatra: "Punarvasu",
  pada: 3,
  planets: {
    Sun: { sign: "Libra", degree: dmsToDecimal(2, 3, 30), nakshatra: "Chitra", pada: 3, house: 2 },
    Moon: { sign: "Gemini", degree: dmsToDecimal(29, 9, 6), nakshatra: "Punarvasu", pada: 3, house: 10 },
    Mars: { sign: "Gemini", degree: dmsToDecimal(24, 27, 37), nakshatra: "Punarvasu", pada: 2, house: 10 },
    Mercury: { sign: "Libra", degree: dmsToDecimal(22, 52, 43), nakshatra: "Vishakha", pada: 1, house: 2 },
    Jupiter: { sign: "Virgo", degree: dmsToDecimal(7, 58, 27), nakshatra: "Uttara Phalguni", pada: 4, house: 1 },
    Venus: { sign: "Scorpio", degree: dmsToDecimal(5, 17, 29), nakshatra: "Anuradha", pada: 1, house: 3 },
    Saturn: { sign: "Capricorn", degree: dmsToDecimal(18, 3, 14), nakshatra: "Shravana", pada: 3, house: 5 },
    Rahu: { sign: "Sagittarius", degree: dmsToDecimal(0, 34, 55), nakshatra: "Mula", pada: 1, house: 4 },
    Ketu: { sign: "Gemini", degree: dmsToDecimal(0, 34, 55), nakshatra: "Mrigashira", pada: 3, house: 10 }
  } satisfies Record<string, BenchmarkPlanet>
};

export function isAstroSageSarvagyaPandeyInput(input: AstrologyBirthInput) {
  return input.name.trim().toLowerCase() === "sarvagya pandey"
    && normalizeDate(String(input.dateOfBirth)) === "1992-10-19"
    && input.timeOfBirth.startsWith("04:20")
    && Math.abs(Number(input.latitude) - 24.75) <= 0.02
    && Math.abs(Number(input.longitude) - 79.0) <= 0.05;
}

export function compareAstroSageSarvagyaBenchmark(calculated: {
  ayanamsa: number;
  ascendant: { rashi: string; degreeInSign: number };
  planets: ComputedBenchmarkPlanet[];
  panchang?: PanchangSnapshot;
  vimshottariDasha?: DashaPeriod[];
}) {
  const rows: BenchmarkRow[] = [];

  rows.push(compareText("Lagna sign", astrosageSarvagyaPandeyBenchmark.ascendant.sign, calculated.ascendant.rashi));
  rows.push(compareDegree("Lagna degree", astrosageSarvagyaPandeyBenchmark.ascendant.degree, calculated.ascendant.degreeInSign));
  rows.push(compareDegree("Ayanamsha", astrosageSarvagyaPandeyBenchmark.ayanamsa, calculated.ayanamsa, 0.05));
  rows.push(compareText("Panchang tithi", astrosageSarvagyaPandeyBenchmark.panchang.tithi, calculated.panchang?.tithi));
  rows.push(compareText("Panchang paksha", astrosageSarvagyaPandeyBenchmark.panchang.paksha, calculated.panchang?.paksha));
  rows.push(compareText("Panchang vaar", astrosageSarvagyaPandeyBenchmark.panchang.vaar, calculated.panchang?.vaar));
  rows.push(compareText("Panchang yoga", astrosageSarvagyaPandeyBenchmark.panchang.yoga, calculated.panchang?.yoga));
  rows.push(compareText("Panchang karan", astrosageSarvagyaPandeyBenchmark.panchang.karan, calculated.panchang?.karan));
  rows.push(compareClock("Panchang sunrise", astrosageSarvagyaPandeyBenchmark.panchang.sunrise, calculated.panchang?.sunrise));
  rows.push(compareClock("Panchang sunset", astrosageSarvagyaPandeyBenchmark.panchang.sunset, calculated.panchang?.sunset));

  const firstDasha = calculated.vimshottariDasha?.[0];
  rows.push(compareText("Dasha balance lord", astrosageSarvagyaPandeyBenchmark.dasha.balanceLord, firstDasha?.planet));
  rows.push(compareText("First Mahadasha start", astrosageSarvagyaPandeyBenchmark.dasha.firstMahadashaStart, firstDasha?.startsAt));
  rows.push(compareText("First Mahadasha end", astrosageSarvagyaPandeyBenchmark.dasha.firstMahadashaEnd, firstDasha?.endsAt));

  for (const [planetName, expected] of Object.entries(astrosageSarvagyaPandeyBenchmark.planets)) {
    const planet = calculated.planets.find((item) => item.planet === planetName);
    rows.push(compareText(`${planetName} sign`, expected.sign, planet?.sign));
    rows.push(compareDegree(`${planetName} degree`, expected.degree, planet?.degree));
    rows.push(compareText(`${planetName} nakshatra`, expected.nakshatra, planet?.nakshatra));
    rows.push(compareText(`${planetName} pada`, String(expected.pada), planet?.pada ? String(planet.pada) : undefined));
    rows.push(compareText(`${planetName} D1 house`, String(expected.house), planet?.house ? String(planet.house) : undefined));
  }

  return rows;
}

export function printAstroSageSarvagyaBenchmarkComparison(calculated: {
  ayanamsa: number;
  ascendant: { rashi: string; degreeInSign: number };
  planets: ComputedBenchmarkPlanet[];
  panchang?: PanchangSnapshot;
  vimshottariDasha?: DashaPeriod[];
}) {
  const rows = compareAstroSageSarvagyaBenchmark(calculated);
  console.info("[Naksharix AstroSage Benchmark] Sarvagya Pandey comparison");
  console.table(rows);
}

function compareText(field: string, expected: string, calculated: string | undefined): BenchmarkRow {
  const actual = calculated ?? "Not available";
  return {
    Field: field,
    Expected: expected,
    Naksharix: actual,
    Difference: expected === actual ? "0" : "mismatch",
    Status: expected === actual ? "PASS" : "FAIL"
  };
}

function compareDegree(field: string, expected: number, calculated: number | undefined, tolerance = 1): BenchmarkRow {
  if (typeof calculated !== "number") {
    return {
      Field: field,
      Expected: decimalToDms(expected),
      Naksharix: "Not available",
      Difference: "n/a",
      Status: "FAIL"
    };
  }
  const diff = Math.abs(expected - calculated);
  return {
    Field: field,
    Expected: decimalToDms(expected),
    Naksharix: decimalToDms(calculated),
    Difference: `${diff.toFixed(4)}°`,
    Status: diff <= tolerance ? "PASS" : "FAIL"
  };
}

function compareClock(field: string, expected: string, calculated: string | undefined): BenchmarkRow {
  if (!calculated || calculated === "Not available") {
    return {
      Field: field,
      Expected: expected,
      Naksharix: calculated ?? "Not available",
      Difference: "n/a",
      Status: "FAIL"
    };
  }
  const diff = Math.abs(clockToSeconds(expected) - clockToSeconds(calculated));
  return {
    Field: field,
    Expected: expected,
    Naksharix: calculated,
    Difference: `${diff}s`,
    Status: diff <= 60 ? "PASS" : "FAIL"
  };
}

function dmsToDecimal(degrees: number, minutes: number, seconds: number) {
  return degrees + minutes / 60 + seconds / 3600;
}

function decimalToDms(value: number) {
  const totalSeconds = Math.round(value * 3600);
  const degrees = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds - degrees * 3600) / 60);
  const seconds = totalSeconds - degrees * 3600 - minutes * 60;
  return `${String(degrees).padStart(2, "0")}°${String(minutes).padStart(2, "0")}'${String(seconds).padStart(2, "0")}"`;
}

function clockToSeconds(value: string) {
  const [hours, minutes, seconds] = value.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

function normalizeDate(value: string) {
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const indian = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (!indian) return value;
  return `${indian[3]}-${indian[2].padStart(2, "0")}-${indian[1].padStart(2, "0")}`;
}

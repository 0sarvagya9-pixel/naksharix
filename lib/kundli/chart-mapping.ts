export type ChartLanguage = "en" | "hi" | "hinglish";
export type ChartType = "D1" | "D9";

export type ChartPlanet = {
  planet: string;
  degree?: number;
  nakshatra?: string;
  pada?: number;
};

export type ChartHouse = {
  house: number;
  sign: string;
  signLord?: string;
  planets?: ChartPlanet[];
};

export type NorthIndianChartData = {
  chartType: ChartType;
  ascendantSign: string;
  houses: ChartHouse[];
  language: ChartLanguage;
};

export type ChartCell = ChartHouse & {
  points: string;
  labelX: number;
  labelY: number;
  signX: number;
  signY: number;
  planetX: number;
  planetY: number;
  planetLineHeight: number;
  signLabel: string;
  signShortLabel: string;
  signLordLabel?: string;
  planetLabels: string[];
  planetFullLabels: string[];
};

const signLords: Record<string, string> = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter"
};

const signOrder = Object.keys(signLords);

const signNumbers: Record<string, number> = {
  Aries: 1,
  Taurus: 2,
  Gemini: 3,
  Cancer: 4,
  Leo: 5,
  Virgo: 6,
  Libra: 7,
  Scorpio: 8,
  Sagittarius: 9,
  Capricorn: 10,
  Aquarius: 11,
  Pisces: 12
};

const signLabels: Record<ChartLanguage, Record<string, string>> = {
  en: {
    Aries: "Aries",
    Taurus: "Taurus",
    Gemini: "Gemini",
    Cancer: "Cancer",
    Leo: "Leo",
    Virgo: "Virgo",
    Libra: "Libra",
    Scorpio: "Scorpio",
    Sagittarius: "Sagittarius",
    Capricorn: "Capricorn",
    Aquarius: "Aquarius",
    Pisces: "Pisces"
  },
  hi: {
    Aries: "मेष",
    Taurus: "वृषभ",
    Gemini: "मिथुन",
    Cancer: "कर्क",
    Leo: "सिंह",
    Virgo: "कन्या",
    Libra: "तुला",
    Scorpio: "वृश्चिक",
    Sagittarius: "धनु",
    Capricorn: "मकर",
    Aquarius: "कुंभ",
    Pisces: "मीन"
  },
  hinglish: {
    Aries: "Mesh",
    Taurus: "Vrishabh",
    Gemini: "Mithun",
    Cancer: "Kark",
    Leo: "Singh",
    Virgo: "Kanya",
    Libra: "Tula",
    Scorpio: "Vrishchik",
    Sagittarius: "Dhanu",
    Capricorn: "Makar",
    Aquarius: "Kumbh",
    Pisces: "Meen"
  }
};

const planetFullLabels: Record<ChartLanguage, Record<string, string>> = {
  en: {
    Sun: "Sun",
    Moon: "Moon",
    Mars: "Mars",
    Mercury: "Mercury",
    Jupiter: "Jupiter",
    Venus: "Venus",
    Saturn: "Saturn",
    Rahu: "Rahu",
    Ketu: "Ketu",
    Ascendant: "Ascendant"
  },
  hi: {
    Sun: "सूर्य",
    Moon: "चंद्र",
    Mars: "मंगल",
    Mercury: "बुध",
    Jupiter: "गुरु",
    Venus: "शुक्र",
    Saturn: "शनि",
    Rahu: "राहु",
    Ketu: "केतु",
    Ascendant: "लग्न"
  },
  hinglish: {
    Sun: "Surya",
    Moon: "Chandra",
    Mars: "Mangal",
    Mercury: "Budh",
    Jupiter: "Guru",
    Venus: "Shukra",
    Saturn: "Shani",
    Rahu: "Rahu",
    Ketu: "Ketu",
    Ascendant: "Lagna"
  }
};

const planetShortLabels: Record<ChartLanguage, Record<string, string>> = {
  en: { Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke", Ascendant: "As" },
  hi: { Sun: "सू", Moon: "चं", Mars: "मं", Mercury: "बु", Jupiter: "गु", Venus: "शु", Saturn: "श", Rahu: "रा", Ketu: "के", Ascendant: "ल" },
  hinglish: { Sun: "Su", Moon: "Ch", Mars: "Ma", Mercury: "Bu", Jupiter: "Gu", Venus: "Sh", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke", Ascendant: "As" }
};

const northIndianLayout: Record<number, { points: string; labelX: number; labelY: number; signX: number; signY: number; planetX: number; planetY: number; planetLineHeight: number }> = {
  1: { points: "200,28 292,120 200,212 108,120", labelX: 200, labelY: 118, signX: 200, signY: 56, planetX: 200, planetY: 126, planetLineHeight: 14 },
  2: { points: "32,28 200,28 108,120 32,120", labelX: 94, labelY: 68, signX: 56, signY: 48, planetX: 96, planetY: 78, planetLineHeight: 13 },
  3: { points: "32,120 108,120 200,212 108,212", labelX: 112, labelY: 166, signX: 74, signY: 138, planetX: 122, planetY: 170, planetLineHeight: 13 },
  4: { points: "32,120 108,212 32,372 32,252", labelX: 62, labelY: 246, signX: 46, signY: 174, planetX: 62, planetY: 260, planetLineHeight: 13 },
  5: { points: "32,372 108,212 200,372", labelX: 116, labelY: 320, signX: 88, signY: 350, planetX: 122, planetY: 320, planetLineHeight: 13 },
  6: { points: "108,212 200,212 292,304 200,372", labelX: 190, labelY: 294, signX: 166, signY: 238, planetX: 200, planetY: 306, planetLineHeight: 14 },
  7: { points: "200,372 292,304 368,372", labelX: 286, labelY: 334, signX: 262, signY: 356, planetX: 290, planetY: 334, planetLineHeight: 13 },
  8: { points: "292,304 368,120 368,372", labelX: 336, labelY: 246, signX: 354, signY: 174, planetX: 338, planetY: 260, planetLineHeight: 13 },
  9: { points: "200,212 292,120 368,120 292,304", labelX: 294, labelY: 184, signX: 326, signY: 138, planetX: 292, planetY: 190, planetLineHeight: 13 },
  10: { points: "292,120 200,28 368,28 368,120", labelX: 308, labelY: 68, signX: 344, signY: 48, planetX: 306, planetY: 78, planetLineHeight: 13 },
  11: { points: "108,120 200,212 108,212 32,120", labelX: 110, labelY: 188, signX: 118, signY: 132, planetX: 112, planetY: 194, planetLineHeight: 13 },
  12: { points: "292,120 368,120 292,304 200,212", labelX: 290, labelY: 206, signX: 282, signY: 132, planetX: 288, planetY: 210, planetLineHeight: 13 }
};

export function normalizeNorthIndianChart(input: NorthIndianChartData): ChartCell[] {
  return Array.from({ length: 12 }, (_, index) => {
    const houseNumber = index + 1;
    const layout = northIndianLayout[houseNumber];
    const source = input.houses.find((house) => house.house === houseNumber);
    const sign = source?.sign || signFromAscendant(input.ascendantSign, houseNumber);
    const planets = source?.planets ?? [];
    const signLord = source?.signLord ?? signLords[sign];
    return {
      house: houseNumber,
      sign,
      signLord,
      signLordLabel: signLord ? translatePlanet(signLord, input.language) : undefined,
      planets,
      points: layout.points,
      labelX: layout.labelX,
      labelY: layout.labelY,
      signX: layout.signX,
      signY: layout.signY,
      planetX: layout.planetX,
      planetY: layout.planetY,
      planetLineHeight: layout.planetLineHeight,
      signLabel: translateSign(sign, input.language),
      signShortLabel: String(signNumbers[sign] ?? houseNumber),
      planetLabels: planets.map((planet) => abbreviatePlanet(planet.planet, input.language)),
      planetFullLabels: planets.map((planet) => translatePlanet(planet.planet, input.language))
    };
  });
}

export function translateSign(sign: string | undefined, language: ChartLanguage) {
  if (!sign) return "";
  return signLabels[language][sign] ?? sign;
}

export function translatePlanet(planet: string | undefined, language: ChartLanguage) {
  if (!planet) return "";
  return planetFullLabels[language][planet] ?? planet;
}

export function abbreviatePlanet(planet: string, language: ChartLanguage) {
  return planetShortLabels[language][planet] ?? planet.slice(0, 2);
}

export function chartLabels(language: ChartLanguage) {
  if (language === "hi") {
    return { house: "भाव", sign: "राशि", signLord: "राशि स्वामी", planets: "ग्रह", degree: "डिग्री", nakshatra: "नक्षत्र", pada: "पद", noPlanets: "कोई ग्रह नहीं" };
  }
  if (language === "hinglish") {
    return { house: "Bhav", sign: "Rashi", signLord: "Rashi Swami", planets: "Grah", degree: "Degree", nakshatra: "Nakshatra", pada: "Pada", noPlanets: "Koi grah nahi" };
  }
  return { house: "House", sign: "Sign", signLord: "Sign Lord", planets: "Planets", degree: "Degree", nakshatra: "Nakshatra", pada: "Pada", noPlanets: "No planets" };
}

function signFromAscendant(ascendantSign: string, house: number) {
  const ascendantIndex = Math.max(0, signOrder.indexOf(ascendantSign));
  return signOrder[(ascendantIndex + house - 1) % signOrder.length];
}




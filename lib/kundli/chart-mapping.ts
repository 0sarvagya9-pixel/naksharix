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
  maxWidth: number;
  maxLines: number;
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

const HOUSE_LAYOUT: Record<number, { points: string; labelX: number; labelY: number; signX: number; signY: number; planetX: number; planetY: number; planetLineHeight: number; maxWidth: number; maxLines: number }> = {
  1: { points: "300,6 402,108 300,210 198,108", labelX: 300, labelY: 110, signX: 300, signY: 38, planetX: 300, planetY: 106, planetLineHeight: 16, maxWidth: 82, maxLines: 4 },
  2: { points: "96,6 300,6 198,108", labelX: 198, labelY: 52, signX: 128, signY: 34, planetX: 178, planetY: 58, planetLineHeight: 15, maxWidth: 70, maxLines: 4 },
  3: { points: "96,6 198,108 96,210", labelX: 132, labelY: 112, signX: 118, signY: 160, planetX: 142, planetY: 116, planetLineHeight: 15, maxWidth: 64, maxLines: 4 },
  4: { points: "96,210 198,108 300,210 198,312", labelX: 198, labelY: 210, signX: 130, signY: 210, planetX: 198, planetY: 210, planetLineHeight: 16, maxWidth: 72, maxLines: 4 },
  5: { points: "96,210 198,312 96,414", labelX: 132, labelY: 308, signX: 118, signY: 340, planetX: 142, planetY: 304, planetLineHeight: 15, maxWidth: 64, maxLines: 4 },
  6: { points: "96,414 198,312 300,414", labelX: 198, labelY: 366, signX: 178, signY: 388, planetX: 224, planetY: 358, planetLineHeight: 15, maxWidth: 70, maxLines: 4 },
  7: { points: "300,210 402,312 300,414 198,312", labelX: 300, labelY: 314, signX: 300, signY: 386, planetX: 300, planetY: 314, planetLineHeight: 16, maxWidth: 82, maxLines: 4 },
  8: { points: "300,414 402,312 504,414", labelX: 402, labelY: 366, signX: 422, signY: 388, planetX: 376, planetY: 358, planetLineHeight: 15, maxWidth: 70, maxLines: 4 },
  9: { points: "504,210 504,414 402,312", labelX: 468, labelY: 308, signX: 482, signY: 340, planetX: 458, planetY: 304, planetLineHeight: 15, maxWidth: 64, maxLines: 4 },
  10: { points: "504,210 402,108 300,210 402,312", labelX: 402, labelY: 210, signX: 470, signY: 210, planetX: 402, planetY: 210, planetLineHeight: 16, maxWidth: 72, maxLines: 4 },
  11: { points: "504,6 504,210 402,108", labelX: 468, labelY: 112, signX: 482, signY: 160, planetX: 458, planetY: 116, planetLineHeight: 15, maxWidth: 64, maxLines: 4 },
  12: { points: "300,6 504,6 402,108", labelX: 402, labelY: 52, signX: 472, signY: 34, planetX: 422, planetY: 58, planetLineHeight: 15, maxWidth: 70, maxLines: 4 }
};export function normalizeNorthIndianChart(input: NorthIndianChartData): ChartCell[] {
  return Array.from({ length: 12 }, (_, index) => {
    const houseNumber = index + 1;
    const layout = HOUSE_LAYOUT[houseNumber];
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
      maxWidth: layout.maxWidth,
      maxLines: layout.maxLines,
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






export type ChartLanguage = "en" | "hi" | "hinglish";
export type ChartType = "D1" | "D9";
export type AstroValueCategory = "planet" | "sign" | "weekday" | "paksha" | "tithi" | "nakshatra" | "yoga" | "karan";

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
};

export function normalizeNorthIndianChart(input: NorthIndianChartData): ChartCell[] {
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
  const canonical = canonicalKey(sign, signLabels.en);
  return canonical ? signLabels[language][canonical] ?? sign : sign;
}

export function translatePlanet(planet: string | undefined, language: ChartLanguage) {
  if (!planet) return "";
  const canonical = canonicalKey(planet, planetFullLabels.en);
  return canonical ? planetFullLabels[language][canonical] ?? planet : planet;
}

export function translateAstroValue(value: unknown, language: ChartLanguage, category: AstroValueCategory) {
  if (value === null || value === undefined || value === "") return "";
  const text = String(value);
  if (category === "planet") return translatePlanet(text, language) || text;
  if (category === "sign") return translateSign(text, language) || text;
  const map = astroValueLabels[category];
  const canonical = canonicalKey(text, map.en);
  return canonical ? map[language][canonical] ?? text : text;
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

function canonicalKey(value: string, dictionary: Record<string, string>) {
  const normalized = normalizeAstroKey(value);
  return Object.keys(dictionary).find((key) => normalizeAstroKey(key) === normalized || normalizeAstroKey(dictionary[key]) === normalized);
}

function normalizeAstroKey(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const astroValueLabels: Record<Exclude<AstroValueCategory, "planet" | "sign">, Record<ChartLanguage, Record<string, string>>> = {
  weekday: {
    en: { Monday: "Monday", Tuesday: "Tuesday", Wednesday: "Wednesday", Thursday: "Thursday", Friday: "Friday", Saturday: "Saturday", Sunday: "Sunday" },
    hi: { Monday: "सोमवार", Tuesday: "मंगलवार", Wednesday: "बुधवार", Thursday: "गुरुवार", Friday: "शुक्रवार", Saturday: "शनिवार", Sunday: "रविवार" },
    hinglish: { Monday: "Somvar", Tuesday: "Mangalvar", Wednesday: "Budhvar", Thursday: "Guruvar", Friday: "Shukravar", Saturday: "Shanivar", Sunday: "Ravivar" }
  },
  paksha: {
    en: { "Shukla Paksha": "Shukla Paksha", "Krishna Paksha": "Krishna Paksha", Shukla: "Shukla Paksha", Krishna: "Krishna Paksha" },
    hi: { "Shukla Paksha": "शुक्ल पक्ष", "Krishna Paksha": "कृष्ण पक्ष", Shukla: "शुक्ल पक्ष", Krishna: "कृष्ण पक्ष" },
    hinglish: { "Shukla Paksha": "Shukla Paksha", "Krishna Paksha": "Krishna Paksha", Shukla: "Shukla Paksha", Krishna: "Krishna Paksha" }
  },
  tithi: {
    en: {
      Pratipada: "Pratipada", Dwitiya: "Dwitiya", Tritiya: "Tritiya", Chaturthi: "Chaturthi", Panchami: "Panchami", Shashthi: "Shashthi", Saptami: "Saptami", Ashtami: "Ashtami", Navami: "Navami", Dashami: "Dashami", Ekadashi: "Ekadashi", Dwadashi: "Dwadashi", Trayodashi: "Trayodashi", Chaturdashi: "Chaturdashi", Purnima: "Purnima", Amavasya: "Amavasya"
    },
    hi: {
      Pratipada: "प्रतिपदा", Dwitiya: "द्वितीया", Tritiya: "तृतीया", Chaturthi: "चतुर्थी", Panchami: "पंचमी", Shashthi: "षष्ठी", Saptami: "सप्तमी", Ashtami: "अष्टमी", Navami: "नवमी", Dashami: "दशमी", Ekadashi: "एकादशी", Dwadashi: "द्वादशी", Trayodashi: "त्रयोदशी", Chaturdashi: "चतुर्दशी", Purnima: "पूर्णिमा", Amavasya: "अमावस्या"
    },
    hinglish: {
      Pratipada: "Pratipada", Dwitiya: "Dwitiya", Tritiya: "Tritiya", Chaturthi: "Chaturthi", Panchami: "Panchami", Shashthi: "Shashthi", Saptami: "Saptami", Ashtami: "Ashtami", Navami: "Navami", Dashami: "Dashami", Ekadashi: "Ekadashi", Dwadashi: "Dwadashi", Trayodashi: "Trayodashi", Chaturdashi: "Chaturdashi", Purnima: "Purnima", Amavasya: "Amavasya"
    }
  },
  nakshatra: {
    en: {
      Ashwini: "Ashwini", Bharani: "Bharani", Krittika: "Krittika", Rohini: "Rohini", Mrigashira: "Mrigashira", Ardra: "Ardra", Punarvasu: "Punarvasu", Pushya: "Pushya", Ashlesha: "Ashlesha", Magha: "Magha", "Purva Phalguni": "Purva Phalguni", "Uttara Phalguni": "Uttara Phalguni", Hasta: "Hasta", Chitra: "Chitra", Swati: "Swati", Vishakha: "Vishakha", Anuradha: "Anuradha", Jyeshtha: "Jyeshtha", Mula: "Mula", "Purva Ashadha": "Purva Ashadha", "Uttara Ashadha": "Uttara Ashadha", Shravana: "Shravana", Dhanishta: "Dhanishta", Shatabhisha: "Shatabhisha", "Purva Bhadrapada": "Purva Bhadrapada", "Uttara Bhadrapada": "Uttara Bhadrapada", Revati: "Revati"
    },
    hi: {
      Ashwini: "अश्विनी", Bharani: "भरणी", Krittika: "कृत्तिका", Rohini: "रोहिणी", Mrigashira: "मृगशिरा", Ardra: "आर्द्रा", Punarvasu: "पुनर्वसु", Pushya: "पुष्य", Ashlesha: "आश्लेषा", Magha: "मघा", "Purva Phalguni": "पूर्व फाल्गुनी", "Uttara Phalguni": "उत्तर फाल्गुनी", Hasta: "हस्त", Chitra: "चित्रा", Swati: "स्वाती", Vishakha: "विशाखा", Anuradha: "अनुराधा", Jyeshtha: "ज्येष्ठा", Mula: "मूल", "Purva Ashadha": "पूर्वाषाढ़ा", "Uttara Ashadha": "उत्तराषाढ़ा", Shravana: "श्रवण", Dhanishta: "धनिष्ठा", Shatabhisha: "शतभिषा", "Purva Bhadrapada": "पूर्व भाद्रपद", "Uttara Bhadrapada": "उत्तर भाद्रपद", Revati: "रेवती"
    },
    hinglish: {
      Ashwini: "Ashwini", Bharani: "Bharani", Krittika: "Krittika", Rohini: "Rohini", Mrigashira: "Mrigashira", Ardra: "Ardra", Punarvasu: "Punarvasu", Pushya: "Pushya", Ashlesha: "Ashlesha", Magha: "Magha", "Purva Phalguni": "Purva Phalguni", "Uttara Phalguni": "Uttara Phalguni", Hasta: "Hasta", Chitra: "Chitra", Swati: "Swati", Vishakha: "Vishakha", Anuradha: "Anuradha", Jyeshtha: "Jyeshtha", Mula: "Mula", "Purva Ashadha": "Purva Ashadha", "Uttara Ashadha": "Uttara Ashadha", Shravana: "Shravana", Dhanishta: "Dhanishta", Shatabhisha: "Shatabhisha", "Purva Bhadrapada": "Purva Bhadrapada", "Uttara Bhadrapada": "Uttara Bhadrapada", Revati: "Revati"
    }
  },
  yoga: {
    en: { Siddha: "Siddha" },
    hi: { Siddha: "सिद्ध" },
    hinglish: { Siddha: "Siddha" }
  },
  karan: {
    en: { Balava: "Balava", Kaulava: "Kaulava", Taitila: "Taitila", Gara: "Gara", Vanija: "Vanija", Vishti: "Vishti", Bava: "Bava" },
    hi: { Balava: "बालव", Kaulava: "कौलव", Taitila: "तैतिल", Gara: "गर", Vanija: "वणिज", Vishti: "विष्टि", Bava: "बव" },
    hinglish: { Balava: "Balava", Kaulava: "Kaulava", Taitila: "Taitila", Gara: "Gara", Vanija: "Vanija", Vishti: "Vishti", Bava: "Bava" }
  }
};






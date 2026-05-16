import { addDays, format } from "date-fns";
import { planets, tarotDeck, zodiacSigns } from "@/lib/astrology/constants";

export type BirthDetails = {
  name: string;
  birthDate: Date;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
  gender?: string;
};

function seededNumber(seed: string, max: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % max;
}

const nakshatraNames = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati"
];

export function generateFallbackKundli(details: BirthDetails) {
  const seed = `${details.name}-${details.birthDate.toISOString()}-${details.birthTime}-${details.latitude}`;
  const planetPositions = planets.map((planet, index) => ({
    planet,
    sign: zodiacSigns[seededNumber(`${seed}-${planet}`, 12)],
    nakshatra: nakshatraNames[seededNumber(`${seed}-${planet}-nakshatra`, nakshatraNames.length)],
    pada: seededNumber(`${seed}-${planet}-pada`, 4) + 1,
    degree: Number(((seededNumber(`${seed}-${planet}-degree`, 3000) / 100) % 30).toFixed(2)),
    house: ((seededNumber(`${seed}-${planet}-house`, 12) + index) % 12) + 1,
    retrograde: seededNumber(`${seed}-${planet}-retro`, 5) === 0
  }));

  const houses = Array.from({ length: 12 }, (_, house) => ({
    house: house + 1,
    sign: zodiacSigns[(seededNumber(seed, 12) + house) % 12]
  }));

  return {
    planetPositions,
    houses,
    lagnaChart: houses.map((h) => ({ ...h, planets: planetPositions.filter((p) => p.house === h.house).map((p) => p.planet) })),
    navamsaChart: houses.map((h) => {
      const signIndex = zodiacSigns.findIndex((sign) => sign === h.sign);
      return { ...h, sign: zodiacSigns[((signIndex < 0 ? 0 : signIndex) + 8) % 12] };
    }),
    dashas: [
      { planet: "Moon", startsAt: format(details.birthDate, "yyyy-MM-dd"), endsAt: format(addDays(details.birthDate, 365 * 10), "yyyy-MM-dd") },
      { planet: "Mars", startsAt: format(addDays(details.birthDate, 365 * 10), "yyyy-MM-dd"), endsAt: format(addDays(details.birthDate, 365 * 17), "yyyy-MM-dd") }
    ],
    yogas: [
      { name: "Gajakesari Yoga", strength: "Moderate", meaning: "Supports learning, reputation, and good counsel." },
      { name: "Budhaditya Yoga", strength: "Variable", meaning: "Improves articulation when Mercury is unafflicted." }
    ],
    doshas: [
      { name: "Kaal Sarp", present: seededNumber(seed, 4) === 0, remedy: "Rudra abhishek and disciplined Saturday charity." },
      { name: "Pitru Dosha", present: seededNumber(`${seed}-pitru`, 5) === 0, remedy: "Ancestor remembrance and food donation." },
      { name: "Nadi Dosha", present: seededNumber(`${seed}-nadi-dosha`, 6) === 0, remedy: "Compatibility review, mantra discipline, and family elder guidance." },
      { name: "Shani Dosha", present: seededNumber(`${seed}-shani`, 5) === 0, remedy: "Saturday service, patience practices, and structured responsibility." }
    ],
    manglik: {
      present: planetPositions.find((p) => p.planet === "Mars")?.house
        ? [1, 2, 4, 7, 8, 12].includes(planetPositions.find((p) => p.planet === "Mars")!.house)
        : false,
      severity: "Balanced with full chart context"
    },
    sadeSati: {
      status: seededNumber(`${seed}-sade-sati`, 3) === 0 ? "Active" : "Not active",
      phase: ["Rising", "Peak", "Setting"][seededNumber(`${seed}-sade-sati-phase`, 3)],
      guidance: "Use discipline, humility, and long-term planning. Avoid fear-based decisions."
    },
    transits: planets.slice(0, 7).map((planet) => ({
      planet,
      sign: zodiacSigns[seededNumber(`${seed}-transit-${planet}`, 12)],
      house: seededNumber(`${seed}-transit-house-${planet}`, 12) + 1,
      effect: ["Supportive", "Reflective", "Demanding", "Stabilizing"][seededNumber(`${seed}-transit-effect-${planet}`, 4)]
    })),
    varshphal: {
      year: new Date().getFullYear(),
      munthaSign: zodiacSigns[seededNumber(`${seed}-muntha`, 12)],
      annualTheme: "A year for clearer priorities, consistent routines, and careful relationship communication.",
      focusAreas: ["Career planning", "Financial discipline", "Health routines", "Family responsibilities"]
    },
    lalKitabRemedies: [
      "Keep your promises small and consistent for 43 days.",
      "Offer water to the rising Sun with gratitude when possible.",
      "Avoid harsh speech on difficult days and choose service over reaction."
    ],
    panchang: getPanchang(details.birthDate, details.latitude, details.longitude)
  };
}

export function getPanchang(date = new Date(), latitude = 28.6139, longitude = 77.209) {
  const seed = `${format(date, "yyyy-MM-dd")}-${latitude}-${longitude}`;
  const tithis = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Dashami", "Ekadashi", "Purnima", "Amavasya"];
  const nakshatras = ["Ashwini", "Bharani", "Rohini", "Mrigashira", "Pushya", "Magha", "Hasta", "Swati", "Anuradha", "Revati"];
  return {
    date: format(date, "yyyy-MM-dd"),
    tithi: tithis[seededNumber(seed, tithis.length)],
    paksha: seededNumber(`${seed}-paksha`, 2) === 0 ? "Shukla Paksha" : "Krishna Paksha",
    vaar: format(date, "EEEE"),
    nakshatra: nakshatras[seededNumber(`${seed}-nak`, nakshatras.length)],
    nakshatraPada: seededNumber(`${seed}-nak-pada`, 4) + 1,
    yoga: ["Siddhi", "Shubha", "Dhriti", "Saubhagya"][seededNumber(`${seed}-yoga`, 4)],
    karan: ["Bava", "Balava", "Kaulava", "Taitila"][seededNumber(`${seed}-karan`, 4)],
    rahuKaal: "10:30 - 12:00",
    choghadiya: ["Amrit", "Shubh", "Labh", "Char"][seededNumber(`${seed}-choghadiya`, 4)],
    sunrise: "06:02",
    sunset: "18:48",
    festival: seededNumber(`${seed}-festival`, 7) === 0 ? "Auspicious vrata day" : null,
    muhurat: "11:42 - 12:28"
  };
}

export function matchKundlis(bride: BirthDetails, groom: BirthDetails) {
  const seed = `${bride.name}-${groom.name}-${bride.birthDate.toISOString()}-${groom.birthDate.toISOString()}`;
  const factors = [
    { name: "Varna", score: seededNumber(`${seed}-varna`, 2), max: 1, meaning: "Spiritual temperament and ego balance." },
    { name: "Vashya", score: seededNumber(`${seed}-vashya`, 3), max: 2, meaning: "Mutual influence and cooperation." },
    { name: "Tara", score: 1 + seededNumber(`${seed}-tara`, 3), max: 3, meaning: "Birth star harmony and welfare." },
    { name: "Yoni", score: 2 + seededNumber(`${seed}-yoni`, 3), max: 4, meaning: "Intimacy, instincts, and comfort." },
    { name: "Grah Maitri", score: 3 + seededNumber(`${seed}-grah`, 3), max: 5, meaning: "Mental friendship and planetary rapport." },
    { name: "Gana", score: 3 + seededNumber(`${seed}-gana`, 4), max: 6, meaning: "Temperament and emotional style." },
    { name: "Bhakoot", score: 4 + seededNumber(`${seed}-bhakoot`, 4), max: 7, meaning: "Family, prosperity, and shared direction." },
    { name: "Nadi", score: 4 + seededNumber(`${seed}-nadi`, 5), max: 8, meaning: "Health, progeny, and energetic rhythm." }
  ];
  const guna = factors.reduce((sum, factor) => sum + factor.score, 0);
  return {
    guna,
    maxGuna: 36,
    matchPercentage: Math.round((guna / 36) * 100),
    compatibilityScore: 55 + seededNumber(`${seed}-score`, 42),
    manglikCompatible: seededNumber(`${seed}-manglik`, 3) !== 0,
    marriagePrediction: guna >= 24 ? "Strong compatibility with supportive communication patterns." : "Promising, but needs deeper family and emotional alignment review.",
    relationshipAnalysis: "The match favors conscious effort, shared rituals, and transparent financial planning.",
    nadiStatus: factors.find((factor) => factor.name === "Nadi")!.score >= 6 ? "Good" : "Needs review",
    bhakootStatus: factors.find((factor) => factor.name === "Bhakoot")!.score >= 5 ? "Supportive" : "Needs remedies",
    yoniStatus: factors.find((factor) => factor.name === "Yoni")!.score >= 3 ? "Comfortable" : "Sensitive",
    ganaStatus: factors.find((factor) => factor.name === "Gana")!.score >= 4 ? "Balanced" : "Different temperaments",
    grahMaitriStatus: factors.find((factor) => factor.name === "Grah Maitri")!.score >= 4 ? "Friendly" : "Needs communication care",
    taraStatus: factors.find((factor) => factor.name === "Tara")!.score >= 2 ? "Favorable" : "Mixed",
    varnaStatus: factors.find((factor) => factor.name === "Varna")!.score === 1 ? "Aligned" : "Neutral",
    vashyaStatus: factors.find((factor) => factor.name === "Vashya")!.score >= 1 ? "Cooperative" : "Needs patience",
    factors
  };
}

export function calculateCoreAstrology(details: Pick<BirthDetails, "name" | "birthDate" | "birthTime" | "latitude" | "longitude">) {
  const seed = `${details.name}-${details.birthDate.toISOString()}-${details.birthTime}-${details.latitude}-${details.longitude}`;
  const moonSign = zodiacSigns[seededNumber(`${seed}-moon-sign`, 12)];
  const sunSign = zodiacSigns[seededNumber(`${seed}-sun-sign`, 12)];
  const ascendant = zodiacSigns[seededNumber(`${seed}-asc`, 12)];
  const nakshatra = nakshatraNames[seededNumber(`${seed}-nak`, nakshatraNames.length)];
  return {
    moonSign,
    sunSign,
    ascendant,
    nakshatra,
    ayanamsa: `${(23.5 + seededNumber(`${seed}-ayanamsa`, 80) / 100).toFixed(2)}° Lahiri`,
    loveScore: 58 + seededNumber(`${seed}-love`, 40),
    friendshipScore: 55 + seededNumber(`${seed}-friendship`, 42),
    guidance: "Use these calculators as a quick starting point. A full kundli gives better context because signs, houses, dashas, and transits work together."
  };
}

export function calculateNumerology(name: string, dateOfBirth: Date) {
  const digits = format(dateOfBirth, "yyyyMMdd").split("").map(Number);
  const reduce = (n: number): number => (n > 9 && ![11, 22, 33].includes(n) ? reduce(String(n).split("").reduce((a, b) => a + Number(b), 0)) : n);
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "");
  const value = [...letters].reduce((sum, char) => sum + ((char.charCodeAt(0) - 64 - 1) % 9) + 1, 0);
  const vowels = [...letters].filter((c) => "AEIOU".includes(c)).reduce((sum, char) => sum + ((char.charCodeAt(0) - 64 - 1) % 9) + 1, 0);
  return {
    lifePathNumber: reduce(digits.reduce((a, b) => a + b, 0)),
    destinyNumber: reduce(value),
    soulUrgeNumber: reduce(vowels || value),
    personalityNumber: reduce(Math.max(1, value - vowels)),
    report: {
      summary: "Your numbers emphasize timing, intention, and practical follow-through.",
      dailyPrediction: "Prioritize one meaningful conversation and keep spending deliberate.",
      nameVibration: reduce(value) >= 5 ? "Dynamic and opportunity-seeking" : "Stable and methodical"
    }
  };
}

export function drawTarot(spread: string) {
  const count = spread === "celtic-cross" ? 10 : spread === "three-card" ? 3 : 1;
  const shuffled = [...tarotDeck].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((name, index) => ({
    name,
    position: ["Present", "Challenge", "Guidance", "Foundation", "Outcome"][index] ?? `Card ${index + 1}`,
    reversed: Math.random() > 0.72
  }));
}

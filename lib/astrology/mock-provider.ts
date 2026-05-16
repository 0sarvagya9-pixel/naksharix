import "server-only";

import { addDays, format } from "date-fns";
import { calculateCoreAstrology, generateFallbackKundli, getPanchang, matchKundlis } from "@/lib/astrology/engine";
import type { AstrologyBirthInput, BirthChartData, KundliMatchReport, PersonalizedHoroscopeReport } from "@/lib/astrology/types";

const ganas = ["Deva", "Manushya", "Rakshasa"];
const yonis = ["Ashwa", "Gaja", "Mesh", "Sarpa", "Mrig"];
const nadis = ["Aadi", "Madhya", "Antya"];

function seed(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  return hash;
}

function pick<T>(items: T[], value: string) {
  return items[seed(value) % items.length];
}

function normalizeDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

export function createMockBirthChart(input: AstrologyBirthInput): BirthChartData {
  const date = normalizeDate(input.dateOfBirth);
  const legacy = {
    name: input.name,
    gender: input.gender,
    birthDate: date,
    birthTime: input.timeOfBirth,
    birthPlace: input.birthPlace,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone
  };
  const fallback = generateFallbackKundli(legacy);
  const core = calculateCoreAstrology({
    name: input.name,
    birthDate: date,
    birthTime: input.timeOfBirth,
    latitude: input.latitude,
    longitude: input.longitude
  });
  const seedText = `${input.name}-${format(date, "yyyy-MM-dd")}-${input.timeOfBirth}-${input.birthPlace}`;
  const manglikPresent = fallback.manglik.present;
  const kaalSarpPresent = fallback.doshas.find((dosha) => dosha.name === "Kaal Sarp")?.present ?? false;

  return {
    profile: { name: input.name, gender: input.gender },
    birthDetails: {
      dateOfBirth: format(date, "yyyy-MM-dd"),
      timeOfBirth: input.timeOfBirth,
      birthPlace: input.birthPlace,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone
    },
    panchang: fallback.panchang,
    avakhada: {
      moonSign: core.moonSign,
      sunSign: core.sunSign,
      ascendant: core.ascendant,
      nakshatra: core.nakshatra,
      gana: pick(ganas, `${seedText}-gana`),
      yoni: pick(yonis, `${seedText}-yoni`),
      nadi: pick(nadis, `${seedText}-nadi`)
    },
    charts: {
      lagna: fallback.lagnaChart,
      navamsa: fallback.navamsaChart
    },
    planetPositions: fallback.planetPositions,
    housePositions: fallback.houses,
    vimshottariDasha: fallback.dashas.map((dasha) => ({ ...dasha, period: `${dasha.startsAt} to ${dasha.endsAt}` })),
    manglikDosha: {
      present: manglikPresent,
      severity: manglikPresent ? "Needs full chart review" : "Not indicated in this preview",
      summary: manglikPresent ? "Mars occupies a sensitive house in this calculation preview." : "This preview does not indicate a strong Manglik condition.",
      remedies: manglikPresent ? ["Practice Tuesday discipline and charity.", "Review the full chart before marriage decisions."] : ["Maintain balanced communication in relationships."]
    },
    kaalSarpDosha: {
      present: kaalSarpPresent,
      severity: kaalSarpPresent ? "Moderate" : "Not indicated",
      summary: kaalSarpPresent ? "The preview flags a Kaal Sarp pattern for deeper review." : "No strong Kaal Sarp pattern is shown in this preview.",
      remedies: kaalSarpPresent ? ["Offer sincere Shiva prayers on Mondays.", "Avoid fear-based decisions; seek full chart context."] : ["Keep spiritual routines simple and consistent."]
    },
    sadeSati: {
      ...fallback.sadeSati,
      timeline: [
        { phase: "Previous", period: format(addDays(new Date(), -365), "yyyy"), note: "Review old responsibilities with patience." },
        { phase: "Current", period: format(new Date(), "yyyy"), note: fallback.sadeSati.guidance },
        { phase: "Upcoming", period: format(addDays(new Date(), 365), "yyyy"), note: "Strengthen routines and long-term planning." }
      ]
    },
    nakshatraAnalysis: `${core.nakshatra} emphasizes instinct, timing, and emotional rhythm. Use it as a reflective lens, not a fixed label.`,
    lagnaAnalysis: `${core.ascendant} rising highlights the way the native approaches life, decisions, and first responses.`,
    remedies: fallback.lalKitabRemedies
  };
}

export function createMockTransitReport(input: AstrologyBirthInput) {
  const date = new Date();
  const chart = createMockBirthChart(input);
  return {
    date: format(date, "yyyy-MM-dd"),
    moonTransit: { sign: chart.avakhada.moonSign, nakshatra: chart.avakhada.nakshatra },
    transits: generateFallbackKundli({
      name: input.name,
      gender: input.gender,
      birthDate: normalizeDate(input.dateOfBirth),
      birthTime: input.timeOfBirth,
      birthPlace: input.birthPlace,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone
    }).transits,
    houseActivations: ["Career routines", "Family communication", "Personal discipline"]
  };
}

export function createMockMatching(bride: AstrologyBirthInput, groom: AstrologyBirthInput): KundliMatchReport {
  const brideChart = createMockBirthChart(bride);
  const groomChart = createMockBirthChart(groom);
  const legacy = matchKundlis(
    {
      name: bride.name,
      gender: bride.gender,
      birthDate: normalizeDate(bride.dateOfBirth),
      birthTime: bride.timeOfBirth,
      birthPlace: bride.birthPlace,
      latitude: bride.latitude,
      longitude: bride.longitude,
      timezone: bride.timezone
    },
    {
      name: groom.name,
      gender: groom.gender,
      birthDate: normalizeDate(groom.dateOfBirth),
      birthTime: groom.timeOfBirth,
      birthPlace: groom.birthPlace,
      latitude: groom.latitude,
      longitude: groom.longitude,
      timezone: groom.timezone
    }
  );
  const ashtakoot = legacy.factors.map((factor) => ({
    name: factor.name,
    score: factor.score,
    maxScore: factor.max,
    meaning: factor.meaning,
    result: factor.score >= factor.max * 0.65 ? "Supportive" : "Needs attention"
  }));
  const nadiPresent = (ashtakoot.find((factor) => factor.name === "Nadi")?.score ?? 0) < 5;
  const bhakootPresent = (ashtakoot.find((factor) => factor.name === "Bhakoot")?.score ?? 0) < 4;

  return {
    reportId: `match_${Date.now()}`,
    brideProfile: { ...brideChart.profile, birthPlace: bride.birthPlace },
    groomProfile: { ...groomChart.profile, birthPlace: groom.birthPlace },
    brideChart,
    groomChart,
    gunaMilan: {
      totalScore: legacy.guna,
      maxScore: 36,
      percentage: legacy.matchPercentage,
      verdict: legacy.guna >= 24 ? "Favorable with practical communication" : "Promising but needs deeper review",
      ashtakoot
    },
    doshaAnalysis: {
      brideManglik: brideChart.manglikDosha,
      groomManglik: groomChart.manglikDosha,
      manglikCompatibility: legacy.manglikCompatible ? "Balanced" : "Needs astrologer review",
      nadiDosh: { present: nadiPresent, summary: nadiPresent ? "Nadi score needs careful review." : "Nadi compatibility is supportive.", remedies: ["Consult a qualified astrologer for serious marriage decisions."] },
      bhakootDosh: { present: bhakootPresent, summary: bhakootPresent ? "Bhakoot score needs remedies and family context." : "Bhakoot compatibility is supportive.", remedies: ["Use patient family communication and shared planning."] },
      remedies: ["Keep weekly relationship check-ins.", "Discuss finances transparently.", "Avoid fear-based decisions from a single dosha."]
    },
    compatibility: {
      emotional: legacy.compatibilityScore,
      mental: Math.max(50, legacy.compatibilityScore - 5),
      physical: Math.max(50, legacy.matchPercentage),
      financial: Math.max(48, legacy.compatibilityScore - 8),
      family: Math.max(45, legacy.matchPercentage - 4),
      longTerm: Math.round((legacy.compatibilityScore + legacy.matchPercentage) / 2)
    },
    aiSummary: "",
    disclaimer: "Kundli matching is guidance for reflection and family discussion, not a guarantee of relationship outcome.",
    generatedAt: new Date().toISOString()
  };
}

export function createMockPersonalizedHoroscope(input: AstrologyBirthInput, period: PersonalizedHoroscopeReport["period"]): PersonalizedHoroscopeReport {
  const natalChart = createMockBirthChart(input);
  const transitReport = createMockTransitReport(input);
  const common = {
    "Career/work": "Use the day for focused, realistic progress rather than scattered action.",
    Finance: "Keep spending deliberate and review commitments before saying yes.",
    "Love/relationship": "Warm, clear communication is more useful than testing reactions.",
    Health: "Support energy with rest, hydration, and steady routines.",
    Remedy: "Offer water to the rising Sun with gratitude and set one clear intention."
  };

  const sectionsByPeriod: Record<PersonalizedHoroscopeReport["period"], Record<string, string | string[]>> = {
    daily: {
      "Today's overall energy": "The current transit pattern favors calm decisions and clean priorities.",
      ...common,
      Family: "Be patient with small misunderstandings.",
      "Lucky color": "Royal Gold",
      "Lucky number": "7",
      "Best time of day": "10:30 AM - 12:00 PM",
      "Avoid today": "Rushing important conversations"
    },
    weekly: {
      "Weekly theme": "Discipline, relationships, and practical planning.",
      ...common,
      "Important dates this week": ["Monday for planning", "Thursday for guidance", "Saturday for cleanup"],
      "Caution days": ["Tuesday evening"],
      "Weekly remedy": common.Remedy
    },
    monthly: {
      "Month overview": "This month supports measured growth and clearer emotional boundaries.",
      "Career growth": common["Career/work"],
      "Money/finance": common.Finance,
      "Love/marriage": common["Love/relationship"],
      Health: common.Health,
      Family: "Keep promises small and consistent.",
      Travel: "Short practical trips are favored over impulsive travel.",
      "Good dates": ["6", "14", "22"],
      "Challenging dates": ["9", "18"],
      "Monthly remedy": common.Remedy
    },
    yearly: {
      "Year overview": "The year asks for consistency, learning, and mature choices.",
      "Career/business": common["Career/work"],
      Finance: common.Finance,
      "Love/marriage": common["Love/relationship"],
      Health: common.Health,
      Education: "Structured learning pays off.",
      Family: "Responsible communication improves bonds.",
      "Travel/foreign chances": "Travel improves when planned carefully.",
      "Major opportunities": ["Skill building", "Relationship clarity", "Financial organization"],
      "Major caution periods": ["Avoid overcommitment during stressful weeks."],
      "Monthly breakdown": ["Q1: organize", "Q2: build", "Q3: review", "Q4: consolidate"],
      "Remedies for the year": common.Remedy
    }
  };

  return {
    reportId: `prediction_${Date.now()}`,
    period,
    profile: natalChart.profile,
    birthDetails: natalChart.birthDetails,
    calculationData: {
      natalChart,
      transitReport,
      dasha: natalChart.vimshottariDasha,
      sadeSati: natalChart.sadeSati,
      moonSign: natalChart.avakhada.moonSign,
      nakshatra: natalChart.avakhada.nakshatra
    },
    sections: sectionsByPeriod[period],
    aiSummary: "",
    lockedSections: period === "daily" ? [] : ["Full detailed PDF history", "Saved prediction archive"],
    disclaimer: "Personalized horoscope is reflective guidance and should not replace professional advice.",
    generatedAt: new Date().toISOString()
  };
}

export function createMockPanchang(input: AstrologyBirthInput) {
  return getPanchang(normalizeDate(input.dateOfBirth), input.latitude, input.longitude);
}

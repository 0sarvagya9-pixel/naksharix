import "server-only";

import { env } from "@/lib/env";
import { createMockBirthChart, createMockMatching, createMockPanchang, createMockPersonalizedHoroscope, createMockTransitReport } from "@/lib/astrology/mock-provider";
import { createVedicRishiProvider } from "@/lib/astrology/vedic-rishi-provider";
import { createProkeralaProvider } from "@/lib/astrology/prokerala-provider";
import { createDivineApiProvider } from "@/lib/astrology/divineapi-provider";
import { createSwissBirthChart } from "@/lib/astrology/swiss-provider";
import { calculateOwnEngineBirthChart } from "@/lib/astrology/own-engine";
import { normalizeBirthInput } from "@/lib/astrology/normalize";
import type { AstrologyBirthInput, AstrologyProviderName, PersonalizedHoroscopeReport } from "@/lib/astrology/types";

export interface AstrologyProvider {
  getBirthChart(input: AstrologyBirthInput): Promise<unknown>;
  getPlanetPositions(input: AstrologyBirthInput): Promise<unknown>;
  getPanchang(input: AstrologyBirthInput): Promise<unknown>;
  getVimshottariDasha(input: AstrologyBirthInput): Promise<unknown>;
  getDoshaAnalysis(input: AstrologyBirthInput): Promise<unknown>;
  getSadeSati(input: AstrologyBirthInput): Promise<unknown>;
  getTransitReport(input: AstrologyBirthInput): Promise<unknown>;
  getCurrentTransit?(input: AstrologyBirthInput, date: Date): Promise<unknown>;
  getMoonTransit?(input: AstrologyBirthInput, date: Date): Promise<unknown>;
  getVarshphal(input: AstrologyBirthInput): Promise<unknown>;
  getKundliMatching(brideInput: AstrologyBirthInput, groomInput: AstrologyBirthInput): Promise<unknown>;
  getPersonalizedHoroscope(input: AstrologyBirthInput, period: PersonalizedHoroscopeReport["period"]): Promise<unknown>;
  getPersonalizedPrediction(input: AstrologyBirthInput, period: PersonalizedHoroscopeReport["period"]): Promise<unknown>;
}

export class AstrologyProviderUnavailableError extends Error {
  constructor() {
    super("Personalized calculation service is temporarily unavailable. Please try again later.");
    this.name = "AstrologyProviderUnavailableError";
  }
}

const mockProvider: AstrologyProvider = {
  async getBirthChart(input) {
    return createMockBirthChart(normalizeBirthInput(input));
  },
  async getPlanetPositions(input) {
    return createMockBirthChart(normalizeBirthInput(input)).planetPositions;
  },
  async getPanchang(input) {
    return createMockPanchang(normalizeBirthInput(input));
  },
  async getVimshottariDasha(input) {
    return createMockBirthChart(normalizeBirthInput(input)).vimshottariDasha;
  },
  async getDoshaAnalysis(input) {
    const chart = createMockBirthChart(normalizeBirthInput(input));
    return { manglikDosha: chart.manglikDosha, kaalSarpDosha: chart.kaalSarpDosha };
  },
  async getSadeSati(input) {
    return createMockBirthChart(normalizeBirthInput(input)).sadeSati;
  },
  async getTransitReport(input) {
    return createMockTransitReport(normalizeBirthInput(input));
  },
  async getCurrentTransit(input, date) {
    return { ...createMockTransitReport(normalizeBirthInput(input)), date: date.toISOString() };
  },
  async getMoonTransit(input, date) {
    const chart = createMockBirthChart(normalizeBirthInput(input));
    return { date: date.toISOString(), sign: chart.avakhada.moonSign, nakshatra: chart.avakhada.nakshatra };
  },
  async getVarshphal(input) {
    const transit = createMockTransitReport(normalizeBirthInput(input));
    return { year: new Date().getFullYear(), annualTheme: "Steady growth through discipline and clarity.", transit };
  },
  async getKundliMatching(brideInput, groomInput) {
    return createMockMatching(normalizeBirthInput(brideInput), normalizeBirthInput(groomInput));
  },
  async getPersonalizedHoroscope(input, period) {
    return createMockPersonalizedHoroscope(normalizeBirthInput(input), period);
  },
  async getPersonalizedPrediction(input, period) {
    return createMockPersonalizedHoroscope(normalizeBirthInput(input), period);
  }
};

const swissProvider: AstrologyProvider = {
  async getBirthChart(input) {
    return createSwissBirthChart(normalizeBirthInput(input));
  },
  async getPlanetPositions(input) {
    return createSwissBirthChart(normalizeBirthInput(input)).planetPositions;
  },
  async getPanchang(input) {
    return createSwissBirthChart(normalizeBirthInput(input)).panchang;
  },
  async getVimshottariDasha(input) {
    return createSwissBirthChart(normalizeBirthInput(input)).vimshottariDasha;
  },
  async getDoshaAnalysis(input) {
    const chart = createSwissBirthChart(normalizeBirthInput(input));
    return { manglikDosha: chart.manglikDosha, kaalSarpDosha: chart.kaalSarpDosha };
  },
  async getSadeSati(input) {
    return createSwissBirthChart(normalizeBirthInput(input)).sadeSati;
  },
  async getTransitReport(input) {
    const chart = createSwissBirthChart(normalizeBirthInput(input));
    return { date: new Date().toISOString(), moonSign: chart.avakhada.moonSign, nakshatra: chart.avakhada.nakshatra, note: "Transit engine verification pending." };
  },
  async getVarshphal(input) {
    return { year: new Date().getFullYear(), natalChart: createSwissBirthChart(normalizeBirthInput(input)), note: "Varshphal verification pending." };
  },
  async getKundliMatching() {
    throw new AstrologyProviderUnavailableError();
  },
  async getPersonalizedHoroscope(input, period) {
    const chart = createSwissBirthChart(normalizeBirthInput(input));
    return {
      reportId: `swiss_prediction_${Date.now()}`,
      period,
      profile: chart.profile,
      birthDetails: chart.birthDetails,
      calculationData: { natalChart: chart, transitReport: {}, dasha: chart.vimshottariDasha, sadeSati: chart.sadeSati, moonSign: chart.avakhada.moonSign, nakshatra: chart.avakhada.nakshatra },
      sections: {},
      aiSummary: "",
      disclaimer: "Calculation not available yet.",
      generatedAt: new Date().toISOString()
    };
  },
  async getPersonalizedPrediction(input, period) {
    const chart = createSwissBirthChart(normalizeBirthInput(input));
    return {
      reportId: `swiss_prediction_${Date.now()}`,
      period,
      profile: chart.profile,
      birthDetails: chart.birthDetails,
      calculationData: { natalChart: chart, transitReport: {}, dasha: chart.vimshottariDasha, sadeSati: chart.sadeSati, moonSign: chart.avakhada.moonSign, nakshatra: chart.avakhada.nakshatra },
      sections: {},
      aiSummary: "",
      disclaimer: "Calculation not available yet.",
      generatedAt: new Date().toISOString()
    };
  }
};

const ownEngineProvider: AstrologyProvider = {
  async getBirthChart(input) {
    return calculateOwnEngineBirthChart(normalizeBirthInput(input));
  },
  async getPlanetPositions(input) {
    return calculateOwnEngineBirthChart(normalizeBirthInput(input)).planetPositions;
  },
  async getPanchang(input) {
    return calculateOwnEngineBirthChart(normalizeBirthInput(input)).panchang;
  },
  async getVimshottariDasha() {
    return [];
  },
  async getDoshaAnalysis(input) {
    const chart = calculateOwnEngineBirthChart(normalizeBirthInput(input));
    return { manglikDosha: chart.manglikDosha, kaalSarpDosha: chart.kaalSarpDosha };
  },
  async getSadeSati(input) {
    return calculateOwnEngineBirthChart(normalizeBirthInput(input)).sadeSati;
  },
  async getTransitReport(input) {
    const chart = calculateOwnEngineBirthChart(normalizeBirthInput(input));
    return { date: new Date().toISOString(), moonSign: chart.avakhada.moonSign, nakshatra: chart.avakhada.nakshatra };
  },
  async getVarshphal(input) {
    const chart = calculateOwnEngineBirthChart(normalizeBirthInput(input));
    return { year: new Date().getFullYear(), natalChart: chart };
  },
  async getKundliMatching() {
    throw new AstrologyProviderUnavailableError();
  },
  async getPersonalizedHoroscope(input, period) {
    const chart = calculateOwnEngineBirthChart(normalizeBirthInput(input));
    return {
      reportId: `own_prediction_${Date.now()}`,
      period,
      profile: chart.profile,
      birthDetails: chart.birthDetails,
      calculationData: { natalChart: chart, transitReport: {}, dasha: chart.vimshottariDasha, sadeSati: chart.sadeSati, moonSign: chart.avakhada.moonSign, nakshatra: chart.avakhada.nakshatra },
      sections: {},
      aiSummary: "",
      disclaimer: "Naksharix own_engine provides basic calculated chart data. Advanced predictions are not available yet.",
      generatedAt: new Date().toISOString()
    };
  },
  async getPersonalizedPrediction(input, period) {
    const chart = calculateOwnEngineBirthChart(normalizeBirthInput(input));
    return {
      reportId: `own_prediction_${Date.now()}`,
      period,
      profile: chart.profile,
      birthDetails: chart.birthDetails,
      calculationData: { natalChart: chart, transitReport: {}, dasha: chart.vimshottariDasha, sadeSati: chart.sadeSati, moonSign: chart.avakhada.moonSign, nakshatra: chart.avakhada.nakshatra },
      sections: {},
      aiSummary: "",
      disclaimer: "Naksharix own_engine provides basic calculated chart data. Advanced predictions are not available yet.",
      generatedAt: new Date().toISOString()
    };
  }
};

export function getAstrologyProvider(): AstrologyProvider {
  const selected = getActiveAstrologyProviderName();
  console.info(`Active astrology provider: ${selected}`);
  if (selected === "own_engine") return ownEngineProvider;
  if (selected === "swiss") return swissProvider;
  if (selected === "mock") {
    if (env.NODE_ENV === "production") throw new AstrologyProviderUnavailableError();
    return mockProvider;
  }
  if (selected === "vedic_rishi") return createVedicRishiProvider();
  if (selected === "prokerala") return createProkeralaProvider();
  if (selected === "divineapi") return createDivineApiProvider();
  throw new AstrologyProviderUnavailableError();
}

export function getActiveAstrologyProviderName(): AstrologyProviderName {
  return (env.ASTROLOGY_PROVIDER ?? "mock") as AstrologyProviderName;
}

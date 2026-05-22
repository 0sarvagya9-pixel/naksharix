import type { ChalitChartCalculation, DashaPeriod, DoshaAnalysis, DoshaStatus, HousePosition, KundliReport, PanchangSnapshot, PlanetPosition, SadeSatiStatus, VimshottariDashaCalculation, YogaAnalysis } from "@/lib/astrology/types";

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

export type PdfPlanet = PlanetPosition & {
  signNumber?: number;
};

export type PdfChartHouse = {
  house: number;
  sign: string;
  signNumber?: number;
  planets: PdfPlanet[];
};

export type KundliPdfData = {
  personDetails: KundliReport["profile"];
  birthDetails: KundliReport["birthDetails"];
  panchang: PanchangSnapshot;
  avakahada: KundliReport["avakhada"];
  planetaryPositions: PdfPlanet[];
  d1Chart: PdfChartHouse[];
  d9Chart: PdfChartHouse[];
  chalitChart: PdfChartHouse[];
  chalitAnalysis?: ChalitChartCalculation;
  shodashvarga: unknown[];
  vimshottariDasha: DashaPeriod[];
  calculatedDasha?: VimshottariDashaCalculation;
  yoginiDasha: unknown[];
  ashtakavarga: unknown[];
  doshas: {
    manglik: DoshaStatus;
    kaalSarp: DoshaStatus;
    sadeSati: SadeSatiStatus;
  };
  predictions: {
    nakshatraAnalysis: string;
    lagnaAnalysis: string;
    personalityAnalysis: string;
    careerAnalysis: string;
    marriageAnalysis: string;
    financeAnalysis: string;
    healthAnalysis: string;
    educationAnalysis: string;
    aiSummary: string;
    disclaimer: string;
  };
  remedies: string[];
  doshaAnalysis?: DoshaAnalysis;
  yogaAnalysis?: YogaAnalysis;
  validation: {
    rahuKetuOpposite: boolean;
    d1MatchesPlanetTable: boolean;
    d1LagnaAnchored: boolean;
    d1HasAllPlanets: boolean;
    d9HasAllChartPlanets: boolean;
    chalitAvailable: boolean;
  };
};

export function normalizeKundliPdfData(report: KundliReport): KundliPdfData {
  const planetaryPositions = normalizePlanetaryPositions(report.planetPositions ?? []);
  const ascendantSign = report.charts?.lagna?.find((house) => house.house === 1)?.sign || report.avakhada?.ascendant || planetaryPositions.find((planet) => planet.house === 1)?.sign || "Aries";
  const d1Chart = normalizeD1Chart(ascendantSign, planetaryPositions);
  const d9Chart = normalizeSourceChart(report.charts?.navamsa, []);
  const explicitChalitSource = report.chalitChart?.houses ?? chartSource(report, "chalit") ?? chartSource(report, "kpBhava") ?? chartSource(report, "bhavaChalit");
  const chalitChart = explicitChalitSource ? normalizeSourceChart(explicitChalitSource, planetaryPositions) : [];
  const validation = {
    rahuKetuOpposite: validateRahuKetuOpposite(planetaryPositions),
    d1MatchesPlanetTable: validateChartMatchesPlanetTable(d1Chart, planetaryPositions),
    d1LagnaAnchored: validateLagnaAnchor(d1Chart, ascendantSign),
    d1HasAllPlanets: validateNoMissingPlanetInChart(d1Chart, planetaryPositions),
    d9HasAllChartPlanets: d9Chart.length > 0 ? validateNoMissingPlanetInChart(d9Chart, flattenChartPlanets(d9Chart)) : false,
    chalitAvailable: chalitChart.length > 0
  };

  return {
    personDetails: {
      name: report.profile?.name || "Native",
      gender: report.profile?.gender || "Not available"
    },
    birthDetails: {
      dateOfBirth: report.birthDetails?.dateOfBirth || "Not available",
      timeOfBirth: report.birthDetails?.timeOfBirth || "Not available",
      birthPlace: report.birthDetails?.birthPlace || "Not available",
      latitude: Number(report.birthDetails?.latitude ?? 0),
      longitude: Number(report.birthDetails?.longitude ?? 0),
      timezone: report.birthDetails?.timezone || "Not available"
    },
    panchang: {
      date: report.panchang?.date || report.birthDetails?.dateOfBirth || "Not available",
      tithi: report.panchang?.tithi || "Not available",
      paksha: report.panchang?.paksha || "Not available",
      vaar: report.panchang?.vaar || "Not available",
      nakshatra: report.panchang?.nakshatra || report.avakhada?.nakshatra || "Not available",
      nakshatraPada: report.panchang?.nakshatraPada || "Not available",
      yoga: report.panchang?.yoga || "Not available",
      karan: report.panchang?.karan || "Not available",
      rahuKaal: report.panchang?.rahuKaal || "Not available",
      sunrise: report.panchang?.sunrise || "Not available",
      sunset: report.panchang?.sunset || "Not available"
    },
    avakahada: {
      moonSign: report.avakhada?.moonSign || "Not available",
      sunSign: report.avakhada?.sunSign || "Not available",
      ascendant: report.avakhada?.ascendant || ascendantSign || "Not available",
      nakshatra: report.avakhada?.nakshatra || "Not available",
      gana: report.avakhada?.gana || "Not available",
      yoni: report.avakhada?.yoni || "Not available",
      nadi: report.avakhada?.nadi || "Not available"
    },
    planetaryPositions,
    d1Chart,
    d9Chart,
    chalitChart,
    chalitAnalysis: report.chalitChart,
    shodashvarga: arraySource(report, "shodashvarga"),
    vimshottariDasha: report.vimshottariDasha ?? [],
    calculatedDasha: report.calculatedDasha,
    yoginiDasha: arraySource(report, "yoginiDasha"),
    ashtakavarga: arraySource(report, "ashtakavarga"),
    doshas: {
      manglik: report.manglikDosha ?? unavailableDosha(),
      kaalSarp: report.kaalSarpDosha ?? unavailableDosha(),
      sadeSati: report.sadeSati ?? { status: "Not available", guidance: "Not available" }
    },
    predictions: {
      nakshatraAnalysis: report.nakshatraAnalysis || "Not available",
      lagnaAnalysis: report.lagnaAnalysis || "Not available",
      personalityAnalysis: report.personalityAnalysis || "Not available",
      careerAnalysis: report.careerAnalysis || "Not available",
      marriageAnalysis: report.marriageAnalysis || "Not available",
      financeAnalysis: report.financeAnalysis || "Not available",
      healthAnalysis: report.healthAnalysis || "Not available",
      educationAnalysis: report.educationAnalysis || "Not available",
      aiSummary: report.aiSummary || "Not available",
      disclaimer: report.disclaimer || "Naksharix reports are for reflection and planning only."
    },
    remedies: report.remedies ?? [],
    doshaAnalysis: report.doshaAnalysis,
    yogaAnalysis: report.yogaAnalysis,
    validation
  };
}

function unavailableDosha() {
  return { present: false, severity: "Not available", summary: "Not available", remedies: ["Not available"] };
}

export function validateRahuKetuOpposite(planets: PdfPlanet[]) {
  const rahu = planets.find((planet) => planet.planet?.toLowerCase() === "rahu");
  const ketu = planets.find((planet) => planet.planet?.toLowerCase() === "ketu");
  if (!rahu || !ketu) return false;
  const houseOk = typeof rahu.house === "number" && typeof ketu.house === "number" ? opposite12(rahu.house, ketu.house) : true;
  const signOk = typeof rahu.signNumber === "number" && typeof ketu.signNumber === "number" ? opposite12(rahu.signNumber, ketu.signNumber) : true;
  return houseOk && signOk;
}

export function validateChartMatchesPlanetTable(chart: PdfChartHouse[], planets: PdfPlanet[]) {
  return planets.every((planet) => {
    if (typeof planet.house !== "number") return true;
    return chart.find((house) => house.house === planet.house)?.planets.some((chartPlanet) => chartPlanet.planet === planet.planet) ?? false;
  });
}

export function validateLagnaAnchor(chart: PdfChartHouse[], ascendantSign: string) {
  return normalizeSign(chart.find((house) => house.house === 1)?.sign) === normalizeSign(ascendantSign);
}

export function validateNoMissingPlanetInChart(chart: PdfChartHouse[], planets: PdfPlanet[]) {
  const chartPlanets = new Set(flattenChartPlanets(chart).map((planet) => planet.planet));
  return planets.every((planet) => !planet.planet || chartPlanets.has(planet.planet));
}

export function logKundliPdfValidation(data: KundliPdfData) {
  if (process.env.NODE_ENV === "production" || process.env.KUNDLI_DEBUG !== "true") return;
  const rahu = data.planetaryPositions.find((planet) => planet.planet?.toLowerCase() === "rahu");
  const ketu = data.planetaryPositions.find((planet) => planet.planet?.toLowerCase() === "ketu");
  console.info("[Naksharix Kundli PDF Validation]", {
    lagnaSign: data.d1Chart.find((house) => house.house === 1)?.sign,
    rahuHouse: rahu?.house,
    ketuHouse: ketu?.house,
    rahuSign: rahu?.signNumber ?? rahu?.sign,
    ketuSign: ketu?.signNumber ?? ketu?.sign,
    planetHouseMapping: data.planetaryPositions.map((planet) => ({ planet: planet.planet, sign: planet.sign, house: planet.house })),
    d1Chart: summarizeChart(data.d1Chart),
    d9Chart: summarizeChart(data.d9Chart),
    chalitChart: summarizeChart(data.chalitChart),
    validation: data.validation
  });
}

function normalizeD1Chart(ascendantSign: string, planets: PdfPlanet[]) {
  const ascendantSignNumber = signNumberFor(ascendantSign) ?? 1;
  return Array.from({ length: 12 }, (_, index) => {
    const house = index + 1;
    const signNumber = ((ascendantSignNumber + house - 2) % 12) + 1;
    return {
      house,
      sign: SIGNS[signNumber - 1],
      signNumber,
      planets: planets.filter((planet) => planet.house === house)
    };
  });
}

function normalizeSourceChart(source: HousePosition[] | undefined, tablePlanets: PdfPlanet[]) {
  if (!Array.isArray(source) || source.length === 0) return [];
  return Array.from({ length: 12 }, (_, index) => {
    const houseNumber = index + 1;
    const sourceHouse = source.find((house) => house.house === houseNumber);
    const sign = sourceHouse?.sign || "";
    const planets = (sourceHouse?.planets ?? []).map((planetName) => tablePlanets.find((planet) => planet.planet === planetName) ?? { planet: planetName, sign, house: houseNumber });
    return { house: houseNumber, sign, signNumber: signNumberFor(sign), planets };
  });
}

function normalizePlanetaryPositions(planets: PlanetPosition[]): PdfPlanet[] {
  return planets.map((planet) => ({ ...planet, signNumber: signNumberFor(planet.sign) }));
}

function flattenChartPlanets(chart: PdfChartHouse[]) {
  return chart.flatMap((house) => house.planets);
}

function signNumberFor(sign?: string) {
  const index = SIGNS.findIndex((item) => normalizeSign(item) === normalizeSign(sign));
  return index >= 0 ? index + 1 : undefined;
}

function normalizeSign(sign?: string) {
  return String(sign ?? "").trim().toLowerCase();
}

function opposite12(first: number, second: number) {
  return ((first + 5) % 12) + 1 === second;
}

function chartSource(report: KundliReport, key: string): HousePosition[] | undefined {
  const charts = report.charts as Record<string, unknown>;
  const value = charts?.[key];
  return Array.isArray(value) ? value as HousePosition[] : undefined;
}

function arraySource(report: KundliReport, key: string) {
  const value = (report as unknown as Record<string, unknown>)[key];
  return Array.isArray(value) ? value : [];
}

function summarizeChart(chart: PdfChartHouse[]) {
  return chart.map((house) => ({ house: house.house, sign: house.sign, signNumber: house.signNumber, planets: house.planets.map((planet) => planet.planet) }));
}

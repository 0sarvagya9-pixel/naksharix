export type AstrologyLanguage = "en" | "hi" | "hinglish";

export type AstrologyProviderName = "mock" | "swiss" | "own_engine" | "vedic_rishi" | "prokerala" | "divineapi";

export type AstrologyBirthInput = {
  name: string;
  gender?: string;
  dateOfBirth: string | Date;
  timeOfBirth: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
  language?: AstrologyLanguage;
  locale?: AstrologyLanguage;
};

export type PlanetPosition = {
  planet: string;
  sign: string;
  nakshatra?: string;
  pada?: number;
  degree?: number;
  house?: number;
  retrograde?: boolean;
};

export type HousePosition = {
  house: number;
  sign: string;
  planets?: string[];
};

export type PanchangSnapshot = {
  date: string;
  tithi: string;
  paksha?: string;
  vaar?: string;
  nakshatra: string;
  nakshatraPada?: string | number;
  yoga?: string;
  karan?: string;
  rahuKaal: string;
  choghadiya?: string;
  sunrise: string;
  sunset: string;
  festival?: string | null;
  muhurat?: string;
};

export type DashaPeriod = {
  planet: string;
  startsAt: string;
  endsAt: string;
  period?: string;
};

export type DoshaStatus = {
  present: boolean;
  severity?: string;
  summary: string;
  remedies: string[];
};

export type SadeSatiStatus = {
  status: string;
  phase?: string;
  guidance: string;
  timeline?: Array<{ phase: string; period: string; note: string }>;
};

export type BirthChartData = {
  profile: { name: string; gender?: string };
  birthDetails: {
    dateOfBirth: string;
    timeOfBirth: string;
    birthPlace: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  panchang: PanchangSnapshot;
  avakhada: {
    moonSign: string;
    sunSign: string;
    ascendant: string;
    nakshatra: string;
    gana: string;
    yoni: string;
    nadi: string;
  };
  charts: {
    lagna: HousePosition[];
    navamsa: HousePosition[];
  };
  planetPositions: PlanetPosition[];
  housePositions: HousePosition[];
  vimshottariDasha: DashaPeriod[];
  manglikDosha: DoshaStatus;
  kaalSarpDosha: DoshaStatus;
  sadeSati: SadeSatiStatus;
  nakshatraAnalysis: string;
  lagnaAnalysis: string;
  remedies: string[];
  calculationMeta?: {
    provider: string;
    ayanamsaName: string;
    ayanamsaDegree: number;
    houseSystem: string;
    nodeMode: string;
    julianDay: number;
    utcDate: string;
  };
};

export type KundliReport = BirthChartData & {
  reportId: string;
  reportHash?: string;
  personalityAnalysis: string;
  careerAnalysis: string;
  marriageAnalysis: string;
  financeAnalysis: string;
  healthAnalysis: string;
  educationAnalysis: string;
  aiSummary: string;
  disclaimer: string;
  generatedAt: string;
};

export type AshtakootFactor = {
  name: string;
  score: number;
  maxScore: number;
  meaning: string;
  result: string;
};

export type KundliMatchReport = {
  reportId: string;
  reportHash?: string;
  brideProfile: BirthChartData["profile"] & { birthPlace: string };
  groomProfile: BirthChartData["profile"] & { birthPlace: string };
  brideChart: BirthChartData;
  groomChart: BirthChartData;
  gunaMilan: {
    totalScore: number;
    maxScore: number;
    percentage: number;
    verdict: string;
    ashtakoot: AshtakootFactor[];
  };
  doshaAnalysis: {
    brideManglik: DoshaStatus;
    groomManglik: DoshaStatus;
    manglikCompatibility: string;
    nadiDosh: DoshaStatus;
    bhakootDosh: DoshaStatus;
    remedies: string[];
  };
  compatibility: {
    emotional: number;
    mental: number;
    physical: number;
    financial: number;
    family: number;
    longTerm: number;
  };
  aiSummary: string;
  disclaimer: string;
  generatedAt: string;
};

export type PersonalizedHoroscopeReport = {
  reportId: string;
  period: "daily" | "weekly" | "monthly" | "yearly";
  profile: BirthChartData["profile"];
  birthDetails: BirthChartData["birthDetails"];
  calculationData: {
    natalChart: BirthChartData;
    transitReport: unknown;
    dasha: DashaPeriod[];
    sadeSati: SadeSatiStatus;
    moonSign: string;
    nakshatra: string;
  };
  sections: Record<string, string | string[]>;
  aiSummary: string;
  lockedSections?: string[];
  disclaimer: string;
  generatedAt: string;
};

export type DatabaseReadyKundliReport = {
  id: string;
  userId?: string;
  name: string;
  gender?: string;
  birthDetails: KundliReport["birthDetails"];
  calculationData: BirthChartData;
  aiInterpretation: string;
  language: AstrologyLanguage;
  pdfType: "FREE" | "PREMIUM";
  pdfUrl?: string;
  createdAt: string;
};

export type DatabaseReadyKundliMatchReport = {
  id: string;
  userId?: string;
  brideDetails: AstrologyBirthInput;
  groomDetails: AstrologyBirthInput;
  calculationData: KundliMatchReport;
  aiSummary: string;
  language: AstrologyLanguage;
  createdAt: string;
};

export type DatabaseReadyPersonalizedPrediction = {
  id: string;
  userId?: string;
  birthDetails: AstrologyBirthInput;
  period: PersonalizedHoroscopeReport["period"];
  calculationData: PersonalizedHoroscopeReport["calculationData"];
  aiPrediction: string;
  language: AstrologyLanguage;
  createdAt: string;
};

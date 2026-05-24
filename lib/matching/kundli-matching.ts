import type { AshtakootFactor, AstrologyBirthInput, AstrologyLanguage, BirthChartData, DoshaStatus, KundliMatchReport } from "@/lib/astrology/types";

type KootStatus = "good" | "average" | "concern";

export type MatchingAshtakootFactor = AshtakootFactor & {
  koot: string;
  brideValue: string;
  groomValue: string;
  explanation: string;
  status: KootStatus;
  basis: string;
  available: boolean;
};

export type PremiumKundliMatchReport = KundliMatchReport & {
  matchingMode: string;
  limitationNotes: string[];
  strengths: string[];
  concerns: string[];
  practicalGuidance: string[];
  moonCompatibility: string;
  nakshatraCompatibility: string;
  calculationBasis: {
    bride: MatchBasis;
    groom: MatchBasis;
  };
  manglikComparison: {
    brideStatus: string;
    groomStatus: string;
    brideBasis: string;
    groomBasis: string;
    compatible: boolean;
    note: string;
  };
  reportReady: {
    title: string;
    sections: string[];
    downloadAvailable: boolean;
    note: string;
  };
};

type MatchBasis = {
  moonSign: string;
  moonLord: string;
  nakshatra: string;
  nakshatraHindi: string;
  nakshatraIndex?: number;
  gana: string;
  nadi: string;
  yoni: string;
  varna: string;
  vashya: string;
};

type NakshatraRef = {
  index: number;
  name: string;
  hindi: string;
  lord: string;
  gana: "Deva" | "Manushya" | "Rakshasa";
  nadi: "Adi" | "Madhya" | "Antya";
  yoni: string;
  aliases?: string[];
};

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"] as const;

const SIGN_LORDS: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury",
  Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter"
};

const SIGN_HINDI: Record<string, string> = {
  Aries: "मेष", Taurus: "वृषभ", Gemini: "मिथुन", Cancer: "कर्क", Leo: "सिंह", Virgo: "कन्या",
  Libra: "तुला", Scorpio: "वृश्चिक", Sagittarius: "धनु", Capricorn: "मकर", Aquarius: "कुंभ", Pisces: "मीन"
};

const SIGN_HINGLISH: Record<string, string> = {
  Aries: "Aries", Taurus: "Taurus", Gemini: "Gemini", Cancer: "Cancer", Leo: "Leo", Virgo: "Virgo",
  Libra: "Libra", Scorpio: "Scorpio", Sagittarius: "Sagittarius", Capricorn: "Capricorn", Aquarius: "Aquarius", Pisces: "Pisces"
};

const PLANET_FRIENDS: Record<string, { friends: string[]; enemies: string[] }> = {
  Sun: { friends: ["Moon", "Mars", "Jupiter"], enemies: ["Venus", "Saturn"] },
  Moon: { friends: ["Sun", "Mercury"], enemies: [] },
  Mars: { friends: ["Sun", "Moon", "Jupiter"], enemies: ["Mercury"] },
  Mercury: { friends: ["Sun", "Venus"], enemies: ["Moon"] },
  Jupiter: { friends: ["Sun", "Moon", "Mars"], enemies: ["Mercury", "Venus"] },
  Venus: { friends: ["Mercury", "Saturn"], enemies: ["Sun", "Moon"] },
  Saturn: { friends: ["Mercury", "Venus"], enemies: ["Sun", "Moon", "Mars"] }
};

const NAKSHATRA_REFS: NakshatraRef[] = [
  { index: 1, name: "Ashwini", hindi: "अश्विनी", lord: "Ketu", gana: "Deva", nadi: "Adi", yoni: "Horse" },
  { index: 2, name: "Bharani", hindi: "भरणी", lord: "Venus", gana: "Manushya", nadi: "Madhya", yoni: "Elephant" },
  { index: 3, name: "Krittika", hindi: "कृत्तिका", lord: "Sun", gana: "Rakshasa", nadi: "Antya", yoni: "Sheep", aliases: ["Krithika", "Kritika"] },
  { index: 4, name: "Rohini", hindi: "रोहिणी", lord: "Moon", gana: "Manushya", nadi: "Antya", yoni: "Serpent" },
  { index: 5, name: "Mrigashira", hindi: "मृगशिरा", lord: "Mars", gana: "Deva", nadi: "Madhya", yoni: "Serpent", aliases: ["Mrigasira"] },
  { index: 6, name: "Ardra", hindi: "आर्द्रा", lord: "Rahu", gana: "Manushya", nadi: "Adi", yoni: "Dog" },
  { index: 7, name: "Punarvasu", hindi: "पुनर्वसु", lord: "Jupiter", gana: "Deva", nadi: "Adi", yoni: "Cat" },
  { index: 8, name: "Pushya", hindi: "पुष्य", lord: "Saturn", gana: "Deva", nadi: "Madhya", yoni: "Sheep" },
  { index: 9, name: "Ashlesha", hindi: "आश्लेषा", lord: "Mercury", gana: "Rakshasa", nadi: "Antya", yoni: "Cat" },
  { index: 10, name: "Magha", hindi: "मघा", lord: "Ketu", gana: "Rakshasa", nadi: "Antya", yoni: "Rat" },
  { index: 11, name: "Purva Phalguni", hindi: "पूर्वा फाल्गुनी", lord: "Venus", gana: "Manushya", nadi: "Madhya", yoni: "Rat", aliases: ["Poorva Phalguni", "Pubba"] },
  { index: 12, name: "Uttara Phalguni", hindi: "उत्तरा फाल्गुनी", lord: "Sun", gana: "Manushya", nadi: "Adi", yoni: "Cow", aliases: ["Uttar Phalguni"] },
  { index: 13, name: "Hasta", hindi: "हस्त", lord: "Moon", gana: "Deva", nadi: "Adi", yoni: "Buffalo" },
  { index: 14, name: "Chitra", hindi: "चित्रा", lord: "Mars", gana: "Rakshasa", nadi: "Madhya", yoni: "Tiger" },
  { index: 15, name: "Swati", hindi: "स्वाति", lord: "Rahu", gana: "Deva", nadi: "Antya", yoni: "Buffalo" },
  { index: 16, name: "Vishakha", hindi: "विशाखा", lord: "Jupiter", gana: "Rakshasa", nadi: "Antya", yoni: "Tiger" },
  { index: 17, name: "Anuradha", hindi: "अनुराधा", lord: "Saturn", gana: "Deva", nadi: "Madhya", yoni: "Deer" },
  { index: 18, name: "Jyeshtha", hindi: "ज्येष्ठा", lord: "Mercury", gana: "Rakshasa", nadi: "Adi", yoni: "Deer", aliases: ["Jyestha"] },
  { index: 19, name: "Mula", hindi: "मूल", lord: "Ketu", gana: "Rakshasa", nadi: "Adi", yoni: "Dog", aliases: ["Moola"] },
  { index: 20, name: "Purva Ashadha", hindi: "पूर्वाषाढ़ा", lord: "Venus", gana: "Manushya", nadi: "Madhya", yoni: "Monkey", aliases: ["Poorva Ashadha"] },
  { index: 21, name: "Uttara Ashadha", hindi: "उत्तराषाढ़ा", lord: "Sun", gana: "Manushya", nadi: "Antya", yoni: "Mongoose", aliases: ["Uttar Ashadha"] },
  { index: 22, name: "Shravana", hindi: "श्रवण", lord: "Moon", gana: "Deva", nadi: "Antya", yoni: "Monkey" },
  { index: 23, name: "Dhanishta", hindi: "धनिष्ठा", lord: "Mars", gana: "Rakshasa", nadi: "Madhya", yoni: "Lion" },
  { index: 24, name: "Shatabhisha", hindi: "शतभिषा", lord: "Rahu", gana: "Rakshasa", nadi: "Adi", yoni: "Horse", aliases: ["Shatabhishak"] },
  { index: 25, name: "Purva Bhadrapada", hindi: "पूर्व भाद्रपद", lord: "Jupiter", gana: "Manushya", nadi: "Adi", yoni: "Lion", aliases: ["Poorva Bhadrapada"] },
  { index: 26, name: "Uttara Bhadrapada", hindi: "उत्तर भाद्रपद", lord: "Saturn", gana: "Manushya", nadi: "Madhya", yoni: "Cow", aliases: ["Uttar Bhadrapada"] },
  { index: 27, name: "Revati", hindi: "रेवती", lord: "Mercury", gana: "Deva", nadi: "Antya", yoni: "Elephant" }
];

const YONI_ENEMIES = new Set(["buffalo|horse", "elephant|lion", "monkey|sheep", "mongoose|serpent", "deer|dog", "cat|rat", "cow|tiger"]);

export function buildPremiumCompatibilityReport(
  bride: AstrologyBirthInput,
  groom: AstrologyBirthInput,
  brideChart: BirthChartData,
  groomChart: BirthChartData,
  language: AstrologyLanguage,
  reportHash: string
): PremiumKundliMatchReport {
  const labels = copy(language);
  const brideRef = resolveNakshatra(brideChart.avakhada.nakshatra);
  const groomRef = resolveNakshatra(groomChart.avakhada.nakshatra);
  const basis = {
    bride: buildBasis(brideChart, brideRef, language),
    groom: buildBasis(groomChart, groomRef, language)
  };
  const ashtakoot = brideRef && groomRef ? buildAshtakoot(brideChart, groomChart, brideRef, groomRef, language) : unavailableAshtakoot(language);
  const totalScore = round(ashtakoot.reduce((sum, factor) => sum + factor.score, 0), 1);
  const percentage = Math.round((totalScore / 36) * 100);
  const rashiDistance = signNumber(brideChart.avakhada.moonSign) && signNumber(groomChart.avakhada.moonSign)
    ? circularDistance(signNumber(brideChart.avakhada.moonSign), signNumber(groomChart.avakhada.moonSign))
    : 0;
  const manglik = compareManglik(brideChart, groomChart, language);
  const nadiFactor = ashtakoot.find((factor) => factor.koot === labels.nadi);
  const bhakootFactor = ashtakoot.find((factor) => factor.koot === labels.bhakoot);
  const emotional = insightScore(percentage, scoreOf(ashtakoot, labels.tara), 3, rashiDistance);
  const mental = insightScore(percentage, scoreOf(ashtakoot, labels.grahMaitri), 5, rashiDistance);
  const physical = insightScore(percentage, scoreOf(ashtakoot, labels.yoni), 4, rashiDistance, manglik.compatible ? 4 : -6);
  const financial = insightScore(percentage, scoreOf(ashtakoot, labels.varna) + scoreOf(ashtakoot, labels.vashya), 3, rashiDistance);
  const family = insightScore(percentage, scoreOf(ashtakoot, labels.bhakoot) + scoreOf(ashtakoot, labels.nadi), 15, rashiDistance);
  const longTerm = Math.round((emotional + mental + physical + financial + family + percentage) / 6);
  const missingNotes = [
    ...ashtakoot.filter((factor) => !factor.available).map((factor) => `${factor.koot}: ${labels.insufficient}`),
    ...(brideRef && groomRef ? [] : [labels.nakshatraRequired])
  ];
  const limitationNotes = missingNotes.length ? missingNotes : [labels.calculationBasisNote];

  return {
    reportId: `match_${Date.now()}`,
    reportHash,
    matchingMode: "naksharix_ashtakoot_27_nakshatra_v3",
    brideProfile: { ...brideChart.profile, birthPlace: bride.birthPlace },
    groomProfile: { ...groomChart.profile, birthPlace: groom.birthPlace },
    brideChart,
    groomChart,
    gunaMilan: {
      totalScore,
      maxScore: 36,
      percentage,
      verdict: verdictFor(totalScore, language),
      ashtakoot
    },
    doshaAnalysis: {
      brideManglik: brideChart.manglikDosha,
      groomManglik: groomChart.manglikDosha,
      manglikCompatibility: manglik.note,
      nadiDosh: doshaFromFactor(Boolean(nadiFactor && nadiFactor.score === 0), nadiFactor?.explanation ?? labels.insufficient, language),
      bhakootDosh: doshaFromFactor(Boolean(bhakootFactor && bhakootFactor.score === 0), bhakootFactor?.explanation ?? labels.insufficient, language),
      remedies: practicalGuidance(language)
    },
    compatibility: { emotional, mental, physical, financial, family, longTerm },
    aiSummary: labels.aiFallback,
    disclaimer: labels.disclaimer,
    generatedAt: new Date().toISOString(),
    limitationNotes,
    strengths: buildStrengths(totalScore, ashtakoot, manglik.compatible, language),
    concerns: buildConcerns(totalScore, nadiFactor?.score ?? 0, bhakootFactor?.score ?? 0, manglik.compatible, language),
    practicalGuidance: practicalGuidance(language),
    moonCompatibility: moonCompatibilityLine(brideChart.avakhada.moonSign, groomChart.avakhada.moonSign, rashiDistance, language),
    nakshatraCompatibility: nakshatraCompatibilityLine(brideRef, groomRef, language),
    calculationBasis: basis,
    manglikComparison: manglik,
    reportReady: {
      title: labels.matchingReportComingSoon,
      sections: [labels.score, labels.guna, labels.manglik, labels.compatibility, labels.guidance],
      downloadAvailable: false,
      note: labels.reportReadyNote
    }
  };
}

export function validateAshtakootFactors(factors: Array<Pick<MatchingAshtakootFactor, "koot" | "score" | "maxScore">>) {
  const issues: string[] = [];
  const totalMax = factors.reduce((sum, factor) => sum + factor.maxScore, 0);
  if (totalMax !== 36) issues.push(`Ashtakoot max total must be 36, received ${totalMax}.`);
  factors.forEach((factor) => {
    if (factor.score < 0 || factor.score > factor.maxScore) issues.push(`${factor.koot} score ${factor.score} is outside 0-${factor.maxScore}.`);
  });
  return { ok: issues.length === 0, totalMax, issues };
}

export function normalizeNakshatraForMatching(value: string | undefined) {
  const ref = resolveNakshatra(value);
  return ref ? { index: ref.index, name: ref.name, hindi: ref.hindi, lord: ref.lord, gana: ref.gana, nadi: ref.nadi, yoni: ref.yoni } : null;
}

function buildAshtakoot(brideChart: BirthChartData, groomChart: BirthChartData, brideRef: NakshatraRef, groomRef: NakshatraRef, language: AstrologyLanguage): MatchingAshtakootFactor[] {
  const labels = copy(language);
  return [
    varnaKoota(brideChart.avakhada.moonSign, groomChart.avakhada.moonSign, labels, language),
    vashyaKoota(brideChart, groomChart, labels, language),
    taraKoota(brideRef, groomRef, labels, language),
    yoniKoota(brideRef, groomRef, labels, language),
    grahaMaitriKoota(brideChart.avakhada.moonSign, groomChart.avakhada.moonSign, labels, language),
    ganaKoota(brideRef, groomRef, labels, language),
    bhakootKoota(brideChart.avakhada.moonSign, groomChart.avakhada.moonSign, labels, language),
    nadiKoota(brideRef, groomRef, labels, language)
  ];
}

function unavailableAshtakoot(language: AstrologyLanguage): MatchingAshtakootFactor[] {
  const labels = copy(language);
  return [
    unavailableFactor(labels.varna, 1, labels.varnaMeaning, language),
    unavailableFactor(labels.vashya, 2, labels.vashyaMeaning, language),
    unavailableFactor(labels.tara, 3, labels.taraMeaning, language),
    unavailableFactor(labels.yoni, 4, labels.yoniMeaning, language),
    unavailableFactor(labels.grahMaitri, 5, labels.grahMaitriMeaning, language),
    unavailableFactor(labels.gana, 6, labels.ganaMeaning, language),
    unavailableFactor(labels.bhakoot, 7, labels.bhakootMeaning, language),
    unavailableFactor(labels.nadi, 8, labels.nadiMeaning, language)
  ];
}

function varnaKoota(brideSign: string | undefined, groomSign: string | undefined, labels: ReturnType<typeof copy>, language: AstrologyLanguage) {
  const varnas: Record<string, { rank: number; label: string }> = {
    Cancer: { rank: 4, label: "Brahmin" }, Scorpio: { rank: 4, label: "Brahmin" }, Pisces: { rank: 4, label: "Brahmin" },
    Aries: { rank: 3, label: "Kshatriya" }, Leo: { rank: 3, label: "Kshatriya" }, Sagittarius: { rank: 3, label: "Kshatriya" },
    Taurus: { rank: 2, label: "Vaishya" }, Virgo: { rank: 2, label: "Vaishya" }, Capricorn: { rank: 2, label: "Vaishya" },
    Gemini: { rank: 1, label: "Shudra" }, Libra: { rank: 1, label: "Shudra" }, Aquarius: { rank: 1, label: "Shudra" }
  };
  const bride = brideSign ? varnas[brideSign] : undefined;
  const groom = groomSign ? varnas[groomSign] : undefined;
  if (!bride || !groom) return unavailableFactor(labels.varna, 1, labels.varnaMeaning, language);
  const score = groom.rank >= bride.rank ? 1 : 0;
  return factor(labels.varna, score, 1, translateVarna(bride.label, language), translateVarna(groom.label, language), labels.varnaBasis, score ? labels.varnaGood : labels.varnaConcern, language);
}

function vashyaKoota(brideChart: BirthChartData, groomChart: BirthChartData, labels: ReturnType<typeof copy>, language: AstrologyLanguage) {
  const bride = vashyaGroup(brideChart);
  const groom = vashyaGroup(groomChart);
  if (!bride || !groom) return unavailableFactor(labels.vashya, 2, labels.vashyaMeaning, language);
  const same = bride === groom;
  const score = same ? 2 : bride === "Manav" || groom === "Manav" ? 1 : 0.5;
  return factor(labels.vashya, score, 2, translateVashya(bride, language), translateVashya(groom, language), labels.vashyaBasis, same ? labels.vashyaGood : labels.vashyaAverage, language);
}

function taraKoota(bride: NakshatraRef, groom: NakshatraRef, labels: ReturnType<typeof copy>, language: AstrologyLanguage) {
  const brideToGroom = circularDistance(bride.index, groom.index, 27);
  const groomToBride = circularDistance(groom.index, bride.index, 27);
  const brideGood = taraIsSupportive(brideToGroom);
  const groomGood = taraIsSupportive(groomToBride);
  const score = (brideGood ? 1.5 : 0) + (groomGood ? 1.5 : 0);
  return factor(labels.tara, score, 3, formatNakshatraIndex(bride, language), formatNakshatraIndex(groom, language), labels.taraBasis, labels.taraResult(brideToGroom, groomToBride, score === 3 ? labels.good : score > 0 ? labels.average : labels.concern), language);
}

function yoniKoota(bride: NakshatraRef, groom: NakshatraRef, labels: ReturnType<typeof copy>, language: AstrologyLanguage) {
  const relation = yoniRelation(bride.yoni, groom.yoni);
  const score = relation === "same" ? 4 : relation === "friendly" ? 3 : relation === "neutral" ? 2 : 0;
  return factor(labels.yoni, score, 4, `${formatNakshatraIndex(bride, language)} - ${translateYoni(bride.yoni, language)}`, `${formatNakshatraIndex(groom, language)} - ${translateYoni(groom.yoni, language)}`, labels.yoniBasis, score >= 3 ? labels.yoniGood : score >= 2 ? labels.yoniAverage : labels.yoniConcern, language);
}

function grahaMaitriKoota(brideSign: string | undefined, groomSign: string | undefined, labels: ReturnType<typeof copy>, language: AstrologyLanguage) {
  const brideLord = brideSign ? SIGN_LORDS[brideSign] : undefined;
  const groomLord = groomSign ? SIGN_LORDS[groomSign] : undefined;
  if (!brideLord || !groomLord) return unavailableFactor(labels.grahMaitri, 5, labels.grahMaitriMeaning, language);
  const relation = planetRelation(brideLord, groomLord);
  const score = relation === "mutualFriend" ? 5 : relation === "friend" ? 4 : relation === "neutral" ? 3 : relation === "mixed" ? 2 : 0;
  return factor(labels.grahMaitri, score, 5, `${translateSign(brideSign ?? "", language)} - ${translatePlanet(brideLord, language)}`, `${translateSign(groomSign ?? "", language)} - ${translatePlanet(groomLord, language)}`, labels.grahMaitriBasis, labels.grahRelation(relationLabel(relation, language), score >= 4 ? labels.good : score >= 3 ? labels.average : labels.concern), language);
}

function ganaKoota(bride: NakshatraRef, groom: NakshatraRef, labels: ReturnType<typeof copy>, language: AstrologyLanguage) {
  const key = `${bride.gana}|${groom.gana}`;
  const scores: Record<string, number> = {
    "Deva|Deva": 6, "Manushya|Manushya": 6, "Rakshasa|Rakshasa": 6,
    "Deva|Manushya": 5, "Manushya|Deva": 5,
    "Manushya|Rakshasa": 1, "Rakshasa|Manushya": 1,
    "Deva|Rakshasa": 0, "Rakshasa|Deva": 0
  };
  const score = scores[key] ?? 3;
  return factor(labels.gana, score, 6, translateGana(bride.gana, language), translateGana(groom.gana, language), labels.ganaBasis, score >= 5 ? labels.ganaGood : score >= 3 ? labels.ganaAverage : labels.ganaConcern, language);
}

function bhakootKoota(brideSign: string | undefined, groomSign: string | undefined, labels: ReturnType<typeof copy>, language: AstrologyLanguage) {
  const bride = signNumber(brideSign);
  const groom = signNumber(groomSign);
  if (!bride || !groom) return unavailableFactor(labels.bhakoot, 7, labels.bhakootMeaning, language);
  const distance = circularDistance(bride, groom);
  const reverse = circularDistance(groom, bride);
  const concern = [2, 5, 6, 8, 9, 12].includes(distance);
  const score = concern ? 0 : 7;
  return factor(labels.bhakoot, score, 7, translateSign(brideSign ?? "", language), translateSign(groomSign ?? "", language), labels.bhakootBasis, labels.bhakootResult(distance, reverse, concern ? labels.bhakootConcern : labels.bhakootGood), language);
}

function nadiKoota(bride: NakshatraRef, groom: NakshatraRef, labels: ReturnType<typeof copy>, language: AstrologyLanguage) {
  const same = bride.nadi === groom.nadi;
  const score = same ? 0 : 8;
  return factor(labels.nadi, score, 8, translateNadi(bride.nadi, language), translateNadi(groom.nadi, language), labels.nadiBasis, labels.nadiResult(same, same ? labels.nadiConcern : labels.nadiGood), language);
}

function compareManglik(brideChart: BirthChartData, groomChart: BirthChartData, language: AstrologyLanguage) {
  const labels = copy(language);
  const bride = manglikDetails(brideChart, language);
  const groom = manglikDetails(groomChart, language);
  const compatible = bride.rank === groom.rank || Math.abs(bride.rank - groom.rank) <= 1;
  const noStrongSignal = bride.rank === 0 && groom.rank === 0;
  return {
    brideStatus: bride.status,
    groomStatus: groom.status,
    brideBasis: noStrongSignal ? "" : bride.basis,
    groomBasis: noStrongSignal ? "" : groom.basis,
    compatible,
    note: noStrongSignal ? labels.manglikNoStrongSignal : compatible ? labels.manglikBalanced : labels.manglikReview
  };
}

function manglikDetails(chart: BirthChartData, language: AstrologyLanguage) {
  const labels = copy(language);
  const manglik = chart.doshaAnalysis?.manglik;
  const houses = [
    manglik?.marsHouseFromLagna,
    manglik?.marsHouseFromMoon,
    manglik?.marsHouseFromVenus
  ].filter((value): value is number => typeof value === "number");
  if (!houses.length && !chart.manglikDosha?.summary) return { status: labels.notEnoughManglik, rank: 0, basis: labels.notEnoughManglik };
  const sensitiveHits = houses.filter((house) => [1, 2, 4, 7, 8, 12].includes(house)).length;
  const rank = sensitiveHits >= 3 ? 3 : sensitiveHits === 2 ? 2 : sensitiveHits === 1 || chart.manglikDosha?.present ? 1 : 0;
  const status = rank === 3 ? labels.strong : rank === 2 ? labels.moderate : rank === 1 ? labels.mild : labels.none;
  const basis = houses.length ? labels.manglikBasis(houses.join(", ")) : chart.manglikDosha?.summary ?? labels.notEnoughManglik;
  return { status, rank, basis };
}

function factor(koot: string, score: number, maxScore: number, brideValue: string, groomValue: string, basis: string, explanation: string, language: AstrologyLanguage): MatchingAshtakootFactor {
  const safeScore = Math.max(0, Math.min(maxScore, round(score, 1)));
  const status: KootStatus = safeScore >= maxScore * 0.72 ? "good" : safeScore > 0 ? "average" : "concern";
  return { koot, name: koot, score: safeScore, maxScore, brideValue, groomValue, explanation, meaning: explanation, result: statusLabel(status, language), status, basis, available: true };
}

function unavailableFactor(koot: string, maxScore: number, basis: string, language: AstrologyLanguage): MatchingAshtakootFactor {
  const labels = copy(language);
  return { koot, name: koot, score: 0, maxScore, brideValue: labels.notAvailable, groomValue: labels.notAvailable, explanation: labels.insufficient, meaning: labels.insufficient, result: labels.insufficient, status: "concern", basis, available: false };
}

function doshaFromFactor(present: boolean, summary: string, language: AstrologyLanguage): DoshaStatus {
  return { present, severity: present ? copy(language).review : copy(language).none, summary, remedies: practicalGuidance(language) };
}

function buildBasis(chart: BirthChartData, ref: NakshatraRef | undefined, language: AstrologyLanguage): MatchBasis {
  const moonSign = chart.avakhada.moonSign;
  return {
    moonSign: translateSign(moonSign, language),
    moonLord: translatePlanet(SIGN_LORDS[moonSign] ?? copy(language).notAvailable, language),
    nakshatra: ref ? displayNakshatra(ref, language) : copy(language).notAvailable,
    nakshatraHindi: ref?.hindi ?? copy("hi").notAvailable,
    nakshatraIndex: ref?.index,
    gana: ref ? translateGana(ref.gana, language) : copy(language).notAvailable,
    nadi: ref ? translateNadi(ref.nadi, language) : copy(language).notAvailable,
    yoni: ref ? translateYoni(ref.yoni, language) : copy(language).notAvailable,
    varna: translateVarna(varnaForSign(moonSign)?.label ?? copy(language).notAvailable, language),
    vashya: translateVashya(vashyaGroup(chart) ?? copy(language).notAvailable, language)
  };
}

function resolveNakshatra(value: string | undefined) {
  const normalized = normalizeToken(value);
  if (!normalized || ["notavailable", "needsverifiedpanchang", "availablenahihai", "उपलब्धनहीं"].includes(normalized)) return undefined;
  return NAKSHATRA_REFS.find((item) => [item.name, item.hindi, ...(item.aliases ?? [])].some((candidate) => normalizeToken(candidate) === normalized));
}

function varnaForSign(sign: string | undefined) {
  const varnas: Record<string, { rank: number; label: string }> = {
    Cancer: { rank: 4, label: "Brahmin" }, Scorpio: { rank: 4, label: "Brahmin" }, Pisces: { rank: 4, label: "Brahmin" },
    Aries: { rank: 3, label: "Kshatriya" }, Leo: { rank: 3, label: "Kshatriya" }, Sagittarius: { rank: 3, label: "Kshatriya" },
    Taurus: { rank: 2, label: "Vaishya" }, Virgo: { rank: 2, label: "Vaishya" }, Capricorn: { rank: 2, label: "Vaishya" },
    Gemini: { rank: 1, label: "Shudra" }, Libra: { rank: 1, label: "Shudra" }, Aquarius: { rank: 1, label: "Shudra" }
  };
  return sign ? varnas[sign] : undefined;
}

function vashyaGroup(chart: BirthChartData) {
  const moon = chart.planetPositions?.find((planet) => sameToken(planet.planet, "Moon"));
  const sign = chart.avakhada.moonSign;
  const degree = moon?.degree ?? 0;
  if (sign === "Aries" || sign === "Taurus") return "Chatushpada";
  if (sign === "Gemini" || sign === "Virgo" || sign === "Libra" || sign === "Aquarius") return "Manav";
  if (sign === "Cancer" || sign === "Pisces") return "Jalachara";
  if (sign === "Leo") return "Vanachara";
  if (sign === "Scorpio") return "Keeta";
  if (sign === "Sagittarius") return degree < 15 ? "Manav" : "Chatushpada";
  if (sign === "Capricorn") return degree < 15 ? "Chatushpada" : "Jalachara";
  return undefined;
}

function taraIsSupportive(distance: number) {
  const tara = distance % 9 || 9;
  return ![3, 5, 7].includes(tara);
}

function yoniRelation(a: string, b: string) {
  if (a === b) return "same";
  const key = [a.toLowerCase(), b.toLowerCase()].sort().join("|");
  if (YONI_ENEMIES.has(key)) return "enemy";
  const sameClass = new Set(["Horse", "Elephant", "Cow", "Sheep", "Deer"]).has(a) && new Set(["Horse", "Elephant", "Cow", "Sheep", "Deer"]).has(b);
  return sameClass ? "friendly" : "neutral";
}

function planetRelation(a: string, b: string) {
  if (a === b) return "mutualFriend";
  const aFriend = PLANET_FRIENDS[a]?.friends.includes(b);
  const bFriend = PLANET_FRIENDS[b]?.friends.includes(a);
  const aEnemy = PLANET_FRIENDS[a]?.enemies.includes(b);
  const bEnemy = PLANET_FRIENDS[b]?.enemies.includes(a);
  if (aFriend && bFriend) return "mutualFriend";
  if ((aFriend || bFriend) && !(aEnemy || bEnemy)) return "friend";
  if (aEnemy && bEnemy) return "enemy";
  if (aEnemy || bEnemy) return "mixed";
  return "neutral";
}

function relationLabel(relation: string, language: AstrologyLanguage) {
  const labels: Record<string, Record<string, string>> = {
    hi: { mutualFriend: "परस्पर मित्र", friend: "मित्र", neutral: "तटस्थ", mixed: "मिश्रित", enemy: "शत्रु" },
    hinglish: { mutualFriend: "mutual friend", friend: "friend", neutral: "neutral", mixed: "mixed", enemy: "enemy" },
    en: { mutualFriend: "mutual friend", friend: "friend", neutral: "neutral", mixed: "mixed", enemy: "enemy" }
  };
  return labels[language]?.[relation] ?? relation;
}

function insightScore(gunaPercentage: number, factorScore: number, factorMax: number, distance: number, adjustment = 0) {
  const factorPart = factorMax ? Math.round((factorScore / factorMax) * 32) : 0;
  const distancePart = [1, 3, 4, 5, 7, 9, 10, 11].includes(distance) ? 8 : 0;
  return clampScore(36 + Math.round(gunaPercentage * 0.35) + factorPart + distancePart + adjustment);
}

function buildStrengths(totalScore: number, factors: MatchingAshtakootFactor[], manglikCompatible: boolean, language: AstrologyLanguage) {
  const labels = copy(language);
  const strengths = [labels.strengthCommunication];
  if (totalScore >= 24) strengths.push(labels.strengthGuna);
  if (scoreOf(factors, labels.tara) >= 1.5) strengths.push(labels.strengthTara);
  if (scoreOf(factors, labels.grahMaitri) >= 3) strengths.push(labels.strengthGrah);
  if (scoreOf(factors, labels.yoni) >= 2) strengths.push(labels.strengthYoni);
  if (manglikCompatible) strengths.push(labels.strengthManglik);
  return strengths;
}

function buildConcerns(totalScore: number, nadiScore: number, bhakootScore: number, manglikCompatible: boolean, language: AstrologyLanguage) {
  const labels = copy(language);
  const concerns: string[] = [];
  if (totalScore < 18) concerns.push(labels.concernGunaLow);
  else if (totalScore < 24) concerns.push(labels.concernGunaAverage);
  if (nadiScore === 0) concerns.push(labels.concernNadi);
  if (bhakootScore === 0) concerns.push(labels.concernBhakoot);
  if (!manglikCompatible) concerns.push(labels.concernManglik);
  concerns.push(labels.concernNoGuarantee);
  return concerns;
}

function practicalGuidance(language: AstrologyLanguage) {
  const labels = copy(language);
  return [labels.guidanceTalk, labels.guidanceFamily, labels.guidanceTiming, labels.guidanceConsult];
}

function moonCompatibilityLine(brideSign: string | undefined, groomSign: string | undefined, distance: number, language: AstrologyLanguage) {
  const labels = copy(language);
  if (!brideSign || !groomSign || !distance) return labels.insufficientMoon;
  return labels.moonLine(translateSign(brideSign, language), translateSign(groomSign, language), [1, 3, 4, 5, 7, 9, 10, 11].includes(distance));
}

function nakshatraCompatibilityLine(bride: NakshatraRef | undefined, groom: NakshatraRef | undefined, language: AstrologyLanguage) {
  const labels = copy(language);
  if (!bride || !groom) return labels.insufficientNakshatra;
  return labels.nakshatraLine(displayNakshatra(bride, language), displayNakshatra(groom, language), bride.index === groom.index);
}

function verdictFor(totalScore: number, language: AstrologyLanguage) {
  const labels = copy(language);
  if (totalScore >= 28) return labels.verdictStrong;
  if (totalScore >= 24) return labels.verdictGood;
  if (totalScore >= 18) return labels.verdictAverage;
  return labels.verdictReview;
}

function scoreOf(factors: MatchingAshtakootFactor[], name: string) {
  return factors.find((factor) => factor.koot === name)?.score ?? 0;
}

function signNumber(sign: string | undefined) {
  const index = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  return index >= 0 ? index + 1 : 0;
}

function circularDistance(a: number, b: number, size = 12) {
  return ((b - a + size) % size) + 1;
}

function normalizeToken(value: string | undefined) {
  return (value ?? "").toLowerCase().replace(/[\s\-_'.]/g, "").replace(/[^a-z\u0900-\u097f]/g, "");
}

function sameToken(a: string | undefined, b: string) {
  return normalizeToken(a) === normalizeToken(b);
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, value));
}

function round(value: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function statusLabel(status: KootStatus, language: AstrologyLanguage) {
  const labels = copy(language);
  return status === "good" ? labels.good : status === "average" ? labels.average : labels.concern;
}

function displayNakshatra(ref: NakshatraRef, language: AstrologyLanguage) {
  return language === "hi" ? ref.hindi : ref.name;
}

function formatNakshatraIndex(ref: NakshatraRef, language: AstrologyLanguage) {
  return `${displayNakshatra(ref, language)} (${ref.index})`;
}

function translateSign(sign: string, language: AstrologyLanguage) {
  if (language === "hi") return SIGN_HINDI[sign] ?? sign;
  if (language === "hinglish") return SIGN_HINGLISH[sign] ?? sign;
  return sign;
}

function translatePlanet(planet: string, language: AstrologyLanguage) {
  if (language === "hi") return ({ Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु", Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु" } as Record<string, string>)[planet] ?? planet;
  return planet;
}

function translateGana(gana: string, language: AstrologyLanguage) {
  if (language === "hi") return ({ Deva: "देव", Manushya: "मनुष्य", Rakshasa: "राक्षस" } as Record<string, string>)[gana] ?? gana;
  return gana;
}

function translateNadi(nadi: string, language: AstrologyLanguage) {
  if (language === "hi") return ({ Adi: "आदि", Madhya: "मध्य", Antya: "अंत्य" } as Record<string, string>)[nadi] ?? nadi;
  return nadi;
}

function translateYoni(yoni: string, language: AstrologyLanguage) {
  if (language === "hi") return ({ Horse: "घोड़ा", Elephant: "हाथी", Sheep: "भेड़", Serpent: "सर्प", Dog: "कुत्ता", Cat: "बिल्ली", Rat: "चूहा", Cow: "गाय", Buffalo: "भैंस", Tiger: "बाघ", Deer: "हिरण", Monkey: "बंदर", Mongoose: "नेवला", Lion: "सिंह" } as Record<string, string>)[yoni] ?? yoni;
  return yoni;
}

function translateVarna(varna: string, language: AstrologyLanguage) {
  if (language === "hi") return ({ Brahmin: "ब्राह्मण", Kshatriya: "क्षत्रिय", Vaishya: "वैश्य", Shudra: "शूद्र" } as Record<string, string>)[varna] ?? varna;
  return varna;
}

function translateVashya(vashya: string, language: AstrologyLanguage) {
  if (language === "hi") return ({ Chatushpada: "चतुष्पाद", Manav: "मानव", Jalachara: "जलचर", Vanachara: "वनचर", Keeta: "कीट" } as Record<string, string>)[vashya] ?? vashya;
  return vashya;
}

function copy(language: AstrologyLanguage) {
  if (language === "hi") return {
    varna: "वर्ण", vashya: "वश्य", tara: "तारा", yoni: "योनि", grahMaitri: "ग्रह मैत्री", gana: "गण", bhakoot: "भकूट", nadi: "नाड़ी",
    varnaMeaning: "चंद्र राशि से वर्ण मिलान।", vashyaMeaning: "चंद्र राशि और डिग्री से वश्य वर्ग।", taraMeaning: "दोनों दिशाओं में नक्षत्र गणना।", yoniMeaning: "नक्षत्र आधारित योनि पशु मिलान।", grahMaitriMeaning: "चंद्र राशि स्वामियों की प्राकृतिक मित्रता।", ganaMeaning: "नक्षत्र आधारित गण मिलान।", bhakootMeaning: "चंद्र राशियों की परस्पर दूरी।", nadiMeaning: "नक्षत्र आधारित नाड़ी मिलान।",
    varnaBasis: "वर का वर्ण वधू के वर्ण के बराबर या उच्च होना चाहिए।", vashyaBasis: "राशि-आधारित वश्य वर्गों की संगति।", taraBasis: "जन्म नक्षत्र से 9-तारा चक्र में शुभ/अशुभ गणना।", yoniBasis: "नक्षत्र योनि पशु संबंध।", grahMaitriBasis: "चंद्र राशि स्वामियों की मित्रता/तटस्थता/शत्रुता।", ganaBasis: "देव, मनुष्य, राक्षस गण की पारंपरिक तालिका।", bhakootBasis: "2-12, 5-9 और 6-8 संबंधों को सावधानी माना गया।", nadiBasis: "समान नाड़ी को 0, भिन्न नाड़ी को 8 गुण।",
    taraResult: (brideToGroom: number, groomToBride: number, status: string) => `वधू से वर तारा दूरी ${brideToGroom}, वर से वधू दूरी ${groomToBride}; परिणाम ${status}।`,
    grahRelation: (relation: string, status: string) => `राशि स्वामी संबंध ${relation} है; परिणाम ${status}।`,
    bhakootResult: (distance: number, reverse: number, note: string) => `राशि दूरी ${distance}/${reverse}; ${note}`,
    nadiResult: (same: boolean, note: string) => `${same ? "समान नाड़ी" : "भिन्न नाड़ी"}; ${note}`,
    varnaGood: "वर का वर्ण वधू के वर्ण के बराबर या उससे उच्च माना जाता है।", varnaConcern: "वर्ण नियम में सावधानी है।", vashyaGood: "वश्य वर्ग अनुकूल है।", vashyaAverage: "वश्य वर्ग आंशिक रूप से अनुकूल है।", taraGood: "तारा दोनों दिशाओं से सहायक है।", taraAverage: "तारा आंशिक रूप से सहायक है।", taraConcern: "तारा संकेत समीक्षा मांगता है।", yoniGood: "योनि अनुकूलता अच्छी है।", yoniAverage: "योनि अनुकूलता औसत है।", yoniConcern: "योनि संकेत सावधानी मांगता है।", grahGood: "ग्रह मैत्री सहायक है।", grahAverage: "ग्रह मैत्री औसत है।", grahConcern: "राशि स्वामी संबंध मिश्रित है; परिणाम सावधानी का संकेत देता है।", ganaGood: "गण अनुकूलता अच्छी है।", ganaAverage: "गण अनुकूलता औसत है।", ganaConcern: "गण संकेत गहरी समीक्षा मांगता है।", bhakootGood: "भकूट दोष स्पष्ट रूप से नहीं दिखता।", bhakootConcern: "भकूट संबंध सावधानी मांगता है।", nadiGood: "नाड़ी अलग है; पूर्ण अंक मिलते हैं।", nadiConcern: "समान नाड़ी पर 0 अंक मिलते हैं; गहरी समीक्षा जरूरी है।",
    good: "अच्छा", average: "औसत", concern: "चिंता", review: "समीक्षा", none: "नहीं", mild: "हल्का", moderate: "मध्यम", strong: "मजबूत", notAvailable: "उपलब्ध नहीं", notEnoughManglik: "मंगल भाव डेटा पर्याप्त नहीं है।", insufficient: "आवश्यक नक्षत्र/राशि डेटा उपलब्ध नहीं है।", nakshatraRequired: "अष्टकूट के लिए दोनों जन्म नक्षत्र आवश्यक हैं।",
    manglikBalanced: "मांगलिक स्तर संतुलित या नज़दीक दिखते हैं।", manglikNoStrongSignal: "उपलब्ध लग्न, चंद्र और शुक्र जांच के आधार पर प्रबल मांगलिक संकेत नहीं दिखता।", manglikReview: "मांगलिक स्तर अलग हैं; पूर्ण कुंडली समीक्षा करें।", manglikBasis: (houses: string) => `मंगल भाव संकेत: ${houses}. संवेदनशील भाव 1, 2, 4, 7, 8, 12 हैं।`,
    strengthGuna: "कुल गुण मिलान सहायक श्रेणी में है।", strengthTara: "तारा संकेत समय और सहारे में मदद करता है।", strengthGrah: "ग्रह मैत्री मानसिक तालमेल को समर्थन देती है।", strengthYoni: "योनि मिलान सहजता को समर्थन देता है।", strengthCommunication: "स्पष्ट संवाद संबंध की मुख्य ताकत बन सकता है।", strengthManglik: "मांगलिक स्तर संतुलित हैं।",
    concernGunaLow: "कुल गुण 18 से कम हैं; विस्तृत समीक्षा जरूरी है।", concernGunaAverage: "कुल गुण औसत हैं; सावधानी और संवाद जरूरी हैं।", concernNadi: "नाड़ी दोष संकेत दिखता है।", concernBhakoot: "भकूट संबंध सावधानी मांगता है।", concernManglik: "मांगलिक स्तर अलग हैं।", concernNoGuarantee: "यह मार्गदर्शन है, विवाह परिणाम की गारंटी नहीं।",
    guidanceTalk: "अपेक्षा, करियर, वित्त और परिवार पर स्पष्ट बात करें।", guidanceFamily: "परिवारिक संस्कृति और जीवनशैली को सम्मान से समझें।", guidanceTiming: "दशा, गोचर और व्यावहारिक परिस्थिति साथ में देखें।", guidanceConsult: "अंतिम निर्णय से पहले योग्य ज्योतिषी से पूर्ण समीक्षा लें।",
    moonLine: (a: string, b: string, supportive: boolean) => `${a} और ${b} चंद्र राशियां संबंध में ${supportive ? "सहयोगी" : "समीक्षा योग्य"} संकेत देती हैं।`, nakshatraLine: (a: string, b: string, same: boolean) => `${a} और ${b} नक्षत्र ${same ? "समान हैं; नाड़ी और तारा पर विशेष ध्यान दें।" : "अलग हैं; संतुलन को अष्टकूट स्कोर के साथ समझें।"}`,
    insufficientMoon: "चंद्र राशि डेटा पर्याप्त नहीं है।", insufficientNakshatra: "नक्षत्र डेटा पर्याप्त नहीं है।",
    verdictStrong: "मजबूत मिलान संकेत हैं।", verdictGood: "अच्छा मिलान है, फिर भी व्यावहारिक तैयारी रखें।", verdictAverage: "औसत/कार्यशील मेल है; सावधानी उपयोगी है।", verdictReview: "विस्तृत समीक्षा जरूरी है।",
    calculationBasisNote: "यह अष्टकूट स्कोर चंद्र राशि, नक्षत्र, गण, नाड़ी, योनि, राशि स्वामी, वर्ण, वश्य, तारा दूरी और भकूट राशि-दूरी नियमों के आधार पर निकाला गया है।",
    aiFallback: "गणना-आधारित मिलान तैयार है।", disclaimer: "कुंडली मिलान मार्गदर्शन है, विवाह परिणाम की गारंटी नहीं।", reportReadyTitle: "मिलान रिपोर्ट संरचना", matchingReportComingSoon: "मिलान रिपोर्ट जल्द आएगी", reportReadyNote: "डाउनलोड योग्य मिलान PDF अभी सक्रिय नहीं है।", score: "स्कोर", guna: "गुण", manglik: "मांगलिक", compatibility: "अनुकूलता", guidance: "मार्गदर्शन"
  };
  if (language === "hinglish") return {
    varna: "Varna", vashya: "Vashya", tara: "Tara", yoni: "Yoni", grahMaitri: "Graha Maitri", gana: "Gana", bhakoot: "Bhakoot", nadi: "Nadi",
    varnaMeaning: "Moon rashi se Varna matching.", vashyaMeaning: "Moon rashi aur degree se Vashya class.", taraMeaning: "Dono directions me nakshatra count.", yoniMeaning: "Nakshatra based yoni animal matching.", grahMaitriMeaning: "Moon rashi lords ki natural friendship.", ganaMeaning: "Nakshatra based Gana matching.", bhakootMeaning: "Moon rashis ki mutual distance.", nadiMeaning: "Nakshatra based Nadi matching.",
    varnaBasis: "Groom varna bride varna ke equal ya higher hona chahiye.", vashyaBasis: "Rashi-based Vashya classes ki compatibility.", taraBasis: "Birth nakshatra se 9-Tara chakra calculation.", yoniBasis: "Nakshatra yoni animal relation.", grahMaitriBasis: "Moon sign lords ki friendship/neutrality/enmity.", ganaBasis: "Deva, Manushya, Rakshasa traditional table.", bhakootBasis: "2-12, 5-9 aur 6-8 relations caution hain.", nadiBasis: "Same Nadi 0, different Nadi 8.",
    taraResult: (brideToGroom: number, groomToBride: number, status: string) => `Bride-to-groom Tara distance ${brideToGroom} aur groom-to-bride distance ${groomToBride} hai; result ${status} hai.`,
    grahRelation: (relation: string, status: string) => `Rashi lord relation ${relation} hai; result ${status} dikhata hai.`,
    bhakootResult: (distance: number, reverse: number, note: string) => `Sign distance ${distance}/${reverse} hai; ${note}`,
    nadiResult: (same: boolean, note: string) => `${same ? "Same Nadi" : "Different Nadi"}; ${note}`,
    varnaGood: "Groom varna bride ke barabar ya usse higher maana jata hai.", varnaConcern: "Varna rule caution dikhata hai.", vashyaGood: "Vashya class compatible hai.", vashyaAverage: "Vashya class partially compatible hai.", taraGood: "Tara dono directions se supportive hai.", taraAverage: "Tara partially supportive hai.", taraConcern: "Tara signal review maangta hai.", yoniGood: "Yoni compatibility good hai.", yoniAverage: "Yoni compatibility average hai.", yoniConcern: "Yoni signal caution maangta hai.", grahGood: "Graha Maitri supportive hai.", grahAverage: "Graha Maitri average hai.", grahConcern: "Rashi lord relation mixed hai; result concern dikhata hai.", ganaGood: "Gana compatibility good hai.", ganaAverage: "Gana compatibility average hai.", ganaConcern: "Gana deeper review maangta hai.", bhakootGood: "Bhakoot concern clearly indicated nahi hai.", bhakootConcern: "Bhakoot relation caution maangta hai.", nadiGood: "Different Nadi par full score milta hai.", nadiConcern: "Same Nadi par deeper review zaroori hai.",
    good: "Good", average: "Average", concern: "Concern", review: "Review", none: "None", mild: "Mild", moderate: "Moderate", strong: "Strong", notAvailable: "Available nahi hai", notEnoughManglik: "Mars house data enough nahi hai.", insufficient: "Required nakshatra/rashi data available nahi hai.", nakshatraRequired: "Ashtakoot ke liye dono birth nakshatra zaroori hain.",
    manglikBalanced: "Manglik levels balanced ya close dikhte hain.", manglikNoStrongSignal: "Available Lagna, Moon aur Venus checks ke basis par strong Manglik indication nahi dikhta.", manglikReview: "Manglik levels alag hain; full kundli review karein.", manglikBasis: (houses: string) => `Mars house signals: ${houses}. Sensitive houses 1, 2, 4, 7, 8, 12 hain.`,
    strengthGuna: "Total Guna supportive range me hai.", strengthTara: "Tara signal timing aur support me help karta hai.", strengthGrah: "Graha Maitri mental tuning support karti hai.", strengthYoni: "Yoni match comfort ko support karta hai.", strengthCommunication: "Clear communication relation ki main strength ban sakti hai.", strengthManglik: "Manglik levels balanced hain.",
    concernGunaLow: "Total guna 18 se kam hai; detailed review zaroori hai.", concernGunaAverage: "Total guna average hai; caution aur communication zaroori hai.", concernNadi: "Nadi dosh signal dikh raha hai.", concernBhakoot: "Bhakoot relation caution maangta hai.", concernManglik: "Manglik levels different hain.", concernNoGuarantee: "Ye guidance hai, marriage outcome ki guarantee nahi.",
    guidanceTalk: "Expectations, career, finance aur family par clear baat karein.", guidanceFamily: "Family culture aur lifestyle ko respect se samjhein.", guidanceTiming: "Dasha, transit aur practical situation saath me dekhein.", guidanceConsult: "Final decision se pehle qualified astrologer se full review lein.",
    moonLine: (a: string, b: string, supportive: boolean) => `${a} aur ${b} Moon signs ${supportive ? "supportive relation dikhate hain" : "review-worthy relation dikhate hain"}.`, nakshatraLine: (a: string, b: string, same: boolean) => `${a} aur ${b} nakshatra ${same ? "same hain; Nadi aur Tara par special dhyan dein." : "alag hain; balance ko Ashtakoot score ke saath review karein."}`,
    insufficientMoon: "Moon sign data enough nahi hai.", insufficientNakshatra: "Nakshatra data enough nahi hai.",
    verdictStrong: "Strong matching signals hain.", verdictGood: "Good match hai, practical readiness rakhein.", verdictAverage: "Average/workable match hai; caution helpful hai.", verdictReview: "Detailed review zaroori hai.",
    calculationBasisNote: "Ye Ashtakoot score Moon sign, Nakshatra, Gana, Nadi, Yoni, Rashi lord, Varna, Vashya, Tara distance aur Bhakoot sign-distance rules ke basis par calculate hua hai.",
    aiFallback: "Calculated matching ready hai.", disclaimer: "Kundli Milan guidance hai, marriage outcome ki guarantee nahi.", reportReadyTitle: "Matching Report Structure", matchingReportComingSoon: "Matching report jaldi aayegi", reportReadyNote: "Downloadable matching PDF abhi active nahi hai.", score: "Score", guna: "Guna", manglik: "Manglik", compatibility: "Compatibility", guidance: "Guidance"
  };
  return {
    varna: "Varna", vashya: "Vashya", tara: "Tara", yoni: "Yoni", grahMaitri: "Graha Maitri", gana: "Gana", bhakoot: "Bhakoot", nadi: "Nadi",
    varnaMeaning: "Varna matching from Moon sign.", vashyaMeaning: "Vashya class from Moon sign and degree.", taraMeaning: "Nakshatra count in both directions.", yoniMeaning: "Nakshatra-based yoni animal matching.", grahMaitriMeaning: "Natural friendship of Moon-sign lords.", ganaMeaning: "Nakshatra-based Gana matching.", bhakootMeaning: "Mutual distance of Moon signs.", nadiMeaning: "Nakshatra-based Nadi matching.",
    varnaBasis: "Groom varna should be equal to or higher than bride varna.", vashyaBasis: "Compatibility of rashi-based Vashya classes.", taraBasis: "9-Tara cycle from each birth nakshatra.", yoniBasis: "Nakshatra yoni animal relationship.", grahMaitriBasis: "Friendship, neutrality, or enmity of Moon sign lords.", ganaBasis: "Traditional Deva, Manushya, Rakshasa table.", bhakootBasis: "2-12, 5-9, and 6-8 relations are treated as caution combinations.", nadiBasis: "Same Nadi scores 0; different Nadi scores 8.",
    taraResult: (brideToGroom: number, groomToBride: number, status: string) => `Bride-to-groom Tara distance ${brideToGroom}, groom-to-bride distance ${groomToBride}; result ${status}.`,
    grahRelation: (relation: string, status: string) => `Rashi lord relation ${relation}; result ${status}.`,
    bhakootResult: (distance: number, reverse: number, note: string) => `Sign distance ${distance}/${reverse}; ${note}`,
    nadiResult: (same: boolean, note: string) => `${same ? "Same Nadi" : "Different Nadi"}; ${note}`,
    varnaGood: "Varna rule is supportive.", varnaConcern: "Varna rule indicates caution.", vashyaGood: "Vashya class is the same.", vashyaAverage: "Vashya class is partially compatible.", taraGood: "Tara is supportive from both directions.", taraAverage: "Tara is partly supportive.", taraConcern: "Tara signal needs review.", yoniGood: "Yoni compatibility is good.", yoniAverage: "Yoni compatibility is average.", yoniConcern: "Yoni signal needs caution.", grahGood: "Graha Maitri is supportive.", grahAverage: "Graha Maitri is average.", grahConcern: "Graha Maitri shows tension.", ganaGood: "Gana compatibility is good.", ganaAverage: "Gana compatibility is average.", ganaConcern: "Gana needs deeper review.", bhakootGood: "No Bhakoot concern is indicated.", bhakootConcern: "Bhakoot relation needs caution.", nadiGood: "Different Nadi, full score.", nadiConcern: "Same Nadi, deeper review is needed.",
    good: "Good", average: "Average", concern: "Concern", review: "Review", none: "None", mild: "Mild", moderate: "Moderate", strong: "Strong", notAvailable: "Not available", notEnoughManglik: "Mars house data is not sufficient.", insufficient: "Required nakshatra/rashi data is not available.", nakshatraRequired: "Both birth nakshatras are required for Ashtakoot.",
    manglikBalanced: "Manglik levels look balanced or close.", manglikNoStrongSignal: "Strong Manglik indication is not visible from available Lagna, Moon, and Venus checks.", manglikReview: "Manglik levels differ; review the full chart.", manglikBasis: (houses: string) => `Mars house signals: ${houses}. Sensitive houses are 1, 2, 4, 7, 8, 12.`,
    strengthGuna: "Total Guna score is in a supportive range.", strengthTara: "Tara supports timing and mutual support.", strengthGrah: "Graha Maitri supports mental tuning.", strengthYoni: "Yoni match supports comfort.", strengthCommunication: "Clear communication can become a main strength.", strengthManglik: "Manglik levels are balanced.",
    concernGunaLow: "Total guna is below 18; detailed review is important.", concernGunaAverage: "Total guna is average; caution and communication matter.", concernNadi: "Nadi dosh signal is present.", concernBhakoot: "Bhakoot relation needs caution.", concernManglik: "Manglik levels differ.", concernNoGuarantee: "This is guidance, not a guarantee of marriage outcome.",
    guidanceTalk: "Discuss expectations, career, finances, and family responsibilities clearly.", guidanceFamily: "Understand family culture and lifestyle differences respectfully.", guidanceTiming: "Combine dasha, transits, and practical circumstances.", guidanceConsult: "Before final decisions, review the full chart with a qualified astrologer.",
    moonLine: (a: string, b: string, supportive: boolean) => `${a} and ${b} Moon signs show a ${supportive ? "supportive" : "review-worthy"} relationship.`, nakshatraLine: (a: string, b: string, same: boolean) => `${a} and ${b} nakshatras are ${same ? "the same; pay special attention to Nadi and Tara." : "different; review balance through the Ashtakoot score."}`,
    insufficientMoon: "Moon sign data is not sufficient.", insufficientNakshatra: "Nakshatra data is not sufficient.",
    verdictStrong: "Strong matching indicators.", verdictGood: "Good match, with practical readiness still important.", verdictAverage: "Average or workable match; caution is useful.", verdictReview: "Detailed review is recommended.",
    calculationBasisNote: "This Ashtakoot score uses Moon sign, Nakshatra, Gana, Nadi, Yoni, Rashi lord, Varna, Vashya, Tara distance, and Bhakoot sign-distance rules.",
    aiFallback: "Calculated matching report is ready.", disclaimer: "Kundli matching is guidance, not a guarantee of marriage outcome.", reportReadyTitle: "Matching Report Structure", matchingReportComingSoon: "Matching report coming soon", reportReadyNote: "Downloadable matching PDF is not active yet.", score: "Score", guna: "Guna", manglik: "Manglik", compatibility: "Compatibility", guidance: "Guidance"
  };
}

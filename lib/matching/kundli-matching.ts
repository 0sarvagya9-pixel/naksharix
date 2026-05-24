import type { AshtakootFactor, AstrologyBirthInput, AstrologyLanguage, BirthChartData, DoshaStatus, KundliMatchReport } from "@/lib/astrology/types";

export type PremiumKundliMatchReport = KundliMatchReport & {
  matchingMode: string;
  limitationNotes: string[];
  strengths: string[];
  concerns: string[];
  practicalGuidance: string[];
  moonCompatibility: string;
  nakshatraCompatibility: string;
  reportReady: {
    title: string;
    sections: string[];
    downloadAvailable: boolean;
    note: string;
  };
};

type KootaScore = AshtakootFactor & { available: boolean };

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"] as const;
const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
] as const;

const SIGN_LORDS: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury",
  Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter"
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

export function buildPremiumCompatibilityReport(
  bride: AstrologyBirthInput,
  groom: AstrologyBirthInput,
  brideChart: BirthChartData,
  groomChart: BirthChartData,
  language: AstrologyLanguage,
  reportHash: string
): PremiumKundliMatchReport {
  const labels = copy(language);
  const ashtakoot = buildAshtakoot(brideChart, groomChart, language);
  const totalScore = round(ashtakoot.reduce((sum, factor) => sum + factor.score, 0), 1);
  const percentage = Math.round((totalScore / 36) * 100);
  const brideMoon = signNumber(brideChart.avakhada.moonSign);
  const groomMoon = signNumber(groomChart.avakhada.moonSign);
  const rashiDistance = brideMoon && groomMoon ? circularDistance(brideMoon, groomMoon) : 0;
  const manglik = compareManglik(brideChart.manglikDosha, groomChart.manglikDosha, language);
  const nadiFactor = ashtakoot.find((factor) => factor.name === labels.nadi);
  const bhakootFactor = ashtakoot.find((factor) => factor.name === labels.bhakoot);
  const emotional = clampScore(48 + Math.round(percentage * 0.42) + (isSupportiveDistance(rashiDistance) ? 10 : 2));
  const mental = clampScore(50 + Math.round((scoreOf(ashtakoot, labels.grahMaitri) / 5) * 28) + (isSupportiveDistance(rashiDistance) ? 8 : 0));
  const physical = clampScore(48 + Math.round((scoreOf(ashtakoot, labels.yoni) / 4) * 30) + (manglik.compatible ? 8 : -4));
  const financial = clampScore(52 + Math.round((scoreOf(ashtakoot, labels.varna) + scoreOf(ashtakoot, labels.vashya)) * 6) + (isArthaPair(brideChart.avakhada.moonSign, groomChart.avakhada.moonSign) ? 8 : 0));
  const family = clampScore(45 + Math.round((scoreOf(ashtakoot, labels.bhakoot) / 7) * 26) + Math.round((scoreOf(ashtakoot, labels.nadi) / 8) * 18));
  const longTerm = clampScore(Math.round((emotional + mental + physical + financial + family + percentage) / 6));
  const limitationNotes = ashtakoot.filter((factor) => !factor.available).map((factor) => `${factor.name}: ${labels.insufficient}`);
  const strengths = buildStrengths({ percentage, emotional, mental, physical, financial, family, manglikCompatible: manglik.compatible }, language);
  const concerns = buildConcerns({ percentage, nadiScore: nadiFactor?.score ?? 0, bhakootScore: bhakootFactor?.score ?? 0, manglikCompatible: manglik.compatible }, language);

  return {
    reportId: `match_${Date.now()}`,
    reportHash,
    matchingMode: "naksharix_ashtakoot_from_chart_data_v2",
    brideProfile: { ...brideChart.profile, birthPlace: bride.birthPlace },
    groomProfile: { ...groomChart.profile, birthPlace: groom.birthPlace },
    brideChart,
    groomChart,
    gunaMilan: {
      totalScore,
      maxScore: 36,
      percentage,
      verdict: verdictFor(percentage, language),
      ashtakoot
    },
    doshaAnalysis: {
      brideManglik: brideChart.manglikDosha,
      groomManglik: groomChart.manglikDosha,
      manglikCompatibility: manglik.summary,
      nadiDosh: doshaFromFactor(Boolean(nadiFactor && nadiFactor.score < 8), nadiFactor?.meaning ?? labels.insufficient, language),
      bhakootDosh: doshaFromFactor(Boolean(bhakootFactor && bhakootFactor.score < 7), bhakootFactor?.meaning ?? labels.insufficient, language),
      remedies: practicalGuidance(language)
    },
    compatibility: { emotional, mental, physical, financial, family, longTerm },
    aiSummary: matchFallback(language),
    disclaimer: disclaimerFor(language),
    generatedAt: new Date().toISOString(),
    limitationNotes,
    strengths,
    concerns,
    practicalGuidance: practicalGuidance(language),
    moonCompatibility: moonCompatibilityLine(brideChart.avakhada.moonSign, groomChart.avakhada.moonSign, rashiDistance, language),
    nakshatraCompatibility: nakshatraCompatibilityLine(brideChart.avakhada.nakshatra, groomChart.avakhada.nakshatra, language),
    reportReady: {
      title: labels.reportReadyTitle,
      sections: [labels.score, labels.guna, labels.manglik, labels.compatibility, labels.guidance],
      downloadAvailable: false,
      note: labels.reportReadyNote
    }
  };
}

function buildAshtakoot(brideChart: BirthChartData, groomChart: BirthChartData, language: AstrologyLanguage): KootaScore[] {
  const labels = copy(language);
  const brideMoon = brideChart.avakhada.moonSign;
  const groomMoon = groomChart.avakhada.moonSign;
  const brideNakshatra = brideChart.avakhada.nakshatra;
  const groomNakshatra = groomChart.avakhada.nakshatra;
  return [
    varnaKoota(brideMoon, groomMoon, labels, language),
    vashyaKoota(brideMoon, groomMoon, labels, language),
    taraKoota(brideNakshatra, groomNakshatra, labels, language),
    yoniKoota(brideChart.avakhada.yoni, groomChart.avakhada.yoni, labels, language),
    grahaMaitriKoota(brideMoon, groomMoon, labels, language),
    ganaKoota(brideChart.avakhada.gana, groomChart.avakhada.gana, labels, language),
    bhakootKoota(brideMoon, groomMoon, labels, language),
    nadiKoota(brideChart.avakhada.nadi, groomChart.avakhada.nadi, labels, language)
  ];
}

function varnaKoota(brideSign: string | undefined, groomSign: string | undefined, labels: ReturnType<typeof copy>, language: AstrologyLanguage): KootaScore {
  const varnas: Record<string, number> = { Cancer: 4, Scorpio: 4, Pisces: 4, Aries: 3, Leo: 3, Sagittarius: 3, Taurus: 2, Virgo: 2, Capricorn: 2, Gemini: 1, Libra: 1, Aquarius: 1 };
  if (!brideSign || !groomSign || !varnas[brideSign] || !varnas[groomSign]) return unavailableFactor(labels.varna, 1, labels.varnaMeaning, language);
  return factor(labels.varna, varnas[groomSign] >= varnas[brideSign] ? 1 : 0, 1, labels.varnaMeaning, language, true);
}

function vashyaKoota(brideSign: string | undefined, groomSign: string | undefined, labels: ReturnType<typeof copy>, language: AstrologyLanguage): KootaScore {
  const groups: Record<string, string> = { Aries: "chatushpad", Taurus: "chatushpad", Gemini: "manav", Cancer: "jalchar", Leo: "vanchar", Virgo: "manav", Libra: "manav", Scorpio: "keet", Sagittarius: "chatushpad", Capricorn: "chatushpad", Aquarius: "manav", Pisces: "jalchar" };
  if (!brideSign || !groomSign || !groups[brideSign] || !groups[groomSign]) return unavailableFactor(labels.vashya, 2, labels.vashyaMeaning, language);
  const score = groups[brideSign] === groups[groomSign] ? 2 : (groups[brideSign] === "manav" || groups[groomSign] === "manav") ? 1.5 : 1;
  return factor(labels.vashya, score, 2, labels.vashyaMeaning, language, true);
}

function taraKoota(brideNakshatra: string | undefined, groomNakshatra: string | undefined, labels: ReturnType<typeof copy>, language: AstrologyLanguage): KootaScore {
  const bride = nakshatraNumber(brideNakshatra);
  const groom = nakshatraNumber(groomNakshatra);
  if (!bride || !groom) return unavailableFactor(labels.tara, 3, labels.taraMeaning, language);
  const brideToGroom = taraIsSupportive(circularDistance(bride, groom, 27));
  const groomToBride = taraIsSupportive(circularDistance(groom, bride, 27));
  const score = brideToGroom && groomToBride ? 3 : brideToGroom || groomToBride ? 1.5 : 0;
  return factor(labels.tara, score, 3, labels.taraMeaning, language, true);
}

function yoniKoota(brideYoni: string | undefined, groomYoni: string | undefined, labels: ReturnType<typeof copy>, language: AstrologyLanguage): KootaScore {
  if (!brideYoni || !groomYoni) return unavailableFactor(labels.yoni, 4, labels.yoniMeaning, language);
  const same = normalizeToken(brideYoni) === normalizeToken(groomYoni);
  return factor(labels.yoni, same ? 4 : 2, 4, labels.yoniMeaning, language, true);
}

function grahaMaitriKoota(brideSign: string | undefined, groomSign: string | undefined, labels: ReturnType<typeof copy>, language: AstrologyLanguage): KootaScore {
  const brideLord = brideSign ? SIGN_LORDS[brideSign] : undefined;
  const groomLord = groomSign ? SIGN_LORDS[groomSign] : undefined;
  if (!brideLord || !groomLord) return unavailableFactor(labels.grahMaitri, 5, labels.grahMaitriMeaning, language);
  const relation = planetRelation(brideLord, groomLord);
  const score = relation === "friend" ? 5 : relation === "neutral" ? 3 : 1;
  return factor(labels.grahMaitri, score, 5, labels.grahMaitriMeaning, language, true);
}

function ganaKoota(brideGana: string | undefined, groomGana: string | undefined, labels: ReturnType<typeof copy>, language: AstrologyLanguage): KootaScore {
  if (!brideGana || !groomGana) return unavailableFactor(labels.gana, 6, labels.ganaMeaning, language);
  const bride = normalizeToken(brideGana);
  const groom = normalizeToken(groomGana);
  let score = 3;
  if (bride === groom) score = 6;
  else if ([bride, groom].includes("deva") && [bride, groom].includes("manushya")) score = 5;
  else if ([bride, groom].includes("manushya") && [bride, groom].includes("rakshasa")) score = 2;
  else if ([bride, groom].includes("deva") && [bride, groom].includes("rakshasa")) score = 1;
  return factor(labels.gana, score, 6, labels.ganaMeaning, language, true);
}

function bhakootKoota(brideSign: string | undefined, groomSign: string | undefined, labels: ReturnType<typeof copy>, language: AstrologyLanguage): KootaScore {
  const bride = signNumber(brideSign);
  const groom = signNumber(groomSign);
  if (!bride || !groom) return unavailableFactor(labels.bhakoot, 7, labels.bhakootMeaning, language);
  const distance = circularDistance(bride, groom);
  const reverse = circularDistance(groom, bride);
  const difficult = (distance === 2 && reverse === 12) || (distance === 12 && reverse === 2) || [5, 6, 8, 9].includes(distance);
  return factor(labels.bhakoot, difficult ? 0 : 7, 7, labels.bhakootMeaning, language, true);
}

function nadiKoota(brideNadi: string | undefined, groomNadi: string | undefined, labels: ReturnType<typeof copy>, language: AstrologyLanguage): KootaScore {
  if (!brideNadi || !groomNadi) return unavailableFactor(labels.nadi, 8, labels.nadiMeaning, language);
  return factor(labels.nadi, normalizeToken(brideNadi) === normalizeToken(groomNadi) ? 0 : 8, 8, labels.nadiMeaning, language, true);
}

function compareManglik(bride: DoshaStatus, groom: DoshaStatus, language: AstrologyLanguage) {
  const labels = copy(language);
  const bridePresent = Boolean(bride?.present);
  const groomPresent = Boolean(groom?.present);
  const compatible = bridePresent === groomPresent || (!bridePresent && !groomPresent);
  const summary = compatible
    ? labels.manglikBalanced
    : labels.manglikReview;
  return { compatible, summary };
}

function doshaFromFactor(present: boolean, summary: string, language: AstrologyLanguage): DoshaStatus {
  return { present, severity: present ? copy(language).review : copy(language).none, summary, remedies: practicalGuidance(language) };
}

function factor(name: string, score: number, maxScore: number, meaning: string, language: AstrologyLanguage, available: boolean): KootaScore {
  return { name, score: round(score, 1), maxScore, meaning, result: score >= maxScore * 0.65 ? copy(language).supportive : copy(language).review, available };
}

function unavailableFactor(name: string, maxScore: number, meaning: string, language: AstrologyLanguage): KootaScore {
  return { name, score: 0, maxScore, meaning: `${meaning} ${copy(language).insufficient}`, result: copy(language).insufficient, available: false };
}

function buildStrengths(input: { percentage: number; emotional: number; mental: number; physical: number; financial: number; family: number; manglikCompatible: boolean }, language: AstrologyLanguage) {
  const labels = copy(language);
  const strengths = [labels.strengthCommunication, labels.strengthFamilyReview];
  if (input.percentage >= 65) strengths.unshift(labels.strengthGuna);
  if (input.emotional >= 70) strengths.push(labels.strengthEmotional);
  if (input.financial >= 68) strengths.push(labels.strengthFinancial);
  if (input.manglikCompatible) strengths.push(labels.strengthManglik);
  return strengths.slice(0, 5);
}

function buildConcerns(input: { percentage: number; nadiScore: number; bhakootScore: number; manglikCompatible: boolean }, language: AstrologyLanguage) {
  const labels = copy(language);
  const concerns: string[] = [];
  if (input.percentage < 55) concerns.push(labels.concernGuna);
  if (input.nadiScore < 8) concerns.push(labels.concernNadi);
  if (input.bhakootScore < 7) concerns.push(labels.concernBhakoot);
  if (!input.manglikCompatible) concerns.push(labels.concernManglik);
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
  return labels.moonLine(translateSign(brideSign, language), translateSign(groomSign, language), isSupportiveDistance(distance));
}

function nakshatraCompatibilityLine(brideNakshatra: string | undefined, groomNakshatra: string | undefined, language: AstrologyLanguage) {
  const labels = copy(language);
  if (!brideNakshatra || !groomNakshatra) return labels.insufficientNakshatra;
  return labels.nakshatraLine(translateNakshatra(brideNakshatra, language), translateNakshatra(groomNakshatra, language), normalizeToken(brideNakshatra) === normalizeToken(groomNakshatra));
}

function verdictFor(score: number, language: AstrologyLanguage) {
  const labels = copy(language);
  if (score >= 72) return labels.verdictStrong;
  if (score >= 55) return labels.verdictSupportive;
  return labels.verdictReview;
}

function matchFallback(language: AstrologyLanguage) {
  return copy(language).aiFallback;
}

function disclaimerFor(language: AstrologyLanguage) {
  return copy(language).disclaimer;
}

function scoreOf(factors: KootaScore[], name: string) {
  return factors.find((factor) => factor.name === name)?.score ?? 0;
}

function signNumber(sign: string | undefined) {
  const index = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  return index >= 0 ? index + 1 : 0;
}

function nakshatraNumber(nakshatra: string | undefined) {
  const normalized = normalizeToken(nakshatra);
  const index = NAKSHATRAS.findIndex((item) => normalizeToken(item) === normalized);
  return index >= 0 ? index + 1 : 0;
}

function circularDistance(a: number, b: number, size = 12) {
  return ((b - a + size) % size) + 1;
}

function taraIsSupportive(distance: number) {
  const tara = distance % 9 || 9;
  return ![3, 5, 7].includes(tara);
}

function isSupportiveDistance(distance: number) {
  return [1, 3, 4, 5, 7, 9, 10, 11].includes(distance);
}

function isArthaPair(brideSign: string | undefined, groomSign: string | undefined) {
  const artha = new Set(["Taurus", "Virgo", "Capricorn"]);
  return Boolean(brideSign && groomSign && artha.has(brideSign) && artha.has(groomSign));
}

function planetRelation(a: string, b: string) {
  if (a === b) return "friend";
  const aData = PLANET_FRIENDS[a];
  const bData = PLANET_FRIENDS[b];
  if (aData?.friends.includes(b) || bData?.friends.includes(a)) return "friend";
  if (aData?.enemies.includes(b) || bData?.enemies.includes(a)) return "enemy";
  return "neutral";
}

function normalizeToken(value: string | undefined) {
  return (value ?? "").toLowerCase().replace(/[^a-z]/g, "");
}

function clampScore(value: number) {
  return Math.max(25, Math.min(94, value));
}

function round(value: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function translateSign(sign: string, language: AstrologyLanguage) {
  if (language === "hi") return ({ Aries: "मेष", Taurus: "वृषभ", Gemini: "मिथुन", Cancer: "कर्क", Leo: "सिंह", Virgo: "कन्या", Libra: "तुला", Scorpio: "वृश्चिक", Sagittarius: "धनु", Capricorn: "मकर", Aquarius: "कुंभ", Pisces: "मीन" } as Record<string, string>)[sign] ?? sign;
  if (language === "hinglish") return ({ Aries: "Mesh", Taurus: "Vrishabh", Gemini: "Mithun", Cancer: "Kark", Leo: "Singh", Virgo: "Kanya", Libra: "Tula", Scorpio: "Vrishchik", Sagittarius: "Dhanu", Capricorn: "Makar", Aquarius: "Kumbh", Pisces: "Meen" } as Record<string, string>)[sign] ?? sign;
  return sign;
}

function translateNakshatra(nakshatra: string, language: AstrologyLanguage) {
  if (language === "hi") return ({
    Ashwini: "अश्विनी", Bharani: "भरणी", Krittika: "कृत्तिका", Rohini: "रोहिणी", Mrigashira: "मृगशिरा", Ardra: "आर्द्रा", Punarvasu: "पुनर्वसु", Pushya: "पुष्य", Ashlesha: "आश्लेषा",
    Magha: "मघा", "Purva Phalguni": "पूर्व फाल्गुनी", "Uttara Phalguni": "उत्तर फाल्गुनी", Hasta: "हस्त", Chitra: "चित्रा", Swati: "स्वाति", Vishakha: "विशाखा", Anuradha: "अनुराधा", Jyeshtha: "ज्येष्ठा",
    Mula: "मूल", "Purva Ashadha": "पूर्वाषाढ़ा", "Uttara Ashadha": "उत्तराषाढ़ा", Shravana: "श्रवण", Dhanishta: "धनिष्ठा", Shatabhisha: "शतभिषा", "Purva Bhadrapada": "पूर्व भाद्रपद", "Uttara Bhadrapada": "उत्तर भाद्रपद", Revati: "रेवती"
  } as Record<string, string>)[nakshatra] ?? nakshatra;
  return nakshatra;
}

function copy(language: AstrologyLanguage) {
  if (language === "hi") return {
    varna: "वर्ण", vashya: "वश्य", tara: "तारा", yoni: "योनि", grahMaitri: "ग्रह मैत्री", gana: "गण", bhakoot: "भकूट", nadi: "नाड़ी",
    varnaMeaning: "चंद्र राशि से मूल स्वभाव और संस्कार का संकेत।", vashyaMeaning: "व्यवहारिक आकर्षण और आपसी प्रभाव का संकेत।", taraMeaning: "नक्षत्र दूरी से शुभता और सहारा देखा गया।", yoniMeaning: "निकटता, सहजता और शारीरिक तालमेल का संकेत।", grahMaitriMeaning: "चंद्र राशि स्वामियों के संबंध से मानसिक तालमेल।", ganaMeaning: "स्वभाव और प्रतिक्रिया शैली का तुलनात्मक संकेत।", bhakootMeaning: "चंद्र राशियों के संबंध से पारिवारिक और दीर्घकालिक संकेत।", nadiMeaning: "नाड़ी समानता को सावधानी से देखा गया।",
    supportive: "सहायक", review: "समीक्षा करें", none: "नहीं", insufficient: "उपलब्ध चार्ट डेटा पर्याप्त नहीं है।",
    manglikBalanced: "मांगलिक संकेत संतुलित दिखते हैं। अंतिम निर्णय में पूरी कुंडली, दशा और परिवारिक परिस्थिति भी देखें।", manglikReview: "मांगलिक संकेत असंतुलित हैं। डर के आधार पर निर्णय न लें; पूर्ण कुंडली समीक्षा उपयोगी रहेगी।",
    strengthGuna: "गुण मिलान समग्र रूप से सहायक है।", strengthEmotional: "भावनात्मक लय में सहयोग की संभावना दिखती है।", strengthFinancial: "व्यावहारिक और वित्तीय तालमेल संभलकर मजबूत हो सकता है।", strengthCommunication: "स्पष्ट संवाद इस संबंध की सबसे बड़ी ताकत बन सकता है।", strengthFamilyReview: "परिवारिक अपेक्षाओं पर शुरुआती चर्चा लाभकारी रहेगी।", strengthManglik: "मांगलिक संकेत संतुलित हैं या दोनों पक्षों में समान हैं।",
    concernGuna: "कुल गुण स्कोर को गहरी समीक्षा की जरूरत है।", concernNadi: "नाड़ी संकेत सावधानी मांगता है।", concernBhakoot: "भकूट संकेत पर अतिरिक्त समीक्षा उपयोगी है।", concernManglik: "मांगलिक संतुलन पर योग्य ज्योतिषी से समीक्षा कराएं।", concernNoGuarantee: "यह रिपोर्ट मार्गदर्शन है, विवाह परिणाम की गारंटी नहीं।",
    guidanceTalk: "अपेक्षाओं, करियर, वित्त और परिवार पर स्पष्ट बातचीत करें।", guidanceFamily: "परिवारिक संस्कृति और जीवनशैली के अंतर को सम्मान से समझें।", guidanceTiming: "विवाह निर्णय में दशा, गोचर और व्यावहारिक परिस्थिति साथ में देखें।", guidanceConsult: "महत्वपूर्ण निर्णय से पहले योग्य ज्योतिषी से पूर्ण चार्ट समीक्षा लें।",
    moonLine: (a: string, b: string, supportive: boolean) => `${a} और ${b} चंद्र राशियों में ${supportive ? "सहायक" : "समीक्षा योग्य"} भावनात्मक दूरी दिखती है।`, nakshatraLine: (a: string, b: string, same: boolean) => `${a} और ${b} नक्षत्र ${same ? "समान हैं, इसलिए नाड़ी/तारा संकेत ध्यान से देखें।" : "अलग हैं, इसलिए व्यक्तिगत स्वभाव का संतुलन अलग तरह से बनेगा।"}`,
    insufficientMoon: "चंद्र राशि डेटा के बिना चंद्र अनुकूलता पूरी तरह नहीं देखी जा सकती।", insufficientNakshatra: "नक्षत्र डेटा के बिना तारा/नाड़ी संकेत सीमित रहेंगे।",
    verdictStrong: "मजबूत संकेत हैं, फिर भी संवाद और व्यावहारिक तैयारी जरूरी है।", verdictSupportive: "सहायक मेल है; कुछ बिंदुओं पर जागरूक समीक्षा रखें।", verdictReview: "मेल में संभावना है, लेकिन गहरी कुंडली और पारिवारिक समीक्षा जरूरी है।",
    aiFallback: "गणना-आधारित अनुकूलता रिपोर्ट तैयार है। AI व्याख्या फिलहाल सीमित है, इसलिए गुण, दोष और अनुकूलता कार्ड को मार्गदर्शन की तरह पढ़ें।", disclaimer: "कुंडली मिलान आत्मचिंतन और बातचीत के लिए मार्गदर्शन है। यह संबंध के परिणाम की गारंटी नहीं है।",
    reportReadyTitle: "मिलान रिपोर्ट संरचना", reportReadyNote: "डाउनलोड योग्य मिलान PDF अगली प्रीमियम रिपोर्ट परत के लिए सुरक्षित रूप से तैयार की जा सकती है।", score: "स्कोर", guna: "गुण", manglik: "मांगलिक", compatibility: "अनुकूलता", guidance: "मार्गदर्शन"
  };
  if (language === "hinglish") return {
    varna: "Varna", vashya: "Vashya", tara: "Tara", yoni: "Yoni", grahMaitri: "Grah Maitri", gana: "Gana", bhakoot: "Bhakoot", nadi: "Nadi",
    varnaMeaning: "Moon rashi se basic nature aur sanskar ka signal.", vashyaMeaning: "Practical attraction aur mutual influence ka signal.", taraMeaning: "Nakshatra distance se support dekha gaya.", yoniMeaning: "Closeness, comfort aur physical tuning ka signal.", grahMaitriMeaning: "Moon sign lords ke relation se mental tuning.", ganaMeaning: "Temperament aur response style ka comparative signal.", bhakootMeaning: "Moon sign relation se family aur long-term signal.", nadiMeaning: "Same Nadi ko caution ke saath dekha gaya.",
    supportive: "Supportive", review: "Review karein", none: "None", insufficient: "Available chart data enough nahi hai.",
    manglikBalanced: "Manglik signals balanced dikh rahe hain. Final decision me full kundli, dasha aur practical context bhi dekhein.", manglikReview: "Manglik signals imbalanced hain. Fear-based decision na lein; full kundli review helpful rahega.",
    strengthGuna: "Guna Milan overall supportive hai.", strengthEmotional: "Emotional rhythm me support ki possibility hai.", strengthFinancial: "Practical aur financial tuning mindful effort se strong ho sakti hai.", strengthCommunication: "Clear communication is match ki strong quality ban sakti hai.", strengthFamilyReview: "Family expectations par early discussion helpful rahega.", strengthManglik: "Manglik signals balanced ya dono sides me similar hain.",
    concernGuna: "Total guna score deeper review maangta hai.", concernNadi: "Nadi signal caution maangta hai.", concernBhakoot: "Bhakoot signal par extra review helpful hai.", concernManglik: "Manglik balance qualified astrologer ke saath review karein.", concernNoGuarantee: "Ye report guidance hai, marriage outcome ki guarantee nahi.",
    guidanceTalk: "Expectations, career, finance aur family par clear baat karein.", guidanceFamily: "Family culture aur lifestyle differences ko respect se samjhein.", guidanceTiming: "Marriage decision me dasha, transit aur practical situation ko saath me dekhein.", guidanceConsult: "Important decision se pehle qualified astrologer se full chart review lein.",
    moonLine: (a: string, b: string, supportive: boolean) => `${a} aur ${b} Moon signs me ${supportive ? "supportive" : "review-worthy"} emotional distance dikhti hai.`, nakshatraLine: (a: string, b: string, same: boolean) => `${a} aur ${b} nakshatra ${same ? "same hain, isliye Nadi/Tara signals dhyan se dekhein." : "different hain, nature balance alag tareeke se banega."}`,
    insufficientMoon: "Moon sign data ke bina Moon compatibility fully nahi dekhi ja sakti.", insufficientNakshatra: "Nakshatra data ke bina Tara/Nadi signals limited rahenge.",
    verdictStrong: "Strong signals hain, phir bhi communication aur practical readiness zaroori hai.", verdictSupportive: "Supportive match hai; kuch points par aware review rakhein.", verdictReview: "Match me possibility hai, lekin deeper kundli aur family review zaroori hai.",
    aiFallback: "Calculated compatibility report ready hai. AI explanation abhi limited hai, isliye guna, dosha aur compatibility cards ko guidance ki tarah dekhein.", disclaimer: "Kundli Milan reflection aur discussion ke liye guidance hai. Ye relationship outcome ki guarantee nahi hai.",
    reportReadyTitle: "Matching Report Structure", reportReadyNote: "Downloadable matching PDF ko next premium report layer me safely add kiya ja sakta hai.", score: "Score", guna: "Guna", manglik: "Manglik", compatibility: "Compatibility", guidance: "Guidance"
  };
  return {
    varna: "Varna", vashya: "Vashya", tara: "Tara", yoni: "Yoni", grahMaitri: "Graha Maitri", gana: "Gana", bhakoot: "Bhakoot", nadi: "Nadi",
    varnaMeaning: "Basic temperament and value signal from Moon sign.", vashyaMeaning: "Practical attraction and mutual influence indicator.", taraMeaning: "Nakshatra distance used for primary supportive timing signal.", yoniMeaning: "Closeness, comfort, and physical harmony indicator.", grahMaitriMeaning: "Mental tuning from the relationship between Moon-sign lords.", ganaMeaning: "Temperament and response-style comparison.", bhakootMeaning: "Moon-sign relationship for family and long-term harmony.", nadiMeaning: "Nadi similarity is reviewed as a caution signal.",
    supportive: "Supportive", review: "Needs review", none: "None", insufficient: "Available chart data is not sufficient.",
    manglikBalanced: "Manglik indicators look balanced. Still combine full chart, dasha, and practical context before a final decision.", manglikReview: "Manglik indicators are imbalanced. Avoid fear-based conclusions; a full chart review is recommended.",
    strengthGuna: "Overall Guna Milan is supportive.", strengthEmotional: "The emotional rhythm shows supportive potential.", strengthFinancial: "Practical and financial harmony can strengthen with mindful planning.", strengthCommunication: "Clear communication can become a strong pillar of this match.", strengthFamilyReview: "Early discussion around family expectations will help.", strengthManglik: "Manglik indicators are balanced or similar on both sides.",
    concernGuna: "The total guna score needs deeper review.", concernNadi: "Nadi signals require caution.", concernBhakoot: "Bhakoot signals deserve additional review.", concernManglik: "Manglik balance should be reviewed with a qualified astrologer.", concernNoGuarantee: "This report is guidance, not a guarantee of marriage outcome.",
    guidanceTalk: "Discuss expectations, career, finances, and family responsibilities clearly.", guidanceFamily: "Understand family culture and lifestyle differences with respect.", guidanceTiming: "Combine dasha, transits, and practical circumstances before marriage decisions.", guidanceConsult: "For major decisions, review the full chart with a qualified astrologer.",
    moonLine: (a: string, b: string, supportive: boolean) => `${a} and ${b} Moon signs show a ${supportive ? "supportive" : "review-worthy"} emotional distance.`, nakshatraLine: (a: string, b: string, same: boolean) => `${a} and ${b} nakshatras are ${same ? "the same, so Nadi/Tara signals need careful review." : "different, giving the match a distinct temperament balance."}`,
    insufficientMoon: "Moon compatibility needs Moon sign data.", insufficientNakshatra: "Tara and Nadi review need nakshatra data.",
    verdictStrong: "Strong compatibility indicators, with communication and practical readiness still important.", verdictSupportive: "Supportive match with a few points to review consciously.", verdictReview: "Promising match, but deeper kundli and family review are recommended.",
    aiFallback: "Calculated compatibility report is ready. AI explanation is temporarily limited, so use the Guna, Dosha, and compatibility cards as guidance.", disclaimer: "Kundli matching is guidance for reflection and discussion. It does not guarantee relationship outcome.",
    reportReadyTitle: "Matching Report Structure", reportReadyNote: "A downloadable matching PDF can be added safely in the next premium report layer.", score: "Score", guna: "Guna", manglik: "Manglik", compatibility: "Compatibility", guidance: "Guidance"
  };
}

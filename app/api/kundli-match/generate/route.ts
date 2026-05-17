import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { completeAstrologyPrompt } from "@/lib/ai/gemini";
import { buildKundliMatchPrompt } from "@/lib/ai/prompts/kundli-match";
import { getActiveAstrologyProviderName, getAstrologyProvider, AstrologyProviderUnavailableError } from "@/lib/astrology/provider";
import { normalizeBirthInput } from "@/lib/astrology/normalize";
import { normalizeBirthDate, normalizeBirthTime } from "@/lib/astrology/own-engine/time";
import { cacheGetOrSet } from "@/lib/cache";
import { cacheTtl, createBirthHash, matchCacheKey } from "@/lib/report-hash";
import { readLanguageFromRequest, translatedApiMessage } from "@/lib/server-language";
import type { AstrologyBirthInput, AstrologyLanguage, BirthChartData, KundliMatchReport, AshtakootFactor } from "@/lib/astrology/types";

const birthDateSchema = z.string().trim().min(8).transform((value) => normalizeBirthDate(value));
const birthTimeSchema = z.string().trim().min(1).transform((value) => normalizeBirthTime(value));

const personSchema = z.object({
  name: z.string().trim().min(2).max(80),
  gender: z.string().trim().min(1),
  dateOfBirth: birthDateSchema,
  birthDate: birthDateSchema.optional(),
  timeOfBirth: birthTimeSchema,
  birthTime: birthTimeSchema.optional(),
  birthPlace: z.string().trim().min(2).max(160),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  timezone: z.string().trim().min(1).default("Asia/Kolkata")
});

const schema = z.object({
  bride: personSchema,
  groom: personSchema,
  language: z.enum(["en", "hi", "hinglish"]).optional(),
  locale: z.enum(["en", "hi", "hinglish"]).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await validateJson(request, schema);
    const language = readLanguageFromRequest(request, body.language ?? body.locale);
    const bride = normalizeBirthInput({ ...body.bride, dateOfBirth: body.bride.dateOfBirth ?? body.bride.birthDate, timeOfBirth: body.bride.timeOfBirth ?? body.bride.birthTime, language });
    const groom = normalizeBirthInput({ ...body.groom, dateOfBirth: body.groom.dateOfBirth ?? body.groom.birthDate, timeOfBirth: body.groom.timeOfBirth ?? body.groom.birthTime, language });
    const providerName = getActiveAstrologyProviderName();
    logMatchStep("input", { provider: providerName, bride: loggableInput(bride), groom: loggableInput(groom) });

    const brideHash = createBirthHash(bride);
    const groomHash = createBirthHash(groom);
    const cacheKey = matchCacheKey(brideHash, groomHash, language);
    const cached = await cacheGetOrSet(cacheKey, cacheTtl.longTerm, async () => {
      const provider = getAstrologyProvider();
      const [brideChart, groomChart] = await Promise.all([
        provider.getBirthChart(bride) as Promise<BirthChartData>,
        provider.getBirthChart(groom) as Promise<BirthChartData>
      ]);
      const report = buildBasicCompatibilityReport(bride, groom, brideChart, groomChart, language, cacheKey);
      const prompt = buildKundliMatchPrompt(report, language);
      const aiSummary = await completeAstrologyPrompt(prompt.system, prompt.user, matchFallback(language));
      return { ...report, aiSummary };
    });

    return ok({ report: cached.value, cacheStatus: cached.cacheStatus, meta: { provider: providerName } });
  } catch (error) {
    logMatchStep("failure", { message: error instanceof Error ? error.message : "Unknown matching error" });
    if (error instanceof AstrologyProviderUnavailableError) return fail(translatedApiMessage(readLanguageFromRequest(request), "serviceUnavailable"), 503);
    return handleApiError(error);
  }
}

function buildBasicCompatibilityReport(
  bride: AstrologyBirthInput,
  groom: AstrologyBirthInput,
  brideChart: BirthChartData,
  groomChart: BirthChartData,
  language: AstrologyLanguage,
  reportHash: string
): KundliMatchReport & { matchingMode: string } {
  const brideMoon = signNumber(brideChart.avakhada.moonSign);
  const groomMoon = signNumber(groomChart.avakhada.moonSign);
  const rashiDistance = brideMoon && groomMoon ? circularDistance(brideMoon, groomMoon) : 0;
  const sameNakshatra = brideChart.avakhada.nakshatra === groomChart.avakhada.nakshatra;
  const ashtakoot = buildBasicAshtakoot(rashiDistance, sameNakshatra, language);
  const totalScore = ashtakoot.reduce((sum, factor) => sum + factor.score, 0);
  const percentage = Math.round((totalScore / 36) * 100);
  const emotional = clampScore(58 + compatibilityBoost(rashiDistance) + (sameNakshatra ? 8 : 0));
  const mental = clampScore(56 + compatibilityBoost(rashiDistance));
  const physical = clampScore(54 + Math.round(percentage / 6));
  const financial = clampScore(52 + (rashiDistance === 2 || rashiDistance === 10 ? 10 : 4));
  const family = clampScore(50 + Math.round(percentage / 7));
  const longTerm = Math.round((emotional + mental + physical + financial + family) / 5);
  const notAvailable = notAvailableFor(language);

  return {
    reportId: `match_${Date.now()}`,
    reportHash,
    matchingMode: "own_engine_basic_chart_compatibility",
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
      manglikCompatibility: notAvailable,
      nadiDosh: { present: false, summary: notAvailable, remedies: [notAvailable] },
      bhakootDosh: { present: false, summary: notAvailable, remedies: [notAvailable] },
      remedies: remediesFor(language)
    },
    compatibility: { emotional, mental, physical, financial, family, longTerm },
    aiSummary: matchFallback(language),
    disclaimer: disclaimerFor(language),
    generatedAt: new Date().toISOString()
  };
}

function buildBasicAshtakoot(rashiDistance: number, sameNakshatra: boolean, language: AstrologyLanguage): AshtakootFactor[] {
  const labels = factorLabels(language);
  const supportiveRashi = [1, 3, 4, 5, 7, 9, 11].includes(rashiDistance);
  return [
    factor(labels.varna, supportiveRashi ? 1 : 0, 1, labels.varnaMeaning, language),
    factor(labels.vashya, supportiveRashi ? 2 : 1, 2, labels.vashyaMeaning, language),
    factor(labels.tara, sameNakshatra ? 1.5 : 3, 3, labels.taraMeaning, language),
    factor(labels.yoni, supportiveRashi ? 3 : 2, 4, labels.yoniMeaning, language),
    factor(labels.grahMaitri, supportiveRashi ? 4 : 2, 5, labels.grahMaitriMeaning, language),
    factor(labels.gana, sameNakshatra ? 3 : 5, 6, labels.ganaMeaning, language),
    factor(labels.bhakoot, supportiveRashi ? 6 : 3, 7, labels.bhakootMeaning, language),
    factor(labels.nadi, sameNakshatra ? 3 : 8, 8, labels.nadiMeaning, language)
  ];
}

function factor(name: string, score: number, maxScore: number, meaning: string, language: AstrologyLanguage): AshtakootFactor {
  return { name, score, maxScore, meaning, result: score >= maxScore * 0.65 ? supportiveFor(language) : reviewFor(language) };
}

function factorLabels(language: AstrologyLanguage) {
  if (language === "hi") return {
    varna: "वर्ण", vashya: "वश्य", tara: "तारा", yoni: "योनि", grahMaitri: "ग्रह मैत्री", gana: "गण", bhakoot: "भकूट", nadi: "नाड़ी",
    varnaMeaning: "चंद्र राशि के आधार पर मूल स्वभाव का संकेत।", vashyaMeaning: "परस्पर आकर्षण और व्यवहारिक तालमेल का संकेत।", taraMeaning: "नक्षत्र आधारित शुभता का प्राथमिक संकेत।", yoniMeaning: "निकटता और सहजता का संकेत।", grahMaitriMeaning: "राशि स्वामियों के तालमेल का प्राथमिक संकेत।", ganaMeaning: "स्वभाव और प्रतिक्रिया शैली का संकेत।", bhakootMeaning: "चंद्र राशियों के संबंध का संकेत।", nadiMeaning: "नक्षत्र निकटता का सावधानी संकेत।"
  };
  if (language === "hinglish") return {
    varna: "Varna", vashya: "Vashya", tara: "Tara", yoni: "Yoni", grahMaitri: "Grah Maitri", gana: "Gana", bhakoot: "Bhakoot", nadi: "Nadi",
    varnaMeaning: "Moon rashi se basic nature ka sanket.", vashyaMeaning: "Mutual attraction aur practical tuning ka sanket.", taraMeaning: "Nakshatra based primary support ka sanket.", yoniMeaning: "Closeness aur comfort ka sanket.", grahMaitriMeaning: "Rashi lords ke basic relation ka sanket.", ganaMeaning: "Temperament aur response style ka sanket.", bhakootMeaning: "Moon rashis ke relation ka sanket.", nadiMeaning: "Nakshatra closeness ka caution signal."
  };
  return {
    varna: "Varna", vashya: "Vashya", tara: "Tara", yoni: "Yoni", grahMaitri: "Grah Maitri", gana: "Gana", bhakoot: "Bhakoot", nadi: "Nadi",
    varnaMeaning: "Basic temperament indicator from Moon sign.", vashyaMeaning: "Mutual attraction and practical tuning indicator.", taraMeaning: "Primary nakshatra-based support indicator.", yoniMeaning: "Comfort and closeness indicator.", grahMaitriMeaning: "Basic relationship between sign lords.", ganaMeaning: "Temperament and response style indicator.", bhakootMeaning: "Moon-sign relationship indicator.", nadiMeaning: "Nakshatra proximity caution indicator."
  };
}

const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
function signNumber(sign: string | undefined) { const index = signs.indexOf(sign ?? ""); return index >= 0 ? index + 1 : 0; }
function circularDistance(a: number, b: number) { const forward = ((b - a + 12) % 12) + 1; return forward; }
function compatibilityBoost(distance: number) { return [1, 3, 5, 7, 9, 11].includes(distance) ? 16 : [4, 10].includes(distance) ? 10 : 2; }
function clampScore(value: number) { return Math.max(35, Math.min(92, value)); }
function supportiveFor(language: AstrologyLanguage) { return language === "hi" ? "सहायक" : language === "hinglish" ? "Supportive" : "Supportive"; }
function reviewFor(language: AstrologyLanguage) { return language === "hi" ? "ध्यान दें" : language === "hinglish" ? "Review karein" : "Needs review"; }
function verdictFor(score: number, language: AstrologyLanguage) {
  if (language === "hi") return score >= 65 ? "सहायक मेल, फिर भी व्यावहारिक संवाद ज़रूरी है।" : "मेल में संभावना है, पर गहरी समीक्षा उपयोगी रहेगी।";
  if (language === "hinglish") return score >= 65 ? "Supportive match hai, practical communication zaroori rahega." : "Match promising hai, deeper review helpful rahega.";
  return score >= 65 ? "Supportive match with practical communication." : "Promising match, but deeper review is recommended.";
}
function remediesFor(language: AstrologyLanguage) {
  if (language === "hi") return ["निर्णय डर के आधार पर न लें।", "परिवार, वित्त और अपेक्षाओं पर स्पष्ट बातचीत करें।", "गंभीर दोषों के लिए योग्य ज्योतिषी से सलाह लें।"];
  if (language === "hinglish") return ["Fear ke basis par decision na lein.", "Family, finance aur expectations par clear baat karein.", "Serious dosha cases me qualified astrologer se consult karein."];
  return ["Avoid fear-based decisions.", "Discuss family, finances, and expectations clearly.", "Consult a qualified astrologer for serious dosha concerns."];
}
function disclaimerFor(language: AstrologyLanguage) {
  if (language === "hi") return "कुंडली मिलान आत्मचिंतन और बातचीत के लिए मार्गदर्शन है, संबंध के परिणाम की गारंटी नहीं।";
  if (language === "hinglish") return "Kundli Milan reflection aur discussion ke liye guidance hai, relationship outcome ki guarantee nahi.";
  return "Kundli matching is guidance for reflection and discussion, not a guarantee of relationship outcome.";
}
function notAvailableFor(language: AstrologyLanguage) { return language === "hi" ? "उपलब्ध नहीं" : language === "hinglish" ? "Available nahi hai" : "Not available"; }
function matchFallback(language: AstrologyLanguage) {
  if (language === "hi") return "गणना-आधारित अनुकूलता रिपोर्ट तैयार है। AI व्याख्या फिलहाल सीमित है, इसलिए राशि, नक्षत्र, गुण संकेत और अनुकूलता कार्ड को मार्गदर्शन के रूप में पढ़ें।";
  if (language === "hinglish") return "Calculated compatibility report ready hai. AI explanation abhi limited hai, isliye rashi, nakshatra, guna signals aur compatibility cards ko guidance ke roop me dekhein.";
  return "Calculated compatibility report is ready. AI explanation is temporarily limited, so use the Rashi, Nakshatra, Guna signals, and compatibility cards below for guidance.";
}
function loggableInput(input: AstrologyBirthInput) { return { name: input.name, dateOfBirth: input.dateOfBirth, timeOfBirth: input.timeOfBirth, birthPlace: input.birthPlace, latitude: input.latitude, longitude: input.longitude, timezone: input.timezone, language: input.language }; }
function logMatchStep(step: string, payload: unknown) {
  if (process.env.NODE_ENV === "production" && process.env.KUNDLI_DEBUG !== "true") return;
  console.info(`[Naksharix Match ${step}]`, payload);
}

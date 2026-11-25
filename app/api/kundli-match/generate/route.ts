import { NextRequest } from "next/server";
import { matchingRequestSchema } from "@/lib/matching/request-schema";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { completeAstrologyPrompt } from "@/lib/ai/gemini";
import { buildKundliMatchPrompt } from "@/lib/ai/prompts/kundli-match";
import { getActiveAstrologyProviderName, getAstrologyProvider, AstrologyProviderUnavailableError } from "@/lib/astrology/provider";
import { normalizeBirthInput } from "@/lib/astrology/normalize";
import { cacheGetOrSet } from "@/lib/cache";
import { cacheTtl, createBirthHash, matchCacheKey } from "@/lib/report-hash";
import { readLanguageFromRequest, translatedApiMessage } from "@/lib/server-language";
import { buildPremiumCompatibilityReport } from "@/lib/matching/kundli-matching";
import type { AstrologyLanguage, BirthChartData } from "@/lib/astrology/types";

export async function POST(request: NextRequest) {
  try {
    const body = await validateJson(request, matchingRequestSchema);
    const language = readLanguageFromRequest(request, body.language ?? body.locale);
    const bride = normalizeBirthInput({ ...body.bride, language });
    const groom = normalizeBirthInput({ ...body.groom, language });
    const providerName = getActiveAstrologyProviderName();
    logMatchStep("input", { provider: providerName, inputsAccepted: true });

    const brideHash = createBirthHash(bride);
    const groomHash = createBirthHash(groom);
    const cacheKey = matchCacheKey(brideHash, groomHash, language);
    const cached = await cacheGetOrSet(cacheKey, cacheTtl.longTerm, async () => {
      const provider = getAstrologyProvider();
      const [brideChart, groomChart] = await Promise.all([
        provider.getBirthChart(bride) as Promise<BirthChartData>,
        provider.getBirthChart(groom) as Promise<BirthChartData>
      ]);
      const report = buildPremiumCompatibilityReport(bride, groom, brideChart, groomChart, language, cacheKey);
      const prompt = buildKundliMatchPrompt(report, language);
      const aiSummary = await completeAstrologyPrompt(prompt.system, prompt.user, matchFallback(language));
      return { ...report, aiSummary };
    });

    return ok({ report: cached.value, cacheStatus: cached.cacheStatus, meta: { provider: providerName } });
  } catch (error) {
    logMatchStep("failure", { category: error instanceof AstrologyProviderUnavailableError ? "provider_unavailable" : "calculation_failed" });
    if (error instanceof AstrologyProviderUnavailableError) return fail(translatedApiMessage(readLanguageFromRequest(request), "serviceUnavailable"), 503);
    return handleApiError(error);
  }
}

function matchFallback(language: AstrologyLanguage) {
  if (language === "hi") return "गणना-आधारित अनुकूलता रिपोर्ट तैयार है। AI व्याख्या फिलहाल सीमित है, इसलिए राशि, नक्षत्र, गुण संकेत और अनुकूलता कार्ड को मार्गदर्शन के रूप में पढ़ें।";
  if (language === "hinglish") return "Calculated compatibility report ready hai. AI explanation abhi limited hai, isliye rashi, nakshatra, guna signals aur compatibility cards ko guidance ke roop me dekhein.";
  return "Calculated compatibility report is ready. AI explanation is temporarily limited, so use the Rashi, Nakshatra, Guna signals, and compatibility cards below for guidance.";
}
function logMatchStep(step: string, payload: unknown) {
  if (process.env.NODE_ENV === "production" && process.env.KUNDLI_DEBUG !== "true") return;
  console.info(`[Naksharix Match ${step}]`, payload);
}

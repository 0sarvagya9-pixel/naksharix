import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { completeAstrologyPrompt } from "@/lib/ai/gemini";
import { buildPersonalizedHoroscopePrompt } from "@/lib/ai/prompts/personalized-horoscope";
import { getAstrologyProvider, AstrologyProviderUnavailableError } from "@/lib/astrology/provider";
import { normalizeBirthInput } from "@/lib/astrology/normalize";
import { cacheGetOrSet } from "@/lib/cache";
import { cacheTtl, createBirthHash, dailyCacheKey, monthlyCacheKey, weeklyCacheKey, yearlyCacheKey } from "@/lib/report-hash";
import { checkRateLimit } from "@/lib/rate-limit";
import { readLanguageFromRequest, translatedApiMessage } from "@/lib/server-language";
import type { PersonalizedHoroscopeReport } from "@/lib/astrology/types";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  gender: z.string().trim().min(1),
  dateOfBirth: z.coerce.date(),
  timeOfBirth: z.string().regex(/^\d{2}:\d{2}$/),
  birthPlace: z.string().trim().min(2).max(160),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  timezone: z.string().trim().min(1).default("Asia/Kolkata"),
  period: z.enum(["daily", "weekly", "monthly", "yearly"]).default("daily"),
  language: z.enum(["en", "hi", "hinglish"]).optional(),
  locale: z.enum(["en", "hi", "hinglish"]).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await validateJson(request, schema);
    const language = readLanguageFromRequest(request, body.language ?? body.locale);
    const input = normalizeBirthInput({ ...body, language });
    const limitResponse = await checkRateLimit({ request, key: `personalized-${body.period}`, limit: body.period === "daily" ? 1 : 2, windowSeconds: 60 * 60 * 24, language });
    if (limitResponse) return limitResponse;
    const now = new Date();
    const birthHash = createBirthHash(input);
    const cacheKey = body.period === "weekly" ? weeklyCacheKey(birthHash, now, language)
      : body.period === "monthly" ? monthlyCacheKey(birthHash, now, language)
        : body.period === "yearly" ? yearlyCacheKey(birthHash, now, language)
          : dailyCacheKey(birthHash, now, language);
    const ttl = body.period === "weekly" ? cacheTtl.weekly : body.period === "monthly" ? cacheTtl.monthly : body.period === "yearly" ? cacheTtl.yearly : cacheTtl.daily;
    const cached = await cacheGetOrSet(cacheKey, ttl, async () => {
      const report = await getAstrologyProvider().getPersonalizedPrediction(input, body.period) as PersonalizedHoroscopeReport;
      const prompt = buildPersonalizedHoroscopePrompt(report, language);
      const aiSummary = await completeAstrologyPrompt(prompt.system, prompt.user, horoscopeFallback(language));
      return { ...report, reportHash: cacheKey, language, aiSummary };
    });
    return ok({ prediction: cached.value, cacheStatus: cached.cacheStatus });
  } catch (error) {
    if (error instanceof AstrologyProviderUnavailableError) return fail(translatedApiMessage(readLanguageFromRequest(request), "serviceUnavailable"), 503);
    return handleApiError(error);
  }
}

function horoscopeFallback(language: "en" | "hi" | "hinglish") {
  if (language === "hi") return "आपका गणना-आधारित व्यक्तिगत राशिफल तैयार है। AI व्याख्या फिलहाल सीमित है, इसलिए नीचे दिए गए संरचित मार्गदर्शन को शांत मन से पढ़ें।";
  if (language === "hinglish") return "Aapka calculated personalized rashifal ready hai. AI explanation abhi limited hai, isliye neeche ke structured guidance sections review karein.";
  return "Your calculated personalized horoscope is ready. AI explanation is temporarily limited, so review the structured guidance sections below.";
}

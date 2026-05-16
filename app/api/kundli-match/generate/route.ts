import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { completeAstrologyPrompt } from "@/lib/ai/gemini";
import { buildKundliMatchPrompt } from "@/lib/ai/prompts/kundli-match";
import { getAstrologyProvider, AstrologyProviderUnavailableError } from "@/lib/astrology/provider";
import { normalizeBirthInput } from "@/lib/astrology/normalize";
import { cacheGetOrSet } from "@/lib/cache";
import { cacheTtl, createBirthHash, matchCacheKey } from "@/lib/report-hash";
import { checkRateLimit } from "@/lib/rate-limit";
import { readLanguageFromRequest, translatedApiMessage } from "@/lib/server-language";
import type { KundliMatchReport } from "@/lib/astrology/types";

const personSchema = z.object({
  name: z.string().trim().min(2).max(80),
  gender: z.string().trim().min(1),
  dateOfBirth: z.coerce.date(),
  birthDate: z.coerce.date().optional(),
  timeOfBirth: z.string().regex(/^\d{2}:\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
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
    const limitResponse = await checkRateLimit({ request, key: "kundli-match", limit: 2, windowSeconds: 60 * 60 * 24, language });
    if (limitResponse) return limitResponse;
    const brideHash = createBirthHash(bride);
    const groomHash = createBirthHash(groom);
    const cacheKey = matchCacheKey(brideHash, groomHash, language);
    const cached = await cacheGetOrSet(cacheKey, cacheTtl.longTerm, async () => {
      const report = await getAstrologyProvider().getKundliMatching(bride, groom) as KundliMatchReport;
      const prompt = buildKundliMatchPrompt(report, language);
      const aiSummary = await completeAstrologyPrompt(prompt.system, prompt.user, matchFallback(language));
      return { ...report, reportHash: cacheKey, language, aiSummary };
    });
    return ok({ report: cached.value, cacheStatus: cached.cacheStatus });
  } catch (error) {
    if (error instanceof AstrologyProviderUnavailableError) return fail(translatedApiMessage(readLanguageFromRequest(request), "serviceUnavailable"), 503);
    return handleApiError(error);
  }
}

function matchFallback(language: "en" | "hi" | "hinglish") {
  if (language === "hi") return "गणना-आधारित अनुकूलता रिपोर्ट तैयार है। AI व्याख्या फिलहाल सीमित है, इसलिए गुण मिलान, अष्टकूट, दोष और अनुकूलता कार्ड को मार्गदर्शन के रूप में पढ़ें।";
  if (language === "hinglish") return "Calculated compatibility report ready hai. AI explanation abhi limited hai, isliye Guna Milan, Ashtakoot, dosha aur compatibility cards ko guidance ke roop me dekhein.";
  return "Calculated compatibility report is ready. AI explanation is temporarily limited, so use the Guna Milan, Ashtakoot, dosha, and compatibility cards below for guidance.";
}

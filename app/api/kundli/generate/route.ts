import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { completeAstrologyPrompt } from "@/lib/ai/gemini";
import { buildKundliPrompt } from "@/lib/ai/prompts/kundli";
import { getActiveAstrologyProviderName, getAstrologyProvider, AstrologyProviderUnavailableError } from "@/lib/astrology/provider";
import { buildKundliReport, normalizeBirthInput } from "@/lib/astrology/normalize";
import { cacheGetOrSet } from "@/lib/cache";
import { cacheTtl, createBirthHash, kundliCacheKey } from "@/lib/report-hash";
import { readLanguageFromRequest, translatedApiMessage } from "@/lib/server-language";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { normalizeBirthDate, normalizeBirthTime } from "@/lib/astrology/own-engine/time";
import type { BirthChartData } from "@/lib/astrology/types";

const birthDateSchema = z.string().trim().min(8).transform((value) => normalizeBirthDate(value));
const birthTimeSchema = z.string().trim().min(4).transform((value) => normalizeBirthTime(value));

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  gender: z.string().trim().min(1),
  dateOfBirth: birthDateSchema,
  timeOfBirth: birthTimeSchema,
  birthPlace: z.string().trim().min(2).max(160),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  timezone: z.string().trim().min(1).default("Asia/Kolkata"),
  language: z.enum(["en", "hi", "hinglish"]).optional(),
  locale: z.enum(["en", "hi", "hinglish"]).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await validateJson(request, schema);
    const language = readLanguageFromRequest(request, body.language ?? body.locale);
    const input = normalizeBirthInput({ ...body, language });
    const providerName = getActiveAstrologyProviderName();
    logNormalizedInput(input);
    const birthHash = createBirthHash(input);
    const cacheKey = kundliCacheKey(birthHash, language);
    const cached = await cacheGetOrSet(cacheKey, cacheTtl.longTerm, async () => {
      const provider = getAstrologyProvider();
      const chart = await provider.getBirthChart(input) as BirthChartData;
      const prompt = buildKundliPrompt(chart, language);
      const aiSummary = await completeAstrologyPrompt(prompt.system, prompt.user, kundliFallback(language));
      return { ...buildKundliReport(input, chart, aiSummary), reportHash: birthHash, language };
    });

    const user = await getCurrentUser();
    const report = { ...cached.value, saved: false };
    if (user) {
      const savedReport = await prisma.kundliReport.create({
        data: {
          userId: user.id,
          name: input.name,
          gender: input.gender,
          dateOfBirth: toBirthDate(input.dateOfBirth),
          timeOfBirth: input.timeOfBirth,
          birthPlace: input.birthPlace,
          latitude: input.latitude,
          longitude: input.longitude,
          timezone: input.timezone,
          language,
          reportJson: cached.value
        }
      });
      report.reportId = savedReport.id;
      report.saved = true;
    }

    return ok({ report, cacheStatus: cached.cacheStatus, meta: { provider: providerName, saved: report.saved } });
  } catch (error) {
    if (error instanceof AstrologyProviderUnavailableError) return fail(translatedApiMessage(readLanguageFromRequest(request), "serviceUnavailable"), 503);
    return handleApiError(error);
  }
}

function logNormalizedInput(input: ReturnType<typeof normalizeBirthInput>) {
  if (process.env.NODE_ENV === "production" || process.env.KUNDLI_DEBUG !== "true") return;
  console.info("[Naksharix Kundli Input]", {
    dateOfBirth: input.dateOfBirth,
    timeOfBirth: input.timeOfBirth,
    birthPlace: input.birthPlace,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone,
    language: input.language
  });
}

function kundliFallback(language: "en" | "hi" | "hinglish") {
  if (language === "hi") {
    return "गणना किए गए चार्ट सेक्शन तैयार हैं। AI व्याख्या फिलहाल सीमित है, इसलिए ग्रह स्थिति, दशा, दोष और उपायों को समझने के लिए योग्य ज्योतिषी से सलाह लें।";
  }
  if (language === "hinglish") {
    return "Calculated chart sections ready hain. AI interpretation abhi limited hai, isliye planet positions, dasha, dosha aur remedies ko deeper context ke liye qualified astrologer ke saath review karein.";
  }
  return "Calculated chart sections are ready. AI interpretation is temporarily limited, so review the planet positions, dasha, dosha, and remedies below with a qualified astrologer for deeper context.";
}


function toBirthDate(value: string | Date) {
  if (value instanceof Date) return value;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return new Date();
  return date;
}



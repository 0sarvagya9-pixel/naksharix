import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getAstrologyProvider, AstrologyProviderUnavailableError } from "@/lib/astrology/provider";
import { enrichBirthChartWithCoreCalculations } from "@/lib/astrology/core-calculations";
import { normalizeBirthInput } from "@/lib/astrology/normalize";
import { normalizeBirthDate, normalizeBirthTime } from "@/lib/astrology/own-engine/time";
import { readLanguageFromRequest, translatedApiMessage } from "@/lib/server-language";
import { nakshatraIndex } from "@/lib/focused-calculators";
import type { BirthChartData } from "@/lib/astrology/types";

const birthDateSchema = z.string().trim().min(8).transform((value) => normalizeBirthDate(value));
const birthTimeSchema = z.string().trim().min(4).transform((value) => normalizeBirthTime(value));

const schema = z.object({
  kind: z.enum(["dasha", "nakshatra"]),
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
    const chart = await getAstrologyProvider().getBirthChart(input) as BirthChartData;
    const enriched = enrichBirthChartWithCoreCalculations(chart, input);

    return ok({
      kind: body.kind,
      profile: enriched.profile,
      birthDetails: enriched.birthDetails,
      avakhada: {
        moonSign: enriched.avakhada.moonSign,
        ascendant: enriched.avakhada.ascendant,
        nakshatra: enriched.avakhada.nakshatra,
        nakshatraIndex: nakshatraIndex(enriched.avakhada.nakshatra),
        pada: enriched.panchang.nakshatraPada,
        gana: enriched.avakhada.gana,
        yoni: enriched.avakhada.yoni,
        nadi: enriched.avakhada.nadi
      },
      dasha: enriched.calculatedDasha,
      dashaTimeline: enriched.vimshottariDasha.slice(0, 9),
      nakshatraAnalysis: enriched.nakshatraAnalysis,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof AstrologyProviderUnavailableError) return fail(translatedApiMessage(readLanguageFromRequest(request), "serviceUnavailable"), 503);
    return handleApiError(error);
  }
}

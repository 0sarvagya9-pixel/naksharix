import { NextRequest } from "next/server";
import { ok, handleApiError, validateJson } from "@/lib/api";
import { horoscopeRequestSchema } from "@/lib/validations/astrology";
import { readLanguageFromRequest } from "@/lib/server-language";
import { getHoroscopeContent } from "@/lib/horoscope/content";
import type { HoroscopePageKind } from "@/lib/horoscope/types";

export async function POST(request: NextRequest) {
  try {
    const body = await validateJson(request, horoscopeRequestSchema);
    const locale = readLanguageFromRequest(request, body.locale);
    const kind: HoroscopePageKind = body.period === "yearly" ? "yearly-2026" : body.period;
    const result = getHoroscopeContent(kind, body.zodiac.toLowerCase());
    return ok({
      horoscope: {
        ...body,
        locale,
        content: result.overview,
        sections: result.sections,
        luckyNumber: Number(result.luckyNumber),
        luckyColor: result.luckyColor,
        remedy: result.remedy,
        trustNote: "General sign-based guidance only. Personalized prediction requires verified birth-chart calculation."
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

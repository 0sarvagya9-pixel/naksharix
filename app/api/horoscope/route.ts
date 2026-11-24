import { NextRequest } from "next/server";
import { ok, handleApiError, validateJson } from "@/lib/api";
import { horoscopeRequestSchema } from "@/lib/validations/astrology";
import { readLanguageFromRequest } from "@/lib/server-language";
import { getHoroscopeContent } from "@/lib/horoscope/content";
import { annualApiContent } from "@/lib/horoscope/annual";
import { annualSigns, calendarYearInIndia } from "@/lib/horoscope/annual-rules";
import { fail } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const body = await validateJson(request, horoscopeRequestSchema);
    const locale = readLanguageFromRequest(request, body.locale);
    const sign=body.zodiac.toLowerCase();
    if(!annualSigns.some(s=>s.toLowerCase()===sign))return fail("Select a valid zodiac sign.",422);
    if(body.year!==undefined&&body.period!=="yearly")return fail("Year is supported only for yearly guidance.",422);
    const result=body.period==="yearly"?annualApiContent(body.year??calendarYearInIndia(),sign,locale):getHoroscopeContent(body.period,sign);
    return ok({
      horoscope: {
        ...body,
        locale,
        content: result.overview,
        sections: result.sections,
        luckyNumber: body.period==="yearly"?null:Number(result.luckyNumber),
        ...("annualGuide" in result?{annualGuide:result.annualGuide}:{}),
        luckyColor: result.luckyColor,
        remedy: result.remedy,
        trustNote: "General sign-based guidance only. Personalized prediction requires verified birth-chart calculation."
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

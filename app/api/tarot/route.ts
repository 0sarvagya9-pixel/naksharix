import { NextRequest } from "next/server";
import { ok, handleApiError, validateJson } from "@/lib/api";
import { tarotSchema } from "@/lib/validations/astrology";
import { drawTarot } from "@/lib/astrology/engine";
import { interpretTarot } from "@/lib/ai/gemini";
import { checkRateLimit } from "@/lib/rate-limit";
import { readLanguageFromRequest } from "@/lib/server-language";

export async function POST(request: NextRequest) {
  try {
    const body = await validateJson(request, tarotSchema);
    const locale = readLanguageFromRequest(request, body.locale);
    const limitResponse = await checkRateLimit({ request, key: "tarot", limit: 10, windowSeconds: 60 * 60 * 24, language: locale });
    if (limitResponse) return limitResponse;
    const cards = drawTarot(body.spread);
    const interpretation = await interpretTarot(cards.map((card) => `${card.name}${card.reversed ? " reversed" : ""}`), body.question, locale);
    return ok({ reading: { ...body, locale, cards, interpretation } });
  } catch (error) {
    return handleApiError(error);
  }
}

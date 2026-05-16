import { NextRequest } from "next/server";
import { ok, handleApiError, validateJson } from "@/lib/api";
import { horoscopeRequestSchema } from "@/lib/validations/astrology";
import { generateHoroscopeCopy } from "@/lib/ai/gemini";
import { cached } from "@/lib/redis";
import { readLanguageFromRequest } from "@/lib/server-language";
import type { Locale } from "@/lib/i18n";

export async function POST(request: NextRequest) {
  try {
    const body = await validateJson(request, horoscopeRequestSchema);
    const locale = readLanguageFromRequest(request, body.locale);
    const cacheKey = `horoscope:${locale}:${body.zodiac}:${body.period}:${body.category}:${new Date().toISOString().slice(0, 10)}`;
    const content = await cached(cacheKey, 60 * 60 * 12, () =>
      generateHoroscopeCopy({
        zodiac: body.zodiac,
        period: body.period,
        category: body.category,
        locale,
        birthContext: body.birthDetails ? `${body.birthDetails.birthDate.toDateString()} ${body.birthDetails.birthTime} ${body.birthDetails.birthPlace}` : undefined
      })
    );
    return ok({
      horoscope: {
        ...body,
        locale,
        content,
        luckyNumber: Math.floor(Math.random() * 9) + 1,
        luckyColor: randomItem(luckyColors(locale)),
        gemstone: randomItem(gemstones(locale))
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

function randomItem(items: string[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function luckyColors(locale: Locale) {
  if (locale === "hi") return ["केसरिया", "पन्ना हरा", "मोती सफेद", "राजसी नीला", "गुलाबी"];
  if (locale === "hinglish") return ["Kesari", "Panna green", "Moti white", "Royal blue", "Rose"];
  return ["Saffron", "Emerald", "Pearl white", "Royal blue", "Rose"];
}

function gemstones(locale: Locale) {
  if (locale === "hi") return ["माणिक्य", "मोती", "पीला पुखराज", "पन्ना", "ओपल"];
  if (locale === "hinglish") return ["Manikya", "Moti", "Peela Pukhraj", "Panna", "Opal"];
  return ["Ruby", "Pearl", "Yellow Sapphire", "Emerald", "Opal"];
}

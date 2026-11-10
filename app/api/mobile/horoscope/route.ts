import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok } from "@/lib/api";
import { getHoroscopeContent } from "@/lib/horoscope/content";
import { zodiacSigns } from "@/lib/zodiac";
import { getRequestIp, rateLimitResponse } from "@/lib/security/rate-limit";
import type { HoroscopePageKind } from "@/lib/horoscope/types";

export const dynamic = "force-dynamic";

const allowedSigns = new Set<string>(zodiacSigns.map(sign => sign.slug));
const querySchema = z.object({
  zodiac: z.string().min(3).max(20).transform(value => value.toLowerCase()),
  period: z.enum(["daily","weekly","monthly","yearly"]).default("daily"),
  locale: z.enum(["en","hi","hinglish"]).default("en"),
}).strict();

/** Read-only, anonymous public zodiac guidance for the native mobile client.
 * It contains no birth details, no persistent identity and no generated claims.
 * POST /api/horoscope remains protected by the existing CSRF policy.
 */
export async function GET(request: NextRequest) {
  try {
    const limited = rateLimitResponse("mobile-horoscope", getRequestIp(request), 60, 60_000);
    if (limited) return limited;
    const parsed = querySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );
    if (!parsed.success || !allowedSigns.has(parsed.data.zodiac)) {
      return fail("Select a valid zodiac sign and period.",422);
    }
    const {zodiac,period,locale} = parsed.data;
    const kind: HoroscopePageKind = period==="yearly" ? "yearly-2026" : period;
    const content = getHoroscopeContent(kind,zodiac);
    return ok({
      zodiac,period,locale,
      title: content.title,
      subtitle: content.subtitle,
      overview: content.overview,
      sections: content.sections,
      luckyNumber: content.luckyNumber,
      luckyColor: content.luckyColor,
      remedy: content.remedy,
      notice: "Sign-level traditional reflections; not personal, medical, legal or financial advice."
    },{headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex, nofollow"}});
  } catch (error) { return handleApiError(error); }
}

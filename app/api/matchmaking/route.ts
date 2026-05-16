import { NextRequest } from "next/server";
import { ok, handleApiError, validateJson } from "@/lib/api";
import { matchMakingSchema } from "@/lib/validations/astrology";
import { matchKundlis } from "@/lib/astrology/engine";
import { interpretMatchmaking } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await validateJson(request, matchMakingSchema);
    const match = matchKundlis(body.bride, body.groom);
    const interpretation = await interpretMatchmaking({
      brideName: body.bride.name,
      groomName: body.groom.name,
      guna: match.guna,
      maxGuna: match.maxGuna,
      compatibilityScore: match.compatibilityScore,
      manglikCompatible: match.manglikCompatible,
      factors: match.factors,
      locale: body.locale
    });

    return ok({
      match: {
        ...match,
        emotionalCompatibility: extractSection(interpretation, "Emotional compatibility") ?? match.relationshipAnalysis,
        careerFinanceCompatibility: extractSection(interpretation, "Career/finance compatibility") ?? "Shared planning, transparent spending, and respect for each person's ambitions will improve long-term stability.",
        marriageRecommendation: extractSection(interpretation, "Marriage recommendation") ?? match.marriagePrediction,
        remedies: extractSection(interpretation, "Remedies") ?? "Keep weekly relationship check-ins, perform a simple Friday gratitude ritual, and review concerns with a qualified astrologer before final decisions.",
        interpretation
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

function extractSection(text: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`${escaped}:\\s*([^\\n]+)`, "i"));
  return match?.[1]?.trim();
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { completeAstrologyPrompt } from "@/lib/ai/gemini";

const schema = z.object({
  reportType: z.string().min(2).max(80),
  clientName: z.string().min(2).max(80),
  birthDetails: z.string().min(5).max(500),
  focusQuestion: z.string().min(5).max(500),
  language: z.enum(["English", "Hindi", "Hinglish"]).default("English")
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !["ASTROLOGER", "CONSULTANT", "ADMIN", "SUPER_ADMIN"].includes(user.role)) return fail("Unauthorized", 403);
    const body = await validateJson(request, schema);
    const languageInstruction = body.language === "Hindi"
      ? "Respond only in proper Devanagari Hindi."
      : body.language === "Hinglish"
        ? "Respond in natural Roman Hindi/Hinglish."
        : "Respond in natural English.";
    const fallback = `Report summary for ${body.clientName}: focus on ${body.focusQuestion}. Review the birth details, identify supportive timing, note caution areas, and recommend simple remedies without creating fear or certainty.`;
    const report = await completeAstrologyPrompt(
      `You are Naksharix AI report assistant for professional astrologers. ${languageInstruction} Return clean report text only, no JSON, no code fences. Keep it ethical, practical, and non-fatalistic.`,
      `Create a concise ${body.reportType} consultation report.
Client: ${body.clientName}
Birth details: ${body.birthDetails}
Focus question: ${body.focusQuestion}
Use sections: Summary, Chart themes, Timing guidance, Practical advice, Remedy suggestions, Disclaimer.`,
      fallback
    );
    return ok({ report });
  } catch (error) {
    return handleApiError(error);
  }
}

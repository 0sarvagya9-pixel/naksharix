import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok, handleApiError, validateJson } from "@/lib/api";
import { buildMemory, chatWithAstrologerAI, isGeminiConfigured, parseAstrologyChat } from "@/lib/ai/gemini";
import { checkRateLimit } from "@/lib/rate-limit";
import { readLanguageFromRequest, toAiLanguage, translatedApiMessage } from "@/lib/server-language";

const schema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) })).min(1).max(24),
  language: z.union([z.enum(["English", "Hindi", "Hinglish"]), z.enum(["en", "hi", "hinglish"])]).optional(),
  kundliContext: z.string().max(4000).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await validateJson(request, schema);
    const language = readLanguageFromRequest(request, body.language);
    const aiLanguage = toAiLanguage(language);
    const limitResponse = await checkRateLimit({ request, key: "ai-chat", limit: 20, windowSeconds: 60 * 60 * 24, language });
    if (limitResponse) return limitResponse;
    if (!isGeminiConfigured()) {
      return fail(translatedApiMessage(language, "aiChatNotConfigured"), 503);
    }

    const parsed = parseAstrologyChat(body.messages, body.kundliContext);
    const memory = buildMemory(body.kundliContext, parsed);
    const answer = await chatWithAstrologerAI({
      messages: body.messages,
      language: aiLanguage,
      kundliContext: memory,
      parsedContext: parsed
    });
    return ok({ answer, memory, parsed });
  } catch (error) {
    return handleApiError(error);
  }
}

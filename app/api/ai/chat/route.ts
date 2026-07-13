import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok, handleApiError, validateJson } from "@/lib/api";
import { buildMemory, isGeminiConfigured, parseAstrologyChat } from "@/lib/ai/gemini";
import { chatWithAstrologerAIStrict, isGeminiChatProviderError } from "@/lib/ai/gemini-chat";
import { aiFeatureParkedResponse, isAiAstrologerEnabled } from "@/lib/ai/feature-status";
import { checkRateLimit } from "@/lib/rate-limit";
import { readLanguageFromRequest, toAiLanguage, translatedApiMessage } from "@/lib/server-language";

const schema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) })).min(1).max(24),
  language: z.union([z.enum(["English", "Hindi", "Hinglish"]), z.enum(["en", "hi", "hinglish"])]).optional(),
  kundliContext: z.string().max(4000).optional()
});

export async function POST(request: NextRequest) {
  if (!isAiAstrologerEnabled()) return aiFeatureParkedResponse();

  let language = readLanguageFromRequest(request);

  try {
    const body = await validateJson(request, schema);
    language = readLanguageFromRequest(request, body.language);
    const aiLanguage = toAiLanguage(language);
    const limitResponse = await checkRateLimit({ request, key: "ai-chat", limit: 20, windowSeconds: 60 * 60 * 24, language });
    if (limitResponse) return limitResponse;
    if (!isGeminiConfigured()) return fail(translatedApiMessage(language, "aiChatNotConfigured"), 503);

    const parsed = parseAstrologyChat(body.messages, body.kundliContext);
    const memory = buildMemory(body.kundliContext, parsed);

    try {
      const answer = await chatWithAstrologerAIStrict({
        messages: body.messages,
        language: aiLanguage,
        kundliContext: memory,
        parsedContext: parsed
      });
      return ok({ answer, memory, parsed });
    } catch (error) {
      if (isGeminiChatProviderError(error)) {
        return fail(translatedApiMessage(language, "serviceUnavailable"), 503);
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error);
  }
}

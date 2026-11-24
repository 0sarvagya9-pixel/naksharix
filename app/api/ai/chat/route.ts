import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok, handleApiError, validateJson } from "@/lib/api";
import { buildMemory, isGeminiConfigured, parseAstrologyChat } from "@/lib/ai/gemini";
import { chatWithAstrologerAIStrict, isGeminiChatProviderError } from "@/lib/ai/gemini-chat";
import { aiFeatureParkedResponse, isAiAstrologerEnabled } from "@/lib/ai/feature-status";
import { checkRateLimit, rateLimitMessage } from "@/lib/rate-limit";
import { sharedRedisConfigured } from "@/lib/cache/redis-cache";
import { claimAnonymousAiQuota } from "@/lib/ai/anonymous-quota";
import { readLanguageFromRequest, toAiLanguage, translatedApiMessage } from "@/lib/server-language";
import {getCurrentUser} from "@/lib/auth/jwt";
import {creditUsageEnabled,creditSchemaReady,reserveAiCredit,finishAiCredit} from "@/lib/ai/credit-ledger";
import {validCreditIntent} from "@/lib/ai/credit-contract";

const schema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) })).min(1).max(24),
  language: z.union([z.enum(["English", "Hindi", "Hinglish"]), z.enum(["en", "hi", "hinglish"])]).optional(),
  kundliContext: z.string().max(4000).optional(),
  billing:z.enum(["free","credit"]).default("free"),
  creditRequestId:z.string().refine(validCreditIntent).optional(),
  consent:z.boolean().optional()
});

export async function POST(request: NextRequest) {
  if (!isAiAstrologerEnabled()) return aiFeatureParkedResponse();

  let language = readLanguageFromRequest(request);
  let reservation:{id:string;userId:string}|null=null;

  try {
    const body = await validateJson(request, schema);
    language = readLanguageFromRequest(request, body.language);
    const aiLanguage = toAiLanguage(language);
    if(body.billing==="credit"){
      if(body.consent!==true||!body.creditRequestId)return fail("Choose paid credit use and accept AI processing consent before sending.",422);
      if(!creditUsageEnabled()||!await creditSchemaReady())return fail("Paid AI responses are temporarily unavailable; no credit used.",503);
      if(body.messages.reduce((sum,m)=>sum+m.content.length,0)+(body.kundliContext?.length??0)>20000)return fail("Start a new chat to reduce the context length. No credit used.",422);
      const user=await getCurrentUser();if(!user)return fail("Sign in to use paid AI credits.",401);
      const claim=await reserveAiCredit(user.id,body.creditRequestId);
      if(claim.kind!=="reserved")return fail(claim.kind==="empty"?"No available paid credits.":claim.kind==="account"?"A verified customer account is required.":claim.kind==="limit"?"Daily credit response attempt limit reached.": "A previous response request exists or is still running. Review your balance before sending again.",claim.kind==="empty"?402:claim.kind==="account"?403:claim.kind==="limit"?429:409);
      reservation={id:claim.id,userId:user.id};
    } else if (sharedRedisConfigured()) {
      // A configured Redis provider remains the low-latency shared counter;
      // provider failure is not downgraded to a local memory counter.
      const limitResponse = await checkRateLimit({ request, key: "ai-chat", limit: 20, windowSeconds: 60 * 60 * 24, language });
      if (limitResponse) return limitResponse;
    } else {
      // Without Redis, a serialized, HMAC-anonymized DB audit claim protects
      // all server instances before any chargeable external AI inference.
      if (!await claimAnonymousAiQuota(request)) return fail(rateLimitMessage(language), 429);
    }
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
      if(reservation){
        if(!await finishAiCredit(reservation.userId,reservation.id,true))return fail("Credit reservation expired or was withdrawn. No new response debit was made.",409);
        reservation=null;
      }
      return ok({ answer, memory, parsed,creditUsed:body.billing==="credit"?1:0 });
    } catch (error) {
      if (isGeminiChatProviderError(error)) {
        return fail(translatedApiMessage(language, "serviceUnavailable"), 503);
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error);
  } finally {
    // Provider error, validation interruption or blocked output releases the reserved unit.
    // A terminated process is recovered by the five-minute reservation lease.
    if(reservation)await finishAiCredit(reservation.userId,reservation.id,false).catch(()=>false);
  }
}

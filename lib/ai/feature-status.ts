import "server-only";
import { fail } from "@/lib/api";
import { env } from "@/lib/env";

export function isGeminiKeyConfigured() {
  return Boolean(env.GEMINI_API_KEY && !env.GEMINI_API_KEY.startsWith("your_"));
}

export function isAiAstrologerEnabled() {
  return env.AI_ASTROLOGER_ENABLED === "true";
}

export function isAiAstrologerReady() {
  return isAiAstrologerEnabled() && isGeminiKeyConfigured();
}

export function isAiReportGeneratorEnabled() {
  return env.AI_REPORT_GENERATOR_ENABLED === "true";
}

export function areAiDiagnosticsEnabled() {
  return env.NODE_ENV !== "production" && env.ALLOW_AI_DIAGNOSTICS === "true";
}

export function aiFeatureParkedResponse() {
  return fail("AI guidance is temporarily unavailable. Please use Kundli, reports, or consultation services meanwhile.", 503);
}

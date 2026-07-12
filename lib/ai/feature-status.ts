import "server-only";
import { fail } from "@/lib/api";
import { env } from "@/lib/env";

export function isAiAstrologerEnabled() {
  return env.AI_ASTROLOGER_ENABLED === "true";
}

export function areAiDiagnosticsEnabled() {
  return env.NODE_ENV !== "production" && env.ALLOW_AI_DIAGNOSTICS === "true";
}

export function aiFeatureParkedResponse() {
  return fail("AI features are temporarily unavailable while reliability and safety improvements are completed.", 503);
}

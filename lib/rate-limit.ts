import "server-only";

import { fail } from "@/lib/api";
import { cacheIncrement } from "@/lib/cache";

type RateLimitOptions = {
  request: Request;
  key: string;
  limit: number;
  windowSeconds: number;
  language?: "en" | "hi" | "hinglish";
};

export function rateLimitMessage(language: RateLimitOptions["language"] = "en") {
  if (language === "hi") return "आपने आज की मुफ्त सीमा पूरी कर ली है।";
  if (language === "hinglish") return "Aapne aaj ki free limit complete kar li hai.";
  return "You have reached today's free limit.";
}

export async function checkRateLimit({ request, key, limit, windowSeconds, language = "en" }: RateLimitOptions) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  const count = await cacheIncrement(`rate:${key}:${ip}`, windowSeconds);
  if (count > limit) return fail(rateLimitMessage(language), 429);
  return null;
}

export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const count = await cacheIncrement(`rate:${key}`, windowSeconds);
  return { allowed: count <= limit, count, limit, remaining: Math.max(0, limit - count) };
}

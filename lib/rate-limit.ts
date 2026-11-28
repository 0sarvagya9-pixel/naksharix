import "server-only";

import { fail } from "@/lib/api";
import { cacheIncrement } from "@/lib/cache";
import {sharedRedisConfigured} from "@/lib/cache/redis-cache";
import {durableRateCount} from "@/lib/security/durable-rate-counter";
import {trustedPublicClientIp} from "@/lib/auth/public-quota";

async function sharedCount(key:string,ttlSeconds:number){
  if(sharedRedisConfigured()||process.env.NODE_ENV!=="production")return cacheIncrement(key,ttlSeconds);
  return (await durableRateCount(key,ttlSeconds)).count;
}

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
  const ip=trustedPublicClientIp(request);
  const count = await sharedCount(`rate:${key}:${ip}`, windowSeconds);
  if (count > limit) return fail(rateLimitMessage(language), 429);
  return null;
}

export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const count = await sharedCount(`rate:${key}`, windowSeconds);
  return { allowed: count <= limit, count, limit, remaining: Math.max(0, limit - count) };
}

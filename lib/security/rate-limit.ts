import "server-only";
import { NextRequest } from "next/server";
import { fail } from "@/lib/api";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

export function getRequestIp(request: NextRequest | Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(options: RateLimitOptions) {
  const now = Date.now();
  const existing = buckets.get(options.key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(options.key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.limit - 1, resetAt: now + options.windowMs };
  }

  if (existing.count >= options.limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: options.limit - existing.count, resetAt: existing.resetAt };
}

export function rateLimitResponse(name: string, key: string, limit: number, windowMs: number) {
  const result = checkRateLimit({ key: `${name}:${key}`, limit, windowMs });
  if (result.allowed) return null;
  return fail("Too many requests. Please wait before trying again.", 429, {
    retryAfterSeconds: Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))
  });
}

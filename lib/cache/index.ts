import "server-only";

import { memoryGet, memoryIncrement, memorySet } from "@/lib/cache/memory-cache";
import { redisGet, redisIncrement, redisSet, sharedRedisConfigured } from "@/lib/cache/redis-cache";

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    return await redisGet<T>(key) ?? await memoryGet<T>(key);
  } catch {
    return memoryGet<T>(key);
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number) {
  try {
    const saved = await redisSet(key, value, ttlSeconds);
    if (saved) return;
  } catch {
    // Fall through to memory cache.
  }
  await memorySet(key, value, ttlSeconds);
}

export async function cacheGetOrSet<T>(key: string, ttlSeconds: number, factory: () => Promise<T>) {
  const cached = await cacheGet<T>(key);
  if (cached) return { value: cached, cacheStatus: "HIT" as const };
  const value = await factory();
  await cacheSet(key, value, ttlSeconds);
  return { value, cacheStatus: "MISS" as const };
}

export async function cacheIncrement(key: string, ttlSeconds: number) {
  // Never silently weaken a configured distributed rate limit to per-instance
  // memory after the shared provider fails. Callers must fail closed instead.
  if (sharedRedisConfigured()) {
    const result = await redisIncrement(key, ttlSeconds);
    if (result === null) throw new Error("Shared Redis unavailable for rate limiting");
    return result;
  }
  // Unconfigured local/dev mode continues to support non-distributed counters;
  // Admin Readiness explicitly reports that production is not fully protected.
  return memoryIncrement(key, ttlSeconds);
}

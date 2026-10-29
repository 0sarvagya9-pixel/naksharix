import "server-only";
import Redis from "ioredis";
import { env } from "@/lib/env";

const globalForRedis = globalThis as unknown as { redis?: Redis };

export function getRedis() {
  if (!env.REDIS_URL) return undefined;
  if (!globalForRedis.redis) {
    const client = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 1000,
      retryStrategy: () => null
    });
    client.on("error", () => undefined);
    globalForRedis.redis = client;
  }
  return globalForRedis.redis;
}

export async function cached<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
  const redis = getRedis();
  if (!redis) return factory();
  try {
    const hit = await redis.get(key);
    if (hit !== null) return JSON.parse(hit) as T;
  } catch {
    // A cache read failure must not prevent the primary operation.
  }

  // Execute the real operation exactly once. A Redis write failure must
  // never duplicate an expensive generation or a potentially stateful call.
  const value = await factory();
  try {
    await redis.set(key, JSON.stringify(value), "EX", Math.max(1, Math.floor(ttlSeconds)));
  } catch {
    // Cache is best effort; the successful result remains authoritative.
  }
  return value;
}

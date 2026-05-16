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
    if (hit) return JSON.parse(hit) as T;
    const value = await factory();
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    return value;
  } catch {
    return factory();
  }
}

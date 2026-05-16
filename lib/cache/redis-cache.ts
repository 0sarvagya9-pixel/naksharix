import "server-only";

import { getRedis } from "@/lib/redis";

export async function redisGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  const value = await redis.get(key);
  return value ? JSON.parse(value) as T : null;
}

export async function redisSet<T>(key: string, value: T, ttlSeconds: number) {
  const redis = getRedis();
  if (!redis) return false;
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  return true;
}

export async function redisIncrement(key: string, ttlSeconds: number) {
  const redis = getRedis();
  if (!redis) return null;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, ttlSeconds);
  return count;
}

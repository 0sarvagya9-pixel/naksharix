import "server-only";
import { env } from "@/lib/env";
import { getRedis } from "@/lib/redis";

// A single Lua invocation keeps INCR and the first EXPIRE atomic in both
// supported Redis transports, even under parallel, multi-instance traffic.
const ATOMIC_INCREMENT = "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); end; return n";

const restUrl = env.UPSTASH_REDIS_REST_URL;
const restToken = env.UPSTASH_REDIS_REST_TOKEN;
export function sharedRedisConfigured() {
  return Boolean(env.REDIS_URL || (restUrl && restToken));
}

async function restCommand(command: (string | number)[]): Promise<unknown> {
  if (!restUrl || !restToken) throw new Error("Redis REST provider not configured");
  const url = new URL(restUrl);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("Redis REST endpoint must be a credential-free HTTPS URL");
  }
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + restToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(3500)
  });
  if (!response.ok) throw new Error("Redis REST rejected request: HTTP " + response.status);
  const result = await response.json() as {result?: unknown;error?: unknown};
  if (result.error !== undefined || !Object.prototype.hasOwnProperty.call(result, "result")) {
    throw new Error("Redis REST response rejected");
  }
  return result.result;
}

export async function redisPing(): Promise<boolean> {
  try {
    const tcp = getRedis();
    if (tcp) return (await tcp.ping()) === "PONG";
    if (!restUrl || !restToken) return false;
    return (await restCommand(["PING"])) === "PONG";
  } catch {
    return false;
  }
}

export async function redisGet<T>(key: string): Promise<T | null> {
  const tcp = getRedis();
  if (tcp) {
    const value = await tcp.get(key);
    return value === null ? null : JSON.parse(value) as T;
  }
  if (!restUrl || !restToken) return null;
  const value = await restCommand(["GET",key]);
  if (value === null) return null;
  if (typeof value !== "string") throw new Error("Redis cache value is not a serialized string");
  return JSON.parse(value) as T;
}

export async function redisSet<T>(key: string, value: T, ttlSeconds: number): Promise<boolean> {
  const tcp = getRedis();
  const ttl = Math.max(1, Math.floor(ttlSeconds));
  if (tcp) return (await tcp.set(key, JSON.stringify(value), "EX", ttl)) === "OK";
  if (!restUrl || !restToken) return false;
  return (await restCommand(["SET",key,JSON.stringify(value),"EX",ttl])) === "OK";
}

export async function redisIncrement(key: string, ttlSeconds: number): Promise<number | null> {
  const ttl = Math.max(1, Math.floor(ttlSeconds));
  const tcp = getRedis();
  const value = tcp ? await tcp.eval(ATOMIC_INCREMENT, 1, key, String(ttl))
    : restUrl && restToken ? await restCommand(["EVAL",ATOMIC_INCREMENT,1,key,String(ttl)])
    : null;
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) throw new Error("Redis increment invalid response");
  return value;
}

import "server-only";

type Entry = { value: string; expiresAt: number };

const globalForCache = globalThis as unknown as { naksharixMemoryCache?: Map<string, Entry> };
const store = globalForCache.naksharixMemoryCache ?? new Map<string, Entry>();
globalForCache.naksharixMemoryCache = store;

export async function memoryGet<T>(key: string): Promise<T | null> {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }
  return JSON.parse(entry.value) as T;
}

export async function memorySet<T>(key: string, value: T, ttlSeconds: number) {
  store.set(key, { value: JSON.stringify(value), expiresAt: Date.now() + ttlSeconds * 1000 });
}

export async function memoryIncrement(key: string, ttlSeconds: number) {
  const current = await memoryGet<{ count: number }>(key);
  const next = { count: (current?.count ?? 0) + 1 };
  await memorySet(key, next, ttlSeconds);
  return next.count;
}

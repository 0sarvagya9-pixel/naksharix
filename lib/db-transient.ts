// Public read-only fallback classification. Never use this to retry writes or payments.
// A transient outage must not silently create a price, booking or captured payment.
const transientCodes = new Set(["P1001", "P1002", "P1008", "P1017"]);

export function isTransientDatabaseError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const value = error as { code?: unknown; errorCode?: unknown; name?: unknown; message?: unknown };
  if (typeof value.code === "string" && transientCodes.has(value.code)) return true;
  if (typeof value.errorCode === "string" && transientCodes.has(value.errorCode)) return true;
  return value.name === "PrismaClientInitializationError"
    && typeof value.message === "string"
    && /can't reach database server|server has closed|connection refused|connection timed out|connect timed out|ECONNREFUSED|ENOTFOUND|EAI_AGAIN/i.test(value.message);
}

// Respect explicit operator values. Only tune cold-start timeouts for Neon.
// Never log or return the connection URL to clients.
export function neonRuntimeDatabaseUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (!["postgres:", "postgresql:"].includes(url.protocol) ||
        !url.hostname.endsWith(".neon.tech")) return undefined;
    if (!url.searchParams.has("connect_timeout")) url.searchParams.set("connect_timeout", "15");
    if (!url.searchParams.has("pool_timeout")) url.searchParams.set("pool_timeout", "15");
    return url.toString();
  } catch {
    return undefined;
  }
}

// A single retry is permitted for SELECT-only operations, never for mutations.
export async function retryTransientDatabaseRead<T>(read: () => Promise<T>): Promise<T> {
  try {
    return await read();
  } catch (error) {
    if (!isTransientDatabaseError(error)) throw error;
    return read();
  }
}

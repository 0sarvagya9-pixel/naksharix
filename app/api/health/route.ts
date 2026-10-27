import { ok } from "@/lib/api";
import { prisma } from "@/lib/db";
import { redisPing, sharedRedisConfigured } from "@/lib/cache/redis-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, "ok" | "error" | "skipped"> = {
    app: "ok",
    database: "skipped",
    redis: "skipped"
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  if (sharedRedisConfigured()) {
    checks.redis = await redisPing() ? "ok" : "error";
  }

  const healthy = checks.app === "ok" && checks.database === "ok" && checks.redis !== "error";
  return ok(
    {
      status: healthy ? "ok" : "degraded",
      service: "naksharix",
      checks,
      timestamp: new Date().toISOString()
    },
    { status: healthy ? 200 : 503 }
  );
}

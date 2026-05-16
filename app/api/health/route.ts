import { ok } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getRedis } from "@/lib/redis";

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

  const redis = getRedis();
  if (redis) {
    try {
      await redis.ping();
      checks.redis = "ok";
    } catch {
      checks.redis = "error";
    }
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

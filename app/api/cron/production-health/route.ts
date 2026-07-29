import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getRedis } from "@/lib/redis";
import { getEmailReadiness } from "@/lib/email/email-service";
import { isAiAstrologerEnabled, isAiAstrologerReady } from "@/lib/ai/feature-status";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    app: true,
    database: false,
    redis: "not_configured" as "ok" | "error" | "not_configured",
    email: false,
    ai: false,
    lockedScope: false
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    checks.database = false;
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

  const email = getEmailReadiness();
  checks.email = email.provider === "smtp" && email.emailEnabled;
  checks.ai = isAiAstrologerEnabled() && isAiAstrologerReady();
  checks.lockedScope =
    env.SUBSCRIPTIONS_ENABLED === "false" &&
    env.AI_REPORT_GENERATOR_ENABLED === "false" &&
    env.ALLOW_AI_DIAGNOSTICS === "false";

  const healthy =
    checks.app &&
    checks.database &&
    checks.redis !== "error" &&
    checks.email &&
    checks.ai &&
    checks.lockedScope;

  return NextResponse.json(
    {
      data: {
        status: healthy ? "ok" : "degraded",
        checks,
        deployment: {
          sha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
          branch: process.env.VERCEL_GIT_COMMIT_REF ?? null
        },
        checkedAt: new Date().toISOString()
      }
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow"
      }
    }
  );
}

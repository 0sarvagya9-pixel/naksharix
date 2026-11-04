import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { redisPing, sharedRedisConfigured } from "@/lib/cache/redis-cache";
import { getEmailReadiness } from "@/lib/email/email-service";
import { isAiAstrologerEnabled, isAiAstrologerReady, isAiReportGeneratorEnabled, isGeminiKeyConfigured } from "@/lib/ai/feature-status";
import { getSchemaReadiness } from "@/lib/ops/schema-readiness";

import { authorizedRecoveryRequest, runDailyRecovery } from "@/lib/ops/daily-recovery";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const checks = {
    app: true,
    database: false,
    databaseSchema: false,
    redis: "not_configured" as "ok" | "error" | "not_configured",
    email: false,
    ai: false,
    aiDraft: false,
    lockedScope: false
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    checks.database = false;
  }

  checks.databaseSchema = (await getSchemaReadiness().catch(() => null))?.ready === true;

  if (sharedRedisConfigured()) {
    checks.redis = await redisPing() ? "ok" : "error";
  }

  const email = getEmailReadiness();
  checks.email = email.provider === "smtp" && email.emailEnabled;
  checks.ai = !isAiAstrologerEnabled() || isAiAstrologerReady();
  checks.aiDraft = !isAiReportGeneratorEnabled() || isGeminiKeyConfigured();
  checks.lockedScope =
    env.SUBSCRIPTIONS_ENABLED === "false" &&
    env.ALLOW_AI_DIAGNOSTICS === "false";

  const healthy =
    checks.app &&
    checks.database &&
    checks.databaseSchema &&
    checks.redis !== "error" &&
    checks.email &&
    checks.ai && checks.aiDraft &&
    checks.lockedScope;

  let recovery: unknown = undefined;
  let recoveryFailed = false;
  if (process.env.BACKUP_ENABLED === "true" && authorizedRecoveryRequest(request)) {
    try { recovery = await runDailyRecovery(); }
    catch { recoveryFailed = true; recovery = { status: "failed" }; }
  }

  return NextResponse.json(
    {
      data: {
        status: healthy && !recoveryFailed ? "ok" : "degraded",
        checks,
        ...(recovery ? { recovery } : {}),
        deployment: {
          sha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
          branch: process.env.VERCEL_GIT_COMMIT_REF ?? null
        },
        checkedAt: new Date().toISOString()
      }
    },
    {
      status: healthy && !recoveryFailed ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow"
      }
    }
  );
}

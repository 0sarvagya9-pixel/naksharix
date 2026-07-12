import { fail, ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { getEmailReadiness } from "@/lib/email/email-service";
import { env } from "@/lib/env";
import { getMonitoringReadiness } from "@/lib/monitoring/logger";
import { getRazorpayReadiness } from "@/lib/payments/readiness";
import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) return fail("Not found", 404);

  let database: "ok" | "error" = "error";
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "ok";
  } catch {
    database = "error";
  }

  const redisClient = getRedis();
  let redis: "ok" | "error" | "not_configured" = redisClient ? "error" : "not_configured";
  if (redisClient) {
    try {
      await redisClient.ping();
      redis = "ok";
    } catch {
      redis = "error";
    }
  }

  const email = getEmailReadiness();
  const payments = getRazorpayReadiness();
  const monitoring = getMonitoringReadiness();

  return ok({
    app: {
      productionUrlUsesHttps: env.NEXT_PUBLIC_APP_URL.startsWith("https://"),
      astrologyProvider: env.ASTROLOGY_PROVIDER,
      mockProviderBlocked: env.NODE_ENV === "production" && env.ASTROLOGY_PROVIDER !== "mock",
      reportStorageDriver: env.REPORT_STORAGE_DRIVER
    },
    services: {
      database,
      redis,
      email: {
        provider: email.provider,
        enabled: email.emailEnabled,
        deliveryMode: email.deliveryMode,
        missing: email.missing
      },
      razorpay: {
        enabled: payments.enabled,
        scope: payments.scope,
        missing: payments.missing
      },
      ai: {
        enabled: env.AI_ASTROLOGER_ENABLED === "true",
        diagnosticsEnabled: env.ALLOW_AI_DIAGNOSTICS === "true"
      },
      monitoring: {
        provider: monitoring.provider,
        sentryConfigured: monitoring.sentryConfigured,
        safeMetadataOnly: monitoring.safeMetadataOnly
      }
    },
    checkedAt: new Date().toISOString()
  }, { status: database === "ok" ? 200 : 503 });
}

import { fail, ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { getEmailReadiness } from "@/lib/email/email-service";
import { env } from "@/lib/env";
import { getMonitoringReadiness } from "@/lib/monitoring/logger";
import { getRazorpayReadiness } from "@/lib/payments/readiness";
import { redisPing, sharedRedisConfigured } from "@/lib/cache/redis-cache";
import { getSchemaReadiness } from "@/lib/ops/schema-readiness";
import { getCommercialReadiness } from "@/lib/ops/commercial-readiness";

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

  const redis: "ok" | "error" | "not_configured" = !sharedRedisConfigured()
    ? "not_configured" : await redisPing() ? "ok" : "error";

  let schema: Awaited<ReturnType<typeof getSchemaReadiness>> | null = null;
  try { schema = await getSchemaReadiness(); } catch { schema = null; }
  const email = getEmailReadiness();
  const payments = getRazorpayReadiness();
  const monitoring = getMonitoringReadiness();
  const commercial = await getCommercialReadiness();

  return ok({
    app: {
      productionUrlUsesHttps: env.NEXT_PUBLIC_APP_URL.startsWith("https://"),
      astrologyProvider: env.ASTROLOGY_PROVIDER,
      mockProviderBlocked: env.NODE_ENV === "production" && env.ASTROLOGY_PROVIDER !== "mock",
      reportStorageDriver: env.REPORT_STORAGE_DRIVER
    },
    services: {
      database,
      databaseSchema: { ready: schema?.ready ?? false, checks: schema?.checks ?? [], missingCount: schema?.missingCount ?? 2 },
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
    commercial,
    checkedAt: new Date().toISOString()
  }, { status: database === "ok" ? 200 : 503 });
}

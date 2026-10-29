import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { sharedRedisConfigured } from "@/lib/cache/redis-cache";
import { getEmailReadiness } from "@/lib/email/email-service";
import { getMonitoringReadiness } from "@/lib/monitoring/logger";
import { getReportStorageReadiness } from "@/lib/storage/report-storage";
import { getActiveAstrologyProviderName } from "@/lib/astrology/provider";
import { isAiAstrologerEnabled, isAiAstrologerReady } from "@/lib/ai/feature-status";
import { getSchemaReadiness } from "@/lib/ops/schema-readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const schema = await getSchemaReadiness().catch(() => null);
  const email = getEmailReadiness();
  const monitoring = getMonitoringReadiness();
  const storage = getReportStorageReadiness();
  // Next.js sets NODE_ENV=production for optimized preview builds too.
  // Prefer the actual Vercel target to avoid falsely labeling previews as live production.
  const runtimeEnvironment = process.env.VERCEL_ENV?.trim() || env.NODE_ENV;

  const data = {
    service: "naksharix",
    environment: runtimeEnvironment,
    deployment: {
      sha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      branch: process.env.VERCEL_GIT_COMMIT_REF ?? null
    },
    capabilities: {
      astrologyProvider: getActiveAstrologyProviderName(),
      aiAstrologer: {
        enabled: isAiAstrologerEnabled(),
        ready: isAiAstrologerReady()
      },
      subscriptionsEnabled: env.SUBSCRIPTIONS_ENABLED === "true",
      aiReportGeneratorEnabled: env.AI_REPORT_GENERATOR_ENABLED === "true",
      shopMode: "market_priced_unpaid_order_requests"
    },
    services: {
      databaseSchema: { ready: schema?.ready ?? false, missingCount: schema?.missingCount ?? 2 },
      email: {
        provider: email.provider,
        enabled: email.emailEnabled,
        deliveryMode: email.deliveryMode,
        missingCount: email.missing.length
      },
      redis: {
        configured: sharedRedisConfigured()
      },
      monitoring: {
        provider: monitoring.provider,
        sentryConfigured: monitoring.sentryConfigured,
        sentryTransportConfigured: monitoring.sentryTransportConfigured,
        safeMetadataOnly: monitoring.safeMetadataOnly
      },
      reportStorage: {
        configuredDriver: storage.driver,
        activeDriver: storage.activeDriver,
        enabled: storage.enabled,
        missingCount: storage.missing.length
      }
    },
    privacy: {
      analyticsConfigured: Boolean(env.NEXT_PUBLIC_GA_ID),
      analyticsQueryStringExcluded: true,
      sensitiveLogMetadataFiltered: true
    },
    checkedAt: new Date().toISOString()
  };

  return NextResponse.json({ data }, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}

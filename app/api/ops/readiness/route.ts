import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getEmailReadiness } from "@/lib/email/email-service";
import { getMonitoringReadiness } from "@/lib/monitoring/logger";
import { getReportStorageReadiness } from "@/lib/storage/report-storage";
import { getActiveAstrologyProviderName } from "@/lib/astrology/provider";
import { isAiAstrologerEnabled, isAiAstrologerReady } from "@/lib/ai/feature-status";

export const dynamic = "force-dynamic";

export function GET() {
  const email = getEmailReadiness();
  const monitoring = getMonitoringReadiness();
  const storage = getReportStorageReadiness();
  const production = process.env.VERCEL_ENV === "production" || env.NODE_ENV === "production";

  const data = {
    service: "naksharix",
    environment: production ? "production" : env.NODE_ENV,
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
      shopMode: "informational_enquiry_only"
    },
    services: {
      email: {
        provider: email.provider,
        enabled: email.emailEnabled,
        deliveryMode: email.deliveryMode,
        missingCount: email.missing.length
      },
      redis: {
        configured: Boolean(env.REDIS_URL)
      },
      monitoring: {
        provider: monitoring.provider,
        sentryConfigured: monitoring.sentryConfigured,
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

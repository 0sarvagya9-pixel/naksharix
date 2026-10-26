import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { requireAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { getRedis } from "@/lib/redis";
import { getEmailReadiness } from "@/lib/email/email-service";
import { getMonitoringReadiness } from "@/lib/monitoring/logger";
import { getSchemaReadiness } from "@/lib/ops/schema-readiness";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...seo({
    title: "System Readiness - Naksharix Admin",
    description: "Read-only operational readiness overview for authorized administrators.",
    path: "/admin/readiness"
  }),
  robots: { index: false, follow: false }
};

type Status = "ok" | "missing" | "error" | "unknown";
type Check = { name: string; status: Status; note: string };

export default async function AdminReadinessPage() {
  await requireAdminRole();

  let database: Status = "error";
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "ok";
  } catch {
    database = "error";
  }

  const redisClient = getRedis();
  let redis: Status = redisClient ? "error" : "missing";
  if (redisClient) {
    try {
      await redisClient.ping();
      redis = "ok";
    } catch {
      redis = "error";
    }
  }

  let newTables: Awaited<ReturnType<typeof getSchemaReadiness>> | null = null;
  try { newTables = await getSchemaReadiness(); } catch { newTables = null; }
  const email = getEmailReadiness();
  const monitoring = getMonitoringReadiness();
  const emailStatus: Status = email.emailEnabled ? "ok" : "missing";

  const checks: Check[] = [
    {
      name: "Production database",
      status: database,
      note: "Read-only connectivity probe. This is not a backup or schema-drift verification."
    },
    {
      name: "Learning and Puja schema",
      status: !newTables ? "error" : newTables.ready ? "ok" : "missing",
      note: !newTables
        ? "Read-only schema inspection failed; release must be held."
        : newTables.ready
          ? "LearningProgress and PujaPartner with required indexes are present."
          : "Missing required objects: " + newTables.checks.filter((item) => !item.present).map((item) => item.object).join(", ") + ". Deploy only after verified backup, reviewed migration, and independent restore proof."
    },
    {
      name: "Distributed Redis",
      status: redis,
      note: redis === "ok"
        ? "Shared cache is reachable."
        : "Shared rate limiting cannot be assured across server instances without Redis."
    },
    {
      name: "Transactional email configuration",
      status: emailStatus,
      note: emailStatus === "ok"
        ? "Email adapter reports configured. Real inbox delivery requires a separate test."
        : "Email service is not configured as ready."
    },
    {
      name: "Exception monitoring",
      status: monitoring.sentryConfigured ? "unknown" : "missing",
      note: monitoring.sentryConfigured
        ? "Sentry configuration present; SDK transport and alert delivery still require verification."
        : "Safe console logger is available; central exception alerting is not confirmed."
    },
    {
      name: "Public Shop scope",
      status: "ok",
      note: "Shop is approved as catalogue and enquiry-only; no cart or automatic checkout."
    },
    {
      name: "Account verification and release parity",
      status: "unknown",
      note: "This page cannot certify live OTP delivery, migration history, or exact-SHA custom-domain deployment."
    }
  ];

  const releaseSha = process.env.VERCEL_GIT_COMMIT_SHA || "Not exposed by deployment";
  const releaseBranch = process.env.VERCEL_GIT_COMMIT_REF || "Not exposed by deployment";

  return (
    <main className="star-field">
      <Section>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Operations</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black">System Readiness</h1>
            <p className="mt-3 max-w-3xl naksh-muted-text">
              Current server-side checks for authorized administrators. Configuration is not equivalent to external-provider acceptance.
            </p>
          </div>
          <Button variant="outline" asChild><Link href="/admin">Back to Admin</Link></Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {checks.map((check) => (
            <Card key={check.name} className="glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3 text-lg">
                  <span>{check.name}</span>
                  <span className={
                    check.status === "ok" ? "text-sm text-[#00f5a0]" :
                    check.status === "error" ? "text-sm text-[#fb7185]" : "text-sm text-[#FFD700]"
                  }>{check.status.toUpperCase()}</span>
                </CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm leading-6 naksh-muted-text">{check.note}</p></CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-6 glass">
          <CardHeader><CardTitle>Build identity</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm naksh-muted-text">
            <p>Branch: <code className="break-all text-white">{releaseBranch}</code></p>
            <p>Commit: <code className="break-all text-white">{releaseSha}</code></p>
            <p>Generated: {new Date().toISOString()}</p>
            <p>Final acceptance requires independent exact-SHA, browser, restore and end-to-end tests.</p>
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}

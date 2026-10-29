import "server-only";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { redisPing, sharedRedisConfigured } from "@/lib/cache/redis-cache";
import { getMonitoringReadiness } from "@/lib/monitoring/logger";
import { getEmailReadiness } from "@/lib/email/email-service";
import type { CommercialReadiness } from "@/lib/ops/commercial-readiness";
import { indexableKundliGuideLanguages, kundliGuideLanguages } from "@/lib/kundli-education";
import { seoLocaleExpansion } from "@/lib/seo-localization";
import { ADSENSE_CLIENT, adsenseServingReady, getAdSensePlacement } from "@/lib/adsense";

type EvidenceStatus = "verified" | "action_required" | "external_evidence_required";
export type AcceptanceItem = {
  key: string; title: string; status: EvidenceStatus; evidence: string; href?: string;
};
export type AcceptancePhase = {
  id: "technical" | "business" | "monetization";
  title: string; ready: boolean; checks: AcceptanceItem[];
};
function item(key: string, title: string, status: EvidenceStatus, evidence: string, href?: string): AcceptanceItem {
  return { key, title, status, evidence, ...(href ? { href } : {}) };
}

/**
 * Read-only, admin-only operational acceptance aggregator.
 * Does not perform payments, send emails, authorize images, or modify DB schema.
 * Source tests cannot be promoted into real-world approval evidence.
 */
export async function getThreePhaseAcceptance(commercial: CommercialReadiness): Promise<{
  phases: AcceptancePhase[]; allPhasesVerified: boolean; generatedAt: string;
}> {
  const email = getEmailReadiness(), monitor = getMonitoringReadiness();
  const [history, ping] = await Promise.allSettled([
    // Fixed trusted SQL constant; never contains input, and never writes schema.
    prisma.$queryRaw<Array<{ present: boolean }>>`SELECT to_regclass('public._prisma_migrations') IS NOT NULL AS present`,
    sharedRedisConfigured() ? redisPing() : Promise.resolve(false)
  ]);
  const migrationsPresent = history.status === "fulfilled" && history.value[0]?.present === true;
  const redisReady = ping.status === "fulfilled" && ping.value === true;
  const drafted = kundliGuideLanguages.length - indexableKundliGuideLanguages.length;
  const roadmap = [...seoLocaleExpansion.indian, ...seoLocaleExpansion.international];
  const notWritten = roadmap.filter(code => !kundliGuideLanguages.some(v => String(v) === code)).length;
  const commercialGaps = commercial.checks.filter(v => v.status !== "ready");
  const configuredSlots = Boolean(getAdSensePlacement("kundli-guide") || getAdSensePlacement("kundli-learning"));

  const technical: AcceptanceItem[] = [
    item("locale-review", "Multilingual SEO editorial sign-off", "external_evidence_required",
      indexableKundliGuideLanguages.length + " indexable guides; " + drafted +
      " translation drafts deliberately noindex; " + notWritten +
      " future-language guides need actual native writing and review. Never create thin SEO doorways."),
    item("migrations", "Production Prisma migration lineage",
      migrationsPresent ? "external_evidence_required" : "action_required",
      migrationsPresent ? "Migration history exists, but exact schema checksum and audited baseline still need proof."
        : "Read-only check found no _prisma_migrations history. Production migration must NOT run blindly."),
    item("redis", "Distributed Redis provider", redisReady ? "verified" : "action_required",
      redisReady ? "Shared Redis responded to PING." : "Distributed Redis is not proven reachable; process memory is not a cross-instance security quota."),
    item("monitoring", "Central error monitoring", "external_evidence_required",
      monitor.sentryTransportConfigured
        ? "Privacy-minimized Sentry transport configured; actual provider receipt and on-call alert remain unverified."
        : "Privacy-safe structured console telemetry exists, but no verified centralized alert delivery."),
    item("analytics", "Consent-aware analytics", "external_evidence_required",
      env.NEXT_PUBLIC_GA_ID ? "Analytics identifier configured; verify consent, browser delivery and dashboard measurement."
        : "No verified analytics identifier, regional consent or actual dashboard data."),
    item("backups", "Automatic retained production backups", "external_evidence_required",
      "Disposable restore rehearsal does not establish a scheduled, retained production Neon recovery point or verified independent restore.")
  ];
  const business: AcceptanceItem[] = [
    item("catalogue", "Product/Puja/report catalogue evidence", commercialGaps.length ? "action_required" : "verified",
      commercialGaps.length ? commercialGaps.map(g => g.title + ": " + g.status).join("; ").slice(0, 950)
        : "Catalogue structure and administrative approvals present; real fulfilment still needs external proof.", "/admin/shop"),
    item("stock-shipping", "Supplier SKU photos, stock, courier, returns", "external_evidence_required",
      "Market-priced listings and licensed representative imagery are not exact inventory or proof of dispatch, product rights, delivery and refunds.", "/admin/shop"),
    item("operator-slots", "Pandit and astrologer capacity", "external_evidence_required",
      "Verify real partner identity, provider contract, available slot, booking confirmation and service completion independently.", "/admin/puja-partners"),
    item("manual-reports", "Specialist report fulfillment", "external_evidence_required",
      "Approved fees, sample requirements, real report operator and delivery SLA need actual business acceptance.", "/admin/manual-report-prices"),
    item("email-payment", "Real transactional email, payment and refund", "external_evidence_required",
      email.emailEnabled
        ? "Email adapter configured. Actual received message, gateway capture/webhook replay, refund and rollback still require controlled acceptance."
        : "Email provider unready; live inbox/payment/refund acceptance cannot be inferred from source.")
  ];
  const monetization: AcceptanceItem[] = [
    item("ads-ownership", "AdSense seller and live ads.txt", "external_evidence_required",
      ADSENSE_CLIENT + " owner screenshot previously showed ads.txt Authorized; current Google status must be checked directly."),
    item("ads-approval", "Google site Ready approval", "external_evidence_required",
      "Getting ready is not Ready. Only the Google AdSense owner dashboard can authorize live ad serving."),
    item("cmp", "Google-certified regional CMP", "external_evidence_required",
      "Publish and test certified IAB-TCF message for EEA/UK/Switzerland and relevant regional consent. A DIY cookie banner is not certification."),
    item("ad-slots", "Manual ad units and real impressions",
      adsenseServingReady() && configuredSlots ? "external_evidence_required" : "action_required",
      "Require Google-generated numeric unit IDs, explicit release flags, live consent acceptance and legitimate impressions; never self-click.")
  ];
  const phases: AcceptancePhase[] = [
    { id: "technical", title: "Phase 1 — Website and infrastructure", ready: technical.every(x => x.status === "verified"), checks: technical },
    { id: "business", title: "Phase 2 — Commerce and fulfilment", ready: commercial.readyForAutomaticPayments && business.every(x => x.status === "verified"), checks: business },
    { id: "monetization", title: "Phase 3 — Advertising and consent", ready: monetization.every(x => x.status === "verified"), checks: monetization }
  ];
  return { phases, allPhasesVerified: phases.every(p => p.ready), generatedAt: new Date().toISOString() };
}

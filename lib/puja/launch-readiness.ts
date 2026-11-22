import "server-only";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getEmailReadiness } from "@/lib/email/email-service";
import { getRazorpayReadiness } from "@/lib/payments/readiness";
import { getPublishedPujaOffers, type PublicPujaOffer } from "@/lib/puja/offerings";

/**
 * Global launch is OFF by default. An admin's "VERIFIED" record is only
 * operator-reviewed evidence; partner/date acceptance must be separately
 * recorded per booking. Only exact topic IDs in approved partner capabilities
 * count: a general "Puja" tradition must never enable all 94 services.
 */
export type PujaLaunchState = {
  enabled: boolean;
  reasons: string[];
  offers: Record<string, PublicPujaOffer>;
  approvedPartnerCount: number;
  readyServiceCount: number;
};
export function pujaReleaseFlagEnabled(): boolean {
  return env.PUJA_BOOKINGS_ENABLED === "true" && env.PUJA_PAYMENTS_ENABLED === "true";
}
export function partnerSupportsTopic(partner: {
  reviewStatus: string; reviewedAt?: Date | null; evidenceUrl?: string | null;
  traditions: string[];
}, topicId: string): boolean {
  return partner.reviewStatus === "VERIFIED" && !!partner.reviewedAt &&
    !!partner.evidenceUrl && partner.traditions.includes(topicId);
}
export async function getPujaLaunchState(inspectWhenPaused = false): Promise<PujaLaunchState> {
  const reasons: string[] = [];
  if (env.PUJA_BOOKINGS_ENABLED !== "true") reasons.push("Owner has not activated new Puja intake.");
  if (env.PUJA_PAYMENTS_ENABLED !== "true") reasons.push("Puja payment feature is disabled.");
  if (!getRazorpayReadiness().enabled) reasons.push("Razorpay acceptance is not configured.");
  if (!getEmailReadiness().emailEnabled) reasons.push("Customer and admin transactional email is not configured.");
  if (!env.ADMIN_EMAIL) reasons.push("Admin request-notification mailbox is not configured.");
  if (reasons.length && !inspectWhenPaused) return { enabled: false, reasons, offers: {}, approvedPartnerCount: 0, readyServiceCount: 0 };
  try {
    const [published, partners] = await Promise.all([
      getPublishedPujaOffers(),
      prisma.pujaPartner.findMany({
        where: { reviewStatus: "VERIFIED", reviewedAt: { not: null }, evidenceUrl: { not: null } },
        select: { id: true, reviewStatus: true, reviewedAt: true, evidenceUrl: true, traditions: true }
      })
    ]);
    const offers: Record<string, PublicPujaOffer> = {};
    for (const [topicId, offer] of Object.entries(published)) {
      // The existing one-merchant Puja checkout is owner-approved for ₹1,100
      // only; other draft amounts cannot create a charge or live listing.
      if (offer.pricePaise === 110000 && partners.some(partner => partnerSupportsTopic(partner, topicId))) {
        offers[topicId] = offer;
      }
    }
    if (!partners.length) reasons.push("No admin-reviewed Pandit with evidence is registered.");
    if (!Object.keys(offers).length) reasons.push("No ₹1,100 published Puja has a verified topic-specific Pandit.");
    return { enabled: reasons.length === 0, reasons, offers: reasons.length ? {} : offers,
      approvedPartnerCount: partners.length, readyServiceCount: Object.keys(offers).length };
  } catch {
    // No stale partner/offer cache. Database failure must disable new sales.
    return { enabled: false, reasons: ["Authoritative Puja availability could not be verified."],
      offers: {}, approvedPartnerCount: 0, readyServiceCount: 0 };
  }
}

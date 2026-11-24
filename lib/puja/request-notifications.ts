import "server-only";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email/email-service";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/monitoring/logger";
import { PUJA_STATUS_NOTICES } from "@/lib/puja/customer-notices";
import { shortlistPujaPartners } from "@/lib/puja/partner-shortlist";

/** Two minimal transactional notices; never forward private Sankalp/gotra or
 * user phone number to email lists. In-app order history stays authoritative. */
export async function notifyPujaRequestCreated(input: {
  id: string; userId: string; topicName: string; topicId: string; city: string;
}): Promise<{ customer: "accepted" | "unavailable"; admin: "accepted" | "unavailable" }> {
  const result: { customer: "accepted" | "unavailable"; admin: "accepted" | "unavailable" } =
    { customer: "unavailable", admin: "unavailable" };
  const tracking = new URL("/puja-bookings", env.NEXT_PUBLIC_APP_URL).toString();
  const status = PUJA_STATUS_NOTICES.REQUESTED;
  const customer = await prisma.user.findUnique({
    where: { id: input.userId }, select: { email: true }
  }).catch(() => null);
  if (customer?.email) {
    try {
      const sent = await sendEmail({
        to: customer.email,
        subject: "NAKSHARIX Puja request received — no payment due",
        idempotencyKey: "puja-request-user-" + input.id,
        text: [
          "Namaste,", "", status.hi, "", status.en,
          "Puja: " + input.topicName, "Request ID: " + input.id,
          "Track privately: " + tracking,
          "No booking or payment is confirmed by this message.",
          "Support: care@naksharix.com"
        ].join("\n")
      });
      if (sent.sent) result.customer = "accepted";
    } catch { logger.warn("puja_intake_customer_notice_failed"); }
  }
  // Only an explicitly configured administrative inbox receives the alert.
  // An email being accepted by Resend does not mean it arrived in an inbox.
  if (env.ADMIN_EMAIL) {
    try {
      const eligible = await prisma.pujaPartner.findMany({ where: { reviewStatus: "VERIFIED", reviewedAt: { not: null }, evidenceUrl: { not: null }, traditions: { has: input.topicId } }, select: { id: true, name: true, region: true, traditions: true }, take: 500, orderBy: { name: "asc" } }).catch(() => []);
      const shortlist = shortlistPujaPartners(eligible,input.topicId,input.city);
      const sent = await sendEmail({
        to: env.ADMIN_EMAIL, subject: "NAKSHARIX — new Puja request needs Pandit confirmation",
        idempotencyKey: "puja-request-admin-" + input.id,
        text: [
          "A new Puja request requires manual review.",
          "Puja: " + input.topicName, "Reference: " + input.id,
          "Check the authenticated admin queue: " + new URL("/admin/puja-bookings", env.NEXT_PUBLIC_APP_URL),
          "Verify Pandit capability, date/time, logistics and the price before inviting any payment.",
          shortlist.length ? "Verified matching candidates (contact individually; acceptance required): " + shortlist.map(p=>p.name+" ("+p.region+")").join(", ") : "No verified matching candidate found. Coordination team must arrange a suitable Pandit; keep the request pending.",
          "This alert is not a confirmation that a Pandit is assigned."
        ].join("\n")
      });
      if (sent.sent) result.admin = "accepted";
    } catch { logger.warn("puja_intake_admin_notice_failed"); }
  }
  return result;
}

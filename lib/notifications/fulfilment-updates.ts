import "server-only";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/email-service";
import { logger } from "@/lib/monitoring/logger";
import { env } from "@/lib/env";

type FulfilmentKind = "shop" | "puja";
export type FulfilmentNotice = {
  outcome: "provider_accepted" | "unavailable" | "recipient_missing" | "failed" | "not_needed";
};

// These are status notifications, not payment receipts or claims that a
// supplier, Pandit, courier, or mailbox delivery has been independently verified.
const subjects: Record<FulfilmentKind, string> = {
  shop: "Naksharix order status updated",
  puja: "Naksharix Puja booking status updated"
};
const statusMessages: Record<FulfilmentKind, Record<string, string>> = {
  shop: {
    CONFIRMED: "Your order has been confirmed by the Naksharix team.",
    PACKING: "Our team has marked your order as being packed.",
    DISPATCHED: "Our team has marked your order as dispatched. Check the tracking reference in your account.",
    DELIVERED: "Our team has marked your order as delivered. Please review the order in your account.",
    CANCELED: "Your order has been canceled. Check your account or contact support if you have questions."
  },
  puja: {
    CONFIRMED: "Your Puja request has been confirmed. Ceremony timing is coordinated separately.",
    SCHEDULED: "Your Puja ceremony has been scheduled. Review the confirmed date and time in your account.",
    IN_PROGRESS: "Your Puja ceremony is marked as in progress by the Naksharix team.",
    COMPLETED: "Your Puja ceremony is marked completed. Review any shared completion evidence in your account.",
    CANCELED: "Your Puja request has been canceled. Contact support if you need more details.",
    REJECTED: "Your Puja request could not be accepted. Please contact support for help."
  }
};

export function isNotifiableFulfilmentStatus(kind: FulfilmentKind, status: string): boolean {
  return Object.prototype.hasOwnProperty.call(statusMessages[kind], status);
}

export async function notifyCustomerOfFulfilmentChange(input: {
  kind: FulfilmentKind;
  userId: string;
  reference: string;
  oldStatus: string;
  status: string;
}): Promise<FulfilmentNotice> {
  if (input.status === input.oldStatus) return { outcome: "not_needed" };
  const description = statusMessages[input.kind][input.status];
  if (!description) return { outcome: "not_needed" };
  let email: string | undefined;
  try {
    const user = await prisma.user.findUnique({ where: { id: input.userId }, select: { email: true } });
    email = user?.email || undefined;
  } catch {
    logger.warn("fulfilment_notification_recipient_lookup_failed", { kind: input.kind });
    return { outcome: "failed" };
  }
  if (!email) return { outcome: "recipient_missing" };
  const trackingPath = input.kind === "shop" ? "/orders" : "/puja-bookings";
  try {
    const result = await sendEmail({
      to: email,
      subject: subjects[input.kind],
      text: [
        "Namaste,",
        "",
        description,
        `Reference: ${input.reference}`,
        `Status: ${input.status}`,
        `Track your request after signing in: ${env.NEXT_PUBLIC_APP_URL}${trackingPath}`,
        "",
        "This is a status notification, not a payment receipt or independent proof of delivery or ceremony completion.",
        "If something is incorrect, contact Naksharix support at care@naksharix.com.",
        "Do not reply with passwords, OTPs, complete birth details or payment credentials."
      ].join("\n")
    });
    if (!result.sent) {
      logger.warn("fulfilment_notification_unavailable", { kind: input.kind });
      return { outcome: result.missing.length ? "unavailable" : "failed" };
    }
    // Provider API acceptance does not guarantee actual inbox placement.
    logger.info("fulfilment_notification_provider_accepted", { kind: input.kind });
    return { outcome: "provider_accepted" };
  } catch {
    logger.warn("fulfilment_notification_send_failed", { kind: input.kind });
    return { outcome: "failed" };
  }
}

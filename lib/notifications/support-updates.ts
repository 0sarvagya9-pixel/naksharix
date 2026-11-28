import "server-only";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email/email-service";
import { logger } from "@/lib/monitoring/logger";
import { normalizeLocale } from "@/lib/i18n";
import { supportReplyEmail } from "@/lib/support/email-copy";

export type SupportMailOutcome =
  | "provider_accepted"
  | "provider_unavailable"
  | "recipient_missing"
  | "not_needed";

function supportUrl(admin: boolean) {
  const path = admin ? "/admin/support" : "/support";
  // Fixed destinations only: user-supplied ticket subjects and messages must
  // never become HTML, links or personally identifying email body content.
  return new URL(path, env.NEXT_PUBLIC_APP_URL).toString();
}

async function deliver(to: string | null | undefined, subject: string, text: string, idempotencyKey: string): Promise<SupportMailOutcome> {
  if (!to) return "recipient_missing";
  try {
    const result = await sendEmail({ to, subject, text, idempotencyKey });
    if (result.sent) {
      logger.info("support_notification_provider_accepted", { kind: subject.includes("New") ? "new_ticket" : "staff_reply" });
      return "provider_accepted";
    }
    logger.warn("support_notification_provider_unavailable", { missingCount: result.missing.length });
    return "provider_unavailable";
  } catch {
    logger.warn("support_notification_send_failed");
    return "provider_unavailable";
  }
}

/** Called exactly after a new authenticated support ticket is persisted. */
export async function notifySupportTeamOfNewTicket(ticketId: string): Promise<SupportMailOutcome> {
  if (!ticketId || !env.ADMIN_EMAIL) return "recipient_missing";
  return deliver(env.ADMIN_EMAIL, "Naksharix Support: New customer ticket", [
    "A new customer support ticket is awaiting review.",
    `Reference: ${ticketId}`,
    `Open your authenticated admin support desk: ${supportUrl(true)}`,
    "",
    "Customer details and message content are available only after you sign in.",
    "Provider acceptance of this message does not prove inbox delivery."
  ].join("\n"), "naksharix/support-new/" + ticketId);
}

/** Called only for an admin reply persisted once, never for client retry replays. */
export async function notifyCustomerOfSupportReply(ticketId: string, clientMutationId: string): Promise<SupportMailOutcome> {
  let recipient: string | null | undefined;
  let locale = normalizeLocale("en");
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }, select: { user: { select: { email: true, locale: true } } }
    });
    recipient = ticket?.user?.email;
    locale = normalizeLocale(ticket?.user?.locale);
  } catch {
    logger.warn("support_notification_recipient_lookup_failed");
    return "provider_unavailable";
  }
  const copy = supportReplyEmail(locale, ticketId, supportUrl(false));
  return deliver(recipient, copy.subject, copy.text, "naksharix/support-reply/" + ticketId + "/" + clientMutationId);
}

import "server-only";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/email-service";
import { logger } from "@/lib/monitoring/logger";
import { env } from "@/lib/env";
import { normalizeLocale, type Locale } from "@/lib/i18n";
import { fulfilmentStatusEmail, isNotifiableFulfilmentStatus as canNotify, type FulfilmentKind } from "@/lib/notifications/fulfilment-email-copy";
import {notifyAccountUpdate} from "@/lib/notifications/web-push";

export type FulfilmentNotice = {
  outcome: "provider_accepted" | "unavailable" | "recipient_missing" | "failed" | "not_needed";
};

// These are status notifications, not payment receipts or claims that a
// supplier, Pandit, courier, or mailbox delivery has been independently verified.
export function isNotifiableFulfilmentStatus(kind: FulfilmentKind, status: string): boolean {
  return canNotify(kind,status);
}

export async function notifyCustomerOfFulfilmentChange(input: {
  kind: FulfilmentKind;
  userId: string;
  reference: string;
  oldStatus: string;
  status: string;
}): Promise<FulfilmentNotice> {
  if (input.status === input.oldStatus) return { outcome: "not_needed" };
  if (!isNotifiableFulfilmentStatus(input.kind,input.status)) return { outcome: "not_needed" };
  // The caller persists actual fulfilment state first. Reconfirm ownership/status before generic push.
  if(env.WEB_PUSH_ENABLED==="true"){
    const current=input.kind==="puja"?await prisma.pujaBookingRequest.findFirst({where:{id:input.reference,userId:input.userId,status:input.status},select:{id:true}}).catch(()=>null):await prisma.shopOrder.findFirst({where:{id:input.reference,userId:input.userId,status:input.status},select:{id:true}}).catch(()=>null);
    if(current)await notifyAccountUpdate({userId:input.userId,kind:input.kind,reference:input.reference,status:input.status});
  }
  let email: string | undefined;
  let locale: Locale = "en";
  try {
    const user = await prisma.user.findUnique({ where: { id: input.userId }, select: { email: true, locale: true } });
    email = user?.email || undefined;
    locale = normalizeLocale(user?.locale);
  } catch {
    logger.warn("fulfilment_notification_recipient_lookup_failed", { kind: input.kind });
    return { outcome: "failed" };
  }
  if (!email) return { outcome: "recipient_missing" };
  let scheduledAt: Date | null = null;
  if (input.kind === "puja") {
    const booking = await prisma.pujaBookingRequest.findFirst({
      where: {id:input.reference,userId:input.userId},
      select: {scheduledAt:true,topicId:true}
    }).catch(() => null);
    scheduledAt = booking?.scheduledAt ?? null;
  }
  const trackingPath = input.kind === "shop" ? "/orders" : "/puja-bookings";
  try {
    const message = fulfilmentStatusEmail({locale,kind:input.kind,reference:input.reference,status:input.status,
      trackingUrl:env.NEXT_PUBLIC_APP_URL+trackingPath,scheduledAt});
    if (!message) return { outcome: "not_needed" };
    const result = await sendEmail({to:email,...message});
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

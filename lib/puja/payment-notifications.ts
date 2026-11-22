import "server-only";
import type { Payment } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email/email-service";
import { logger } from "@/lib/monitoring/logger";

/** Payment capture evidence comes from the existing Razorpay signature and
 * provider capture verification, never from a customer-submitted screenshot.
 * Resend idempotency keys mitigate duplicate webhook/client-verify callbacks.
 */
export async function notifyCapturedPujaPayment(payment: Payment): Promise<void> {
  const meta = (payment.metadata as Record<string, unknown> | null) ?? {};
  const bookingId = typeof meta.pujaBookingId === "string" ? meta.pujaBookingId : null;
  if (payment.purpose !== "PUJA_BOOKING" || payment.status !== "PAID" || !bookingId) return;
  const [booking, user] = await Promise.all([
    prisma.pujaBookingRequest.findFirst({
      where: { id: bookingId, userId: payment.userId },
      select: { id: true, status: true, scheduledAt: true, topicId: true }
    }),
    prisma.user.findUnique({ where: { id: payment.userId }, select: { email: true } })
  ]);
  if (!booking || !user?.email) return;
  const accountUrl = new URL("/puja-bookings", env.NEXT_PUBLIC_APP_URL).toString();
  const amount = new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"})
    .format(Number(payment.amount));
  const details = [
    "Namaste,", "",
    "Your NAKSHARIX Puja payment has been verified and recorded.",
    "आपकी पूजा का भुगतान सत्यापित होकर दर्ज हो गया है।",
    "Puja request: " + booking.id,
    "Paid amount: " + amount,
    "Current ceremony status: " + booking.status,
    "View privately: " + accountUrl, "",
    "A captured payment is not proof that the ceremony has occurred.",
    "If there is a scheduling issue, contact care@naksharix.com.",
    "Never share an OTP, PIN, password or card details."
  ].join("\n");
  const targets = [
    { to: user.email, key: "puja-captured-customer-" + payment.id,
      subject: "NAKSHARIX Puja payment verified — booking reference" },
    ...(env.ADMIN_EMAIL ? [{to: env.ADMIN_EMAIL,key:"puja-captured-admin-" + payment.id,
      subject:"NAKSHARIX — Puja payment captured; fulfilment due"}] : [])
  ];
  for (const target of targets) {
    try {
      const result = await sendEmail({
        to: target.to, subject: target.subject,
        idempotencyKey: target.key, text: details
      });
      if (!result.sent) logger.warn("puja_payment_notification_unavailable");
    } catch { logger.warn("puja_payment_notification_failed"); }
  }
}

/** Notify only after a signed full-amount refund has been PROCESSED.
 * A refund request/pending state is never advertised as returned money. */
export async function notifyProcessedPujaRefund(
  payment: Payment, providerRefundId: string
): Promise<void> {
  if (payment.purpose !== "PUJA_BOOKING" || !providerRefundId) return;
  const meta = (payment.metadata as Record<string, unknown> | null) ?? {};
  const bookingId = typeof meta.pujaBookingId === "string" ? meta.pujaBookingId : null;
  if (!bookingId) return;
  const user = await prisma.user.findUnique({
    where: {id: payment.userId}, select: {email: true}
  });
  if (!user?.email) return;
  const amount = new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR"
  }).format(Number(payment.amount));
  const message = [
    "Namaste,", "",
    "A full refund for your NAKSHARIX Puja booking has been marked PROCESSED by the verified payment provider.",
    "आपकी पूजा बुकिंग की पूरी राशि का रिफंड पेमेंट प्रदाता द्वारा प्रोसेस किया गया है।",
    "Puja booking: " + bookingId,
    "Refund amount: " + amount,
    "Provider refund reference: " + providerRefundId,
    "Bank/UPI credit timing depends on the payment provider and bank.",
    "See private records: " + new URL("/puja-bookings", env.NEXT_PUBLIC_APP_URL),
    "Support: care@naksharix.com",
    "This email does not request an OTP, UPI PIN, card number or password."
  ].join("\n");
  const targets = [
    {to:user.email, key: "puja-refund-customer-" + providerRefundId, subject:"NAKSHARIX — Puja refund processed"},
    ...(env.ADMIN_EMAIL ? [{to:env.ADMIN_EMAIL,key:"puja-refund-admin-" + providerRefundId,
      subject:"NAKSHARIX — Puja refund processed; reconcile booking"}] : [])
  ];
  for(const target of targets){
    try{
      const result = await sendEmail({
        to: target.to, subject: target.subject,
        idempotencyKey: target.key, text: message
      });
      if(!result.sent)logger.warn("puja_refund_email_unavailable");
    }catch{logger.warn("puja_refund_email_failed");}
  }
}

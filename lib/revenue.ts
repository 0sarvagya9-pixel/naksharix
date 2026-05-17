import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { PaymentPurpose, PaymentStatus, Prisma, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { razorpay } from "@/lib/payments/razorpay";
import { subscriptionPlans } from "@/lib/subscription-plans";

export function getSubscriptionPlan(id: string) {
  return subscriptionPlans.find((plan) => plan.id === id);
}

export function verifyRazorpayPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const secret = env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

export async function verifyRazorpayCapturedPayment(orderId: string, paymentId: string, expectedAmount: number, expectedCurrency = "INR") {
  if (!razorpay) return { ok: false, reason: "Razorpay is not configured" };
  try {
    const payment = await razorpay.payments.fetch(paymentId) as {
      id?: string;
      order_id?: string;
      status?: string;
      amount?: number;
      currency?: string;
    };
    if (payment.id !== paymentId) return { ok: false, reason: "Payment id mismatch" };
    if (payment.order_id !== orderId) return { ok: false, reason: "Order id mismatch" };
    if (payment.status !== "captured") return { ok: false, reason: "Payment is not captured" };
    if (Number(payment.amount) !== Math.round(expectedAmount * 100)) return { ok: false, reason: "Amount mismatch" };
    if ((payment.currency ?? "").toUpperCase() !== expectedCurrency.toUpperCase()) return { ok: false, reason: "Currency mismatch" };
    return { ok: true, reason: "verified" };
  } catch {
    return { ok: false, reason: "Unable to verify payment with Razorpay" };
  }
}
export function verifyRazorpayWebhookSignature(payload: string, signature: string | null) {
  if (!env.RAZORPAY_WEBHOOK_SECRET || !signature) return false;
  const expected = createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET).update(payload).digest("hex");
  return safeEqual(expected, signature);
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function finalizePaidPayment(providerOrderId: string, providerPaymentId: string, metadata: Record<string, unknown> = {}) {
  const payment = await prisma.payment.findUnique({ where: { providerOrderId } });
  if (!payment) return null;
  if (payment.status === PaymentStatus.PAID) return payment;

  const invoiceNumber = `NXR-${new Date().getFullYear()}-${payment.id.slice(-8).toUpperCase()}`;
  const taxAmount = Number(payment.amount) * 0.18;

  const existingMetadata = (payment.metadata as Record<string, unknown> | null) ?? {};
  const mergedMetadata = { ...existingMetadata, ...metadata } as Prisma.InputJsonObject;

  const updated = await prisma.$transaction(async (tx) => {
    const paid = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        providerPaymentId,
        metadata: mergedMetadata
      }
    });

    await tx.invoice.upsert({
      where: { paymentId: paid.id },
      update: {},
      create: {
        userId: paid.userId,
        paymentId: paid.id,
        number: invoiceNumber,
        taxAmount,
        html: buildInvoiceHtml(invoiceNumber, Number(paid.amount), paid.currency, paid.purpose)
      }
    });

    if (paid.purpose === PaymentPurpose.KUNDLI_REPORT || paid.purpose === PaymentPurpose.YEARLY_REPORT || paid.purpose === PaymentPurpose.MATCH_REPORT) {
      await tx.purchasedReport.upsert({
        where: { paymentId: paid.id },
        update: { status: "READY" },
        create: {
          userId: paid.userId,
          paymentId: paid.id,
          reportType: paid.purpose,
          title: reportTitle(paid.purpose),
          status: "READY",
          metadata: (paid.metadata as Prisma.InputJsonValue | null) ?? undefined
        }
      });
    }

    if (paid.purpose === PaymentPurpose.SUBSCRIPTION) {
      const plan = String((paid.metadata as Record<string, unknown> | null)?.plan ?? "PREMIUM") as SubscriptionPlan;
      const now = new Date();
      const end = new Date(now);
      end.setMonth(end.getMonth() + 1);
      await tx.subscription.create({
        data: {
          userId: paid.userId,
          plan,
          status: SubscriptionStatus.ACTIVE,
          provider: paid.provider,
          currentPeriodStart: now,
          currentPeriodEnd: end,
          payments: { connect: { id: paid.id } }
        }
      });
    }

    return paid;
  });

  return updated;
}

function reportTitle(purpose: PaymentPurpose) {
  if (purpose === PaymentPurpose.YEARLY_REPORT) return "AI Yearly Prediction";
  if (purpose === PaymentPurpose.MATCH_REPORT) return "Premium Match Report";
  return "Kundli Pro Report";
}

function buildInvoiceHtml(number: string, amount: number, currency: string, purpose: PaymentPurpose) {
  return `<h1>Naksharix Invoice ${number}</h1><p>Purpose: ${purpose}</p><p>Amount: ${currency} ${amount.toFixed(2)}</p><p>GST estimate: ${currency} ${(amount * 0.18).toFixed(2)}</p>`;
}





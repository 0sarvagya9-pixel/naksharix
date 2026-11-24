import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { PaymentPurpose, PaymentStatus, Prisma, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { razorpay } from "@/lib/payments/razorpay";
import { subscriptionPlans } from "@/lib/subscription-plans";
import {creditSnapshot} from "@/lib/ai/credit-contract";
import {lockCreditAccount} from "@/lib/ai/credit-ledger";
import {validatePackageCapture} from "@/lib/digital-packages/ledger";
import {validateExpertCapture} from "@/lib/expert-services/ledger";

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
  // A late captured webhook must never reopen a refunded/waived payment.
  if (payment.status === PaymentStatus.PAID) {
    return payment.providerPaymentId === providerPaymentId ? payment : null;
  }
  if (payment.status !== PaymentStatus.PENDING && payment.status !== PaymentStatus.FAILED) return null;

  const invoiceNumber = `NXR-${new Date().getFullYear()}-${payment.id.slice(-8).toUpperCase()}`;
  const md = (payment.metadata as Record<string, unknown> | null) ?? {};
  // Only the customer-visible, owner-confirmed Shop tax may populate a tax figure.
  // Never invent 18% GST for all spiritual services or digital reports.
  const verifiedTaxPaise = payment.purpose === PaymentPurpose.SHOP_ORDER &&
    Number.isSafeInteger(md.shopTaxPaise) && Number(md.shopTaxPaise) >= 0
    ? Number(md.shopTaxPaise) : 0;
  const taxAmount = verifiedTaxPaise / 100;
  const existingMetadata = (payment.metadata as Record<string, unknown> | null) ?? {};
  const mergedMetadata = { ...existingMetadata, ...metadata } as Prisma.InputJsonObject;

  return prisma.$transaction(async (tx) => {
    const expertOrder=payment.purpose==="EXPERT_SERVICE"?await validateExpertCapture(tx,payment,metadata.gatewayStatus):null;
    const packageOrderId=payment.purpose==="DIGITAL_PACKAGE"?await validatePackageCapture(tx,payment,metadata.gatewayStatus):null;
    const credit=payment.purpose==="AI_CREDITS"?creditSnapshot(payment.metadata,Math.round(Number(payment.amount)*100),payment.currency):null;
    if(payment.purpose==="AI_CREDITS"){
      if(!credit||payment.provider!=="RAZORPAY"||metadata.gatewayStatus!=="captured"||(process.env.VERCEL_ENV==="production"&&existingMetadata.analyticsLiveOrder!==true))throw new Error("AI_CREDIT_CAPTURE_CONTRACT_INVALID");
      await lockCreditAccount(tx,payment.userId);
    }
    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: { in: [PaymentStatus.PENDING, PaymentStatus.FAILED] } },
      data: {
        status: PaymentStatus.PAID,
        providerPaymentId,
        metadata: mergedMetadata
      }
    });

    if (claimed.count === 0) {
      // Race-safe: another captured transaction may have finalized first.
      // Return only an identical PAID transaction, never a refunded record.
      const current = await tx.payment.findUnique({ where: { id: payment.id } });
      return current?.status === PaymentStatus.PAID &&
        current.providerPaymentId === providerPaymentId ? current : null;
    }

    const paid = await tx.payment.findUnique({ where: { id: payment.id } });
    if (!paid) throw new Error("Payment disappeared during finalization");

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
          status: "PURCHASED_AWAITING_DETAILS",
          metadata: (paid.metadata as Prisma.InputJsonValue | null) ?? undefined
        }
      });
    }

    if(expertOrder)await tx.expertServiceRequest.update({where:{id:expertOrder.id},data:{status:expertOrder.status}});
    if(packageOrderId)await tx.digitalPackageOrder.update({where:{id:packageOrderId},data:{status:"PAID"}});
    if(paid.purpose==="AI_CREDITS"&&credit){
      // Capture and unique credit grant commit together. No credits from pending, test-in-production, waived or duplicate payments.
      await tx.aiCreditGrant.create({data:{paymentId:paid.id,units:credit.units,remaining:credit.units,offerVersion:credit.version}});
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
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

function reportTitle(purpose: PaymentPurpose) {
  if (purpose === PaymentPurpose.YEARLY_REPORT) return "Yearly Astrology Report";
  if (purpose === PaymentPurpose.MATCH_REPORT) return "Premium Match Report";
  return "Kundli Pro Report";
}

function buildInvoiceHtml(number: string, amount: number, currency: string, purpose: PaymentPurpose) {
  return `<h1>Naksharix Payment Receipt ${number}</h1><p>Purpose: ${purpose}</p><p>Amount paid: ${currency} ${amount.toFixed(2)}</p><p>This is a payment receipt, not a tax invoice. Applicable GST or other tax breakdown must be issued under the verified merchant tax policy.</p>`;
}

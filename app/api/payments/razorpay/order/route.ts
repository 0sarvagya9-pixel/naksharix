import { findKumbhEvent, kumbhEventVisible, kumbhEventScheduleMatches } from "@/lib/puja/service-catalogue";
import { PUJA_FEE_TERMS_VERSION } from "@/lib/puja/fee-terms";
import { NextRequest } from "next/server";
import { PaymentPurpose, ReportPaymentStatus, ReportRequestStatus } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { canBypassPayment } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getPaidReport } from "@/lib/paid-reports";
import { razorpay } from "@/lib/payments/razorpay";
import { getRazorpayReadiness } from "@/lib/payments/readiness";
import { getPujaLaunchState, partnerSupportsTopic } from "@/lib/puja/launch-readiness";
import { writeAuditLog, writeReportStatusHistory } from "@/lib/reports/report-audit";
import { getReportPricing } from "@/lib/reports/pricing";
import { getSubscriptionPlan } from "@/lib/revenue";
import { googleSessionSchema, liveRazorpayAnalyticsOrder, sendGoogleCheckout } from "@/lib/analytics/google";
import { getRequestIp, rateLimitResponse } from "@/lib/security/rate-limit";
import { shippingPayable,SHIPPING_TERMS_VERSION,readShippingSnapshot } from "@/lib/shop/shipping-rules";

const schema = z.discriminatedUnion("purpose", [
  z.object({ purpose: z.literal("SUBSCRIPTION"), plan: z.enum(["PREMIUM", "VIP"]) }),
  z.object({ purpose: z.literal("KUNDLI_REPORT"), reportId: z.string().min(1), savedReportId: z.string().min(1).optional(), reportRequestId: z.string().min(1).optional(), analyticsSession: googleSessionSchema.optional() }),
  z.object({ purpose: z.literal("YEARLY_REPORT"), reportId: z.string().min(1), savedReportId: z.string().min(1).optional(), reportRequestId: z.string().min(1).optional(), analyticsSession: googleSessionSchema.optional() }),
  z.object({ purpose: z.literal("MATCH_REPORT"), reportId: z.string().min(1), savedReportId: z.string().min(1).optional(), reportRequestId: z.string().min(1).optional(), analyticsSession: googleSessionSchema.optional() }),
  z.object({ purpose: z.literal("CONSULTATION"), bookingId: z.string().min(1) }),
  z.object({ purpose: z.literal("PUJA_BOOKING"), bookingId: z.string().min(1), feeTermsVersion: z.literal(PUJA_FEE_TERMS_VERSION) }),
  z.object({ purpose: z.literal("SHOP_ORDER"), shopOrderId: z.string().min(1), expectedTotalPaise:z.number().int().positive().max(1000000000).optional(),expectedOrderVersion:z.number().int().positive().optional(),shippingTermsVersion:z.literal(SHIPPING_TERMS_VERSION).optional() }).strict()
]);

type CheckoutBody = z.infer<typeof schema>;

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    const limited = rateLimitResponse("razorpay-order", user.id || getRequestIp(request), 10, 60_000);
    if (limited) return limited;
    const body = await validateJson(request, schema);
    if (body.purpose === "SUBSCRIPTION" && env.SUBSCRIPTIONS_ENABLED !== "true") return fail("Not found", 404);
    if (body.purpose === "SHOP_ORDER" && env.SHOP_PAYMENTS_ENABLED !== "true")
      return fail("Shop online payments are temporarily unavailable. Your order remains saved.", 503);
    if (body.purpose === "PUJA_BOOKING" && !(await getPujaLaunchState()).enabled)
      return fail("Puja services coming soon. New Puja payments are temporarily closed.", 503);
    if (canBypassPayment(user)) return fail("Admin access does not require payment", 403);
    const readiness = getRazorpayReadiness();
    if (!readiness.enabled || !razorpay) return fail(readiness.reason, 503);

    const item = await resolveCheckoutItem(body, user.id);
    if (!item) return fail("Invalid or completed checkout item", 422);
    const reportRequestId = "reportRequestId" in body ? body.reportRequestId : undefined;
    const savedReportId = "savedReportId" in body ? body.savedReportId : undefined;

    if (savedReportId) {
      const alreadyPaid = await prisma.payment.findFirst({
        where: {
          userId: user.id,
          status: "PAID",
          metadata: { path: ["savedReportId"], equals: savedReportId }
        },
        select: { id: true }
      });
      if (alreadyPaid) return fail("This report is already unlocked.", 409);
    }

    let previousReportStatus: ReportRequestStatus | null = null;
    if (reportRequestId) {
      const reportRequest = await prisma.reportRequest.findUnique({ where: { id: reportRequestId } });
      if (!reportRequest || reportRequest.userId !== user.id) return fail("Report request not found", 404);
      if (reportRequest.paymentStatus === ReportPaymentStatus.PAID) return fail("This report request is already paid.", 409);
      previousReportStatus = reportRequest.status;
      const pricing = getReportPricing(reportRequest.reportSlug);
      if (!pricing || pricing.amount !== item.amount || pricing.reportType !== body.purpose) {
        return fail("Report pricing mismatch. Please restart checkout from the report page.", 422);
      }
    }

    const reusable = await findReusablePayment(body, user.id);
    if (reusable && (Number(reusable.amount) !== item.amount || reusable.currency !== "INR"))
      return fail("An earlier order has a different amount. Contact support before trying to pay again.", 409);
    if (reusable?.status === "PAID") return fail("This checkout item is already paid.", 409);
    if (reusable?.status === "PENDING" && Date.now() - reusable.createdAt.getTime() > 24 * 60 * 60 * 1000)
      return fail("An old payment attempt needs merchant reconciliation. Check payment history or contact support before paying again.", 409);
    if (reusable?.status === "PENDING" && reusable.providerOrderId) {
      if (body.purpose === "PUJA_BOOKING") await writeAuditLog({ actor: user, action: "puja.fee_terms_accepted", targetType: "Payment", targetId: reusable.id, metadata: { feeTermsVersion: body.feeTermsVersion } });
      if ("analyticsSession" in body) await sendGoogleCheckout(request,body.analyticsSession,body.purpose,item.amount);
      return ok({
        keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order: {
          id: reusable.providerOrderId,
          amount: Math.round(Number(reusable.amount) * 100),
          currency: reusable.currency
        },
        paymentId: reusable.id,
        item: { name: item.name, amount: item.amount },
        reused: true
      });
    }

    const paymentData={
        userId: user.id,
        provider: "RAZORPAY" as const,
        purpose: body.purpose as PaymentPurpose,
        status: "PENDING" as const,
        amount: item.amount,
        currency: "INR",
        metadata: { ...item.metadata, reportRequestId, savedReportId, analyticsLiveOrder: liveRazorpayAnalyticsOrder() }
    };
    // Reserve the Shop payment under the same lock as admin quote updates.
    // Do not open a second gateway order during an in-flight reservation.
    const payment=body.purpose==="SHOP_ORDER"?await prisma.$transaction(async tx=>{
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${body.shopOrderId}),hashtext('naksharix-shop-payment-v1'))::text`;
      const fresh=await tx.shopOrder.findUnique({where:{id:body.shopOrderId}});
      if(!fresh||fresh.userId!==user.id||fresh.status!=="CONFIRMED"||!["UNPAID","FAILED"].includes(fresh.paymentStatus)||
         !("shopOrderVersion" in item.metadata)||fresh.version!==item.metadata.shopOrderVersion||fresh.totalPaise!==Math.round(item.amount*100)||!shippingPayable(fresh))return null;
      const outstanding=await tx.payment.findFirst({where:{userId:user.id,provider:"RAZORPAY",purpose:"SHOP_ORDER",status:{in:["PENDING","PAID"]},metadata:{path:["shopOrderId"],equals:body.shopOrderId}},select:{id:true}});
      if(outstanding)return null;
      return tx.payment.create({data:paymentData});
    }):await prisma.payment.create({data:paymentData});
    if(!payment)return fail("The shipping quote changed or a payment attempt is already pending. Review My Orders before trying again.",409);

    let order;
    try {
      order = await razorpay.orders.create({
        amount: Math.round(item.amount * 100),
        currency: "INR",
        receipt: payment.id,
        notes: { userId: user.id, paymentId: payment.id, purpose: body.purpose }
      });
    } catch (error) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } }).catch(() => null);
      await writeAuditLog({
        actor: user,
        action: "payment.razorpay_order_failed",
        targetType: "Payment",
        targetId: payment.id,
        metadata: { purpose: body.purpose, provider: "razorpay" }
      }).catch(() => null);
      throw error;
    }

    await prisma.payment.update({ where: { id: payment.id }, data: { providerOrderId: order.id } });
    if (reportRequestId) {
      const updated = await prisma.reportRequest.update({
        where: { id: reportRequestId },
        data: {
          paymentId: payment.id,
          paymentStatus: ReportPaymentStatus.PENDING,
          status: ReportRequestStatus.PAYMENT_PENDING
        }
      });
      await writeReportStatusHistory({
        reportRequestId,
        oldStatus: previousReportStatus,
        newStatus: updated.status,
        actor: user,
        note: "Razorpay order created for report request.",
        metadata: { paymentId: payment.id, amount: item.amount, currency: "INR" }
      });
    }
    await writeAuditLog({
      actor: user,
      action: "payment.razorpay_order_created",
      targetType: "Payment",
      targetId: payment.id,
      metadata: { purpose: body.purpose, amount: item.amount, reportRequestLinked: Boolean(reportRequestId) }
    });

    if ("analyticsSession" in body) await sendGoogleCheckout(request,body.analyticsSession,body.purpose,item.amount);
    return ok({
      keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order,
      paymentId: payment.id,
      item: { name: item.name, amount: item.amount },
      reused: false
    });
  } catch (error) {
    return handleApiError(error);
  }
}

async function findReusablePayment(body: CheckoutBody, userId: string) {
  const identity = checkoutIdentity(body);
  if (!identity) return null;

  return prisma.payment.findFirst({
    where: {
      userId,
      provider: "RAZORPAY",
      purpose: body.purpose as PaymentPurpose,
      status: { in: ["PENDING", "PAID"] },
      metadata: { path: [identity.key], equals: identity.value }
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, providerOrderId: true, amount: true, currency: true, createdAt: true }
  });
}

function checkoutIdentity(body: CheckoutBody) {
  if (body.purpose === "CONSULTATION") return { key: "bookingId", value: body.bookingId };
  if (body.purpose === "PUJA_BOOKING") return { key: "pujaBookingId", value: body.bookingId };
  if (body.purpose === "SHOP_ORDER") return { key: "shopOrderId", value: body.shopOrderId };
  if (body.purpose === "SUBSCRIPTION") return null;
  if (body.reportRequestId) return { key: "reportRequestId", value: body.reportRequestId };
  if (body.savedReportId) return { key: "savedReportId", value: body.savedReportId };
  // Prevent repeated accidental charges for the same fixed-price report.
  // Additional customized copies require an explicit owner-assisted purchase intent.
  if ("reportId" in body) return { key: "reportId", value: body.reportId };
  return null;
}

async function resolveCheckoutItem(body: CheckoutBody, userId: string) {
  if (body.purpose === "SUBSCRIPTION") {
    const plan = getSubscriptionPlan(body.plan);
    if (!plan) return null;
    return { name: `${plan.name} Plan`, amount: plan.amount, metadata: { plan: plan.id, interval: plan.interval } };
  }
  if (body.purpose === "PUJA_BOOKING") {
    const booking = await prisma.pujaBookingRequest.findUnique({ where: { id: body.bookingId } });
    // No buyer is charged for an unaccepted date, missing Pandit, stale fee,
    // old canceled request or a service whose partner is no longer verified.
    if (!booking || booking.userId !== userId || booking.status !== "SCHEDULED" ||
        !booking.partnerId || !booking.scheduledAt || booking.scheduledAt.getTime() <= Date.now()) return null;
    const event = findKumbhEvent(booking.topicId);
    if (event && (!kumbhEventVisible(event) || !kumbhEventScheduleMatches(event,booking.scheduledAt) || booking.city !== event.city)) return null;
    const [offer, partner] = await Promise.all([
      prisma.pujaOffering.findUnique({ where: { topicId: booking.topicId } }),
      prisma.pujaPartner.findUnique({ where: { id: booking.partnerId } })
    ]);
    if (!partner || !partnerSupportsTopic(partner, booking.topicId) ||
        !offer?.available || offer.pricePaise !== booking.quotedPricePaise ||
        booking.quotedPricePaise !== 110000 || booking.quotedPricePaise < 100) return null;
    return { name: "Naksharix Puja Platform Coordination", amount: booking.quotedPricePaise / 100,
      metadata: { pujaBookingId: booking.id, pujaTopicId: booking.topicId, feeTermsVersion: body.feeTermsVersion, feeTermsAcceptedAt: new Date().toISOString() } };
  }
  if (body.purpose === "SHOP_ORDER") {
    const order = await prisma.shopOrder.findUnique({ where: { id: body.shopOrderId } });
    if (!order || order.userId !== userId || order.status !== "CONFIRMED" ||
        !["UNPAID", "FAILED"].includes(order.paymentStatus) ||
        !["SELLER_FULFILLED", "MANUAL_CONFIRMATION"].includes(order.fulfillmentMode) ||
        order.shippingPaise === null || order.taxPaise === null ||
        !Number.isSafeInteger(order.totalPaise) || !order.totalPaise || order.totalPaise < 100 ||
        order.totalPaise !== order.subtotalPaise + order.shippingPaise + order.taxPaise || !shippingPayable(order)) return null;
    if(body.expectedTotalPaise!==undefined&&body.expectedTotalPaise!==order.totalPaise)return null;
    if(order.deliveryCountry!=="IN"&&(body.expectedTotalPaise!==order.totalPaise||body.expectedOrderVersion!==order.version||body.shippingTermsVersion!==SHIPPING_TERMS_VERSION))return null;
    const shippingQuote=readShippingSnapshot(order.shippingQuote);
    return { name: "Naksharix Shop Order", amount: order.totalPaise / 100,
      metadata: { shopOrderId: order.id,shopOrderVersion:order.version,shopCountry:order.deliveryCountry,shopShippingPaise:order.shippingPaise,shopTaxPaise:order.taxPaise,shopDutiesMode:shippingQuote?.dutiesMode??"INCLUDED",...(order.deliveryCountry!=="IN"?{shippingTermsVersion:body.shippingTermsVersion,shippingTermsAcceptedAt:new Date().toISOString()}: {}) } };
  }
  if (body.purpose === "CONSULTATION") {
    const booking = await prisma.consultationBooking.findUnique({ where: { id: body.bookingId } });
    if (!booking || booking.userId !== userId) return null;
    if (["PAID", "ADMIN_BYPASS", "REFUNDED"].includes(booking.paymentStatus)) return null;
    if (["CANCELED", "COMPLETED", "REJECTED"].includes(booking.status)) return null;
    const amount = Number(booking.amount);
    if (!Number.isFinite(amount) || amount < 1 || Math.round(amount * 100) !== amount * 100) return null;
    return { name: "Astrology Consultation", amount, metadata: { bookingId: booking.id } };
  }
  const report = getPaidReport(body.reportId);
  if (!report || report.purpose !== body.purpose) return null;
  return { name: report.name, amount: report.amount, metadata: { reportId: report.id, reportName: report.name } };
}

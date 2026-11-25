import { findKumbhEvent, kumbhEventVisible, kumbhEventScheduleMatches } from "@/lib/puja/service-catalogue";
import { PUJA_FEE_TERMS_VERSION } from "@/lib/puja/fee-terms";
import { NextRequest } from "next/server";
import { PaymentPurpose, ReportPaymentStatus, ReportRequestStatus, Prisma } from "@prisma/client";
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
import { getSubscriptionPlan, finalizePaidPayment } from "@/lib/revenue";
import { checkExistingReportOrder } from "@/lib/payments/report-order-recovery";
import { getReportSlugForPaidId, getManualReportCheckout } from "@/lib/reports/checkout-catalogue";
import {isSavedKundliCheckout,hasSavedKundliPayload} from "@/lib/reports/saved-kundli-contract";
import {reportReservationScope,matchesReportCheckoutContext,type ReportCheckoutContext} from "@/lib/reports/checkout-context";
import { verifyReportPreflight } from "@/lib/reports/preflight-contract";
import { googleSessionSchema, liveRazorpayAnalyticsOrder, sendGoogleCheckout } from "@/lib/analytics/google";
import { getRequestIp, sharedRateLimitResponse as rateLimitResponse } from "@/lib/security/rate-limit";
import { shippingPayable,SHIPPING_TERMS_VERSION,readShippingSnapshot } from "@/lib/shop/shipping-rules";

import {availableCreditOffer,lockCreditAccount} from "@/lib/ai/credit-ledger";
import {resolvePackageCheckout,lockPackage} from "@/lib/digital-packages/ledger";
import {resolveExpertCheckout,lockExpertService} from "@/lib/expert-services/ledger";
import {EXPERT_TERMS_VERSION} from "@/lib/expert-services/contract";
import {PACKAGE_TERMS_VERSION} from "@/lib/digital-packages/catalogue";
import {AI_CREDIT_TERMS_VERSION,creditSnapshot,offerMatches,validCreditIntent} from "@/lib/ai/credit-contract";

const schema = z.discriminatedUnion("purpose", [
  z.object({purpose:z.literal("EXPERT_SERVICE"),expertServiceId:z.string().min(1).max(100),quoteVersion:z.number().int().positive(),pricePaise:z.number().int().min(100).max(10000000),termsVersion:z.literal(EXPERT_TERMS_VERSION)}).strict(),
  z.object({purpose:z.literal("DIGITAL_PACKAGE"),packageOrderId:z.string().min(1).max(100),version:z.literal("v1"),pricePaise:z.number().int().min(100).max(10000000),termsVersion:z.literal(PACKAGE_TERMS_VERSION)}).strict(),
  z.object({purpose:z.literal("AI_CREDITS"),intent:z.string().refine(validCreditIntent),version:z.string().max(64),units:z.number().int().min(1).max(500),pricePaise:z.number().int().min(100).max(1000000),termsVersion:z.literal(AI_CREDIT_TERMS_VERSION)}).strict(),
  z.object({ purpose: z.literal("SUBSCRIPTION"), plan: z.enum(["PREMIUM", "VIP"]) }),
  z.object({ purpose: z.literal("KUNDLI_REPORT"), reportId: z.string().min(1), savedReportId: z.string().min(1).optional(), reportRequestId: z.string().min(1).optional(), preflightToken: z.string().max(1024).optional(), analyticsSession: googleSessionSchema.optional().catch(undefined) }),
  z.object({ purpose: z.literal("YEARLY_REPORT"), reportId: z.string().min(1), savedReportId: z.string().min(1).optional(), reportRequestId: z.string().min(1).optional(), preflightToken: z.string().max(1024).optional(), analyticsSession: googleSessionSchema.optional().catch(undefined) }),
  z.object({ purpose: z.literal("MATCH_REPORT"), reportId: z.string().min(1), savedReportId: z.string().min(1).optional(), reportRequestId: z.string().min(1).optional(), preflightToken: z.string().max(1024).optional(), analyticsSession: googleSessionSchema.optional().catch(undefined) }),
  z.object({ purpose: z.literal("CONSULTATION"), bookingId: z.string().min(1) }),
  z.object({ purpose: z.literal("PUJA_BOOKING"), bookingId: z.string().min(1), feeTermsVersion: z.literal(PUJA_FEE_TERMS_VERSION) }),
  z.object({ purpose: z.literal("SHOP_ORDER"), shopOrderId: z.string().min(1), expectedTotalPaise:z.number().int().positive().max(1000000000).optional(),expectedOrderVersion:z.number().int().positive().optional(),shippingTermsVersion:z.literal(SHIPPING_TERMS_VERSION).optional() }).strict()
]);

type CheckoutBody = z.infer<typeof schema>;

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    const limited = await rateLimitResponse("razorpay-order", user.id || getRequestIp(request), 10, 60_000);
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
    if("reportId" in body && !reportRequestId && !savedReportId && getReportSlugForPaidId(body.reportId) && !verifyReportPreflight(body.preflightToken,{userId:user.id,reportId:body.reportId,purpose:body.purpose,amountPaise:Math.round(item.amount*100)},env.JWT_SECRET))return fail("Complete and validate your report details before starting payment.",422);

    if(reportRequestId&&savedReportId)return fail("Choose exactly one report checkout context.",422);
    if((reportRequestId&&!reportRequestId.trim())||(savedReportId&&!savedReportId.trim()))return fail("Invalid report checkout context.",422);
    if (savedReportId) {
      if(!("reportId" in body)||!isSavedKundliCheckout(body.purpose,body.reportId))return fail("Saved Kundli checkout requires its exact report product.",422);
      const saved=await prisma.kundliReport.findFirst({where:{id:savedReportId,userId:user.id},select:{id:true,reportJson:true}});
      if(!saved)return fail("Saved report not found",404);
      if(!hasSavedKundliPayload(saved.reportJson))return fail("Saved chart needs review before payment. No new order was created.",422);
      const alreadyPaid = await prisma.payment.findFirst({
        where: {
          userId: user.id,
          status: "PAID",
          metadata: { path: ["savedReportId"], equals: savedReportId }
        },
        select: { id: true }
      });
      if (alreadyPaid) return fail("A prior paid record exists for this saved report. Check Payment History or contact support before paying again.", 409);
    }

    let previousReportStatus: ReportRequestStatus | null = null;
    if (reportRequestId) {
      const reportRequest = await prisma.reportRequest.findUnique({ where: { id: reportRequestId } });
      if (!reportRequest || reportRequest.userId !== user.id) return fail("Report request not found", 404);
      if (reportRequest.paymentStatus === ReportPaymentStatus.PAID) return fail("This report request is already paid.", 409);
      if(reportRequest.adminBypass||["REFUNDED","ADMIN_BYPASS"].includes(reportRequest.paymentStatus)||["CANCELLED","DELIVERED","SENT"].includes(reportRequest.status))return fail("This report request requires review before any new payment.",409);
      const expectedReportId=getManualReportCheckout(reportRequest.reportSlug)?.reportId??reportRequest.reportSlug;
      if(!("reportId" in body)||body.reportId!==expectedReportId)return fail("Report product does not match the saved request.",422);
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
    const reportCheckout = "reportId" in body;
    const creditCheckout=body.purpose==="AI_CREDITS";
    const packageCheckout=body.purpose==="DIGITAL_PACKAGE";
    const expertCheckout=body.purpose==="EXPERT_SERVICE";
    if(reusable&&body.purpose==="AI_CREDITS"){
      const prior=creditSnapshot(reusable.metadata,Math.round(Number(reusable.amount)*100),reusable.currency);
      if(!prior||!offerMatches(prior,body))return fail("Prior credit order terms need reconciliation. Do not pay again.",409);
    }
    if (reusable && (reportCheckout||creditCheckout||packageCheckout||expertCheckout)) {
      // A missing order ID may be an in-flight reservation or ambiguous
      // gateway-create failure. Never replace it with a second order.
      const decision=await checkExistingReportOrder(reusable);
      if(decision.kind==="captured"&&reusable.providerOrderId){
        const paid=await finalizePaidPayment(reusable.providerOrderId,decision.providerPaymentId,{verifiedBy:"merchant_order_recovery",gatewayStatus:"captured"});
        if(paid&&reportRequestId){
          await prisma.reportRequest.updateMany({where:{id:reportRequestId,userId:user.id,paymentId:paid.id,status:{in:[ReportRequestStatus.RECEIVED,ReportRequestStatus.PENDING_REVIEW,ReportRequestStatus.PAYMENT_PENDING]},paymentStatus:{in:[ReportPaymentStatus.PENDING,ReportPaymentStatus.FAILED]}},data:{paymentStatus:ReportPaymentStatus.PAID,status:ReportRequestStatus.PAID}});
        }
        return fail(expertCheckout?"Payment already captured. Refresh your expert service requests. Do not pay again.":packageCheckout?"Payment already captured. Refresh your digital package account. Do not pay again.":creditCheckout?"Payment already captured. Refresh your AI credit balance and check Payment History. Do not pay again.":"Payment already captured. Open your dashboard Payment History to continue the report. Do not pay again.",409);
      }
      if(decision.kind!=="retry_same_order"||!reusable.providerOrderId)
        return fail("Previous payment requires merchant reconciliation. Do not pay again; contact support.",409);
    }
    if (!reportCheckout && !creditCheckout && !packageCheckout && !expertCheckout && reusable?.status === "PENDING" && Date.now() - reusable.createdAt.getTime() > 24 * 60 * 60 * 1000)
      return fail("An old payment attempt needs merchant reconciliation. Check payment history or contact support before paying again.", 409);
    if (reusable && (reusable.status === "PENDING" || ((reportCheckout||creditCheckout||packageCheckout||expertCheckout)&&reusable.status==="FAILED")) && reusable.providerOrderId) {
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
    }):body.purpose==="EXPERT_SERVICE"?await prisma.$transaction(async tx=>{
      await lockExpertService(tx,body.expertServiceId);
      const fresh=await resolveExpertCheckout(user.id,body.expertServiceId,body.quoteVersion,body.pricePaise,tx);
      if(!fresh||fresh.amount!==item.amount)return null;
      const request=await tx.expertServiceRequest.findFirst({where:{id:body.expertServiceId,userId:user.id,status:"QUOTED",paymentId:null,quoteVersion:body.quoteVersion,pricePaise:body.pricePaise}});
      if(!request)return null;
      const payment=await tx.payment.create({data:paymentData});
      await tx.expertServiceRequest.update({where:{id:request.id},data:{paymentId:payment.id,status:"PAYMENT_PENDING"}});
      return payment;
    }):body.purpose==="DIGITAL_PACKAGE"?await prisma.$transaction(async tx=>{
      await lockPackage(tx,body.packageOrderId);
      const draft=await tx.digitalPackageOrder.findFirst({where:{id:body.packageOrderId,userId:user.id,status:"DRAFT",paymentId:null,expiresAt:{gt:new Date()},productVersion:body.version,pricePaise:body.pricePaise,consentVersion:PACKAGE_TERMS_VERSION}});
      if(!draft)return null;
      const payment=await tx.payment.create({data:paymentData});
      await tx.digitalPackageOrder.update({where:{id:draft.id},data:{paymentId:payment.id,status:"PAYMENT_PENDING"}});
      return payment;
    }):body.purpose==="AI_CREDITS"?await prisma.$transaction(async tx=>{
      await lockCreditAccount(tx,user.id);
      const outstanding=await tx.payment.findFirst({where:{userId:user.id,provider:"RAZORPAY",purpose:"AI_CREDITS",OR:[{status:{in:["PENDING","FAILED"]}},{metadata:{path:["aiCreditIntent"],equals:body.intent}}]},select:{id:true}});
      if(outstanding)return null;
      return tx.payment.create({data:paymentData});
    }):reportCheckout?await prisma.$transaction(async tx=>{
      // Serialize every fixed-price report purchase for this account/SKU.
      // Preserve any pending, paid or failed reservation for reconciliation.
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${user.id}),hashtext(${body.reportId}))::text`;
      if(!("reportId" in body))return null;
      if(savedReportId){
        const saved=await tx.$queryRaw<Array<{id:string}>>`SELECT id FROM public."KundliReport" WHERE id=${savedReportId} AND "userId"=${user.id} FOR UPDATE`;
        if(!saved.length)return null;
        const paid=await tx.payment.findFirst({where:{userId:user.id,status:"PAID",metadata:{path:["savedReportId"],equals:savedReportId}},select:{id:true}});
        if(paid)return null;
      }
      const outstanding=await findReportReservations(tx,user.id,body);
      if(outstanding.length)return null;
      if(reportRequestId){
        const locked=await tx.$queryRaw<Array<{id:string}>>`SELECT id FROM public."ReportRequest" WHERE id=${reportRequestId} AND "userId"=${user.id} FOR UPDATE`;
        if(!locked.length)return null;
        const fresh=await tx.reportRequest.findUnique({where:{id:reportRequestId}});
        if(!fresh||fresh.paymentId||fresh.adminBypass||["PAID","REFUNDED","ADMIN_BYPASS"].includes(fresh.paymentStatus)||["CANCELLED","DELIVERED","SENT"].includes(fresh.status)|| (getManualReportCheckout(fresh.reportSlug)?.reportId??fresh.reportSlug)!==body.reportId)return null;
      }
      return tx.payment.create({data:paymentData});
    }):await prisma.payment.create({data:paymentData});
    if(!payment)return fail("An order or payment attempt already exists. Review Payment History or My Orders before trying again.",409);

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
    if(error instanceof ReportContextConflict)return fail("An earlier report order requires reconciliation. Do not pay again; contact support.",409);
    return handleApiError(error);
  }
}

class ReportContextConflict extends Error{}
async function findReportReservations(db:Pick<Prisma.TransactionClient,"payment">,userId:string,context:ReportCheckoutContext){
  const key=context.savedReportId?"savedReportId":context.reportRequestId?"reportRequestId":"reportId";
  const value=context.savedReportId??context.reportRequestId??context.reportId;
  const candidates=await db.payment.findMany({where:{userId,provider:"RAZORPAY",status:{in:["PENDING","PAID","FAILED"]},metadata:{path:[key],equals:value}},orderBy:{createdAt:"desc"},select:{id:true,status:true,providerOrderId:true,amount:true,currency:true,createdAt:true,metadata:true,purpose:true}});
  return candidates.filter(p=>reportReservationScope(p.metadata,context));
}

async function findReusablePayment(body: CheckoutBody, userId: string) {
  if("reportId" in body){
    const scoped=await findReportReservations(prisma,userId,body);
    if(scoped.some(p=>p.purpose!==body.purpose||!matchesReportCheckoutContext(p.metadata,body)))throw new ReportContextConflict();
    const paid=scoped.find(p=>p.status==="PAID");
    if(paid)return paid;
    if(scoped.length>1)throw new ReportContextConflict();
    return scoped[0]??null;
  }
  const identity = checkoutIdentity(body);
  if (!identity) return null;

  return prisma.payment.findFirst({
    where: {
      userId,
      provider: "RAZORPAY",
      purpose: body.purpose as PaymentPurpose,
      status: { in: (body.purpose==="AI_CREDITS"||body.purpose==="DIGITAL_PACKAGE"||body.purpose==="EXPERT_SERVICE") ? ["PENDING", "PAID", "FAILED"] : ["PENDING", "PAID"] },
      metadata: { path: [identity.key], equals: identity.value }
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, providerOrderId: true, amount: true, currency: true, createdAt: true, metadata:true }
  });
}

function checkoutIdentity(body: CheckoutBody) {
  if (body.purpose === "CONSULTATION") return { key: "bookingId", value: body.bookingId };
  if (body.purpose === "PUJA_BOOKING") return { key: "pujaBookingId", value: body.bookingId };
  if (body.purpose === "SHOP_ORDER") return { key: "shopOrderId", value: body.shopOrderId };
  if (body.purpose === "SUBSCRIPTION") return null;
  if (body.purpose === "AI_CREDITS") return {key:"aiCreditIntent",value:body.intent};
  if (body.purpose === "DIGITAL_PACKAGE") return {key:"digitalPackageId",value:body.packageOrderId};
  if (body.purpose === "EXPERT_SERVICE") return {key:"expertServiceId",value:body.expertServiceId};
  if (body.reportRequestId) return { key: "reportRequestId", value: body.reportRequestId };
  if (body.savedReportId) return { key: "savedReportId", value: body.savedReportId };
  // Prevent repeated accidental charges for the same fixed-price report.
  // Additional customized copies require an explicit owner-assisted purchase intent.
  if ("reportId" in body) return { key: "reportId", value: body.reportId };
  return null;
}

async function resolveCheckoutItem(body: CheckoutBody, userId: string) {
  if(body.purpose==="EXPERT_SERVICE")return resolveExpertCheckout(userId,body.expertServiceId,body.quoteVersion,body.pricePaise);
  if(body.purpose==="DIGITAL_PACKAGE")return resolvePackageCheckout(userId,body.packageOrderId,body.version,body.pricePaise);
  if(body.purpose==="AI_CREDITS"){
    const offer=await availableCreditOffer();
    if(!offer||!offerMatches(offer,body))return null;
    const account=await prisma.user.findUnique({where:{id:userId},select:{emailVerified:true,emailVerifiedAt:true,role:true}});
    if(!account||(!account.emailVerified&&!account.emailVerifiedAt)||["ADMIN","SUPER_ADMIN"].includes(account.role))return null;
    return {name:`Naksharix AI — ${offer.units} completed responses`,amount:offer.pricePaise/100,metadata:{aiCreditIntent:body.intent,aiCreditPack:{...offer,intent:body.intent,termsVersion:AI_CREDIT_TERMS_VERSION}}};
  }
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

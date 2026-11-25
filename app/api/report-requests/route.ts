import { NextRequest, after } from "next/server";
import { env } from "@/lib/env";
import { automaticExtraSchema,checkAutomaticInputs,encodeAutomaticReportInput } from "@/lib/reports/automatic-report-input";
import { processAutomaticReport } from "@/lib/reports/automatic-report-worker";

export const runtime="nodejs";
export const maxDuration=120;
import { PaymentStatus, Prisma, ReportPaymentStatus, ReportPlanType, ReportRequestStatus } from "@prisma/client";
import {lockProviderPayment,cumulativeSignedRefund} from "@/lib/payments/refund-evidence";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { canBypassPayment } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { getManualReport } from "@/lib/manual-catalogue";
import { getManualReportCheckout } from "@/lib/reports/checkout-catalogue";
import { writeAuditLog, writeReportStatusHistory } from "@/lib/reports/report-audit";
import { getRequestIp, sharedRateLimitResponse as rateLimitResponse } from "@/lib/security/rate-limit";

const schema = z.object({
  orderId: z.string().optional(),
  planType: z.enum(["PREMIUM", "VIP"]),
  reportSlug: z.string().min(1).default("premium-kundli"),
  adminBypass: z.boolean().optional(),
  deliveryEmail: z.string().email(),
  fullName: z.string().min(1),
  gender: z.string().optional(),
  dateOfBirth: z.string().min(1),
  timeOfBirth: z.string().min(1),
  birthPlace: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.number().optional(),
  phone: z.string().optional(),
  concern: z.string().min(1),
  questionOrConcern: z.string().max(2000).optional(),
  language: z.enum(["en","hi","hinglish"]).default("en"),
  automaticDetails: automaticExtraSchema.optional()
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);

    const rateLimited = await rateLimitResponse("report-request-create", user.id || getRequestIp(request), 5, 60_000);
    if (rateLimited) return rateLimited;

    const body = await validateJson(request, schema);
    const report = getManualReport(body.reportSlug);
    if (!report) return fail("Unknown report type", 422);

    const checkout = getManualReportCheckout(report.slug);
    const adminBypass = Boolean(body.adminBypass && canBypassPayment(user));

    if (body.deliveryEmail.toLowerCase() !== user.email.toLowerCase()) {
      return fail("Delivery email must match your login email", 403);
    }

    let paymentId: string | undefined;
    let providerPaymentId: string | null = null;
    let paymentStatus: ReportPaymentStatus = adminBypass ? ReportPaymentStatus.ADMIN_BYPASS : ReportPaymentStatus.PENDING;
    const planType = body.planType as ReportPlanType;

    if (!adminBypass && checkout) {
      if (!body.orderId) return fail("Verified payment is required for this fixed-price report.", 402);

      const payment = await prisma.payment.findUnique({ where: { id: body.orderId } });
      if (!payment || payment.userId !== user.id) return fail("Payment not found", 404);

      const metadata = (payment.metadata as Record<string, unknown> | null) ?? {};
      const validPayment = payment.status === PaymentStatus.PAID
        && String(payment.purpose) === checkout.purpose
        && Number(payment.amount) === checkout.amount
        && metadata.reportId === checkout.reportId
        && (env.AUTO_REPORT_DELIVERY_ENABLED!=="true"||(payment.provider==="RAZORPAY"&&payment.currency==="INR"));

      if (!validPayment) {
        return fail("Payment does not match this report. Please restart checkout from the report page.", 422);
      }

      paymentId = payment.id;
      providerPaymentId=payment.providerPaymentId;
      paymentStatus = ReportPaymentStatus.PAID;
    } else if (!adminBypass && body.orderId) {
      return fail("This manual-review report does not accept an upfront payment.", 422);
    }

    const automatic = env.AUTO_REPORT_DELIVERY_ENABLED==="true" && paymentStatus===ReportPaymentStatus.PAID && !adminBypass && Boolean(checkout);
    const question=(body.questionOrConcern??body.concern).trim();
    let concern=question;
    // Preserve the validated, private specialist input even if delivery is
    // operator-reviewed instead of automatic. Older clients without this
    // envelope remain review-only; the renderer must not invent missing data.
    if(automatic||Boolean(checkout&&body.automaticDetails)){
      const checked=checkAutomaticInputs(report.slug,{name:body.fullName,gender:body.gender,dateOfBirth:body.dateOfBirth,timeOfBirth:body.timeOfBirth,birthPlace:body.birthPlace,latitude:body.latitude,longitude:body.longitude,timezone:body.timezone},body.automaticDetails);
      if(!checked.ok)return fail(checked.reason,422);
      if(question.length>2000)return fail("Please limit the main question to 2,000 characters.",422);
      concern=encodeAutomaticReportInput(question,checked.extra);
    }
    // Recheck ownership and paid eligibility inside the same transaction as
    // request creation. Refund processing updates Payment before dependent
    // requests; the row lock prevents a new paid request slipping past it.
    const result=await prisma.$transaction(async tx=>{
      if(paymentId&&checkout){
        if(providerPaymentId){
          await lockProviderPayment(tx,providerPaymentId);
          if(await cumulativeSignedRefund(tx,providerPaymentId)>0)return null;
        }
        const locked=await tx.$queryRaw<{id:string}[]>`SELECT "id" FROM "Payment" WHERE "id"=${paymentId} FOR UPDATE`;
        if(!locked.length)return null;
        const current=await tx.payment.findUnique({where:{id:paymentId}});
        const metadata=(current?.metadata as Record<string,unknown>|null)??{};
        if(!current||current.userId!==user.id||current.status!==PaymentStatus.PAID||current.providerPaymentId!==providerPaymentId||String(current.purpose)!==checkout.purpose||Number(current.amount)!==checkout.amount||metadata.reportId!==checkout.reportId||(env.AUTO_REPORT_DELIVERY_ENABLED==="true"&&(current.provider!=="RAZORPAY"||current.currency!=="INR")))return null;
        const existing=await tx.reportRequest.findUnique({where:{paymentId}});
        if(existing)return {row:existing,created:false};
      }
      const row=await tx.reportRequest.create({
      data: {
        userId: user.id,
        paymentId,
        planType,
        paymentStatus,
        status: paymentStatus === ReportPaymentStatus.PAID ? ReportRequestStatus.PAID : ReportRequestStatus.PENDING_REVIEW,
        reportSlug: report.slug,
        deliveryEmail: user.email,
        fullName: body.fullName,
        gender: body.gender,
        dateOfBirth: body.dateOfBirth,
        timeOfBirth: body.timeOfBirth,
        birthPlace: body.birthPlace,
        latitude: body.latitude,
        longitude: body.longitude,
        timezone: body.timezone,
        phone: body.phone,
        concern,
        deliveryStatus: automatic ? "auto_queued" : "not_ready",
        language: body.language,
        adminBypass
      }
      });
      return {row,created:true};
    },{isolationLevel:Prisma.TransactionIsolationLevel.ReadCommitted});
    if(!result)return fail("Payment requires reconciliation before creating a report request.",409);
    const reportRequest=result.row;
    if(!result.created){
      if(env.AUTO_REPORT_DELIVERY_ENABLED==="true"&&reportRequest.deliveryStatus.startsWith("auto_"))after(async()=>{await processAutomaticReport(reportRequest.id).catch(()=>undefined)});
      return ok({reportRequest,automaticQueued:reportRequest.deliveryStatus.startsWith("auto_")});
    }

    await writeReportStatusHistory({
      reportRequestId: reportRequest.id,
      oldStatus: null,
      newStatus: reportRequest.status,
      actor: user,
      note: paymentStatus === ReportPaymentStatus.PAID ? "Paid report request created after verified checkout." : "Manual-review report request created.",
      metadata: {
        paymentStatus: reportRequest.paymentStatus,
        reportSlug: reportRequest.reportSlug,
        paymentId: reportRequest.paymentId
      }
    });

    await writeAuditLog({
      actor: user,
      action: "report_request.created",
      targetType: "ReportRequest",
      targetId: reportRequest.id,
      metadata: {
        reportSlug: reportRequest.reportSlug,
        paymentStatus: reportRequest.paymentStatus,
        fixedPriceCheckout: Boolean(checkout)
      }
    });

    if(automatic)after(async()=>{await processAutomaticReport(reportRequest.id).catch(()=>undefined)});
    return ok({ reportRequest, automaticQueued: automatic });
  } catch (error) {
    return handleApiError(error);
  }
}

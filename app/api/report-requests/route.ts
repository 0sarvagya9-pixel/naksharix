import { NextRequest, after } from "next/server";
import { env } from "@/lib/env";
import { automaticExtraSchema,checkNewReportInputs,encodeAutomaticReportInput } from "@/lib/reports/automatic-report-input";
import {CHECKOUT_DRAFT_LIFETIME_MS,fieldsForSubmission,normalizeReviewedFields,reviewedInputDigest} from "@/lib/reports/checkout-draft";
import {reportIntakeScope} from "@/lib/reports/public-intake";
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
import { getManualReportCheckout,getReportSlugForPaidId } from "@/lib/reports/checkout-catalogue";
import {isPersonalizedPaymentCandidate,personalizedPaymentContext} from "@/lib/reports/checkout-context";
import { writeAuditLog, writeReportStatusHistory } from "@/lib/reports/report-audit";
import { getRequestIp, sharedRateLimitResponse as rateLimitResponse } from "@/lib/security/rate-limit";

const schema = z.object({
  orderId: z.string().optional(),
  replaceExpiredReview:z.literal(true).optional(),
  planType: z.enum(["PREMIUM", "VIP"]),
  reportSlug: z.string().min(1).default("premium-kundli"),
  adminBypass: z.boolean().optional(),
  deliveryEmail: z.string().email(),
  fullName: z.string().min(1),
  gender: z.string().optional(),
  dateOfBirth: z.string().min(1),
  timeOfBirth: z.string().min(1).optional(),
  birthPlace: z.string().min(1).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.number().optional(),
  phone: z.string().optional(),
  concern: z.string().trim().max(2000).default(""),
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

    const submitted=await validateJson(request,z.union([z.object({orderId:z.string().min(1),resumeReviewed:z.literal(true)}).strict(),schema]));
    let body:z.infer<typeof schema>;
    if("resumeReviewed" in submitted){
      const draft=await prisma.reportCheckoutDraft.findFirst({where:{paymentId:submitted.orderId,expiresAt:{gt:new Date()},payment:{userId:user.id,status:"PAID"}},include:{payment:{select:{metadata:true}}}});
      if(!draft){
        const existing=await prisma.reportRequest.findFirst({where:{paymentId:submitted.orderId,userId:user.id,paymentStatus:"PAID",payment:{status:"PAID"}},select:{id:true}});
        return existing?ok({reportRequest:existing}):fail("This paid report is unavailable for automatic recovery. Check Payment History.",409);
      }
      const meta=draft.payment.metadata as Record<string,unknown>|null;
      const slug=typeof meta?.reportId==="string"?getReportSlugForPaidId(meta.reportId):undefined;
      const restored=slug&&normalizeReviewedFields(slug,draft.fields);
      if(!slug||!restored||!restored.ok||reviewedInputDigest(user.id,slug,restored.fields,env.JWT_SECRET)!==draft.inputDigest)return fail("This order requires private report review.",409);
      body=schema.parse({orderId:submitted.orderId,reportSlug:slug,planType:"PREMIUM",deliveryEmail:user.email,...fieldsForSubmission(restored.fields)});
    }else body=submitted;
    const report = getManualReport(body.reportSlug);
    if (!report) return fail("Unknown report type", 422);

    const checkout = getManualReportCheckout(report.slug);
    const adminBypass = Boolean(body.adminBypass && canBypassPayment(user));

    if (body.deliveryEmail.toLowerCase() !== user.email.toLowerCase()) {
      return fail("Delivery email must match your login email", 403);
    }

    let expectedInputDigest:unknown;
    let replacementEligible=false,replaceExpired=false;
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
        && isPersonalizedPaymentCandidate(metadata)
        && (env.AUTO_REPORT_DELIVERY_ENABLED!=="true"||(payment.provider==="RAZORPAY"&&payment.currency==="INR"));

      if (!validPayment) {
        return fail("Payment does not match this report. Please restart checkout from the report page.", 422);
      }

      expectedInputDigest=metadata.reviewedInputDigest;
      replacementEligible=body.replaceExpiredReview===true&&payment.createdAt.getTime()+CHECKOUT_DRAFT_LIFETIME_MS<=Date.now();
      paymentId = payment.id;
      providerPaymentId=payment.providerPaymentId;
      paymentStatus = ReportPaymentStatus.PAID;
    } else if (!adminBypass && body.orderId) {
      return fail("This manual-review report does not accept an upfront payment.", 422);
    }

    const automatic = env.AUTO_REPORT_DELIVERY_ENABLED==="true" && paymentStatus===ReportPaymentStatus.PAID && !adminBypass && Boolean(checkout);
    const question=(body.questionOrConcern??body.concern).trim();
    let concern=question;
    const dateNameOnly=reportIntakeScope(report.slug).dateNameOnly;
    if(!dateNameOnly&&(!body.timeOfBirth||!body.birthPlace))return fail("Complete birth details are required for this report.",422);
    if(dateNameOnly&&[body.gender,body.timeOfBirth,body.birthPlace,body.latitude,body.longitude,body.timezone,body.phone].some(value=>value!==undefined))return fail("Remove extra personal details that are not required for this report.",422);
    // Preserve the validated, private specialist input even if delivery is
    // operator-reviewed instead of automatic. Older clients without this
    // envelope remain review-only; the renderer must not invent missing data.
    if(automatic||expectedInputDigest!==undefined||dateNameOnly||Boolean(checkout&&body.automaticDetails)){
      const checked=checkNewReportInputs(report.slug,dateNameOnly?{name:body.fullName,dateOfBirth:body.dateOfBirth}:{name:body.fullName,gender:body.gender,dateOfBirth:body.dateOfBirth,timeOfBirth:body.timeOfBirth,birthPlace:body.birthPlace,latitude:body.latitude,longitude:body.longitude,timezone:body.timezone},body.automaticDetails);
      if(!checked.ok)return fail(checked.reason,422);
      if(question.length>2000)return fail("Please limit the main question to 2,000 characters.",422);
      if(expectedInputDigest!==undefined){
        const actual=normalizeReviewedFields(report.slug,{birth:checked.birth,automaticDetails:checked.extra,concern:question,language:body.language,phone:body.phone});
        if(!actual.ok)return fail(actual.reason,422);
        if(reviewedInputDigest(user.id,report.slug,actual.fields,env.JWT_SECRET)!==expectedInputDigest){
          if(!replacementEligible)return fail("Submitted details differ from the reviewed purchase. Resume the original details in Payment History.",409);
          replaceExpired=true;
        }
      }
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
        if(!current||current.userId!==user.id||current.status!==PaymentStatus.PAID||current.providerPaymentId!==providerPaymentId||String(current.purpose)!==checkout.purpose||Number(current.amount)!==checkout.amount||metadata.reportId!==checkout.reportId||!isPersonalizedPaymentCandidate(metadata)||(env.AUTO_REPORT_DELIVERY_ENABLED==="true"&&(current.provider!=="RAZORPAY"||current.currency!=="INR")))return null;
        const existing=await tx.reportRequest.findUnique({where:{paymentId}});
        if(!personalizedPaymentContext(metadata,existing?.id)||(existing&&(existing.userId!==user.id||existing.reportSlug!==report.slug)))return null;
        if(existing)return {row:existing,created:false};
        if(replaceExpired){
          const active=await tx.reportCheckoutDraft.findFirst({where:{paymentId,expiresAt:{gt:new Date()}},select:{paymentId:true}});
          if(active||current.createdAt.getTime()+CHECKOUT_DRAFT_LIFETIME_MS>Date.now()||metadata.reviewedInputDigest!==expectedInputDigest)return null;
        }
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
        timeOfBirth: body.timeOfBirth??"",
        birthPlace: body.birthPlace??"",
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
      if(replaceExpired)await tx.auditLog.create({data:{actorId:user.id,actorRole:String(user.role),action:"report_request.expired_input_reconfirmed",targetType:"ReportRequest",targetId:row.id,metadata:{paymentId,reportSlug:report.slug}}});
      if(paymentId&&expectedInputDigest!==undefined)await tx.reportCheckoutDraft.deleteMany({where:{paymentId}});
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

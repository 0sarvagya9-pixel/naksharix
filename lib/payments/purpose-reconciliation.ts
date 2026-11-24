import "server-only";
import { Prisma, type Payment } from "@prisma/client";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/monitoring/logger";
import { writeAuditLog } from "@/lib/reports/report-audit";
import { notifyCapturedPujaPayment, notifyProcessedPujaRefund } from "@/lib/puja/payment-notifications";
import {lockCreditAccount} from "@/lib/ai/credit-ledger";
import {recordSignedRefundReceipt} from "@/lib/payments/refund-evidence";
import {lockPackage} from "@/lib/digital-packages/ledger";
import {lockExpertService,expertSchemaReady} from "@/lib/expert-services/ledger";

/** One-gateway post-capture state reconciliation. Idempotent; never reopens canceled work. */
export async function reconcileCapturedPurpose(payment: Payment) {
  const meta = (payment.metadata as Record<string, unknown> | null) ?? {};
  if (payment.status !== "PAID") return;
  if (payment.purpose === "SHOP_ORDER" && typeof meta.shopOrderId === "string") {
    await prisma.shopOrder.updateMany({
      where: {
        id: meta.shopOrderId, userId: payment.userId,
        status: "CONFIRMED", paymentStatus: { in: ["UNPAID", "FAILED"] },
        totalPaise: Math.round(Number(payment.amount) * 100)
      },
      data: { paymentStatus: "PAID" }
    });
  }
  if (payment.purpose === "CONSULTATION" && typeof meta.bookingId === "string") {
    await prisma.consultationBooking.updateMany({
      where: {
        id: meta.bookingId, userId: payment.userId,
        status: { in: ["REQUESTED", "PAYMENT_PENDING", "ACCEPTED", "CONFIRMED"] },
        paymentStatus: { in: ["PENDING", "FAILED"] }
      },
      data: { status: "CONFIRMED", paymentStatus: "PAID" }
    });
  }
  if (payment.purpose === "PUJA_BOOKING" && typeof meta.pujaBookingId === "string") {
    // Payment is accepted only after a verified Pandit/date were scheduled.
    // Never overwrite the ceremony status to CONFIRMED from a gateway callback.
    await notifyCapturedPujaPayment(payment).catch(() =>
      logger.warn("puja_capture_notification_temporarily_unavailable"));
  }
  // Verified payment updates the Payment ledger, NOT proof of a ceremony.
}

/** Only signed Razorpay refund.processed with the exact FULL original amount
 * may change entitlements. A partial refund requires separate accounting review.
 * No fake refund initiation or bank-settlement claim is made here.
 */
export async function reconcileProcessedRefund(refund: {
  id?: string; payment_id?: string; amount?: number; status?: string;
}) {
  if (refund.status !== "processed" || !refund.payment_id || !refund.id ||
      !Number.isSafeInteger(refund.amount) || Number(refund.amount) <= 0) return;
  // Signed receipts survive out-of-order events before a membership Payment exists.
  const signedTotal=await recordSignedRefundReceipt(refund);
  const original = await prisma.payment.findUnique({ where: { providerPaymentId: refund.payment_id } });
  if (!original) return;
  const fullAmountPaise = Math.round(Number(original.amount) * 100);
  const effectiveRefund=original.purpose==="AI_MEMBERSHIP"&&signedTotal!==null?signedTotal:Number(refund.amount);
  if(effectiveRefund>fullAmountPaise&&original.purpose==="AI_MEMBERSHIP")throw Error("MEMBERSHIP_REFUND_TOTAL_INVALID");
  if (effectiveRefund !== fullAmountPaise) {
    if(original.purpose==="EXPERT_SERVICE"&&Number(refund.amount)<fullAmountPaise){
      const expertId=(original.metadata as Record<string,unknown>|null)?.expertServiceId;
      if(typeof expertId==="string")await prisma.$transaction(async tx=>{await lockExpertService(tx,expertId);await tx.expertServiceRequest.updateMany({where:{id:expertId,userId:original.userId,paymentId:original.id,status:{in:["PAID","DELIVERED"]}},data:{status:"REVIEW",settlementStatus:"REVIEW"}});});
    }
    if(original.purpose==="DIGITAL_PACKAGE"&&refund.amount!<fullAmountPaise){
      const packageId=(original.metadata as Record<string,unknown>|null)?.digitalPackageId;
      if(typeof packageId==="string")await prisma.$transaction(async tx=>{await lockPackage(tx,packageId);await tx.digitalPackageOrder.updateMany({where:{id:packageId,userId:original.userId,paymentId:original.id,status:"PAID"},data:{status:"REVIEW"}});});
    }
    if(["AI_CREDITS","AI_MEMBERSHIP"].includes(original.purpose)&&effectiveRefund<fullAmountPaise){
      // A signed partial refund requires human reconciliation; prevent any further spending of this grant.
      await prisma.$transaction(async tx=>{await lockCreditAccount(tx,original.userId);await tx.aiCreditGrant.updateMany({where:{paymentId:original.id,revokedAt:null,suspendedAt:null,payment:{status:"PAID"}},data:{suspendedAt:new Date()}});});
    }
    logger.warn("razorpay_partial_refund_requires_ledger_review", { paymentId: original.id });
    return;
  }
  const meta = (original.metadata as Record<string, unknown> | null) ?? {};

  // Single atomic transition. A callback retry after a dependent-record error
  // must re-run the WHOLE transaction, not leave a refunded payment with a
  // still-paid digital entitlement or an uncanceled shop order.
  const transitioned = await prisma.$transaction(async (tx) => {
    if(["AI_CREDITS","AI_MEMBERSHIP"].includes(original.purpose))await lockCreditAccount(tx,original.userId);
    const packageId=original.purpose==="DIGITAL_PACKAGE"&&typeof meta.digitalPackageId==="string"?meta.digitalPackageId:null;
    if(packageId)await lockPackage(tx,packageId);
    const expertId=original.purpose==="EXPERT_SERVICE"&&typeof meta.expertServiceId==="string"?meta.expertServiceId:null;
    if(expertId)await lockExpertService(tx,expertId);
    const updated = await tx.payment.updateMany({
      where: { id: original.id, status: "PAID", providerPaymentId: refund.payment_id },
      data: {
        status: "REFUNDED",
        metadata: { ...meta, verifiedRefundId: refund.id, refundVerifiedBy: "signed_webhook" } as Prisma.InputJsonObject
      }
    });
    if (updated.count !== 1) return false;
    if(expertId){await tx.expertServiceRequest.updateMany({where:{id:expertId,userId:original.userId,paymentId:original.id},data:{status:"REFUNDED",settlementStatus:"REVIEW"}});}
    if(packageId)await tx.digitalPackageOrder.updateMany({where:{id:packageId,userId:original.userId,paymentId:original.id},data:{status:"REFUNDED"}});
    if(["AI_CREDITS","AI_MEMBERSHIP"].includes(original.purpose))await tx.aiCreditGrant.updateMany({where:{paymentId:original.id,revokedAt:null},data:{revokedAt:new Date()}});

    if (original.purpose === "SHOP_ORDER" && typeof meta.shopOrderId === "string") {
      await tx.shopOrder.updateMany({
        where: { id: meta.shopOrderId, userId: original.userId, paymentStatus: "PAID" },
        data: { paymentStatus: "REFUNDED" }
      });
      await tx.shopOrder.updateMany({
        where: { id: meta.shopOrderId, userId: original.userId,
          status: { in: ["REQUESTED", "CONFIRMED", "PACKING"] } },
        data: { status: "CANCELED" }
      });
    }
    if (original.purpose === "PUJA_BOOKING" && typeof meta.pujaBookingId === "string") {
      await tx.pujaBookingRequest.updateMany({
        where: { id: meta.pujaBookingId, userId: original.userId,
          status: { notIn: ["COMPLETED", "CANCELED"] } },
        data: { status: "CANCELED" }
      });
    }
    if (original.purpose === "CONSULTATION" && typeof meta.bookingId === "string") {
      await tx.consultationBooking.updateMany({
        where: { id: meta.bookingId, userId: original.userId, paymentStatus: "PAID" },
        data: { paymentStatus: "REFUNDED" }
      });
      await tx.consultationBooking.updateMany({
        where: { id: meta.bookingId, userId: original.userId,
          status: { in: ["REQUESTED", "PAYMENT_PENDING", "ACCEPTED", "CONFIRMED"] } },
        data: { status: "CANCELED" }
      });
    }
    if (["KUNDLI_REPORT", "YEARLY_REPORT", "MATCH_REPORT"].includes(original.purpose)) {
      await tx.purchasedReport.updateMany({
        where: { paymentId: original.id, userId: original.userId },
        data: { status: "REFUNDED" }
      });
      await tx.reportRequest.updateMany({
        where: { paymentId: original.id, userId: original.userId },
        data: { paymentStatus: "REFUNDED" }
      });
      await tx.reportRequest.updateMany({
        where: { paymentId: original.id, userId: original.userId,
          status: { notIn: ["DELIVERED", "SENT", "CANCELLED"] } },
        data: { status: "CANCELLED" }
      });
    }
    return true;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  if (!transitioned) return;
  await writeAuditLog({
    actor: { id: original.userId, role: "USER" },
    action: "payment.razorpay_full_refund_verified",
    targetType: "Payment",
    targetId: original.id,
    metadata: { refundId: refund.id, purpose: original.purpose, verifiedWebhook: true }
  });
  if (["KUNDLI_REPORT","YEARLY_REPORT","MATCH_REPORT"].includes(original.purpose)&&await expertSchemaReady()){
    // A refunded base report cannot continue to authorize a paid review. Do not invent a second refund.
    const linked=await prisma.reportRequest.findUnique({where:{paymentId:original.id},select:{id:true}});
    if(linked){const reviews=await prisma.expertServiceRequest.findMany({where:{sourceReportId:linked.id,userId:original.userId,status:{in:["PAID","DELIVERED"]}},select:{id:true}});for(const review of reviews)await prisma.$transaction(async tx=>{await lockExpertService(tx,review.id);await tx.expertServiceRequest.updateMany({where:{id:review.id,status:{in:["PAID","DELIVERED"]}},data:{status:"REVIEW",settlementStatus:"REVIEW"}});});}
  }
  if (original.purpose === "PUJA_BOOKING") {
    await notifyProcessedPujaRefund(original, refund.id).catch(() =>
      logger.warn("puja_refund_notification_temporarily_unavailable"));
  }
}

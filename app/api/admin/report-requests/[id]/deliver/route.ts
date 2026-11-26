import { ReportRequestStatus } from "@prisma/client";
import { fail, handleApiError, ok } from "@/lib/api";
import { getAdminApiUser } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/monitoring/logger";
import { writeAuditLog, writeReportStatusHistory } from "@/lib/reports/report-audit";
import { hasActiveReportLease, reportDeliveryMessage, requiresEmailReconciliation, sendReportDeliveryEmail } from "@/lib/reports/report-delivery-service";
import {notifyAccountUpdate} from "@/lib/notifications/web-push";
import {fixedReportCheckout,hasCurrentPaidReportEntitlement} from "@/lib/reports/paid-entitlement";
import {loadReportPdf} from "@/lib/storage/report-storage";

type Params = Promise<{ id: string }>;

export async function POST(_request: Request, { params }: { params: Params }) {
  try {
    const admin = await getAdminApiUser();
    if (!admin) return fail("Forbidden", 403);
    const { id } = await params;
    const reportRequest = await prisma.reportRequest.findUnique({ where: { id } });
    if (!reportRequest) return fail("Report request not found", 404);
    if (hasActiveReportLease(reportRequest)) return fail("Report processing is active. Retry after the current operation ends.", 409);
    // An admin retry must not resend a completed report email.
    if (reportRequest.status === ReportRequestStatus.DELIVERED && reportRequest.deliveryStatus === "email_sent") {
      return ok({ reportRequest, delivery: { sent: false, skipped: true, reason: "Already recorded as sent; no duplicate email attempted." } });
    }
    if (requiresEmailReconciliation(reportRequest)) return fail("The earlier email attempt requires provider reconciliation before another send.", 409);
    if (!reportRequest.adminBypass && reportRequest.paymentStatus !== "PAID") {
      return fail("Verified payment or authorized admin bypass is required before delivering a paid report.", 409);
    }
    const requiresPaidEntitlement=!reportRequest.adminBypass&&Boolean(fixedReportCheckout(reportRequest.reportSlug));
    if(reportRequest.status===ReportRequestStatus.CANCELLED||(requiresPaidEntitlement&&!await hasCurrentPaidReportEntitlement(reportRequest)))return fail("Report purchase requires reconciliation before delivery.",409);
    if (!reportRequest.generatedPdfSize || (!reportRequest.generatedPdfBytes && !reportRequest.generatedPdfStorageKey)) {
      return fail("A real generated PDF is required before delivery.", 422);
    }

    const bytes=await loadReportPdf({storageDriver:reportRequest.generatedPdfStorageDriver,storageKey:reportRequest.generatedPdfStorageKey,databaseBytes:reportRequest.generatedPdfBytes,expectedChecksum:reportRequest.generatedPdfChecksum});
    if(bytes.length!==reportRequest.generatedPdfSize||Buffer.from(bytes.subarray(0,5)).toString("ascii")!=="%PDF-")return fail("The stored report requires integrity review.",503);
    const recipient = reportRequest.userId ? await prisma.user.findUnique({
      where: { id: reportRequest.userId }, select: { email: true, emailVerified: true, emailVerifiedAt: true, googleId: true }
    }) : null;
    if (!recipient || recipient.email.toLowerCase() !== reportRequest.deliveryEmail.toLowerCase() ||
        (!recipient.emailVerified && !recipient.emailVerifiedAt && !recipient.googleId)) {
      return fail("Verify the current registered delivery mailbox before sending the report.", 409);
    }
    if (requiresPaidEntitlement && !await hasCurrentPaidReportEntitlement(reportRequest)) return fail("Report purchase changed before delivery.", 409);

    const lease = new Date();
    const unchanged = {
      id: reportRequest.id, paymentId: reportRequest.paymentId, paymentStatus: reportRequest.paymentStatus, status: reportRequest.status,
      ...(requiresPaidEntitlement ? { payment: { is: { status: "PAID" as const } } } : {})
    };
    const claim = await prisma.reportRequest.updateMany({
      where: { ...unchanged, deliveryStatus: reportRequest.deliveryStatus, updatedAt: reportRequest.updatedAt,
        user: { is: { email: recipient.email, OR: [{ emailVerified: { not: null } }, { emailVerifiedAt: { not: null } }, { googleId: { not: null } }] } } },
      data: { deliveryStatus: "admin_sending", updatedAt: lease }
    });
    if (claim.count !== 1) return fail("Report state changed before delivery. Reload the request.", 409);
    const leased = { ...unchanged, deliveryStatus: "admin_sending", updatedAt: lease };
    const sent = await sendReportDeliveryEmail(reportDeliveryMessage(reportRequest, recipient.email));

    if (!sent.sent) {
      const saved=await prisma.reportRequest.updateMany({
        where: leased,
        data: { status: ReportRequestStatus.READY_FOR_DELIVERY, deliveryStatus: sent.acceptanceUncertain ? "admin_email_uncertain" : "secure_download_ready", deliveryError: sent.reason }
      });
      if(saved.count!==1)return fail("Report state changed during delivery; reconcile the current request before retrying.",409);
      await writeReportStatusHistory({
        reportRequestId: reportRequest.id,
        oldStatus: reportRequest.status,
        newStatus: ReportRequestStatus.READY_FOR_DELIVERY,
        actor: admin,
        note: "Email delivery was not accepted by the provider; secure download remains available.",
        metadata: { deliveryMode: "secure_download_only", storageDriver: reportRequest.generatedPdfStorageDriver ?? "database" }
      });
      await writeAuditLog({
        actor: admin,
        action: "report_delivery.email_disabled",
        targetType: "ReportRequest",
        targetId: reportRequest.id,
        metadata: { missingCount: sent.missing.length, storageDriver: reportRequest.generatedPdfStorageDriver ?? "database" }
      });
      logger.warn("report_delivery_email_disabled", { reportRequestId: reportRequest.id, missingCount: sent.missing.length });
      return fail(sent.reason, 503);
    }

    const saved = await prisma.reportRequest.updateMany({
      where: leased,
      data: { status: ReportRequestStatus.DELIVERED, deliveryStatus: "email_sent", emailSentAt: new Date(), deliveryError: null }
    });
    if(saved.count!==1)return fail("Email provider accepted the attempt, but the report state changed. Reconcile before retrying.",409);
    const updated=await prisma.reportRequest.findUniqueOrThrow({where:{id:reportRequest.id}});
    await writeReportStatusHistory({
      reportRequestId: reportRequest.id,
      oldStatus: reportRequest.status,
      newStatus: ReportRequestStatus.DELIVERED,
      actor: admin,
      note: "Report delivery email sent.",
      metadata: { deliveryMode: "email", providerMessageId:sent.providerMessageId, storageDriver: reportRequest.generatedPdfStorageDriver ?? "database" }
    });
    await writeAuditLog({
      actor: admin,
      action: "report_delivery.email_sent",
      targetType: "ReportRequest",
      targetId: reportRequest.id,
      metadata: { deliveryMode: "email", providerMessageId:sent.providerMessageId, storageDriver: reportRequest.generatedPdfStorageDriver ?? "database" }
    });
    if(updated.userId&&!updated.adminBypass&&updated.paymentStatus==="PAID")await notifyAccountUpdate({userId:updated.userId,kind:"report",reference:updated.id,status:"PDF_READY"});
    return ok({ reportRequest: updated, delivery: sent });
  } catch (error) {
    return handleApiError(error);
  }
}

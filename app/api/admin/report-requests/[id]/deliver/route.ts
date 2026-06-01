import { ReportRequestStatus } from "@prisma/client";
import { fail, handleApiError, ok } from "@/lib/api";
import { requireAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { logger } from "@/lib/monitoring/logger";
import { writeAuditLog, writeReportStatusHistory } from "@/lib/reports/report-audit";
import { sendReportDeliveryEmail } from "@/lib/reports/report-delivery-service";

type Params = Promise<{ id: string }>;

export async function POST(_request: Request, { params }: { params: Params }) {
  try {
    const admin = await requireAdminRole();
    const { id } = await params;
    const reportRequest = await prisma.reportRequest.findUnique({ where: { id } });
    if (!reportRequest) return fail("Report request not found", 404);
    if (!reportRequest.generatedPdfBytes || !reportRequest.generatedPdfSize) {
      return fail("A real generated PDF is required before delivery.", 422);
    }

    const downloadUrl = `${env.NEXT_PUBLIC_APP_URL}/api/report-requests/${reportRequest.id}/download`;
    const sent = await sendReportDeliveryEmail({
      to: reportRequest.deliveryEmail,
      fullName: reportRequest.fullName,
      reportRequestId: reportRequest.id,
      downloadUrl
    });

    if (!sent.sent) {
      await prisma.reportRequest.update({
        where: { id: reportRequest.id },
        data: { status: ReportRequestStatus.READY_FOR_DELIVERY, deliveryStatus: "secure_download_ready", deliveryError: sent.reason }
      });
      await writeReportStatusHistory({
        reportRequestId: reportRequest.id,
        oldStatus: reportRequest.status,
        newStatus: ReportRequestStatus.READY_FOR_DELIVERY,
        actor: admin,
        note: "Email delivery not configured; secure download remains available.",
        metadata: { deliveryMode: "secure_download_only" }
      });
      await writeAuditLog({
        actor: admin,
        action: "report_delivery.email_disabled",
        targetType: "ReportRequest",
        targetId: reportRequest.id,
        metadata: { missingCount: sent.missing.length }
      });
      logger.warn("report_delivery_email_disabled", { reportRequestId: reportRequest.id, missingCount: sent.missing.length });
      return fail(sent.reason, 503);
    }

    const updated = await prisma.reportRequest.update({
      where: { id: reportRequest.id },
      data: { status: ReportRequestStatus.DELIVERED, deliveryStatus: "email_sent", emailSentAt: new Date(), deliveryError: null }
    });
    await writeReportStatusHistory({
      reportRequestId: reportRequest.id,
      oldStatus: reportRequest.status,
      newStatus: ReportRequestStatus.DELIVERED,
      actor: admin,
      note: "Report delivery email sent.",
      metadata: { deliveryMode: "email" }
    });
    await writeAuditLog({
      actor: admin,
      action: "report_delivery.email_sent",
      targetType: "ReportRequest",
      targetId: reportRequest.id,
      metadata: { deliveryMode: "email" }
    });
    return ok({ reportRequest: updated, delivery: sent });
  } catch (error) {
    return handleApiError(error);
  }
}

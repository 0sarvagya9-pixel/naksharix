import { ReportRequestStatus } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok } from "@/lib/api";
import { getAdminApiUser } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { writeAuditLog, writeReportStatusHistory } from "@/lib/reports/report-audit";
import { assertAllowedReportStatusTransition } from "@/lib/reports/report-status-transitions";

export async function GET() {
  try {
    const admin = await getAdminApiUser();
    if (!admin) return fail("Forbidden", 403);
    const reportRequests = await prisma.reportRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        fullName: true,
        deliveryEmail: true,
        planType: true,
        paymentStatus: true,
        status: true,
        reportSlug: true,
        dateOfBirth: true,
        timeOfBirth: true,
        birthPlace: true,
        phone: true,
        concern: true,
        generatedPdfFileName: true,
        generatedPdfSize: true,
        user: { select: { email: true, name: true } },
        payment: { select: { id: true, amount: true, currency: true, providerOrderId: true, providerPaymentId: true, status: true } }
      }
    });
    return ok({ reportRequests });
  } catch (error) {
    return handleApiError(error);
  }
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(ReportRequestStatus),
  adminNotes: z.string().max(5000).optional(),
  reviewConfirmed: z.boolean().optional()
});

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminApiUser();
    if (!admin) return fail("Forbidden", 403);
    const body = patchSchema.parse(await request.json());
    const current = await prisma.reportRequest.findUnique({ where: { id: body.id } });
    if (!current) return fail("Report request not found", 404);
    if (body.status === ReportRequestStatus.READY_FOR_GENERATION && current.status !== body.status) {
      if (body.reviewConfirmed !== true || (body.adminNotes ?? "").trim().length < 30) {
        return fail("Explicit admin review confirmation and at least 30 characters of chart/input review notes are required.", 422);
      }
    }
    try {
      assertAllowedReportStatusTransition(current.status, body.status, {
        hasPdf: Boolean(current.generatedPdfSize && (current.generatedPdfBytes || current.generatedPdfStorageKey)),
        paymentStatus: current.paymentStatus,
        adminBypass: current.adminBypass
      });
    } catch (error) {
      return fail(error instanceof Error ? error.message : "Invalid status transition", 422);
    }
    const reportRequest = await prisma.reportRequest.update({
      where: { id: body.id },
      data: {
        status: body.status,
        adminNotes: body.adminNotes ?? current.adminNotes
      }
    });
    if (current.status !== reportRequest.status) {
      await writeReportStatusHistory({
        reportRequestId: reportRequest.id,
        oldStatus: current.status,
        newStatus: reportRequest.status,
        actor: admin,
        note: body.adminNotes,
        metadata: { source: "admin_patch", reviewConfirmed: body.status === ReportRequestStatus.READY_FOR_GENERATION && body.reviewConfirmed === true }
      });
    }
    await writeAuditLog({
      actor: admin,
      action: "report_request.status_updated",
      targetType: "ReportRequest",
      targetId: reportRequest.id,
      metadata: { from: current.status, to: reportRequest.status }
    });
    return ok({ reportRequest });
  } catch (error) {
    return handleApiError(error);
  }
}


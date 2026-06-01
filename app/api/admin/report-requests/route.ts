import { ReportRequestStatus } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok } from "@/lib/api";
import { requireAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { writeAuditLog, writeReportStatusHistory } from "@/lib/reports/report-audit";
import { assertAllowedReportStatusTransition } from "@/lib/reports/report-status-transitions";

export async function GET() {
  try {
    await requireAdminRole();
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
  adminNotes: z.string().max(5000).optional()
});

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdminRole();
    const body = patchSchema.parse(await request.json());
    const current = await prisma.reportRequest.findUnique({ where: { id: body.id } });
    if (!current) return fail("Report request not found", 404);
    try {
      assertAllowedReportStatusTransition(current.status, body.status, {
        hasPdf: Boolean(current.generatedPdfBytes && current.generatedPdfSize),
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
        adminNotes: body.adminNotes
      }
    });
    if (current.status !== reportRequest.status) {
      await writeReportStatusHistory({
        reportRequestId: reportRequest.id,
        oldStatus: current.status,
        newStatus: reportRequest.status,
        actor: admin,
        note: body.adminNotes,
        metadata: { source: "admin_patch" }
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


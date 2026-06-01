import { ReportRequestStatus } from "@prisma/client";
import { fail, handleApiError, ok } from "@/lib/api";
import { requireAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/monitoring/logger";
import { calculateInternalChart } from "@/lib/astrology/premium-engine/chart";
import { calculatePremiumPanchang } from "@/lib/astrology/premium-engine/panchang";
import { calculateInternalTransitSnapshot } from "@/lib/astrology/transit/engine";
import { writeAuditLog, writeReportStatusHistory } from "@/lib/reports/report-audit";
import { assemblePremiumReportContent } from "@/lib/reports/premium-report-content-engine";
import { generatePremiumReportPdf } from "@/lib/reports/premium-report-generation-service";
import { saveReportPdf } from "@/lib/storage/report-storage";
import { rateLimitResponse } from "@/lib/security/rate-limit";

type Params = Promise<{ id: string }>;

export async function POST(_request: Request, { params }: { params: Params }) {
  try {
    const admin = await requireAdminRole();
    const limited = rateLimitResponse("admin-generate-pdf", admin.id, 10, 60_000);
    if (limited) return limited;
    const { id } = await params;
    const reportRequest = await prisma.reportRequest.findUnique({ where: { id } });
    if (!reportRequest) return fail("Report request not found", 404);
    if (!reportRequest.latitude || !reportRequest.longitude || reportRequest.timezone === null) {
      return fail("Birth latitude, longitude, and timezone are required before PDF generation.", 422);
    }

    const chart = calculateInternalChart({
      name: reportRequest.fullName,
      gender: reportRequest.gender ?? undefined,
      dateOfBirth: reportRequest.dateOfBirth,
      timeOfBirth: reportRequest.timeOfBirth,
      birthPlace: reportRequest.birthPlace,
      latitude: reportRequest.latitude,
      longitude: reportRequest.longitude,
      timezone: String(reportRequest.timezone),
      language: reportRequest.language === "hi" || reportRequest.language === "hinglish" ? reportRequest.language : "en",
      ayanamsa: "lahiri",
      houseSystem: "whole_sign"
    });

    const panchang = calculatePremiumPanchang({
      date: reportRequest.dateOfBirth,
      latitude: reportRequest.latitude,
      longitude: reportRequest.longitude,
      timezone: String(reportRequest.timezone),
      place: reportRequest.birthPlace
    });

    const transit = calculateInternalTransitSnapshot({
      date: new Date().toISOString().slice(0, 10),
      latitude: reportRequest.latitude,
      longitude: reportRequest.longitude,
      timezone: String(reportRequest.timezone),
      place: reportRequest.birthPlace,
      ayanamsa: "lahiri"
    });

    const content = assemblePremiumReportContent({
      chart,
      includePanchang: panchang,
      includeTransit: transit
    });

    const generated = await generatePremiumReportPdf({
      requestId: reportRequest.id,
      templateId: reportRequest.reportSlug,
      status: "ready_for_generation",
      content,
      reviewedByAdmin: true
    });

    if (generated.status !== "generated_internal_unverified" || !generated.bytes?.byteLength) {
      return fail("PDF generation did not produce a file.", 500);
    }

    const stored = saveReportPdf({
      reportRequestId: reportRequest.id,
      reportSlug: reportRequest.reportSlug,
      bytes: generated.bytes
    });
    await prisma.reportRequest.update({
      where: { id: reportRequest.id },
      data: {
        generatedPdfBytes: stored.bytes,
        generatedPdfFileName: stored.fileName,
        generatedPdfMimeType: stored.mimeType,
        generatedPdfStorageKey: stored.storageKey,
        generatedPdfChecksum: stored.checksum,
        generatedPdfStorageDriver: stored.storageDriver,
        generatedPdfSize: stored.size,
        generatedAt: new Date(),
        deliveryStatus: "not_sent",
        deliveryError: null,
        status: ReportRequestStatus.GENERATED
      }
    });
    await writeReportStatusHistory({
      reportRequestId: reportRequest.id,
      oldStatus: reportRequest.status,
      newStatus: ReportRequestStatus.GENERATED,
      actor: admin,
      note: "PDF generated and stored.",
      metadata: { storageDriver: stored.storageDriver, size: stored.size }
    });
    await writeAuditLog({
      actor: admin,
      action: "report_pdf.generated",
      targetType: "ReportRequest",
      targetId: reportRequest.id,
      metadata: { storageDriver: stored.storageDriver, size: stored.size }
    });
    logger.info("report_pdf_generated", { reportRequestId: reportRequest.id, storageDriver: stored.storageDriver, size: stored.size });

    return ok({ fileName: stored.fileName, byteLength: stored.size, storageProvider: stored.storageDriver, status: ReportRequestStatus.GENERATED });
  } catch (error) {
    return handleApiError(error);
  }
}

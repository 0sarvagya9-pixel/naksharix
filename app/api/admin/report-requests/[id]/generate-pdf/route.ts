import { ReportRequestStatus } from "@prisma/client";
import { fail, handleApiError, ok } from "@/lib/api";
import { requireAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { calculateInternalChart } from "@/lib/astrology/premium-engine/chart";
import { calculatePremiumPanchang } from "@/lib/astrology/premium-engine/panchang";
import { calculateInternalTransitSnapshot } from "@/lib/astrology/transit/engine";
import { assemblePremiumReportContent } from "@/lib/reports/premium-report-content-engine";
import { generatePremiumReportPdf } from "@/lib/reports/premium-report-generation-service";

type Params = Promise<{ id: string }>;

export async function POST(_request: Request, { params }: { params: Params }) {
  try {
    await requireAdminRole();
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

    const fileName = `naksharix-${reportRequest.reportSlug}-${reportRequest.id}.pdf`;
    await prisma.reportRequest.update({
      where: { id: reportRequest.id },
      data: {
        generatedPdfBytes: new Uint8Array(generated.bytes),
        generatedPdfFileName: fileName,
        generatedPdfSize: generated.byteLength,
        generatedAt: new Date(),
        status: ReportRequestStatus.GENERATED
      }
    });

    return ok({ fileName, byteLength: generated.byteLength, status: ReportRequestStatus.GENERATED });
  } catch (error) {
    return handleApiError(error);
  }
}

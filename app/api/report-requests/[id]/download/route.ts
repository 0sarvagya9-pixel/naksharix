import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { isAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/monitoring/logger";
import { writeAuditLog } from "@/lib/reports/report-audit";
import { getRequestIp, rateLimitResponse } from "@/lib/security/rate-limit";
import { loadReportPdf } from "@/lib/storage/report-storage";

type Params = Promise<{ id: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const limited = rateLimitResponse("report-pdf-download", user.id || getRequestIp(request), 30, 60_000);
  if (limited) return limited;
  const { id } = await params;
  const reportRequest = await prisma.reportRequest.findUnique({ where: { id } });
  if (!reportRequest) return NextResponse.json({ error: "Report request not found" }, { status: 404 });
  if (!isAdmin(user) && reportRequest.userId !== user.id) {
    await writeAuditLog({
      actor: user,
      action: "report_pdf.download_denied",
      targetType: "ReportRequest",
      targetId: reportRequest.id,
      metadata: { reason: "not_owner_or_admin" }
    });
    logger.warn("report_pdf_download_denied", { reportRequestId: reportRequest.id, actorId: user.id });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!reportRequest.generatedPdfSize || (!reportRequest.generatedPdfBytes && !reportRequest.generatedPdfStorageKey)) {
    return NextResponse.json({ error: "No generated PDF is available for this request." }, { status: 404 });
  }

  let bytes: Uint8Array;
  try {
    bytes = await loadReportPdf({
      storageDriver: reportRequest.generatedPdfStorageDriver,
      storageKey: reportRequest.generatedPdfStorageKey,
      databaseBytes: reportRequest.generatedPdfBytes,
      expectedChecksum: reportRequest.generatedPdfChecksum
    });
  } catch {
    logger.error("report_pdf_storage_load_failed", { reportRequestId: reportRequest.id, storageDriver: reportRequest.generatedPdfStorageDriver ?? "database" });
    return NextResponse.json({ error: "The generated PDF is temporarily unavailable." }, { status: 503 });
  }

  await writeAuditLog({
    actor: user,
    action: "report_pdf.downloaded",
    targetType: "ReportRequest",
    targetId: reportRequest.id,
    metadata: { storageDriver: reportRequest.generatedPdfStorageDriver ?? "database", size: bytes.byteLength }
  });

  const responseBuffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(responseBuffer).set(bytes);
  return new NextResponse(responseBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `attachment; filename="${reportRequest.generatedPdfFileName ?? `naksharix-report-${id}.pdf`}"`,
      "X-Naksharix-Storage": reportRequest.generatedPdfStorageDriver ?? "database",
      "Cache-Control": "private, no-store"
    }
  });
}

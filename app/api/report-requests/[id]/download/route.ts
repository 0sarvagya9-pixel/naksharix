import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { isAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/monitoring/logger";
import { writeAuditLog } from "@/lib/reports/report-audit";
import { getRequestIp, rateLimitResponse } from "@/lib/security/rate-limit";

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
  if (!reportRequest.generatedPdfBytes || !reportRequest.generatedPdfSize) {
    return NextResponse.json({ error: "No generated PDF is available for this request." }, { status: 404 });
  }

  const bytes = Buffer.from(reportRequest.generatedPdfBytes);
  await writeAuditLog({
    actor: user,
    action: "report_pdf.downloaded",
    targetType: "ReportRequest",
    targetId: reportRequest.id,
    metadata: { storageDriver: reportRequest.generatedPdfStorageDriver ?? "database", size: reportRequest.generatedPdfSize }
  });
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `attachment; filename="${reportRequest.generatedPdfFileName ?? `naksharix-report-${id}.pdf`}"`,
      "X-Naksharix-Storage": reportRequest.generatedPdfStorageKey ?? "db://report-requests/generated-pdf",
      "Cache-Control": "private, no-store"
    }
  });
}

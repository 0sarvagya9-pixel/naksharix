import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { isAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";

type Params = Promise<{ id: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const { id } = await params;
  const reportRequest = await prisma.reportRequest.findUnique({ where: { id } });
  if (!reportRequest) return NextResponse.json({ error: "Report request not found" }, { status: 404 });
  if (!isAdmin(user) && reportRequest.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!reportRequest.generatedPdfBytes || !reportRequest.generatedPdfSize) {
    return NextResponse.json({ error: "No generated PDF is available for this request." }, { status: 404 });
  }

  const bytes = Buffer.from(reportRequest.generatedPdfBytes);
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `attachment; filename="${reportRequest.generatedPdfFileName ?? `naksharix-report-${id}.pdf`}"`,
      "Cache-Control": "private, no-store"
    }
  });
}

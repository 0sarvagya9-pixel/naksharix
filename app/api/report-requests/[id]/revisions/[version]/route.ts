import { fail, handleApiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { isAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { hasCurrentPaidReportEntitlement } from "@/lib/reports/paid-entitlement";
import { revisionRequestSelection } from "@/lib/reports/report-revisions";
import { sharedRateLimitResponse } from "@/lib/security/rate-limit";
import { loadReportPdf } from "@/lib/storage/report-storage";

export async function GET(_request:Request, {params}:{params:Promise<{id:string;version:string}>}) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated",401);
    const limited = await sharedRateLimitResponse("report-version-download",user.id,30,60_000);
    if (limited) return limited;
    const {id,version} = await params;
    if (!/^[1-9]\d{0,8}$/.test(version)) return fail("Unknown version",404);
    const parent = await prisma.reportRequest.findUnique({where:{id},select:revisionRequestSelection});
    if (!parent || (parent.userId!==user.id && !isAdmin(user))) return fail("Unknown report",404);
    if (!await hasCurrentPaidReportEntitlement(parent)) return fail("Current purchase required.",403);
    const revision = await prisma.reportRevision.findUnique({where:{reportRequestId_version:{reportRequestId:id,version:Number(version)}},
      select:{status:true,bytes:true,storageKey:true,storageDriver:true,checksum:true,size:true}});
    if (revision?.status!=="READY"||!revision.checksum||!revision.size) return fail("Version unavailable",404);
    const bytes = await loadReportPdf({databaseBytes:revision.bytes,storageKey:revision.storageKey,storageDriver:revision.storageDriver,expectedChecksum:revision.checksum});
    if (bytes.length!==revision.size || Buffer.from(bytes.subarray(0,5)).toString("ascii")!=="%PDF-") return fail("PDF integrity check failed.",503);
    if (!await hasCurrentPaidReportEntitlement(parent)) return fail("Purchase changed.",403);
    return new Response(new Uint8Array(bytes),{headers:{"Content-Type":"application/pdf","Cache-Control":"private, no-store",
      "Content-Disposition":`attachment; filename="naksharix-${parent.reportSlug}-v${Number(version)}.pdf"`,"X-Content-Type-Options":"nosniff"}});
  } catch(error) { return handleApiError(error); }
}

import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { sharedRateLimitResponse } from "@/lib/security/rate-limit";
import { correctionAvailable, correctionSchema, proposeRevision, revisionRequestSelection } from "@/lib/reports/report-revisions";

export async function POST(request:Request, {params}:{params:Promise<{id:string}>}) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated",401);
    const limited = await sharedRateLimitResponse("report-correction",user.id,6,60_000);
    if (limited) return limited;
    const {id} = await params;
    const parent = await prisma.reportRequest.findUnique({where:{id},select:revisionRequestSelection});
    if (!parent || parent.userId !== user.id) return fail("Report not found",404);
    if (!correctionAvailable(parent)) return fail("This request is still processing.",409);
    const input = await validateJson(request, correctionSchema);
    const result = await proposeRevision(parent,input);
    if (!("revision" in result) || !result.revision) return fail(result.error,result.status);
    return ok({revision:result.revision});
  } catch(error) { return handleApiError(error); }
}

import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getAdminApiUser } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { getActiveAstrologyProviderName } from "@/lib/astrology/provider";
import { assembleAutomaticPaidReport } from "@/lib/reports/automatic-report-content";
import { generatePremiumReportPdf } from "@/lib/reports/premium-report-generation-service";
import { hasCurrentPaidReportEntitlement } from "@/lib/reports/paid-entitlement";
import { reportQualityInputHash } from "@/lib/reports/report-quality";
import { notifyReportRevision } from "@/lib/reports/report-revision-notification";
import { REPORT_LEASE_MS } from "@/lib/reports/report-delivery-service";
import { lockRevisionParent, normalizedCorrection, revisionRequestSelection } from "@/lib/reports/report-revisions";
import { saveReportPdf } from "@/lib/storage/report-storage";
import { sharedRateLimitResponse } from "@/lib/security/rate-limit";

export const maxDuration = 120;
const decision = z.object({action:z.enum(["approve","decline","notify"]),note:z.string().trim().max(2000).default("")}).strict();

export async function POST(request:Request, {params}:{params:Promise<{id:string;version:string}>}) {
  try {
    const admin = await getAdminApiUser();
    if (!admin) return fail("Forbidden",403);
    const limited = await sharedRateLimitResponse("report-correction-review",admin.id,10,60_000);
    if (limited) return limited;
    const {id,version} = await params;
    if (!/^[1-9]\d{0,8}$/.test(version)) return fail("Unknown version",404);
    const {action,note} = await validateJson(request,decision);
    const revision = await prisma.reportRevision.findUnique({where:{reportRequestId_version:{reportRequestId:id,version:Number(version)}},
      select:{id:true,version:true,input:true,status:true,updatedAt:true,reportRequest:{select:revisionRequestSelection}}});
    if (!revision) return fail("Unknown version",404);
    const parent = revision.reportRequest;
    if (!await hasCurrentPaidReportEntitlement(parent)) return fail("Purchase requires reconciliation.",409);
    if(action==="notify") {
      if(revision.status!=="READY") return fail("Publish the reviewed version first.",409);
      const result=await notifyReportRevision(revision.id);
      return result.accepted ? ok(result) : fail(result.reason ?? "Email could not be confirmed.",409);
    }
    if(note.length<30) return fail("Enter at least 30 characters of review notes.",422);
    if (revision.status==="READY" || revision.status==="DECLINED") return ok({status:revision.status});
    if (revision.status==="GENERATING" && Date.now()-revision.updatedAt.getTime()<REPORT_LEASE_MS) return fail("This version is being generated.",409);
    const unchanged = {id:revision.id,updatedAt:revision.updatedAt,status:revision.status};
    if (action==="decline") {
      const updated = await prisma.reportRevision.updateMany({where:unchanged,data:{status:"DECLINED",reviewNote:note,reviewedBy:admin.id}});
      return updated.count===1 ? ok({status:"DECLINED"}) : fail("Review changed. Reload the request.",409);
    }
    const input = normalizedCorrection(parent.reportSlug,revision.input);
    if (!input.ok) return fail(input.reason,422);
    if (getActiveAstrologyProviderName()!=="own_engine") return fail("Report engine unavailable.",503);
    const lease = new Date();
    const claim = await prisma.reportRevision.updateMany({where:unchanged,data:{status:"GENERATING",updatedAt:lease}});
    if (claim.count!==1) return fail("Another review is active.",409);
    const leased = {id:revision.id, status:"GENERATING",updatedAt:lease};
    try {
      const assembly = await assembleAutomaticPaidReport({slug:parent.reportSlug,...input.data});
      const versionId = parent.id+"-v"+revision.version;
      const generated = await generatePremiumReportPdf({requestId:versionId,templateId:parent.reportSlug,status:"ready_for_generation",
        expectedInputHash:reportQualityInputHash({slug:parent.reportSlug,...input.data}),reviewedByAdmin:true,specialistInputValidated:true,content:assembly.content,reportTitle:assembly.title,customerName:input.data.birth.name,language:input.data.language});
      if (!generated.generated || !generated.bytes?.length) throw Error("Corrected PDF generation did not complete.");
      const stored = await saveReportPdf({reportRequestId:versionId,reportSlug:parent.reportSlug,bytes:generated.bytes});
      const ready = await prisma.$transaction(async tx=>{
        if (!await lockRevisionParent(tx,parent)) return false;
        const updated = await tx.reportRevision.updateMany({where:leased,data:{status:"READY", reviewNote:note,reviewedBy:admin.id,
          bytes:stored.bytes, storageDriver:stored.storageDriver,storageKey:stored.storageKey,checksum:stored.checksum,size:stored.size}});
        if (!updated.count) return false;
        await tx.reportStatusHistory.create({data:{reportRequestId:id,actorId:admin.id,actorRole:admin.role,oldStatus:parent.status,
          newStatus:parent.status,note:"Reviewed correction published to the customer account.",metadata:{version:revision.version,checksum:stored.checksum}}});
        return true;
      });
      if (!ready) return fail("Report or purchase changed during regeneration.",409);
      const email=await notifyReportRevision(revision.id);
      return ok({status:"READY",version:revision.version,email});
    } finally {
      // A failed/aborted generation can be reviewed again. A newer lease or a completed version is untouched.
      await prisma.reportRevision.updateMany({where:leased,data:{status:"PENDING"}});
    }
  } catch(error) { return handleApiError(error); }
}

import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getAdminApiUser } from "@/lib/auth/roles";
import { isOwnerRecoveryOperator } from "@/lib/ops/owner-recovery-authorization";
import { prisma } from "@/lib/db";
import { dailyRecoveryConfigured, recoveryHealth, runDailyRecovery } from "@/lib/ops/daily-recovery";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

// No user-provided URLs, SQL, credentials, file paths, recipients or commands.
const inputSchema = z.object({confirmation:z.literal("RUN_VERIFIED_RECOVERY")}).strict();
const ATTEMPT_ACTION="recovery.manual.attempt";
const OUTCOME_ACTION="recovery.manual.outcome";
const TARGET_TYPE="EncryptedRecovery";

export async function POST(request:Request) {
  try {
    const admin=await getAdminApiUser();
    if(!(await isOwnerRecoveryOperator(admin)))return fail("Not found",404);
    // Middleware also enforces x-csrf-token == strict same-site CSRF cookie.
    // Deny missing or cross-origin requests even if an auth cookie is present.
    if(request.headers.get("origin") !== new URL(request.url).origin)
      return fail("Forbidden",403);
    await validateJson(request,inputSchema);
    if(process.env.VERCEL_ENV !== "production") return fail("Production-only operation.",403);
    if(!dailyRecoveryConfigured()) return fail("Protected recovery configuration is missing.",503);
    const current=await recoveryHealth();
    if(current.operational && "encrypted" in current && current.encrypted===true &&
      "restoreVerified" in current && current.restoreVerified===true &&
      "lastSuccessfulAt" in current)
      return ok({state:"verified",encrypted:true,privateStore:true,restoreVerified:true,
        lastSuccessfulAt:current.lastSuccessfulAt,alreadyVerified:true});
    // Serialize and cap owner-triggered attempts across all Vercel instances.
    // This audit log stores only the day, attempt and sanitized result code.
    const day=new Date().toISOString().slice(0,10);
    const claimed=await prisma.$transaction(async tx=>{
      await tx.$queryRaw<Array<{locked:string}>>`
        SELECT pg_advisory_xact_lock(hashtext(${"naksharix"}),hashtext(${ATTEMPT_ACTION}))::text AS locked
      `;
      const attempts=await tx.adminActionLog.count({where:{
        action:ATTEMPT_ACTION,targetType:TARGET_TYPE,targetId:day
      }});
      if(attempts>=3)return false;
      await tx.adminActionLog.create({data:{
        adminId:admin!.id,action:ATTEMPT_ACTION,targetType:TARGET_TYPE,targetId:day,
        metadata:{kind:"explicit_owner_run",scope:"read_only_source_private_encrypted_restore"}
      }});
      return true;
    });
    if(!claimed)return fail("Manual recovery attempt limit reached for today.",429);
    try{
      await runDailyRecovery();
      // An HTTP success is not accepted without a separately readable,
      // recent, encrypted private Blob receipt proving isolated restore.
      const proof=await recoveryHealth();
      if(!proof.operational || !("encrypted" in proof) || proof.encrypted!==true ||
        !("restoreVerified" in proof) || proof.restoreVerified!==true ||
        !("lastSuccessfulAt" in proof))
        throw new Error("BACKUP_RECEIPT_NOT_VERIFIED");
      await prisma.adminActionLog.create({data:{
        adminId:admin!.id,action:OUTCOME_ACTION,targetType:TARGET_TYPE,targetId:day,
        metadata:{verified:true,restored:true}
      }}).catch(()=>undefined);
      return ok({state:"verified",encrypted:true,privateStore:true,restoreVerified:true,
        lastSuccessfulAt:proof.lastSuccessfulAt,alreadyVerified:false});
    }catch(error){
      const code=error instanceof Error && /^BACKUP_[A-Z_]+$/.test(error.message)
        ? error.message:"BACKUP_VERIFICATION_FAILED";
      await prisma.adminActionLog.create({data:{
        adminId:admin!.id,action:OUTCOME_ACTION,targetType:TARGET_TYPE,targetId:day,
        metadata:{verified:false,code}
      }}).catch(()=>undefined);
      return fail("Encrypted backup and independent restore were not verified.",503,{code});
    }
  }catch(error){return handleApiError(error);}
}

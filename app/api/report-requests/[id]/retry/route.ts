import { after } from "next/server";
import { fail,ok,handleApiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { rateLimitResponse } from "@/lib/security/rate-limit";
import { processAutomaticReport } from "@/lib/reports/automatic-report-worker";
export const runtime="nodejs";
export const maxDuration=120;
export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);
    if(env.AUTO_REPORT_DELIVERY_ENABLED!=="true")return fail("Automatic processing is currently paused.",503);
    const limited=rateLimitResponse("auto-report-retry",user.id,3,60_000);if(limited)return limited;
    const {id}=await params;
    const row=await prisma.reportRequest.findUnique({where:{id},select:{userId:true,adminBypass:true,paymentStatus:true,deliveryStatus:true,status:true}});
    if(!row||row.userId!==user.id)return fail("Report not found",404);
    if(row.adminBypass||row.paymentStatus!=="PAID"||!["auto_queued","auto_generation_retry","auto_generating","auto_email_ready","auto_email_retry","auto_email_uncertain","auto_sending"].includes(row.deliveryStatus)||row.status==="CANCELLED")return fail("This report is not eligible for automatic retry.",409);
    after(async()=>{await processAutomaticReport(id).catch(()=>undefined)});
    return ok({queued:true});
  }catch(e){return handleApiError(e)}
}

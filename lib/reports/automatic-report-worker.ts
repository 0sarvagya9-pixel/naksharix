import "server-only";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/monitoring/logger";
import { getManualReport } from "@/lib/manual-catalogue";
import { getManualReportCheckout } from "@/lib/reports/checkout-catalogue";
import { checkAutomaticInputs,decodeAutomaticReportInput } from "@/lib/reports/automatic-report-input";
import { assembleAutomaticPaidReport } from "@/lib/reports/automatic-report-content";
import { generatePremiumReportPdf } from "@/lib/reports/premium-report-generation-service";
import { saveReportPdf,loadReportPdf } from "@/lib/storage/report-storage";
import { sendReportDeliveryEmail } from "@/lib/reports/report-delivery-service";
import { writeAuditLog,writeReportStatusHistory } from "@/lib/reports/report-audit";
import type { ReportRequest } from "@prisma/client";

const LEASE_MS=5*60_000;
const EMAIL_REPLAY_MS=23*3600_000;
const GEN_STATES=["auto_queued","auto_generation_retry","auto_generating"];
const MAIL_STATES=["auto_email_ready","auto_email_retry","auto_email_uncertain","auto_sending"];
const ALL_STATES=[...GEN_STATES,...MAIL_STATES];
function stillActive(state:string){return state==="auto_generating"||state==="auto_sending";}
function claimable(row:ReportRequest,now=Date.now()){
  return ALL_STATES.includes(row.deliveryStatus)&&(!stillActive(row.deliveryStatus)||now-row.updatedAt.getTime()>=LEASE_MS);
}
function languageFor(value:string){return value==="hi"||value==="hinglish"?value:"en";}
async function loadEntitled(id:string){
  const row=await prisma.reportRequest.findUnique({where:{id},include:{
    user:{select:{id:true,email:true,emailVerified:true,emailVerifiedAt:true,googleId:true}},
    payment:{select:{id:true,userId:true,status:true,purpose:true,amount:true,currency:true,provider:true,metadata:true}}
  }});
  if(!row||row.adminBypass||row.paymentStatus!=="PAID"||!row.user||!row.payment||row.status==="CANCELLED")return null;
  const product=getManualReportCheckout(row.reportSlug);
  const p=row.payment,meta=p.metadata as Record<string,unknown>|null;
  if(!product||p.status!=="PAID"||p.userId!==row.user.id||p.provider!=="RAZORPAY"||p.currency!=="INR"||
      String(p.purpose)!==product.purpose||Number(p.amount)!==product.amount||meta?.reportId!==product.reportId)return null;
  return row;
}
async function claim(row:ReportRequest,next:string){
  const lease=new Date();
  const result=await prisma.reportRequest.updateMany({
    where:{id:row.id,updatedAt:row.updatedAt,deliveryStatus:row.deliveryStatus,status:row.status,
      paymentStatus:"PAID",adminBypass:false},
    data:{deliveryStatus:next,updatedAt:lease,deliveryError:null,...(next==="auto_generating"?{status:"IN_PROGRESS" as const}:{})}
  });
  return result.count===1?lease:null;
}
function leasedWhere(id:string,lease:Date,state:string){
  return {id,updatedAt:lease,deliveryStatus:state,paymentStatus:"PAID" as const,adminBypass:false,status:{not:"CANCELLED" as const}};
}
async function flag(id:string,lease:Date,state:string,next:string,reason:string){
  await prisma.reportRequest.updateMany({where:leasedWhere(id,lease,state),data:{deliveryStatus:next,deliveryError:reason}});
  logger.warn("automatic_report_attention",{reportRequestId:id,code:reason});
}

/** New, explicitly validated paid purchases only. No synthetic payment, public
 * file or customer address from request parameters. Every write is guarded by
 * the captured payment and a compare-and-set database lease. */
export async function processAutomaticReport(id:string):Promise<"delivered"|"pending"|"skipped">{
  if(env.AUTO_REPORT_DELIVERY_ENABLED!=="true")return "skipped";
  let row=await loadEntitled(id);
  if(!row||!claimable(row)||row.status==="DELIVERED")return "skipped";
  const envelope=decodeAutomaticReportInput(row.concern);
  if(!envelope)return "skipped";
  if(GEN_STATES.includes(row.deliveryStatus)){
    if(row.generatedPdfSize||row.generatedPdfBytes||row.generatedPdfStorageKey)return "skipped";
    if(!["PAID","IN_PROGRESS"].includes(row.status))return "skipped";
    const lease=await claim(row,"auto_generating");if(!lease)return "skipped";
    try{
      const checked=checkAutomaticInputs(row.reportSlug,{
        name:row.fullName,gender:row.gender??undefined,dateOfBirth:row.dateOfBirth,timeOfBirth:row.timeOfBirth,
        birthPlace:row.birthPlace,latitude:row.latitude,longitude:row.longitude,timezone:row.timezone
      },envelope.extra);
      if(!checked.ok){
        await prisma.reportRequest.updateMany({where:leasedWhere(id,lease,"auto_generating"),data:{status:"NEEDS_INFO",deliveryStatus:"auto_input_review",deliveryError:"Complete specialist birth details are required."}});
        return "pending";
      }
      const generatedContent=await assembleAutomaticPaidReport({slug:row.reportSlug,birth:checked.birth,extra:checked.extra,question:envelope.question,language:languageFor(row.language)});
      const generated=await generatePremiumReportPdf({requestId:id,templateId:row.reportSlug,status:"ready_for_generation",
        content:generatedContent.content,automatedInputValidated:true,reportTitle:generatedContent.title,customerName:row.fullName,language:languageFor(row.language)});
      if(!generated.generated||!generated.bytes?.length)throw new Error("REPORT_PDF_NOT_GENERATED");
      // Confirm captured entitlement again before storage or customer access.
      const current=await loadEntitled(id);
      if(!current||current.deliveryStatus!=="auto_generating"||current.updatedAt.getTime()!==lease.getTime())return "skipped";
      const stored=await saveReportPdf({reportRequestId:id,reportSlug:row.reportSlug,bytes:generated.bytes});
      const write=await prisma.reportRequest.updateMany({
        where:{...leasedWhere(id,lease,"auto_generating"),generatedPdfSize:null,generatedPdfStorageKey:null},
        data:{status:"GENERATED",deliveryStatus:"auto_email_ready",generatedPdfBytes:stored.bytes,generatedPdfFileName:stored.fileName,
          generatedPdfMimeType:stored.mimeType,generatedPdfStorageKey:stored.storageKey,generatedPdfChecksum:stored.checksum,
          generatedPdfStorageDriver:stored.storageDriver,generatedPdfSize:stored.size,generatedAt:new Date(),deliveryError:null}
      });
      if(write.count!==1)return "skipped";
      await writeReportStatusHistory({reportRequestId:id,oldStatus:"IN_PROGRESS",newStatus:"GENERATED",note:"Automatic report calculated from validated customer inputs; PDF stored.",metadata:{source:"automatic_paid_report",size:stored.size}});
      await writeAuditLog({action:"report_pdf.automatically_generated",targetType:"ReportRequest",targetId:id,metadata:{reportSlug:row.reportSlug,size:stored.size,storageDriver:stored.storageDriver}});
    }catch{
      await flag(id,lease,"auto_generating","auto_generation_retry","Automatic generation needs a retry.").catch(()=>null);
      return "pending";
    }
  }
  row=await loadEntitled(id);
  if(!row||!claimable(row)||!MAIL_STATES.includes(row.deliveryStatus)||!["GENERATED","READY_FOR_DELIVERY"].includes(row.status))return "skipped";
  if(!row.generatedPdfSize||!row.generatedPdfChecksum||!row.generatedAt)return "pending";
  if(row.deliveryEmail.toLowerCase()!==row.user!.email.toLowerCase()){
    await prisma.reportRequest.updateMany({where:{id,updatedAt:row.updatedAt,deliveryStatus:row.deliveryStatus,paymentStatus:"PAID"},data:{deliveryStatus:"auto_email_review",deliveryError:"Registered account email changed. Contact support to verify the delivery address."}});
    return "pending";
  }
  if(!row.user!.emailVerified&&!row.user!.emailVerifiedAt&&!row.user!.googleId){
    // Keep the PDF accessible in the account; never send private reports to an
    // unverified mailbox. Daily retry can deliver once account verification is complete.
    await prisma.reportRequest.updateMany({where:{id,updatedAt:row.updatedAt,deliveryStatus:row.deliveryStatus,paymentStatus:"PAID"},data:{status:"READY_FOR_DELIVERY",deliveryStatus:"auto_email_ready",deliveryError:"Verify your registered email to receive the report email."}});
    return "pending";
  }
  // Resend idempotency has a finite window. If an interrupted or uncertain
  // send is older than it, keep the private file and request operator reconciliation
  // rather than silently sending duplicate customer emails.
  if(["auto_email_uncertain","auto_sending"].includes(row.deliveryStatus)&&Date.now()-row.generatedAt.getTime()>=EMAIL_REPLAY_MS){
    await prisma.reportRequest.updateMany({where:{id,updatedAt:row.updatedAt,deliveryStatus:row.deliveryStatus,paymentStatus:"PAID"},data:{status:"READY_FOR_DELIVERY",deliveryStatus:"auto_email_review",deliveryError:"Email attempt requires reconciliation. Secure download remains available."}});
    return "pending";
  }
  const lease=await claim(row,"auto_sending");if(!lease)return "skipped";
  try{
    const bytes=await loadReportPdf({storageDriver:row.generatedPdfStorageDriver,storageKey:row.generatedPdfStorageKey,
      databaseBytes:row.generatedPdfBytes,expectedChecksum:row.generatedPdfChecksum});
    if(bytes.length!==row.generatedPdfSize||Buffer.from(bytes.subarray(0,5)).toString("ascii")!=="%PDF-")throw new Error("REPORT_FILE_INVALID");
    const current=await loadEntitled(id);
    if(!current||current.updatedAt.getTime()!==lease.getTime()||current.deliveryStatus!=="auto_sending"||current.user!.email.toLowerCase()!==row.deliveryEmail.toLowerCase())return "skipped";
    const title=getManualReport(row.reportSlug)?.name[languageFor(row.language)]??"Personalized Astrology Report";
    // Email contains a branded, authenticated PDF link, not personal birth data
    // or a public bearer download link. Refund entitlement is still checked at download.
    const sent=await sendReportDeliveryEmail({to:current.user!.email,fullName:row.fullName,reportRequestId:id,
      reportName:title,language:languageFor(row.language),
      downloadUrl:new URL("/report-request/success?id="+encodeURIComponent(id),env.NEXT_PUBLIC_APP_URL).toString()});
    const result=await prisma.reportRequest.updateMany({
      where:leasedWhere(id,lease,"auto_sending"),
      data:sent.sent?{status:"DELIVERED",deliveryStatus:"email_sent",emailSentAt:new Date(),deliveryError:null}:
        {status:"READY_FOR_DELIVERY",deliveryStatus:sent.reason.includes("temporarily unavailable")?"auto_email_uncertain":"auto_email_retry",deliveryError:"Email provider did not confirm acceptance. Secure download is available."}
    });
    if(result.count!==1)return "skipped";
    if(!sent.sent)return "pending";
    await writeReportStatusHistory({reportRequestId:id,oldStatus:row.status,newStatus:"DELIVERED",note:"Report email accepted by provider; inbox receipt is not independently confirmed.",metadata:{source:"automatic_paid_report",deliveryMode:"registered_email_secure_link"}});
    await writeAuditLog({action:"report_delivery.automatic_email_accepted",targetType:"ReportRequest",targetId:id,metadata:{reportSlug:row.reportSlug,deliveryMode:"registered_email_secure_link"}});
    return "delivered";
  }catch{
    await flag(id,lease,"auto_sending","auto_email_uncertain","Report email needs a retry; secure download remains available.").catch(()=>null);
    return "pending";
  }
}
export async function runAutomaticReportRecovery(limit=12){
  if(env.AUTO_REPORT_DELIVERY_ENABLED!=="true")return {enabled:false,selected:0,delivered:0,pending:0,skipped:0};
  const cutoff=new Date(Date.now()-LEASE_MS);
  const rows=await prisma.reportRequest.findMany({
    where:{paymentStatus:"PAID",adminBypass:false,status:{in:["PAID","IN_PROGRESS","GENERATED","READY_FOR_DELIVERY"]},
      OR:[{deliveryStatus:{in:["auto_queued","auto_generation_retry","auto_email_ready","auto_email_retry","auto_email_uncertain"]}},
        {deliveryStatus:{in:["auto_generating","auto_sending"]},updatedAt:{lt:cutoff}}]},
    orderBy:{updatedAt:"asc"},take:Math.max(1,Math.min(limit,24)),select:{id:true}
  });
  const counts={enabled:true,selected:rows.length,delivered:0,pending:0,skipped:0};
  for(let i=0;i<rows.length;i+=3){
    const results=await Promise.all(rows.slice(i,i+3).map(row=>processAutomaticReport(row.id).catch(()=>"pending" as const)));
    for(const state of results)counts[state]++;
  }
  return counts;
}

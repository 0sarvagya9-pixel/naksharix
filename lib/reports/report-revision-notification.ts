import "server-only";
import { prisma } from "@/lib/db";
import { getManualReport } from "@/lib/manual-catalogue";
import { hasCurrentPaidReportEntitlement } from "@/lib/reports/paid-entitlement";
import { REPORT_LEASE_MS, reportDeliveryMessage, sendReportDeliveryEmail } from "@/lib/reports/report-delivery-service";
import { normalizedCorrection, revisionRequestSelection } from "@/lib/reports/report-revisions";

export async function notifyReportRevision(id:string) {
  const row = await prisma.reportRevision.findUnique({where:{id},select:{id:true,status:true,input:true,version:true,
    emailStatus:true,firstEmailAt:true,updatedAt:true,providerEmailId:true,
    reportRequest:{select:{...revisionRequestSelection,deliveryEmail:true,user:{select:{email:true,emailVerifiedAt:true,emailVerified:true,googleId:true}}}}}});
  if (!row || row.status!=="READY") return {accepted:false,reason:"Version unavailable."};
  if (row.emailStatus==="ACCEPTED") return {accepted:true,providerMessageId:row.providerEmailId};
  const now=new Date();
  if (row.emailStatus==="SENDING" && now.getTime()-row.updatedAt.getTime()<REPORT_LEASE_MS) return {accepted:false,reason:"Email is being processed."};
  const ambiguous=["SENDING","UNCERTAIN"].includes(row.emailStatus);
  if (ambiguous && (!row.firstEmailAt || now.getTime()-row.firstEmailAt.getTime()>=23*3600_000)) {
    return {accepted:false,reason:"Earlier email requires provider reconciliation."};
  }
  const parent=row.reportRequest, recipient=parent.user;
  if (!recipient || recipient.email.toLowerCase()!==parent.deliveryEmail.toLowerCase() ||
      (!recipient.emailVerifiedAt && !recipient.emailVerified && !recipient.googleId) || !await hasCurrentPaidReportEntitlement(parent)) {
    return {accepted:false,reason:"Verify the registered mailbox and purchase."};
  }
  const input=normalizedCorrection(parent.reportSlug,row.input);
  if (!input.ok) return {accepted:false,reason:"Corrected input requires review."};
  const claim=await prisma.reportRevision.updateMany({where:{id,status:"READY",emailStatus:row.emailStatus,updatedAt:row.updatedAt},data:{
    emailStatus:"SENDING",firstEmailAt:ambiguous?row.firstEmailAt:now,updatedAt:now}});
  if (!claim.count) return {accepted:false,reason:"Email state changed."};
  const {language,birth}=input.data;
  const message=reportDeliveryMessage({id:parent.id,reportSlug:parent.reportSlug,language,fullName:birth.name},recipient.email);
  const product=getManualReport(parent.reportSlug)?.name[language] ?? message.reportName;
  const sent=await sendReportDeliveryEmail({...message,version:row.version,reportName:product+" · "+(language==="hi"?"संस्करण":"Version")+" "+row.version});
  const status=sent.sent?"ACCEPTED":ambiguous||sent.acceptanceUncertain?"UNCERTAIN":"RETRY";
  const updated=await prisma.reportRevision.updateMany({where:{id,emailStatus:"SENDING",updatedAt:now},
    data:{emailStatus:status,acceptedEmailAt:sent.sent?new Date():null,providerEmailId:sent.providerMessageId}});
  if (!updated.count) return {accepted:false,reason:"Email state changed. Reconcile the provider receipt."};
  return {accepted:sent.sent,providerMessageId:sent.providerMessageId,reason:sent.reason};
}

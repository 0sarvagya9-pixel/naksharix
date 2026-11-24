import "server-only";
import {prisma} from "@/lib/db";
import {env} from "@/lib/env";
import {getRazorpayReadiness} from "@/lib/payments/readiness";
import {getManualReportCheckout} from "@/lib/reports/checkout-catalogue";
import {EXPERT_TERMS_VERSION,expertNames,expertEntitled,exactExpertPayment,validExpertQuote,sourceMatches,expertProviderAccess,type ExpertKind} from "@/lib/expert-services/contract";
import type {Prisma,Payment,ExpertServiceRequest} from "@prisma/client";
import type {requestSchema,adminSchema,providerSchema} from "@/lib/expert-services/input";
import type {z} from "zod";
export const expertIntakeEnabled=()=>env.EXPERT_SERVICE_INTAKE_ENABLED==="true";
export const expertSalesEnabled=()=>expertIntakeEnabled()&&env.EXPERT_SERVICE_SALES_ENABLED==="true"&&getRazorpayReadiness().enabled&&(process.env.VERCEL_ENV!=="production"||Boolean(env.RAZORPAY_KEY_ID?.startsWith("rzp_live_")));
export async function expertSchemaReady(){try{const [r]=await prisma.$queryRaw<{ready:boolean}[]>`SELECT to_regclass('public."ExpertServiceRequest"') IS NOT NULL AND EXISTS(SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname='PaymentPurpose' AND e.enumlabel='EXPERT_SERVICE') AS ready`;return r?.ready===true;}catch{return false;}}
export async function lockExpertService(tx:Prisma.TransactionClient,id:string){await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${id}),hashtext('naksharix-expert-service-v1'))::text`;}
const profileSelect={id:true,displayName:true,approvedAt:true,status:true,userId:true,user:{select:{role:true,emailVerified:true,emailVerifiedAt:true}}} satisfies Prisma.AstrologerProfileSelect;
export async function approvedExpert(tx:Prisma.TransactionClient,profileId:string){
 const p=await tx.astrologerProfile.findUnique({where:{id:profileId},select:profileSelect});
 return p?.status==="APPROVED"&&p.approvedAt&&p.user.role==="ASTROLOGER"&&(p.user.emailVerified||p.user.emailVerifiedAt)?p:null;
}
async function verifiedSource(tx:Prisma.TransactionClient,userId:string,reportId:string){
 const row=await tx.reportRequest.findFirst({where:{id:reportId,userId,paymentStatus:"PAID",adminBypass:false},include:{payment:true}});
 const product=row&&getManualReportCheckout(row.reportSlug),payment=row?.payment;
 const meta=payment?.metadata as Record<string,unknown>|null|undefined;
 if(!row||!product||!payment||payment.userId!==userId||payment.status!=="PAID"||payment.provider!=="RAZORPAY"||!payment.providerPaymentId||payment.currency!=="INR"||payment.purpose!==product.purpose||Number(payment.amount)!==product.amount||meta?.reportId!==product.reportId||meta?.gatewayStatus!=="captured"||!row.generatedPdfSize||!row.generatedPdfChecksum||!/^[a-f0-9]{64}$/.test(row.generatedPdfChecksum)||(!row.generatedPdfBytes&&!row.generatedPdfStorageKey))return null;
 return row;
}
async function sourceStillValid(tx:Prisma.TransactionClient,row:Pick<ExpertServiceRequest,"kind"|"userId"|"sourceReportId"|"sourceChecksum">){
 if(row.kind==="WRITTEN")return true;
 if(!row.sourceReportId)return false;
 const r=await verifiedSource(tx,row.userId,row.sourceReportId);
 return sourceMatches(row.kind,row.sourceChecksum,r?.generatedPdfChecksum??null);
}
const publicSelect={id:true,kind:true,question:true,language:true,sourceReportId:true,status:true,quoteVersion:true,pricePaise:true,expertFeePaise:true,dueAt:true,providerAcceptedAt:true,completedAt:true,settlementStatus:true,createdAt:true,astrologerProfile:{select:{id:true,displayName:true}}} satisfies Prisma.ExpertServiceRequestSelect;
async function audit(tx:Prisma.TransactionClient,userId:string,id:string,action:string){
 await tx.auditLog.create({data:{actorId:userId,action:"expert."+action,targetType:"ExpertServiceRequest",targetId:id,metadata:{}}});
}
export async function createExpertRequest(userId:string,input:z.infer<typeof requestSchema>){
 return prisma.$transaction(async tx=>{
 await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}),hashtext('naksharix-expert-intake-v1'))::text`;
 const prior=await tx.expertServiceRequest.findUnique({where:{userId_clientIntent:{userId,clientIntent:input.clientIntent}},select:publicSelect});
 if(prior)return prior.kind===input.kind&&prior.question===input.question&&prior.language===input.language&&prior.sourceReportId===(input.sourceReportId??null)?prior:null;
 if(await tx.expertServiceRequest.count({where:{userId,status:{in:["REQUESTED","ASSIGNED","QUOTED","PAYMENT_PENDING","PAID","REVIEW"]}}})>=5)return null;
 const source=input.sourceReportId?await verifiedSource(tx,userId,input.sourceReportId):null;
 if(input.kind==="REPORT_REVIEW"&&!source)return null;
 const row=await tx.expertServiceRequest.create({data:{userId,clientIntent:input.clientIntent,kind:input.kind,question:input.question,language:input.language,sourceReportId:source?.id,sourceChecksum:source?.generatedPdfChecksum,consentVersion:EXPERT_TERMS_VERSION},select:publicSelect});
 await audit(tx,userId,row.id,"requested");return row;
 });
}
export async function listExpertCustomer(userId:string){
 const [rows,reports]=await Promise.all([prisma.expertServiceRequest.findMany({where:{userId},select:{...publicSelect,response:true,payment:true,userId:true,paymentId:true,astrologerProfileId:true,consentVersion:true,sourceChecksum:true},orderBy:{createdAt:"desc"},take:30}),prisma.reportRequest.findMany({where:{userId,paymentStatus:"PAID",adminBypass:false,generatedPdfSize:{not:null}},select:{id:true,reportSlug:true,createdAt:true},orderBy:{createdAt:"desc"},take:20})]);
 return {requests:await Promise.all(rows.map(async ({payment,userId:uid,paymentId,astrologerProfileId,consentVersion,response,expertFeePaise,settlementStatus,sourceChecksum,...row})=>({...row,response:row.status==="DELIVERED"&&expertEntitled({...row,userId:uid,paymentId,astrologerProfileId,consentVersion},payment)&&await sourceStillValid(prisma,{...row,userId:uid,sourceChecksum})?response:null}))),reports};
}
export async function cancelExpertCustomer(userId:string,id:string){
 return prisma.$transaction(async tx=>{await lockExpertService(tx,id);const changed=await tx.expertServiceRequest.updateMany({where:{id,userId,paymentId:null,status:{in:["REQUESTED","ASSIGNED","QUOTED"]}},data:{status:"CANCELED"}});if(changed.count)await audit(tx,userId,id,"canceled");return changed.count===1;});
}
export async function listExpertAdmin(){
 const [requests,profiles]=await Promise.all([prisma.expertServiceRequest.findMany({select:{...publicSelect,settlementReference:true,settledAt:true,paymentId:true},orderBy:{createdAt:"desc"},take:100}),prisma.astrologerProfile.findMany({where:{status:"APPROVED",approvedAt:{not:null},user:{role:"ASTROLOGER",OR:[{emailVerified:{not:null}},{emailVerifiedAt:{not:null}}]}},select:{id:true,displayName:true},orderBy:{displayName:"asc"},take:100})]);
 return {requests,profiles};
}
export async function actExpertAdmin(adminId:string,input:z.infer<typeof adminSchema>){
 return prisma.$transaction(async tx=>{
 await lockExpertService(tx,input.id);
 const row=await tx.expertServiceRequest.findUnique({where:{id:input.id},include:{payment:true}});
 if(!row)return false;
 if(input.action==="ASSIGN"){
  if(!expertIntakeEnabled()||row.paymentId||!["REQUESTED","ASSIGNED","QUOTED"].includes(row.status)||!validExpertQuote(input.pricePaise,input.expertFeePaise,Date.parse(input.dueAt),Date.now())||!await sourceStillValid(tx,row))return false;
  const profile=await approvedExpert(tx,input.profileId);if(!profile||profile.userId===row.userId)return false;
  await tx.expertServiceRequest.update({where:{id:row.id},data:{status:"ASSIGNED",astrologerProfileId:profile.id,quoteVersion:{increment:1},pricePaise:input.pricePaise,expertFeePaise:input.expertFeePaise,dueAt:new Date(input.dueAt),providerAcceptedAt:null,sourceReadAt:null,sourceReadChecksum:null}});
 }else if(input.action==="CANCEL"){
  if(row.paymentId||!["REQUESTED","ASSIGNED","QUOTED"].includes(row.status))return false;
  await tx.expertServiceRequest.update({where:{id:row.id},data:{status:"CANCELED"}});
 }else{
  // Record an independently executed manual payout only. This endpoint never transfers money.
  if(row.status!=="DELIVERED"||row.settlementStatus!=="PAYABLE"||!row.expertFeePaise||!expertEntitled(row,row.payment)||!await sourceStillValid(tx,row)||await tx.expertServiceRequest.findUnique({where:{settlementReference:input.reference},select:{id:true}}))return false;
  await tx.expertServiceRequest.update({where:{id:row.id},data:{settlementStatus:"SETTLED",settlementReference:input.reference,settledAt:new Date()}});
 }
 await audit(tx,adminId,row.id,input.action.toLowerCase());return true;
 });
}
export async function listExpertProvider(userId:string){
 const profile=await prisma.astrologerProfile.findUnique({where:{userId},select:{id:true}});
 if(!profile)return [];
 return prisma.$transaction(async tx=>{
 const ready=await approvedExpert(tx,profile.id);if(!ready)return [];
 const rows=await tx.expertServiceRequest.findMany({where:{astrologerProfileId:profile.id},select:{...publicSelect,response:true,sourceReadAt:true,sourceReadChecksum:true,sourceChecksum:true,payment:true,paymentId:true,userId:true,astrologerProfileId:true,consentVersion:true,settledAt:true},orderBy:{createdAt:"desc"},take:50});
 return Promise.all(rows.map(async ({payment,userId,paymentId,astrologerProfileId,consentVersion,sourceChecksum,sourceReadChecksum,response,...row})=>{
 const entitled=expertEntitled({...row,userId,paymentId,astrologerProfileId,consentVersion},payment);
 // Recheck the current paid report and checksum even after the review itself
 // was purchased. A refunded/replaced source must not expose its private notes.
 const sourceValid=await sourceStillValid(tx,{...row,userId,sourceChecksum});
 const access=expertProviderAccess(row.kind,row.status,entitled,sourceValid);
 return {...row,question:access.question?row.question:null,response:access.response?response:null,canReadReport:access.report,sourceReviewed:access.reviewed&&Boolean(sourceReadChecksum&&sourceReadChecksum===sourceChecksum)};
 }));
 });
}
export async function actExpertProvider(userId:string,input:z.infer<typeof providerSchema>){
 return prisma.$transaction(async tx=>{
 await lockExpertService(tx,input.id);
 const row=await tx.expertServiceRequest.findUnique({where:{id:input.id},include:{payment:true}});
 if(!row?.astrologerProfileId)return false;
 const profile=await approvedExpert(tx,row.astrologerProfileId);if(!profile||profile.userId!==userId||row.userId===userId)return false;
 if(input.action==="ACCEPT"){
  if(!expertIntakeEnabled()||row.status!=="ASSIGNED"||row.paymentId||row.quoteVersion!==input.quoteVersion||!row.dueAt||!validExpertQuote(row.pricePaise??0,row.expertFeePaise??0,row.dueAt.getTime(),Date.now())||!await sourceStillValid(tx,row))return false;
  await tx.expertServiceRequest.update({where:{id:row.id},data:{status:"QUOTED",providerAcceptedAt:new Date()}});
 }else if(input.action==="DECLINE"){
  if(!["ASSIGNED","QUOTED"].includes(row.status)||row.paymentId||row.quoteVersion!==input.quoteVersion)return false;
  await tx.expertServiceRequest.update({where:{id:row.id},data:{status:"REQUESTED",astrologerProfileId:null,pricePaise:null,expertFeePaise:null,dueAt:null,providerAcceptedAt:null}});
 }else{
  if(row.status!=="PAID"||!expertEntitled(row,row.payment)||!await sourceStillValid(tx,row)||!sourceMatches(row.kind,row.sourceChecksum,row.sourceReadChecksum))return false;
  await tx.expertServiceRequest.update({where:{id:row.id},data:{status:"DELIVERED",response:input.response,completedAt:new Date(),settlementStatus:"PAYABLE"}});
 }
 await audit(tx,userId,row.id,input.action.toLowerCase());return true;
 });
}
export async function resolveExpertCheckout(userId:string,id:string,quoteVersion:number,pricePaise:number,tx:Prisma.TransactionClient=prisma){
 if(!expertSalesEnabled())return null;
 const r=await tx.expertServiceRequest.findFirst({where:{id,userId,quoteVersion,pricePaise,status:{in:["QUOTED","PAYMENT_PENDING"]},consentVersion:EXPERT_TERMS_VERSION}});
 if(!r||!r.astrologerProfileId||!r.providerAcceptedAt||!r.dueAt||r.dueAt.getTime()<=Date.now()+15*60000||!await approvedExpert(tx,r.astrologerProfileId)||!await sourceStillValid(tx,r))return null;
 const kind=expertNames[r.kind as ExpertKind];if(!kind)return null;
 return {name:kind,amount:pricePaise/100,metadata:{expertServiceId:r.id,expertKind:r.kind,expertQuoteVersion:r.quoteVersion,expertPricePaise:pricePaise,expertProfileId:r.astrologerProfileId,expertTermsVersion:EXPERT_TERMS_VERSION}};
}
export async function validateExpertCapture(tx:Prisma.TransactionClient,payment:Payment,gatewayStatus:unknown){
 const m=payment.metadata as Record<string,unknown>|null;
 if(typeof m?.expertServiceId!=="string"||gatewayStatus!=="captured"||(process.env.VERCEL_ENV==="production"&&m.analyticsLiveOrder!==true))throw Error("EXPERT_CAPTURE_INVALID");
 await lockExpertService(tx,m.expertServiceId);
 const row=await tx.expertServiceRequest.findUnique({where:{id:m.expertServiceId}});
 if(!row||!exactExpertPayment(row,payment)||!["PAYMENT_PENDING","PAID","DELIVERED","REVIEW"].includes(row.status))throw Error("EXPERT_CAPTURE_MISMATCH");
 // A genuine late capture is recorded, not lost merely because capacity changed. No service delivery or payout until reviewed.
 const ready=row.status==="PAYMENT_PENDING"&&row.astrologerProfileId&&row.providerAcceptedAt&&row.dueAt&&row.dueAt>new Date()&&await approvedExpert(tx,row.astrologerProfileId)&&await sourceStillValid(tx,row);
 return {id:row.id,status:ready?"PAID":"REVIEW"};
}
export async function providerSourceForDownload(userId:string,id:string){
 return prisma.$transaction(async tx=>{
 await lockExpertService(tx,id);const r=await tx.expertServiceRequest.findUnique({where:{id},include:{payment:true}});
 if(!r||r.kind!=="REPORT_REVIEW"||r.status!=="PAID"||!r.sourceReportId||!r.astrologerProfileId||!expertEntitled(r,r.payment))return null;
 const p=await approvedExpert(tx,r.astrologerProfileId);if(!p||p.userId!==userId)return null;
 const source=await verifiedSource(tx,r.userId,r.sourceReportId);if(!source||!sourceMatches(r.kind,r.sourceChecksum,source.generatedPdfChecksum))return null;
 return {storageDriver:source.generatedPdfStorageDriver,storageKey:source.generatedPdfStorageKey,databaseBytes:source.generatedPdfBytes,expectedChecksum:source.generatedPdfChecksum};
 });
}
export async function recordExpertSourceRead(userId:string,id:string,checksum:string){
 return prisma.$transaction(async tx=>{
 await lockExpertService(tx,id);const r=await tx.expertServiceRequest.findUnique({where:{id},include:{payment:true}});
 if(!r||r.status!=="PAID"||!r.astrologerProfileId||r.kind!=="REPORT_REVIEW"||!expertEntitled(r,r.payment)||!sourceMatches(r.kind,r.sourceChecksum,checksum)||!await sourceStillValid(tx,r))return false;
 const p=await approvedExpert(tx,r.astrologerProfileId);if(!p||p.userId!==userId)return false;
 await tx.expertServiceRequest.update({where:{id:r.id},data:{sourceReadAt:new Date(),sourceReadChecksum:checksum}});await audit(tx,userId,r.id,"source_access_authorized");return true;
 });
}

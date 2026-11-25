import "server-only";
import {createHmac,randomUUID,createHash} from "node:crypto";
import {Prisma as RuntimePrisma,type Prisma,type Payment,type DigitalPackageOrder} from "@prisma/client";
import {env} from "@/lib/env";
import {prisma} from "@/lib/db";
import {getRazorpayReadiness} from "@/lib/payments/readiness";
import {cumulativeSignedRefund} from "@/lib/payments/refund-evidence";
import {getActiveAstrologyProviderName} from "@/lib/astrology/provider";
import {getReportStorageReadiness} from "@/lib/storage/report-storage";
import {getPackageDefinition,packagePriceOffers,packagePriceMatches,PACKAGE_TERMS_VERSION,packageEntitled} from "@/lib/digital-packages/catalogue";
import {preparePackageItems,type PackageDraft} from "@/lib/digital-packages/input";
import {reminderServiceReady} from "@/lib/calendar/reminder-readiness";
export const packageOrderSelect={id:true,productKey:true,productVersion:true,pricePaise:true,status:true,expiresAt:true,createdAt:true,items:{select:{id:true,kind:true,position:true,status:true,attempts:true,pdfSize:true},orderBy:{position:"asc" as const}}} satisfies Prisma.DigitalPackageOrderSelect;
export async function packageSchemaReady(){
 try{const [row]=await prisma.$queryRaw<{ready:boolean}[]>`SELECT to_regclass('public."DigitalPackageOrder"') IS NOT NULL AND to_regclass('public."DigitalPackageItem"') IS NOT NULL AND EXISTS(SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname='PaymentPurpose' AND e.enumlabel='DIGITAL_PACKAGE') AS ready`;return row?.ready===true;}catch{return false;}
}
export async function availablePackageOffers(){
 const allowed=env.DIGITAL_PACKAGE_SALES_ENABLED==="true"&&env.DIGITAL_PACKAGE_GENERATION_ENABLED==="true"&&getRazorpayReadiness().enabled&&getReportStorageReadiness().enabled&&
  (process.env.VERCEL_ENV!=="production"||Boolean(env.RAZORPAY_KEY_ID?.startsWith("rzp_live_")));
 if(!allowed)return [];
 const all=packagePriceOffers(env.DIGITAL_PACKAGE_APPROVED_OFFERS,true);
 if(!all.length||!await packageSchemaReady())return [];
 const reminderReady=all.some(p=>p.key==="reference-reminders-2027")?await reminderServiceReady():false;
 return all.filter(p=>(!p.subjects||getActiveAstrologyProviderName()==="own_engine")&&(p.key!=="reference-reminders-2027"||reminderReady));
}
export async function lockPackage(tx:Prisma.TransactionClient,orderId:string){
 await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${orderId}),hashtext('naksharix-digital-package-v1'))::text`;
}
export async function preparePackage(userId:string,input:PackageDraft){
 const items=preparePackageItems(input);
 const offers=await availablePackageOffers(),offer=offers.find(p=>p.key===input.productKey);
 if(!offer||!packagePriceMatches(offer,input))return {kind:"unavailable" as const};
 const digest=createHmac("sha256",env.JWT_SECRET).update("digital-package-v1:"+userId+":"+JSON.stringify(input)).digest("hex");
 return prisma.$transaction(async tx=>{
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}),hashtext('naksharix-package-drafts-v1'))::text`;
  const existing=await tx.digitalPackageOrder.findUnique({where:{userId_clientIntent:{userId,clientIntent:input.clientIntent}},select:{...packageOrderSelect,inputDigest:true}});
  if(existing){
    if(existing.inputDigest!==digest)return {kind:"conflict" as const};
    const {inputDigest:_digest,...order}=existing;return {kind:"saved" as const,order};
  }
  const now=new Date();
  // Expired unpaid drafts have no captured funds; discard their private inputs.
  const expired=await tx.digitalPackageOrder.findMany({where:{userId,status:"DRAFT",paymentId:null,expiresAt:{lte:now}},select:{id:true},take:50});
  for(const row of expired){
   const closed=await tx.digitalPackageOrder.updateMany({where:{id:row.id,userId,status:"DRAFT",paymentId:null},data:{status:"CANCELED"}});
   if(closed.count)await tx.digitalPackageItem.updateMany({where:{orderId:row.id},data:{privateInput:RuntimePrisma.DbNull}});
  }
  if(await tx.digitalPackageOrder.count({where:{userId,status:{in:["DRAFT","PAYMENT_PENDING","REVIEW"]}}})>=5)return {kind:"limit" as const};
  const order=await tx.digitalPackageOrder.create({data:{userId,clientIntent:input.clientIntent,productKey:offer.key,productVersion:offer.version,pricePaise:offer.pricePaise,consentVersion:PACKAGE_TERMS_VERSION,inputDigest:digest,expiresAt:new Date(now.getTime()+24*3600000),items:{create:items.map((item,position)=>({position,kind:item.kind,privateInput:JSON.parse(JSON.stringify(item.privateInput)) as Prisma.InputJsonValue}))}},select:packageOrderSelect});
  return {kind:"saved" as const,order};
 });
}
export async function cancelPackageDraft(userId:string,orderId:string){
 return prisma.$transaction(async tx=>{
  await lockPackage(tx,orderId);
  const closed=await tx.digitalPackageOrder.updateMany({where:{id:orderId,userId,status:"DRAFT",paymentId:null},data:{status:"CANCELED"}});
  if(!closed.count)return false;
  await tx.digitalPackageItem.updateMany({where:{orderId},data:{privateInput:RuntimePrisma.DbNull}});
  return true;
 });
}
export async function resolvePackageCheckout(userId:string,orderId:string,version:string,pricePaise:number){
 const order=await prisma.digitalPackageOrder.findFirst({where:{id:orderId,userId},include:{items:{select:{kind:true,position:true},orderBy:{position:"asc"}}}});
 if(!order||!["DRAFT","PAYMENT_PENDING"].includes(order.status)||order.productVersion!==version||order.pricePaise!==pricePaise||order.consentVersion!==PACKAGE_TERMS_VERSION)return null;
 const def=getPackageDefinition(order.productKey);
 if(!def||def.version!==version||order.items.length!==def.kinds.length||order.items.some((item,i)=>item.kind!==def.kinds[i]))return null;
 const offers=await availablePackageOffers();
 if(!offers.some(o=>o.key===order.productKey&&packagePriceMatches(o,{version,pricePaise})))return null;
 if(order.status==="DRAFT"&&order.expiresAt<=new Date())return null;
 return {name:def.title,amount:order.pricePaise/100,metadata:{digitalPackageId:order.id,digitalPackageKey:order.productKey,digitalPackageVersion:version,digitalPackagePricePaise:pricePaise,digitalPackageTermsVersion:PACKAGE_TERMS_VERSION}};
}
export function exactPackagePayment(order:DigitalPackageOrder,payment:Payment){
 const m=payment.metadata as Record<string,unknown>|null;
 return order.paymentId===payment.id&&order.userId===payment.userId&&payment.provider==="RAZORPAY"&&payment.purpose==="DIGITAL_PACKAGE"&&payment.currency==="INR"&&Math.round(Number(payment.amount)*100)===order.pricePaise&&m?.digitalPackageId===order.id&&m.digitalPackageKey===order.productKey&&m.digitalPackageVersion===order.productVersion&&m.digitalPackagePricePaise===order.pricePaise&&m.digitalPackageTermsVersion===PACKAGE_TERMS_VERSION;
}
export async function validatePackageCapture(tx:Prisma.TransactionClient,payment:Payment,gatewayStatus:unknown){
 const m=payment.metadata as Record<string,unknown>|null;
 if(typeof m?.digitalPackageId!=="string"||gatewayStatus!=="captured"||(process.env.VERCEL_ENV==="production"&&m.analyticsLiveOrder!==true))throw Error("PACKAGE_CAPTURE_INVALID");
 await lockPackage(tx,m.digitalPackageId);
 const order=await tx.digitalPackageOrder.findUnique({where:{id:m.digitalPackageId}});
 if(!order||order.status!=="PAYMENT_PENDING"||!exactPackagePayment(order,payment))throw Error("PACKAGE_CAPTURE_MISMATCH");
 return order.id;
}
/** Signed refund receipts may arrive before the dependent ledger transition.
 * Never render, serve or continue a course against a known refunded capture. */
export async function hasUnrefundedPackageEntitlement(tx:Prisma.TransactionClient,order:DigitalPackageOrder,payment:Payment|null){
 if(!payment||!packageEntitled(order,payment)||!payment.providerPaymentId)return false;
 return (await cumulativeSignedRefund(tx,payment.providerPaymentId))===0;
}
export async function claimPackageItem(userId:string,orderId:string,itemId:string){
 return prisma.$transaction(async tx=>{
  await lockPackage(tx,orderId);const now=new Date();
  const order=await tx.digitalPackageOrder.findFirst({where:{id:orderId,userId},include:{payment:true}});
  if(!order||!await hasUnrefundedPackageEntitlement(tx,order,order.payment))return {kind:"denied" as const};
  const item=await tx.digitalPackageItem.findFirst({where:{id:itemId,orderId},select:{id:true,kind:true,position:true,status:true,leaseUntil:true,attempts:true,privateInput:true}});
  if(!item||getPackageDefinition(order.productKey)?.kinds[item.position]!==item.kind)return {kind:"denied" as const};
  if(item.status==="READY")return {kind:"ready" as const};
  if(item.status==="GENERATING"&&item.leaseUntil&&item.leaseUntil>now)return {kind:"busy" as const};
  if(item.attempts>=5||!item.privateInput)return {kind:"review" as const};
  const other=await tx.digitalPackageItem.count({where:{orderId,status:"GENERATING",leaseUntil:{gt:now}}});if(other)return {kind:"busy" as const};
  const leaseToken=randomUUID();
  await tx.digitalPackageItem.update({where:{id:itemId},data:{status:"GENERATING",attempts:{increment:1},leaseToken,leaseUntil:new Date(now.getTime()+5*60000)}});
  return {kind:"claimed" as const,item,leaseToken,createdAt:order.createdAt};
 });
}

export async function completePackageItem(userId:string,orderId:string,itemId:string,leaseToken:string,bytes:Buffer){
 if(bytes.length<100||bytes.length>8*1024*1024||bytes.subarray(0,5).toString("ascii")!=="%PDF-")throw Error("PACKAGE_PDF_INVALID");
 const checksum=createHash("sha256").update(bytes).digest("hex");
 return prisma.$transaction(async tx=>{
  await lockPackage(tx,orderId);
  const order=await tx.digitalPackageOrder.findFirst({where:{id:orderId,userId},include:{payment:true}});
  if(!order||!await hasUnrefundedPackageEntitlement(tx,order,order.payment))return false;
  const item=await tx.digitalPackageItem.findFirst({where:{id:itemId,orderId},select:{position:true,kind:true}});
  if(!item||getPackageDefinition(order.productKey)?.kinds[item.position]!==item.kind)return false;
  const updated=await tx.digitalPackageItem.updateMany({where:{id:itemId,orderId,status:"GENERATING",leaseToken,leaseUntil:{gt:new Date()}},data:{status:"READY",pdfBytes:new Uint8Array(bytes),pdfChecksum:checksum,pdfSize:bytes.length,pdfStorageDriver:"database",pdfStorageKey:"db://digital-package-items/"+itemId,generatedAt:new Date(),leaseToken:null,leaseUntil:null,privateInput:RuntimePrisma.DbNull}});
  return updated.count===1;
 });
}
export async function releasePackageItem(userId:string,orderId:string,itemId:string,leaseToken:string){
 await prisma.$transaction(async tx=>{await lockPackage(tx,orderId);const order=await tx.digitalPackageOrder.findFirst({where:{id:orderId,userId},select:{id:true}});if(order)await tx.digitalPackageItem.updateMany({where:{id:itemId,orderId,status:"GENERATING",leaseToken},data:{status:"RETRY",leaseToken:null,leaseUntil:null}});});
}
export async function loadPackageItemForDownload(userId:string,orderId:string,itemId:string){
 const order=await prisma.digitalPackageOrder.findFirst({where:{id:orderId,userId},include:{payment:true}});
 if(!order||!await hasUnrefundedPackageEntitlement(prisma,order,order.payment))return null;
 const item=await prisma.digitalPackageItem.findFirst({where:{id:itemId,orderId,status:"READY"},select:{pdfBytes:true,pdfChecksum:true,pdfSize:true,kind:true,position:true}});
 if(!item||getPackageDefinition(order.productKey)?.kinds[item.position]!==item.kind||!item.pdfBytes||!item.pdfChecksum||item.pdfSize!==item.pdfBytes.byteLength||item.pdfBytes.byteLength>8*1024*1024)return null;
 const bytes=Buffer.from(item.pdfBytes);
 if(createHash("sha256").update(bytes).digest("hex")!==item.pdfChecksum||bytes.subarray(0,5).toString("ascii")!=="%PDF-")throw Error("PACKAGE_PDF_CHECKSUM_INVALID");
 const current=await prisma.digitalPackageOrder.findFirst({where:{id:orderId,userId},include:{payment:true}});
 if(!current||!await hasUnrefundedPackageEntitlement(prisma,current,current.payment))return null;
 return {bytes,kind:item.kind};
}

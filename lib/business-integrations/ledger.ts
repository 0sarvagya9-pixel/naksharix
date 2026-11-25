import "server-only";
import {createHmac,randomBytes,timingSafeEqual} from "node:crypto";
import type {Prisma} from "@prisma/client";
import {env} from "@/lib/env";
import {prisma} from "@/lib/db";
import {parseBusinessAuthorization,scopeSubset,scopeUnits,usageFits,usagePeriod,isBusinessScope,validPdfBrand,type BusinessScope} from "@/lib/business-integrations/contract";
import type {keySchema,tenantSchema} from "@/lib/business-integrations/input";
import type {z} from "zod";
export const businessEnabled=()=>env.B2B_INTEGRATION_ENABLED==="true";
export const businessPdfEnabled=()=>businessEnabled()&&env.B2B_CHART_PDF_ENABLED==="true";
const keyDigest=(raw:string)=>createHmac("sha256",env.JWT_SECRET).update("naksharix-b2b-key-v1:"+raw).digest("hex");
function keyDigestMatches(raw:string,digest:string){if(!/^[a-f0-9]{64}$/.test(digest))return false;return timingSafeEqual(Buffer.from(keyDigest(raw),"hex"),Buffer.from(digest,"hex"));}
export async function businessSchemaReady(){
 try{const [r]=await prisma.$queryRaw<{ready:boolean}[]>`SELECT to_regclass('public."BusinessTenant"') IS NOT NULL AND to_regclass('public."BusinessApiKey"') IS NOT NULL AND to_regclass('public."BusinessUsageMonth"') IS NOT NULL AND to_regclass('public."BusinessUsageCall"') IS NOT NULL AS ready`;return r?.ready===true;}catch{return false;}
}
export async function lockBusinessTenant(tx:Prisma.TransactionClient,id:string){await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${id}),hashtext('naksharix-business-v1'))::text`;}
export const tenantSelect={id:true,displayName:true,brandName:true,status:true,contractExpiresAt:true,monthlyUnitLimit:true,unitPricePaise:true,scopes:true,createdAt:true} satisfies Prisma.BusinessTenantSelect;
const keySelect={id:true,label:true,scopes:true,expiresAt:true,revokedAt:true,createdAt:true} satisfies Prisma.BusinessApiKeySelect;
export async function createTenant(adminId:string,input:z.infer<typeof tenantSchema>){
 if(input.scopes.includes("chart-pdf")&&!businessPdfEnabled())return null;
 const expiry=new Date(input.contractExpiresAt+"T00:00:00Z"),now=new Date();
 if(expiry<=now||expiry.getTime()>now.getTime()+366*86400000)return null;
 const owner=await prisma.user.findFirst({where:{email:{equals:input.ownerEmail,mode:"insensitive"}},select:{id:true,role:true,emailVerified:true,emailVerifiedAt:true}});
 if(!owner||["ADMIN","SUPER_ADMIN"].includes(owner.role)||(!owner.emailVerified&&!owner.emailVerifiedAt))return null;
 return prisma.$transaction(async tx=>{
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${owner.id}),hashtext('naksharix-business-owner-v1'))::text`;
  const existing=await tx.businessTenant.findFirst({where:{ownerUserId:owner.id,contractReference:input.contractReference},select:{id:true}});
  if(existing)return null;
  const tenant=await tx.businessTenant.create({data:{ownerUserId:owner.id,displayName:input.displayName,brandName:input.brandName,contractReference:input.contractReference,approvedById:adminId,contractExpiresAt:expiry,monthlyUnitLimit:input.monthlyUnitLimit,unitPricePaise:input.unitPricePaise,scopes:input.scopes},select:tenantSelect});
  await tx.adminActionLog.create({data:{adminId,action:"business.tenant.approved",targetType:"BusinessTenant",targetId:tenant.id,metadata:{explicitContractApproval:true}}});
  return tenant;
 });
}
export async function revokeTenant(adminId:string,tenantId:string){
 return prisma.$transaction(async tx=>{
 await lockBusinessTenant(tx,tenantId);
 const changed=await tx.businessTenant.updateMany({where:{id:tenantId,status:"ACTIVE"},data:{status:"REVOKED"}});
 if(!changed.count)return false;
 await tx.businessApiKey.updateMany({where:{tenantId,revokedAt:null},data:{revokedAt:new Date()}});
 await tx.adminActionLog.create({data:{adminId,action:"business.tenant.revoked",targetType:"BusinessTenant",targetId:tenantId,metadata:{reason:"owner_revocation"}}});
 return true;
 });
}
export async function ownedBusinessTenants(userId:string){
 return prisma.businessTenant.findMany({where:{ownerUserId:userId},select:{...tenantSelect,keys:{select:keySelect,orderBy:{createdAt:"desc"},take:20},usage:{orderBy:{period:"desc"},take:12,select:{period:true,attemptedUnits:true,completedUnits:true,failedUnits:true,unitPricePaise:true}}},orderBy:{createdAt:"desc"},take:20});
}
export async function issueBusinessKey(userId:string,input:z.infer<typeof keySchema>){
 if(env.JWT_SECRET.length<32||env.JWT_SECRET.includes("development-secret"))throw Error("KEY_SECRET_INVALID");
 return prisma.$transaction(async tx=>{
 await lockBusinessTenant(tx,input.tenantId);const now=new Date();
 const t=await tx.businessTenant.findFirst({where:{id:input.tenantId,ownerUserId:userId,status:"ACTIVE",contractExpiresAt:{gt:now}}});
 if(!t||!scopeSubset(input.scopes,t.scopes))return null;
 if(await tx.businessApiKey.count({where:{tenantId:t.id,revokedAt:null,expiresAt:{gt:now}}})>=5)return null;
 const id=randomBytes(16).toString("hex"),raw="nxk_"+id+"_"+randomBytes(32).toString("base64url");
 const record=await tx.businessApiKey.create({data:{id,tenantId:t.id,digest:keyDigest(raw),label:input.label,scopes:input.scopes,expiresAt:new Date(Math.min(t.contractExpiresAt.getTime(),now.getTime()+90*86400000))},select:keySelect});
 return {key:raw,record};
 });
}
export async function revokeBusinessKey(userId:string,tenantId:string,keyId:string){
 return prisma.$transaction(async tx=>{
 await lockBusinessTenant(tx,tenantId);
 const tenant=await tx.businessTenant.findFirst({where:{id:tenantId,ownerUserId:userId},select:{id:true}});
 if(!tenant)return false;
 const result=await tx.businessApiKey.updateMany({where:{id:keyId,tenantId,revokedAt:null},data:{revokedAt:new Date()}});
 return result.count===1;
 });
}
export async function claimBusinessCalculation(authorization:string|null,scope:BusinessScope,requestId:string){
 if(scope==="chart-pdf"&&!businessPdfEnabled())return {kind:"unauthorized" as const};
 const token=parseBusinessAuthorization(authorization);if(!token)return {kind:"unauthorized" as const};
 const initial=await prisma.businessApiKey.findUnique({where:{id:token.id},select:{tenantId:true,digest:true}});
 if(!initial||!keyDigestMatches(token.raw,initial.digest))return {kind:"unauthorized" as const};
 return prisma.$transaction(async tx=>{
 await lockBusinessTenant(tx,initial.tenantId);const now=new Date();
 const key=await tx.businessApiKey.findFirst({where:{id:token.id,tenantId:initial.tenantId,revokedAt:null,expiresAt:{gt:now}},include:{tenant:true}});
 if(!key||!keyDigestMatches(token.raw,key.digest)||key.tenant.status!=="ACTIVE"||key.tenant.contractExpiresAt<=now||!scopeSubset([scope],key.scopes)||!scopeSubset([scope],key.tenant.scopes))return {kind:"unauthorized" as const};
 const t=key.tenant,period=usagePeriod(now),units=scopeUnits(scope);
 if(scope==="chart-pdf"&&!validPdfBrand(t.brandName))return {kind:"unauthorized" as const};
 if(await tx.businessUsageCall.findUnique({where:{tenantId_requestId:{tenantId:t.id,requestId}},select:{requestId:true}}))return {kind:"duplicate" as const};
 const month=await tx.businessUsageMonth.findUnique({where:{tenantId_period:{tenantId:t.id,period}}});
 if(!usageFits(month?.attemptedUnits??0,t.monthlyUnitLimit,units))return {kind:"limit" as const};
 await tx.businessUsageMonth.upsert({where:{tenantId_period:{tenantId:t.id,period}},create:{tenantId:t.id,period,attemptedUnits:units,unitPricePaise:t.unitPricePaise},update:{attemptedUnits:{increment:units}}});
 await tx.businessUsageCall.create({data:{tenantId:t.id,requestId,period,keyId:key.id,scope,units}});
 return {kind:"claimed" as const,tenantId:t.id,keyId:key.id,requestId,brandName:t.brandName,units};
 });
}
/** A signed widget grant cannot elevate scope, switch tenant/key, or revive a reservation. */
export async function activeWidgetReservation(tenantId:string,keyId:string,requestId:string){
 return prisma.$transaction(async tx=>{
 await lockBusinessTenant(tx,tenantId);const now=new Date();
 const call=await tx.businessUsageCall.findUnique({where:{tenantId_requestId:{tenantId,requestId}},include:{tenant:true}});
 if(!call||call.keyId!==keyId||call.scope!=="panchang-widget"||call.state!=="RESERVED"||call.tenant.status!=="ACTIVE"||call.tenant.contractExpiresAt<=now||!scopeSubset(["panchang-widget"],call.tenant.scopes))return null;
 const key=await tx.businessApiKey.findFirst({where:{id:keyId,tenantId,revokedAt:null,expiresAt:{gt:now}},select:{scopes:true}});
 return key&&scopeSubset(["panchang-widget"],key.scopes)?{brandName:call.tenant.brandName}:null;
 });
}
export async function finishBusinessCalculation(tenantId:string,requestId:string,success:boolean){
 return prisma.$transaction(async tx=>{
 await lockBusinessTenant(tx,tenantId);const call=await tx.businessUsageCall.findUnique({where:{tenantId_requestId:{tenantId,requestId}},include:{tenant:true}});
 if(!call||call.state!=="RESERVED")return false;
 const now=new Date();
 const key=await tx.businessApiKey.findFirst({where:{id:call.keyId,tenantId,revokedAt:null,expiresAt:{gt:now}},select:{id:true,scopes:true}});
 // A calculation must not escape a revoked or narrowed contract while it was running.
 const complete=success&&!!key&&(call.scope!=="chart-pdf"||businessPdfEnabled())&&isBusinessScope(call.scope)&&scopeSubset([call.scope],key.scopes)&&scopeSubset([call.scope],call.tenant.scopes)&&call.tenant.status==="ACTIVE"&&call.tenant.contractExpiresAt>now;
 const changed=await tx.businessUsageCall.updateMany({where:{tenantId,requestId,state:"RESERVED"},data:{state:complete?"COMPLETED":"FAILED",finishedAt:new Date()}});
 if(changed.count!==1)return false;
 await tx.businessUsageMonth.update({where:{tenantId_period:{tenantId,period:call.period}},data:complete?{completedUnits:{increment:call.units}}:{failedUnits:{increment:call.units}}});
 return complete;
 });
}

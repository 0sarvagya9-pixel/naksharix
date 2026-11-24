import "server-only";
import type { Prisma } from "@prisma/client";
import {prisma} from "@/lib/db";
import {env} from "@/lib/env";
import {isAiAstrologerReady} from "@/lib/ai/feature-status";
import {getRazorpayReadiness} from "@/lib/payments/readiness";
import {approvedCreditOffer,creditSnapshot,type CreditOffer} from "@/lib/ai/credit-contract";

export function creditUsageEnabled(){
 return env.AI_CREDIT_USAGE_ENABLED==="true"&&isAiAstrologerReady()&&env.AI_CREDIT_APPROVED_MODEL===env.GEMINI_MODEL;
}
export async function creditSchemaReady(){
 try{
 const [r]=await prisma.$queryRaw<{ready:boolean}[]>`SELECT to_regclass('public."AiCreditGrant"') IS NOT NULL AND to_regclass('public."AiCreditUse"') IS NOT NULL AND EXISTS(SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname='PaymentPurpose' AND e.enumlabel='AI_CREDITS') AND EXISTS(SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname='PaymentPurpose' AND e.enumlabel='AI_MEMBERSHIP') AND (SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='AiCreditGrant' AND column_name IN ('validFrom','validUntil'))=2 AS ready`;
 return r?.ready===true;
 }catch{return false;}
}
export async function availableCreditOffer():Promise<CreditOffer|null>{
 const offer=approvedCreditOffer({enabled:creditUsageEnabled()&&env.AI_CREDIT_PACK_SALES_ENABLED==="true"&&getRazorpayReadiness().enabled&&
  (process.env.VERCEL_ENV!=="production"||Boolean(env.RAZORPAY_KEY_ID?.startsWith("rzp_live_"))),version:env.AI_CREDIT_PACK_VERSION,units:env.AI_CREDIT_PACK_UNITS,pricePaise:env.AI_CREDIT_PACK_PRICE_PAISE,approvedModel:env.AI_CREDIT_APPROVED_MODEL,activeModel:env.GEMINI_MODEL});
 return offer&&await creditSchemaReady()?offer:null;
}
export async function lockCreditAccount(tx:Prisma.TransactionClient,userId:string){
 await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}),hashtext('naksharix-ai-credit-v1'))::text`;
}
const availableWhere=(userId:string,now=new Date()):Prisma.AiCreditGrantWhereInput=>({suspendedAt:null,revokedAt:null,OR:[{validFrom:null,validUntil:null,payment:{purpose:"AI_CREDITS"}},{validFrom:{lte:now},validUntil:{gt:now},payment:{purpose:"AI_MEMBERSHIP"}}],payment:{userId,provider:"RAZORPAY",purpose:{in:["AI_CREDITS","AI_MEMBERSHIP"]},status:"PAID",...(process.env.VERCEL_ENV==="production"?{metadata:{path:["analyticsLiveOrder"],equals:true}}:{})}});
async function releaseUse(tx:Prisma.TransactionClient,id:string,grantPaymentId:string,now:Date){
 const changed=await tx.aiCreditUse.updateMany({where:{id,status:"RESERVED"},data:{status:"RELEASED",finishedAt:now}});
 if(changed.count===1)await tx.aiCreditGrant.update({where:{paymentId:grantPaymentId},data:{remaining:{increment:1}}});
}
async function expireReservations(tx:Prisma.TransactionClient,userId:string,now:Date){
 const expired=await tx.aiCreditUse.findMany({where:{userId,status:"RESERVED",expiresAt:{lte:now}},select:{id:true,grantPaymentId:true},take:100});
 for(const row of expired)await releaseUse(tx,row.id,row.grantPaymentId,now);
}
export async function creditAccountSummary(userId:string){
 return prisma.$transaction(async tx=>{
  await lockCreditAccount(tx,userId);const now=new Date();
  const [balance,pending,reclaimable]=await Promise.all([
   tx.aiCreditGrant.aggregate({where:availableWhere(userId,now),_sum:{remaining:true}}),
   tx.payment.findFirst({where:{userId,provider:"RAZORPAY",purpose:"AI_CREDITS",status:{in:["PENDING","FAILED"]}},select:{metadata:true,amount:true,currency:true},orderBy:{createdAt:"desc"}}),
   tx.aiCreditUse.count({where:{userId,status:"RESERVED",expiresAt:{lte:now},grant:availableWhere(userId,now)}})
  ]);
  const attempt=pending?creditSnapshot(pending.metadata,Math.round(Number(pending.amount)*100),pending.currency):null;
  return {remaining:(balance._sum.remaining??0)+reclaimable,unresolvedPurchase:Boolean(pending),pendingIntent:attempt?.intent??null,pendingOffer:attempt?{version:attempt.version,units:attempt.units,pricePaise:attempt.pricePaise}:null};
 });
}
export async function reserveAiCredit(userId:string,requestId:string){
 return prisma.$transaction(async tx=>{
  await lockCreditAccount(tx,userId);const now=new Date();await expireReservations(tx,userId,now);
  const user=await tx.user.findUnique({where:{id:userId},select:{role:true,emailVerified:true,emailVerifiedAt:true}});
  if(!user||(!user.emailVerified&&!user.emailVerifiedAt)||["ADMIN","SUPER_ADMIN"].includes(user.role))return {kind:"account" as const};
  if(await tx.aiCreditUse.findUnique({where:{userId_requestId:{userId,requestId}},select:{id:true}}))return {kind:"duplicate" as const};
  if(await tx.aiCreditUse.count({where:{userId,status:"RESERVED"}}))return {kind:"busy" as const};
  // Attempts, including provider failures, count toward this cross-instance budget.
  if(await tx.aiCreditUse.count({where:{userId,createdAt:{gte:new Date(now.getTime()-86400000)}}})>=60)return {kind:"limit" as const};
  const grant=await tx.aiCreditGrant.findFirst({where:{...availableWhere(userId,now),remaining:{gt:0}},orderBy:[{validUntil:{sort:"asc",nulls:"last"}},{createdAt:"asc"},{paymentId:"asc"}],select:{paymentId:true,validUntil:true}});
  if(!grant)return {kind:"empty" as const};
  const claimed=await tx.aiCreditGrant.updateMany({where:{paymentId:grant.paymentId,remaining:{gt:0},revokedAt:null,suspendedAt:null},data:{remaining:{decrement:1}}});
  if(claimed.count!==1)return {kind:"busy" as const};
  const use=await tx.aiCreditUse.create({data:{userId,requestId,grantPaymentId:grant.paymentId,status:"RESERVED",expiresAt:new Date(Math.min(now.getTime()+5*60000,grant.validUntil?.getTime()??Number.MAX_SAFE_INTEGER))},select:{id:true}});
  return {kind:"reserved" as const,id:use.id};
 });
}
export async function finishAiCredit(userId:string,id:string,completed:boolean){
 return prisma.$transaction(async tx=>{
  await lockCreditAccount(tx,userId);const now=new Date();
  const use=await tx.aiCreditUse.findFirst({where:{id,userId},select:{id:true,status:true,expiresAt:true,grantPaymentId:true,grant:{select:{revokedAt:true,suspendedAt:true,validFrom:true,validUntil:true,payment:{select:{status:true,userId:true}}}}}});
  if(!use||use.status!=="RESERVED")return false;
  if(!completed||use.expiresAt<=now||use.grant.revokedAt||use.grant.suspendedAt||(use.grant.validFrom&&use.grant.validFrom>now)||(use.grant.validUntil&&use.grant.validUntil<=now)||use.grant.payment.status!=="PAID"||use.grant.payment.userId!==userId){
   await releaseUse(tx,use.id,use.grantPaymentId,now);return false;
  }
  const changed=await tx.aiCreditUse.updateMany({where:{id:use.id,userId,status:"RESERVED"},data:{status:"CONSUMED",finishedAt:now}});
  return changed.count===1;
 });
}

import "server-only";
import {prisma} from "@/lib/db";
import {env} from "@/lib/env";
import {creditUsageEnabled,lockCreditAccount} from "@/lib/ai/credit-ledger";
import {getRazorpayReadiness} from "@/lib/payments/readiness";
import {MEMBERSHIP_TERMS_VERSION,membershipOffer,sameMembershipOffer,mappedMembershipState,safeSubscriptionLink,terminalMembershipStates,readChargeEvidence,freshChargeMatches,type MembershipOffer} from "@/lib/ai/membership-contract";
import {checkApprovedPlan,createProviderMembership,fetchProviderMembership,cancelProviderMembership,fetchMembershipPayment} from "@/lib/ai/membership-provider";
import type {AiMembership} from "@prisma/client";
export async function membershipSchemaReady(){
 try{const [r]=await prisma.$queryRaw<{ready:boolean}[]>`SELECT to_regclass('public."AiMembership"') IS NOT NULL AND to_regclass('public."AiMembershipCycle"') IS NOT NULL AND to_regclass('public."AiCreditGrant"') IS NOT NULL AND EXISTS(SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname='PaymentPurpose' AND e.enumlabel='AI_MEMBERSHIP') AND (SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='AiCreditGrant' AND column_name IN ('validFrom','validUntil'))=2 AS ready`;return r?.ready===true;}catch{return false;}
}
const isLive=()=>Boolean(env.RAZORPAY_KEY_ID?.startsWith("rzp_live_"));
export async function availableMembershipOffer(){
 const offer=membershipOffer({enabled:env.AI_MEMBERSHIP_SALES_ENABLED==="true"&&creditUsageEnabled()&&getRazorpayReadiness().enabled&&(process.env.VERCEL_ENV!=="production"||isLive()),planId:env.AI_MEMBERSHIP_PLAN_ID,version:env.AI_MEMBERSHIP_VERSION,price:env.AI_MEMBERSHIP_PRICE_PAISE,units:env.AI_MEMBERSHIP_UNITS,cycles:env.AI_MEMBERSHIP_TOTAL_CYCLES,approvedModel:env.AI_CREDIT_APPROVED_MODEL,activeModel:env.GEMINI_MODEL});
 return offer&&await membershipSchemaReady()?offer:null;
}
function ownProvider(row:AiMembership,value:Record<string,unknown>){
 const notes=value.notes as Record<string,unknown>|undefined;
 return typeof value.id==="string"&&/^sub_[A-Za-z0-9]{5,80}$/.test(value.id)&&(!row.providerSubscriptionId||row.providerSubscriptionId===value.id)&&value.plan_id===row.planId&&value.quantity===1&&value.total_count===row.totalCycles&&notes?.naksharix_membership_id===row.id&&notes.naksharix_membership_version===row.version&&row.liveMode===isLive();
}
function publicMembership(row:AiMembership){return {id:row.id,version:row.version,pricePaise:row.pricePaise,unitsPerCycle:row.unitsPerCycle,totalCycles:row.totalCycles,state:row.state,providerState:row.providerState,lastProviderCheckedAt:row.lastProviderCheckedAt,canCancel:Boolean(row.providerSubscriptionId)&&!(terminalMembershipStates as readonly string[]).includes(row.state),authorizationUrl:row.state==="AWAITING_AUTHORIZATION"&&!row.cancellationRequestedAt?safeSubscriptionLink(row.hostedUrl):null};}
async function saveProviderState(row:AiMembership,value:Record<string,unknown>){
 if(!ownProvider(row,value))throw Error("MEMBERSHIP_PROVIDER_IDENTITY_MISMATCH");
 return prisma.$transaction(async tx=>{
  await lockCreditAccount(tx,row.userId);
  const current=await tx.aiMembership.findUnique({where:{id:row.id}});
  if(!current||!ownProvider(current,value))throw Error("MEMBERSHIP_PROVIDER_IDENTITY_CHANGED");
  const state=mappedMembershipState(value.status,Boolean(current.cancellationRequestedAt));
  const next=(terminalMembershipStates as readonly string[]).includes(current.state)&&!(terminalMembershipStates as readonly string[]).includes(state)?current.state:state;
  return tx.aiMembership.update({where:{id:current.id},data:{providerSubscriptionId:value.id as string,state:next,providerState:String(value.status).slice(0,40),lastProviderCheckedAt:new Date(),hostedUrl:next==="AWAITING_AUTHORIZATION"?safeSubscriptionLink(value.short_url):null}});
 });
}
export async function listMemberships(userId:string){
 const rows=await prisma.aiMembership.findMany({where:{userId},include:{cycles:{select:{cycleNumber:true,periodStart:true,periodEnd:true,payment:{select:{status:true,aiCreditGrant:{select:{remaining:true,suspendedAt:true,revokedAt:true,validFrom:true,validUntil:true}}}}},orderBy:{cycleNumber:"desc"},take:12}},orderBy:{createdAt:"desc"},take:12});
 const now=Date.now();
 return rows.map(r=>({...publicMembership(r),cycles:r.cycles.map(c=>({cycleNumber:c.cycleNumber,periodStart:c.periodStart,periodEnd:c.periodEnd,paymentStatus:c.payment.status,availableUnits:c.payment.status==="PAID"&&c.payment.aiCreditGrant&&!c.payment.aiCreditGrant.suspendedAt&&!c.payment.aiCreditGrant.revokedAt&&c.periodStart.getTime()<=now&&c.periodEnd.getTime()>now?c.payment.aiCreditGrant.remaining:0}))}));
}
export async function startMembership(userId:string,clientIntent:string,requested:MembershipOffer){
 const offer=await availableMembershipOffer();if(!offer||!sameMembershipOffer(offer,requested))return null;
 if(!await checkApprovedPlan(offer))return null;
 const reserved=await prisma.$transaction(async tx=>{
  await lockCreditAccount(tx,userId);
  const account=await tx.user.findUnique({where:{id:userId},select:{role:true,emailVerified:true,emailVerifiedAt:true}});
  if(!account||["ADMIN","SUPER_ADMIN"].includes(account.role)||(!account.emailVerified&&!account.emailVerifiedAt))return null;
  const prior=await tx.aiMembership.findUnique({where:{userId_clientIntent:{userId,clientIntent}}});
  if(prior)return sameMembershipOffer(prior,offer)?{row:prior,created:false}:null;
  // Unconfirmed provider creation and pending cancellation both block another mandate.
  if(await tx.aiMembership.count({where:{userId,state:{notIn:[...terminalMembershipStates]}}}))return null;
  const row=await tx.aiMembership.create({data:{userId,clientIntent,...offer,termsVersion:MEMBERSHIP_TERMS_VERSION,liveMode:isLive()}});return {row,created:true};
 });
 if(!reserved)return null;
 if(!reserved.created)return publicMembership(reserved.row);
 try{const value=await createProviderMembership(reserved.row.id,offer);return publicMembership(await saveProviderState(reserved.row,value));}
 catch{await prisma.aiMembership.updateMany({where:{id:reserved.row.id,state:"CREATING",providerSubscriptionId:null},data:{state:"REVIEW"}}).catch(()=>{});return { ...publicMembership(reserved.row),state:"REVIEW",authorizationUrl:null};}
}
export async function refreshMembership(userId:string,id:string){
 const row=await prisma.aiMembership.findFirst({where:{id,userId}});
 if(!row?.providerSubscriptionId||row.liveMode!==isLive())return null;
 return publicMembership(await saveProviderState(row,await fetchProviderMembership(row.providerSubscriptionId)));
}
export async function requestMembershipCancellation(userId:string,id:string){
 const row=await prisma.$transaction(async tx=>{
  await lockCreditAccount(tx,userId);
  const current=await tx.aiMembership.findFirst({where:{id,userId}});
  if(!current?.providerSubscriptionId||current.liveMode!==isLive())return null;
  if((terminalMembershipStates as readonly string[]).includes(current.state))return current;
  return tx.aiMembership.update({where:{id},data:{state:"CANCEL_PENDING",cancellationRequestedAt:current.cancellationRequestedAt??new Date(),hostedUrl:null}});
 });
 if(!row?.providerSubscriptionId)return null;
 if((terminalMembershipStates as readonly string[]).includes(row.state))return publicMembership(row);
 try{
  const current=await fetchProviderMembership(row.providerSubscriptionId);if(!ownProvider(row,current))throw Error("MEMBERSHIP_PROVIDER_IDENTITY_MISMATCH");
  if(["cancelled","completed","expired"].includes(String(current.status)))return publicMembership(await saveProviderState(row,current));
  return publicMembership(await saveProviderState(row,await cancelProviderMembership(row.providerSubscriptionId)));
 }catch{return publicMembership(row);}
}
/** Called only by the existing raw-body signed Razorpay webhook. No client-provided charge can grant membership units. */
export async function processMembershipEvent(eventName:string,subscription:unknown,payment:unknown){
 if(!subscription||typeof subscription!=="object")return false;
 const s=subscription as Record<string,unknown>,notes=s.notes as Record<string,unknown>|undefined;
 const localId=notes?.naksharix_membership_id;
 if(typeof localId!=="string"||!/^[a-zA-Z0-9_-]{1,100}$/.test(localId))return false;
 if(!await membershipSchemaReady())throw Error("MEMBERSHIP_REGISTRY_UNAVAILABLE");
 const row=await prisma.aiMembership.findUnique({where:{id:localId}});
 if(!row||!ownProvider(row,s))throw Error("MEMBERSHIP_EVENT_MISMATCH");
 if(typeof s.id!=="string")throw Error("MEMBERSHIP_EVENT_INVALID");
 if(eventName==="subscription.charged"){
  const evidence=readChargeEvidence(s,payment,row,s.id,Math.floor(Date.now()/1000));
  if(!evidence)throw Error("MEMBERSHIP_CHARGE_EVIDENCE_INVALID");
  const fresh=await fetchMembershipPayment(evidence.paymentId);
  if(!freshChargeMatches(fresh,evidence,row.pricePaise))throw Error("MEMBERSHIP_CHARGE_PROVIDER_MISMATCH");
  const refunded=Number(fresh.amount_refunded);
  await prisma.$transaction(async tx=>{
   await lockCreditAccount(tx,row.userId);
   const current=await tx.aiMembership.findUnique({where:{id:row.id}});
   if(!current||!ownProvider(current,s)||current.termsVersion!==MEMBERSHIP_TERMS_VERSION)throw Error("MEMBERSHIP_CHARGE_IDENTITY_CHANGED");
   const existing=await tx.aiMembershipCycle.findFirst({where:{OR:[{membershipId:row.id,cycleNumber:evidence.cycleNumber},{providerInvoiceId:evidence.invoiceId},{membershipId:row.id,periodStart:evidence.periodStart}]},include:{payment:true}});
   if(existing){
    if(existing.membershipId!==row.id||existing.cycleNumber!==evidence.cycleNumber||existing.providerInvoiceId!==evidence.invoiceId||existing.payment.providerPaymentId!==evidence.paymentId||existing.payment.providerOrderId!==evidence.orderId||existing.periodStart.getTime()!==evidence.periodStart.getTime()||existing.periodEnd.getTime()!==evidence.periodEnd.getTime())throw Error("MEMBERSHIP_DUPLICATE_CYCLE_CONFLICT");
    return;
   }
   // Overlapping paid periods are not valid extra entitlement, even with different invoice IDs.
   if(await tx.aiMembershipCycle.count({where:{membershipId:row.id,periodStart:{lt:evidence.periodEnd},periodEnd:{gt:evidence.periodStart}}}))throw Error("MEMBERSHIP_PERIOD_OVERLAP");
   const paid=await tx.payment.create({data:{userId:row.userId,purpose:"AI_MEMBERSHIP",provider:"RAZORPAY",status:refunded===row.pricePaise?"REFUNDED":"PAID",amount:row.pricePaise/100,currency:"INR",providerOrderId:evidence.orderId,providerPaymentId:evidence.paymentId,metadata:{membershipId:row.id,providerSubscriptionId:evidence.subscriptionId,providerInvoiceId:evidence.invoiceId,cycleNumber:evidence.cycleNumber,offerVersion:row.version,termsVersion:MEMBERSHIP_TERMS_VERSION,gatewayStatus:"captured",analyticsLiveOrder:row.liveMode,verifiedBy:"signed_subscription_charged_and_provider_read",amountRefundedPaise:refunded}}});
   await tx.aiMembershipCycle.create({data:{membershipId:row.id,cycleNumber:evidence.cycleNumber,periodStart:evidence.periodStart,periodEnd:evidence.periodEnd,providerInvoiceId:evidence.invoiceId,paymentId:paid.id}});
   await tx.aiCreditGrant.create({data:{paymentId:paid.id,units:row.unitsPerCycle,remaining:row.unitsPerCycle,offerVersion:row.version,validFrom:evidence.periodStart,validUntil:evidence.periodEnd,suspendedAt:refunded>0&&refunded<row.pricePaise?new Date():null,revokedAt:refunded===row.pricePaise?new Date():null}});
   const number="NXR-"+paid.createdAt.getUTCFullYear()+"-"+paid.id.slice(-8).toUpperCase();
   await tx.invoice.create({data:{userId:row.userId,paymentId:paid.id,number,taxAmount:0,html:"<h1>Naksharix membership payment receipt "+number+"</h1><p>Cycle "+evidence.cycleNumber+"</p><p>INR "+(row.pricePaise/100).toFixed(2)+" captured; merchant tax documentation is separate.</p>"}});
   if(!current.providerSubscriptionId)await tx.aiMembership.update({where:{id:row.id},data:{providerSubscriptionId:evidence.subscriptionId}});
  });
 }
 // Fresh subscription status, not out-of-order webhook snapshot, controls mandate state.
 await saveProviderState(row,await fetchProviderMembership(s.id));
 return true;
}

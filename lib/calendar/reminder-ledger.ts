import "server-only";
import {createHmac} from "node:crypto";
import {prisma} from "@/lib/db";
import {env} from "@/lib/env";
import type {Prisma} from "@prisma/client";
import {hasUnrefundedPackageEntitlement} from "@/lib/digital-packages/ledger";
import {sendEmail} from "@/lib/email/email-service";
import {normalizeLocale} from "@/lib/i18n";
import {reminderEmail} from "@/lib/calendar/reminder-copy";
import {referenceReminderEvents,reminderDueAt,reminderWindowOpen,REMINDER_CONSENT_VERSION,REMINDER_PRODUCT_KEY,REMINDER_END,REMINDER_DAILY_CAPACITY} from "@/lib/calendar/reminder-contract";
import {reminderServiceReady,reminderSchemaReady} from "@/lib/calendar/reminder-readiness";
const select={id:true,orderId:true,eventId:true,eventDate:true,leadDays:true,dueAt:true,status:true,acceptedAt:true} satisfies Prisma.ReferenceReminderSelect;
const digest=(userId:string,email:string)=>createHmac("sha256",env.JWT_SECRET).update("reference-reminder-v1:"+userId+":"+email.trim().toLowerCase()).digest("hex");
async function eligible(tx:Prisma.TransactionClient,userId:string,orderId:string){
 const order=await tx.digitalPackageOrder.findFirst({where:{id:orderId,userId,productKey:REMINDER_PRODUCT_KEY,productVersion:"v1"},include:{payment:true}});
 return !!order&&await hasUnrefundedPackageEntitlement(tx,order,order.payment);
}
async function account(tx:Prisma.TransactionClient,userId:string){return tx.user.findFirst({where:{id:userId,role:{notIn:["ADMIN","SUPER_ADMIN"]},OR:[{emailVerified:{not:null}},{emailVerifiedAt:{not:null}}]},select:{id:true,email:true,locale:true}});}
export async function reminderAccount(userId:string,now=new Date()){
 if(!await reminderSchemaReady())return null;
 const candidates=await prisma.digitalPackageOrder.findMany({where:{userId,productKey:REMINDER_PRODUCT_KEY,status:"PAID"},include:{payment:true},orderBy:{createdAt:"desc"},take:20});
 const orders:{id:string}[]=[];
 for(const order of candidates)if(await hasUnrefundedPackageEntitlement(prisma,order,order.payment))orders.push({id:order.id});
 return {available:await reminderServiceReady(now),orders,events:referenceReminderEvents(),reminders:await prisma.referenceReminder.findMany({where:{userId},select,orderBy:{dueAt:"asc"},take:100}),consentVersion:REMINDER_CONSENT_VERSION};
}
export async function scheduleReminder(userId:string,input:{orderId:string;eventId:string;leadDays:1|7;consent:true;consentVersion:string},now=new Date()){
 if(!await reminderServiceReady(now)||input.consent!==true||input.consentVersion!==REMINDER_CONSENT_VERSION||![1,7].includes(input.leadDays))return null;
 const event=referenceReminderEvents().find(e=>e.id===input.eventId);if(!event)return null;
 const dueAt=reminderDueAt(event,input.leadDays);if(dueAt<=now||dueAt>=REMINDER_END)return null;
 return prisma.$transaction(async tx=>{
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}),hashtext('reference-reminder-v1'))::text`;
  const user=await account(tx,userId);if(!user||!await eligible(tx,userId,input.orderId))return null;
  // Serialize admission for the selected delivery day, not just this account.
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${dueAt.toISOString().slice(0,10)}),hashtext('reference-reminder-day-v1'))::text`;
  const existing=await tx.referenceReminder.findUnique({where:{userId_eventId:{userId,eventId:event.id}}});
  if(existing&&!["SCHEDULED","CANCELED"].includes(existing.status))return null;
  const reserved=await tx.referenceReminder.count({where:{dueAt,status:{in:["SCHEDULED","CLAIMED","ACCEPTED","UNKNOWN"]},...(existing?{id:{not:existing.id}}:{})}});
  if(reserved>=REMINDER_DAILY_CAPACITY)return null;
  const data={orderId:input.orderId,eventDate:event.date,leadDays:input.leadDays,dueAt,consentVersion:REMINDER_CONSENT_VERSION,recipientDigest:digest(userId,user.email),status:"SCHEDULED"};
  if(existing){const saved=await tx.referenceReminder.updateMany({where:{id:existing.id,status:existing.status},data});return saved.count?tx.referenceReminder.findUnique({where:{id:existing.id},select}):null;}
  return tx.referenceReminder.create({data:{userId,eventId:event.id,...data},select});
 });
}
export async function cancelReminder(userId:string,id:string){if(!await reminderSchemaReady())return false;return (await prisma.referenceReminder.updateMany({where:{id,userId,status:"SCHEDULED"},data:{status:"CANCELED"}})).count===1;}
export async function runReferenceReminderRecovery(now=new Date(),transport=sendEmail,limit=REMINDER_DAILY_CAPACITY){
 const counts={enabled:false,selected:0,accepted:0,skipped:0,unknown:0};
 if(!await reminderServiceReady(now))return counts;
 counts.enabled=true;
 await prisma.referenceReminder.updateMany({where:{status:"CLAIMED",claimedAt:{lt:new Date(now.getTime()-30*60000)}},data:{status:"UNKNOWN"}});
 await prisma.referenceReminder.updateMany({where:{status:"SCHEDULED",dueAt:{lte:new Date(now.getTime()-86400000)}},data:{status:"SKIPPED"}});
 const rows=await prisma.referenceReminder.findMany({where:{status:"SCHEDULED",dueAt:{lte:now,gt:new Date(now.getTime()-86400000)}},select:{id:true},orderBy:{dueAt:"asc"},take:Math.max(1,Math.min(limit,REMINDER_DAILY_CAPACITY))});
 counts.selected=rows.length;
 for(const row of rows){
  const claimed=await prisma.referenceReminder.updateMany({where:{id:row.id,status:"SCHEDULED",dueAt:{lte:now,gt:new Date(now.getTime()-86400000)}},data:{status:"CLAIMED",claimedAt:now}});
  if(!claimed.count)continue;
  let outcome="SKIPPED";
  try{
   const current=await prisma.referenceReminder.findUnique({where:{id:row.id}});
   const event=current&&referenceReminderEvents().find(e=>e.id===current.eventId);
   const user=current&&await account(prisma,current.userId);
   if(current&&current.status==="CLAIMED"&&event&&user&&current.consentVersion===REMINDER_CONSENT_VERSION&&current.eventDate===event.date&&[1,7].includes(current.leadDays)&&current.dueAt.getTime()===reminderDueAt(event,current.leadDays as 1|7).getTime()&&reminderWindowOpen(current.dueAt,now)&&current.recipientDigest===digest(user.id,user.email)&&await eligible(prisma,current.userId,current.orderId)){
    const result=await transport({to:user.email,...reminderEmail(normalizeLocale(user.locale),event),idempotencyKey:"naksharix/reference-reminder/"+current.id});
    outcome=result.sent?"ACCEPTED":"UNKNOWN";
   }
  }catch{outcome="UNKNOWN";}
  await prisma.referenceReminder.updateMany({where:{id:row.id,status:"CLAIMED"},data:{status:outcome,...(outcome==="ACCEPTED"?{acceptedAt:now}:{})}});
  if(outcome==="ACCEPTED")counts.accepted++;else if(outcome==="SKIPPED")counts.skipped++;else counts.unknown++;
 }
 return counts;
}

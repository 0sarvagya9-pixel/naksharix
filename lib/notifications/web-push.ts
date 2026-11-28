import "server-only";
import {prisma} from "@/lib/db";
import {pushConfiguration,pushDigest,openEndpoint,sendGenericPush} from "@/lib/notifications/web-push-transport";
import {validPushEvent,WEB_PUSH_CONSENT_VERSION} from "@/lib/notifications/push-contract";
import {logger} from "@/lib/monitoring/logger";

export async function pushSchemaReady(){
 try{const [row]=await prisma.$queryRaw<{ready:boolean}[]>`SELECT to_regclass('public."WebPushSubscription"') IS NOT NULL AS ready`;return row?.ready===true;}catch{return false;}
}
/** Only called after a real business status transition. No arbitrary public send API. */
export async function notifyAccountUpdate(input:{userId:string;kind:"report"|"shop"|"puja";reference:string;status:string}){
 const config=pushConfiguration();
 if(!config||!input.userId||!validPushEvent(input.kind,input.reference,input.status))return;
 try{
 const devices=await prisma.webPushSubscription.findMany({where:{userId:input.userId,keyFingerprint:config.keyFingerprint,consentVersion:WEB_PUSH_CONSENT_VERSION},select:{id:true,endpointDigest:true},take:5});
 await Promise.all(devices.map(async device=>{
  const id="web-push:"+pushDigest(config,[input.kind,input.reference,input.status,input.userId,device.id].join(":"));
  try{
   // One attempt per actual event/device. Ambiguous transport failures are not blindly retried.
   await prisma.auditLog.create({data:{id,action:"notification.push.attempt",targetType:"PushAttempt",targetId:id,metadata:{outcome:"attempted"}}});
  }catch{return;}
  let outcome="failed_or_unknown";
  try{
   const current=await prisma.webPushSubscription.findFirst({where:{id:device.id,userId:input.userId,endpointDigest:device.endpointDigest,keyFingerprint:config.keyFingerprint,consentVersion:WEB_PUSH_CONSENT_VERSION}});
   if(!current){outcome="revoked_before_send";return;}
   const endpoint=openEndpoint(config,current.endpointCiphertext,input.userId,current.endpointDigest);
   outcome=await sendGenericPush(config,endpoint);
   if(outcome==="expired")await prisma.webPushSubscription.deleteMany({where:{id:current.id,userId:input.userId,endpointDigest:current.endpointDigest}});
   else await prisma.webPushSubscription.updateMany({where:{id:current.id,userId:input.userId},data:{lastOutcome:outcome,...(outcome==="provider_accepted"?{lastAcceptedAt:new Date()}:{})}});
  }catch{outcome="failed_or_unknown";}
  finally{await prisma.auditLog.updateMany({where:{id,action:"notification.push.attempt"},data:{metadata:{outcome}}}).catch(()=>{});}
 }));
 }catch{logger.warn("account_update_push_unavailable");}
}

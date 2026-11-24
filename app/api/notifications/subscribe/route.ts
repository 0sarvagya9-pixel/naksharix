import {z} from "zod";
import {fail,ok,handleApiError,validateJson} from "@/lib/api";
import {getCurrentUser} from "@/lib/auth/jwt";
import {prisma} from "@/lib/db";
import {pushConfiguration,pushDigest,sealEndpoint} from "@/lib/notifications/web-push-transport";
import {pushSchemaReady} from "@/lib/notifications/web-push";
import {allowedPushEndpoint,WEB_PUSH_CONSENT_VERSION} from "@/lib/notifications/push-contract";
import {sharedRateLimitResponse} from "@/lib/security/rate-limit";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const subscribe=z.object({endpoint:z.string().max(2048),consent:z.literal(true),consentVersion:z.literal(WEB_PUSH_CONSENT_VERSION),publicKey:z.string().max(100)}).strict();
const revoke=z.union([z.object({all:z.literal(true)}).strict(),z.object({endpoint:z.string().max(2048)}).strict()]);
export async function GET(){
 try{
 const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);
 const config=pushConfiguration(),schema=await pushSchemaReady();
 const count=schema?await prisma.webPushSubscription.count({where:{userId:user.id}}):0;
 return ok({ready:Boolean(config&&schema),publicKey:config&&schema?config.publicKey:null,registeredDevices:count,schemaReady:schema,consentVersion:WEB_PUSH_CONSENT_VERSION});
 }catch(e){return handleApiError(e);}
}
export async function POST(request:Request){
 try{
 const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);
 const limited=await sharedRateLimitResponse("push-subscribe",user.id,5,60000);if(limited)return limited;
 const config=pushConfiguration();if(!config||!await pushSchemaReady())return fail("Push notifications are not available. No subscription was saved.",503);
 const body=await validateJson(request,subscribe),endpoint=allowedPushEndpoint(body.endpoint);
 if(!endpoint||body.publicKey!==config.publicKey)return fail("Unsupported browser push endpoint or changed server key.",422);
 const account=await prisma.user.findUnique({where:{id:user.id},select:{emailVerified:true,emailVerifiedAt:true}});
 if(!account||(!account.emailVerified&&!account.emailVerifiedAt))return fail("Verify your account before enabling device notifications.",403);
 const digest=pushDigest(config,endpoint);
 const result=await prisma.$transaction(async tx=>{
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${user.id}),hashtext('naksharix-push-user-v1'))::text`;
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${digest}),hashtext('naksharix-push-endpoint-v1'))::text`;
  const existing=await tx.webPushSubscription.findUnique({where:{endpointDigest:digest}});
  if(existing&&existing.userId!==user.id)return "conflict";
  if(!existing&&await tx.webPushSubscription.count({where:{userId:user.id}})>=5)return "limit";
  const data={endpointCiphertext:sealEndpoint(config,endpoint,user.id,digest),keyFingerprint:config.keyFingerprint,consentVersion:WEB_PUSH_CONSENT_VERSION};
  if(existing)await tx.webPushSubscription.update({where:{id:existing.id},data});
  else await tx.webPushSubscription.create({data:{userId:user.id,endpointDigest:digest,...data}});
  return "saved";
 });
 if(result!=="saved")return fail(result==="limit"?"Five device limit reached; revoke old devices first.":"This browser is linked to another account. Disable its existing subscription and enable again.",409);
 return ok({registered:true,deliveryVerified:false});
 }catch(e){return handleApiError(e);}
}
export async function DELETE(request:Request){
 try{
 const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);
 const body=await validateJson(request,revoke);
 if(!await pushSchemaReady())return ok({revoked:true,registeredDevices:0});
 const config=pushConfiguration();
 if("all" in body){await prisma.webPushSubscription.deleteMany({where:{userId:user.id}});}
 else{
  const endpoint=allowedPushEndpoint(body.endpoint);if(!endpoint)return fail("Invalid device endpoint.",422);
  if(!config)return fail("Use revoke all devices while push configuration is unavailable.",409);
  await prisma.webPushSubscription.deleteMany({where:{userId:user.id,endpointDigest:pushDigest(config,endpoint)}});
 }
 return ok({revoked:true,registeredDevices:await prisma.webPushSubscription.count({where:{userId:user.id}})});
 }catch(e){return handleApiError(e);}
}

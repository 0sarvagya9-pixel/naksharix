import { createHash } from "node:crypto";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { prepareServiceRequest } from "@/lib/deferred-services/contract";
import { isShippingCountry } from "@/lib/shop/shipping-rules";

export const dynamic="force-dynamic";
const schema=z.object({kind:z.string().max(40),units:z.number().int(),target:z.string().max(100),preferredDate:z.string().max(10),consent:z.string().max(64),requestId:z.string().uuid()}).strict();
export async function POST(request:Request){
  // Separate owner-controlled gate. Does not change existing Puja or payment gates.
  if(process.env.DEFERRED_SERVICE_REQUESTS_ENABLED!=="true")return fail("Service requests are not open.",404);
  try{
    const user=await getCurrentUser();
    if(!user)return fail("Sign in to request a review.",401);
    if(user.role!=="USER"||user.isAdminLogin)return fail("Customer account required.",403);
    const account=await prisma.user.findUnique({where:{id:user.id},select:{emailVerified:true,emailVerifiedAt:true}});
    if(!account||(!account.emailVerified&&!account.emailVerifiedAt))return fail("Verify your email before requesting a review.",403);
    const input=await validateJson(request,schema);
    const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
    const prepared=prepareServiceRequest(input,today);
    if(!prepared||(prepared.item.target==="country"&&!isShippingCountry(input.target.trim())))return fail("Check the request type, quantity, location, date and acknowledgement.",422);
    const id="deferred-"+createHash("sha256").update(user.id+":"+input.requestId.toLowerCase()).digest("hex");
    const read=()=>prisma.supportTicket.findUnique({where:{id},select:{id:true,userId:true,subject:true,messages:true,status:true,createdAt:true}});
    const respond=(row:NonNullable<Awaited<ReturnType<typeof read>>>,duplicate:boolean)=>{
      const first=Array.isArray(row.messages)?row.messages[0]:null;
      if(row.userId!==user.id||row.subject!==prepared.subject||!first||typeof first!=="object"||Array.isArray(first)||first.text!==prepared.description)return fail("Request reference was already used with different details.",409);
      const response=ok({ticket:{id:row.id,status:row.status,createdAt:row.createdAt},requestId:input.requestId,request:{kind:input.kind,units:input.units,target:input.target.trim(),preferredDate:input.preferredDate},duplicate,trackingPath:"/support",paymentRequired:false,orderCreated:false,bookingCreated:false,entitlementGranted:false,capacityReserved:false,fulfillmentConfirmed:false},{status:duplicate?200:201});
      response.headers.set("Cache-Control","private, no-store");
      return response;
    };
    const existing=await read();
    if(existing)return respond(existing,true);
    if(!prepared.dateAllowed)return fail("Preferred date cannot be in the past.",422);
    const limit=await rateLimit("deferred-service-review:"+user.id,10,86400);
    if(!limit.allowed)return fail("Daily review request limit reached.",429);
    const result=await prisma.supportTicket.createMany({data:[{id,userId:user.id,subject:prepared.subject,status:"OPEN",priority:"NORMAL",messages:[{author:"USER",text:prepared.description,at:new Date().toISOString()}]}],skipDuplicates:true});
    const row=await read();
    if(!row)return fail("Request could not be confirmed. Retry with the same reference.",503);
    return respond(row,result.count===0);
  }catch(error){return handleApiError(error);}
}

import { Prisma } from "@prisma/client";
import { z } from "zod";
import { fail,handleApiError,ok,validateJson } from "@/lib/api";
import { getAdminApiUser } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
export const dynamic="force-dynamic";
const statuses=["REQUESTED","CONFIRMED","SCHEDULED","IN_PROGRESS","COMPLETED","CANCELED","REJECTED"] as const;
const moves:Record<string,readonly string[]>={
 REQUESTED:["CONFIRMED","CANCELED","REJECTED"],
 CONFIRMED:["SCHEDULED","CANCELED"],SCHEDULED:["IN_PROGRESS","CANCELED"],
 IN_PROGRESS:["COMPLETED"],COMPLETED:[],CANCELED:[],REJECTED:[]
};
const patch=z.object({
 id:z.string().min(4).max(140),expectedVersion:z.number().int().min(1),
 status:z.enum(statuses),partnerId:z.string().trim().max(140).nullable(),
 scheduledAt:z.string().datetime({offset:true}).nullable(),
 adminNote:z.string().trim().max(1500),
 evidenceUrl:z.string().url().max(500).nullable()
}).strict();
export async function GET(){
 try{
  const admin=await getAdminApiUser();if(!admin)return fail("Forbidden",403);
  const [bookings,partners]=await Promise.all([
   prisma.pujaBookingRequest.findMany({take:100,orderBy:{createdAt:"desc"}}),
   prisma.pujaPartner.findMany({where:{reviewStatus:"VERIFIED"},select:{id:true,name:true,region:true},take:100})
  ]);
  return ok({bookings,partners});
 }catch(error){
  if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2021")return fail("Booking schema not provisioned.",503);
  return handleApiError(error);
 }
}
export async function PATCH(request:Request){
 try{
  const admin=await getAdminApiUser();if(!admin)return fail("Forbidden",403);
  const input=await validateJson(request,patch);
  const existing=await prisma.pujaBookingRequest.findUnique({where:{id:input.id}});
  if(!existing)return fail("Puja request not found.",404);
  if(existing.version!==input.expectedVersion)return fail("Request changed in another session.",409);
  if(input.status!==existing.status&&!(moves[existing.status]||[]).includes(input.status))
   return fail("Invalid Puja booking status transition.",422);
  if(input.status==="CANCELED"){
    const paid=await prisma.payment.findFirst({where:{userId:existing.userId,purpose:"PUJA_BOOKING",
      status:"PAID",metadata:{path:["pujaBookingId"],equals:existing.id}},select:{id:true}});
    if(paid)return fail("Verify the Razorpay refund before canceling this paid Puja.",409);
  }
  const partnerId=input.partnerId||existing.partnerId;
  if(["CONFIRMED","SCHEDULED","IN_PROGRESS","COMPLETED"].includes(input.status)){
   if(!partnerId)return fail("A VERIFIED Puja partner must be assigned before confirmation.",422);
   const provider=await prisma.pujaPartner.findUnique({where:{id:partnerId}});
   if(provider?.reviewStatus!=="VERIFIED")return fail("Selected Puja partner is not verified.",422);
  }
  const when=input.scheduledAt?new Date(input.scheduledAt):existing.scheduledAt;
  if(["SCHEDULED","IN_PROGRESS","COMPLETED"].includes(input.status)&&(!when||Number.isNaN(when.valueOf())))
   return fail("Confirmed ceremony date/time required.",422);
  if(input.status==="COMPLETED"&&input.adminNote.trim().length<15)
   return fail("Write an actual completion note (15+ characters).",422);
  if(input.evidenceUrl){
   const url=new URL(input.evidenceUrl);
   if(url.protocol!=="https:"||url.username||url.password||url.port||!url.hostname.includes(".")||url.hostname.endsWith(".local"))
    return fail("Completion evidence must be a public HTTPS reference.",422);
  }
  const result=await prisma.$transaction(async tx=>{
   const updated=await tx.pujaBookingRequest.updateMany({
    where:{id:input.id,version:input.expectedVersion,status:existing.status},
    data:{status:input.status,partnerId:partnerId||null,scheduledAt:when,
      adminNote:input.adminNote,evidenceUrl:input.evidenceUrl,version:{increment:1}}
   });
   if(updated.count!==1)return null;
   const booking=await tx.pujaBookingRequest.findUniqueOrThrow({where:{id:input.id}});
   await tx.adminActionLog.create({data:{adminId:admin.id,action:"puja.booking.update",
    targetType:"PujaBookingRequest",targetId:input.id,metadata:{from:existing.status,to:booking.status,
     partnerId:booking.partnerId,version:booking.version,completionEvidencePresent:Boolean(booking.evidenceUrl)}}});
   return booking;
  },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
  if(!result)return fail("Concurrent Puja request update.",409);
  return ok({booking:result,paid:false,operatorVerified:true});
 }catch(error){
  if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2021")return fail("Booking schema not provisioned.",503);
  return handleApiError(error);
 }
}

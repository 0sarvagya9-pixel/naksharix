import { Prisma } from "@prisma/client";
import { z } from "zod";
import { fail,handleApiError,ok,validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { findPujaTopic } from "@/lib/puja/service-catalogue";

export const dynamic="force-dynamic";
const inputSchema=z.object({
 topicId:z.string().regex(/^[a-z0-9-]{1,100}$/),
 preferredDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
 expectedPricePaise:z.number().int().min(100).max(100000000).optional(),
 city:z.string().trim().min(2).max(100),
 devoteeName:z.string().trim().min(2).max(120),
 gotra:z.string().trim().max(100).nullable(),
 sankalpNote:z.string().trim().min(10).max(1500),
 customerPhone:z.string().trim().regex(/^[+0-9() -]{8,20}$/)
}).strict();
export async function GET(){
 try{
  const user=await getCurrentUser();if(!user)return fail("Sign in to view Puja requests.",401);
  const bookings=await prisma.pujaBookingRequest.findMany({where:{userId:user.id},
    orderBy:{createdAt:"desc"},take:60,
    select:{id:true,topicId:true,quotedPricePaise:true,preferredDate:true,city:true,devoteeName:true,
      status:true,scheduledAt:true,partnerId:true,evidenceUrl:true,createdAt:true}});
  return ok({bookings});
 }catch(error){
  if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2021")return fail("Puja booking storage not provisioned.",503);
  return handleApiError(error);
 }
}
export async function POST(request:Request){
 try{
  const user=await getCurrentUser();if(!user)return fail("Sign in to book your Puja. You can return to this page afterward.",401);
  const input=await validateJson(request,inputSchema);
  if(!findPujaTopic(input.topicId))return fail("Unknown Puja service.",422);
  const when=new Date(input.preferredDate+"T00:00:00.000Z");
  if(Number.isNaN(when.valueOf())||when.toISOString().slice(0,10)!==input.preferredDate)
    return fail("Invalid preferred date.",422);
  const now=new Date();
  if(when.valueOf()+86400000<=now.valueOf()||when.valueOf()>now.valueOf()+366*86400000)
    return fail("Choose a future date within the next year.",422);
  // The owner must publish this exact Puja and approved service fee first.
  const offer=await prisma.pujaOffering.findUnique({where:{topicId:input.topicId}});
  if(!offer?.available||!offer.pricePaise||offer.pricePaise<100)
    return fail("This Puja has no published service offer. Request an enquiry instead.",422);
  // Do not record a different fee than the one the devotee actually viewed.
  if(input.expectedPricePaise!==undefined&&offer.pricePaise!==input.expectedPricePaise)
    return fail("The published Puja fee changed. Refresh and review the new price before submitting.",409);
  // Snapshot the validated non-null fee before entering the DB callback; an
  // asynchronous closure must never weaken the type or the accepted quote.
  const quotedPricePaise:number=offer.pricePaise;
  // Shared Postgres lock + persisted count enforce this quota across every
  // serverless instance; no per-instance memory limit or Redis dependency.
  const booking=await prisma.$transaction(async tx=>{
    await tx.$queryRaw<Array<{locked:string}>>`
      SELECT pg_advisory_xact_lock(
        hashtext(${user.id}),hashtext('naksharix-puja-request-v1')
      )::text AS locked
    `;
    const recent=await tx.pujaBookingRequest.count({where:{
      userId:user.id,createdAt:{gte:new Date(Date.now()-86400_000)}
    }});
    if(recent>=4)return null;
    return tx.pujaBookingRequest.create({
      data:{userId:user.id,topicId:input.topicId,quotedPricePaise,preferredDate:when,
        city:input.city,devoteeName:input.devoteeName,gotra:input.gotra||null,
        sankalpNote:input.sankalpNote,customerPhone:input.customerPhone,status:"REQUESTED"},
      select:{id:true,status:true,topicId:true,preferredDate:true,quotedPricePaise:true,createdAt:true}
    });
  });
  if(!booking)return fail("Daily Puja request limit reached.",429);
  return ok({booking,confirmed:false,panditAssigned:false,paymentCollected:false,
    nextStep:"Continue to secure Razorpay payment. The final ceremony time will be coordinated after booking."},{status:201});
 }catch(error){
  if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2021")return fail("Puja booking storage not provisioned.",503);
  return handleApiError(error);
 }
}

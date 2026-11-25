import { NextRequest } from "next/server";
import {Prisma} from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { lockConsultationCalendar } from "@/lib/consultations/booking-conflicts";
import {validConsultationSlotWindow} from "@/lib/consultations/slot-contract";

const createSchema=z.object({
 dayOfWeek:z.coerce.number().int().min(0).max(6),
 startTime:z.string().regex(/^\d{2}:\d{2}$/),endTime:z.string().regex(/^\d{2}:\d{2}$/),
 isHoliday:z.boolean().default(false),isActive:z.boolean().default(true),
 consultationType:z.enum(["CHAT","CALL","VIDEO"]).default("CHAT"),
 status:z.enum(["ONLINE","BUSY","OFFLINE"]).default("ONLINE")
}).strict().refine(validConsultationSlotWindow,"Choose a real same-day time range with at least 30 minutes for a consultation.");
const updateSchema=z.object({slotId:z.string().min(1).max(128),isActive:z.boolean().optional(),status:z.enum(["ONLINE","BUSY","OFFLINE"]).optional()}).strict().refine(x=>x.isActive!==undefined||x.status!==undefined,"Choose a change.");
const deleteSchema=z.object({slotId:z.string().min(1).max(128)}).strict();
const professional=(user:Awaited<ReturnType<typeof getCurrentUser>>)=>!!user&&["ASTROLOGER","CONSULTANT"].includes(user.effectiveRole??"");
const sameSlot=(slot:{astrologerProfileId:string;dayOfWeek:number;startTime:string;endTime:string;consultationType:string;isHoliday:boolean})=>({astrologerProfileId:slot.astrologerProfileId,dayOfWeek:slot.dayOfWeek,startTime:slot.startTime,endTime:slot.endTime,consultationType:slot.consultationType,isHoliday:slot.isHoliday});
function conflict(error:unknown){return error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2034";}
export async function POST(request:NextRequest){
 try{
  const user=await getCurrentUser();if(!user||!professional(user))return fail("Unauthorized",403);
  const profile=await prisma.astrologerProfile.findUnique({where:{userId:user.id},select:{id:true}});
  if(!profile)return fail("Create an astrologer profile first",422);
  const body=await validateJson(request,createSchema);
  const result=await prisma.$transaction(async tx=>{
   await lockConsultationCalendar(tx,profile.id);
   const existing=await tx.availabilitySlot.findFirst({where:{...sameSlot({astrologerProfileId:profile.id,...body}),isActive:true}});
   if(existing&&body.isActive)return null;
   const slot=await tx.availabilitySlot.create({data:{astrologerProfileId:profile.id,...body}});
   await tx.astrologerProfile.update({where:{id:profile.id},data:{availabilityStatus:body.status}});
   return slot;
  });
  if(!result)return fail("This active availability slot already exists.",409);
  return ok({slot:result},{status:201});
 }catch(error){return conflict(error)?fail("Availability changed concurrently. Refresh and retry.",409):handleApiError(error);}
}
export async function PATCH(request:NextRequest){
 try{
  const user=await getCurrentUser();if(!user||!professional(user))return fail("Unauthorized",403);
  const profile=await prisma.astrologerProfile.findUnique({where:{userId:user.id},select:{id:true}});
  if(!profile)return fail("Astrologer profile not found",404);
  const body=await validateJson(request,updateSchema);
  const result=await prisma.$transaction(async tx=>{
   await lockConsultationCalendar(tx,profile.id);
   const slot=await tx.availabilitySlot.findFirst({where:{id:body.slotId,astrologerProfileId:profile.id}});
   if(!slot)return {status:404 as const};
   if(body.isActive===true){
    if(!validConsultationSlotWindow(slot))return {status:422 as const};
    const duplicate=await tx.availabilitySlot.findFirst({where:{...sameSlot(slot),isActive:true,id:{not:slot.id}}});
    if(duplicate)return {status:409 as const};
   }
   const updated=await tx.availabilitySlot.update({where:{id:slot.id},data:{isActive:body.isActive,status:body.status}});
   return {status:200 as const,slot:updated};
  });
  if(result.status===404)return fail("Availability slot not found",404);
  if(result.status===422)return fail("This stored slot has an invalid time range.",422);
  if(result.status===409)return fail("This active availability slot already exists.",409);
  return ok({slot:result.slot});
 }catch(error){return conflict(error)?fail("Availability changed concurrently. Refresh and retry.",409):handleApiError(error);}
}
export async function DELETE(request:NextRequest){
 try{
  const user=await getCurrentUser();if(!user||!professional(user))return fail("Unauthorized",403);
  const profile=await prisma.astrologerProfile.findUnique({where:{userId:user.id},select:{id:true}});
  if(!profile)return fail("Astrologer profile not found",404);
  const body=await validateJson(request,deleteSchema);
  const result=await prisma.$transaction(async tx=>{
   await lockConsultationCalendar(tx,profile.id);
   return tx.availabilitySlot.deleteMany({where:{id:body.slotId,astrologerProfileId:profile.id}});
  });
  if(!result.count)return fail("Availability slot not found",404);
  return ok({success:true});
 }catch(error){return conflict(error)?fail("Availability changed concurrently. Refresh and retry.",409):handleApiError(error);}
}

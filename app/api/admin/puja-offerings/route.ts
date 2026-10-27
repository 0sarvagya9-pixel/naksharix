import { Prisma } from "@prisma/client";
import { z } from "zod";
import { fail,handleApiError,ok,validateJson } from "@/lib/api";
import { getAdminApiUser } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { findPujaTopic } from "@/lib/puja/service-catalogue";
export const dynamic="force-dynamic";
const payload=z.object({
 topicId:z.string().regex(/^[a-z0-9-]{1,100}$/),
 pricePaise:z.number().int().min(100).max(100000000).nullable(),
 durationMinutes:z.number().int().min(15).max(2880).nullable(),
 available:z.boolean(),
 note:z.string().trim().max(500)
}).strict();
export async function GET(){
 try{
  const admin=await getAdminApiUser();
  if(!admin)return fail("Forbidden",403);
  const offerings=await prisma.pujaOffering.findMany({orderBy:{topicId:"asc"}});
  return ok({offerings});
 }catch(error){
  if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2021")
    return fail("Puja offering schema has not been provisioned.",503);
  return handleApiError(error)
 }
}
export async function PUT(request:Request){
 try{
  const admin=await getAdminApiUser();
  if(!admin)return fail("Forbidden",403);
  const input=await validateJson(request,payload);
  if(!findPujaTopic(input.topicId))return fail("Unknown Puja topic.",422);
  if(input.available&&input.pricePaise===null)return fail("Published offer requires an approved INR price.",422);
  const offer=await prisma.$transaction(async tx=>{
   const row=await tx.pujaOffering.upsert({
    where:{topicId:input.topicId},
    create:{...input,updatedBy:admin.id},
    update:{pricePaise:input.pricePaise,durationMinutes:input.durationMinutes,available:input.available,note:input.note,updatedBy:admin.id}
   });
   await tx.adminActionLog.create({data:{
    adminId:admin.id,action:"puja.offering.save",targetType:"PujaOffering",targetId:row.topicId,
    metadata:{available:row.available,pricePaise:row.pricePaise}
   }});
   return row;
  });
  return ok({offering:offer});
 }catch(error){
  if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2021")
    return fail("Puja offering schema has not been provisioned.",503);
  return handleApiError(error)
 }
}

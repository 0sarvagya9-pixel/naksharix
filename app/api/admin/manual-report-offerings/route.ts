import { Prisma } from "@prisma/client";
import { z } from "zod";
import { fail,handleApiError,ok,validateJson } from "@/lib/api";
import { getAdminApiUser } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { getManualReport } from "@/lib/manual-catalogue";
import { getManualReportCheckout } from "@/lib/reports/checkout-catalogue";
export const dynamic="force-dynamic";
const shape=z.object({
 reportSlug:z.string().regex(/^[a-z0-9-]{1,100}$/),
 pricePaise:z.number().int().min(100).max(100000000).nullable(),
 available:z.boolean(),
 deliveryDays:z.number().int().min(1).max(180).nullable(),
 note:z.string().trim().max(500)
}).strict();
export async function GET(){
 try{
  const admin=await getAdminApiUser();if(!admin)return fail("Forbidden",403);
  const offerings=await prisma.manualReportOffering.findMany({orderBy:{reportSlug:"asc"}});
  return ok({offerings});
 }catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==="P2021")return fail("Report pricing schema not provisioned.",503);return handleApiError(e)}
}
export async function PUT(request:Request){
 try{
  const admin=await getAdminApiUser();if(!admin)return fail("Forbidden",403);
  const input=await validateJson(request,shape);
  if(!getManualReport(input.reportSlug))return fail("Unknown report.",422);
  if(getManualReportCheckout(input.reportSlug))return fail("Gateway-priced reports cannot be repriced using the manual report editor.",422);
  if(input.available&&input.pricePaise===null)return fail("Publish only an owner-approved positive fee.",422);
  const record=await prisma.$transaction(async tx=>{
   const row=await tx.manualReportOffering.upsert({where:{reportSlug:input.reportSlug},
    create:{...input,updatedBy:admin.id},
    update:{pricePaise:input.pricePaise,available:input.available,deliveryDays:input.deliveryDays,note:input.note,updatedBy:admin.id}
   });
   await tx.adminActionLog.create({data:{adminId:admin.id,action:"report.manual.offer.save",targetType:"ManualReportOffering",
    targetId:row.reportSlug,metadata:{pricePaise:row.pricePaise,available:row.available}}});
   return row;
  });
  return ok({offering:record,paymentContractChanged:false});
 }catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==="P2021")return fail("Report pricing schema not provisioned.",503);return handleApiError(e)}
}

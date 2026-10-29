import { Prisma } from "@prisma/client";
import { z } from "zod";
import { fail,handleApiError,ok,validateJson } from "@/lib/api";
import { getAdminApiUser } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
export const dynamic="force-dynamic";
const statuses=["REQUESTED","CONFIRMED","PACKING","DISPATCHED","DELIVERED","CANCELED"] as const;
const moves:Record<string,readonly string[]>={
 REQUESTED:["CONFIRMED","CANCELED"],CONFIRMED:["PACKING","CANCELED"],
 PACKING:["DISPATCHED","CANCELED"],DISPATCHED:["DELIVERED"],DELIVERED:[],CANCELED:[]
};
const patch=z.object({
 id:z.string().min(4).max(140),
 expectedVersion:z.number().int().min(1),
 status:z.enum(statuses),
 shippingPaise:z.number().int().min(0).max(10000000).nullable(),
 taxPaise:z.number().int().min(0).max(10000000).nullable(),
 trackingReference:z.string().trim().max(140).nullable(),
 fulfillmentEvidenceUrl:z.string().url().max(500).nullable(),
 adminNote:z.string().trim().max(1500)
}).strict();
export async function GET(){
 try{
  const user=await getAdminApiUser();if(!user)return fail("Forbidden",403);
  const orders=await prisma.shopOrder.findMany({
   orderBy:{createdAt:"desc"},take:100,
   select:{id:true,userId:true,items:true,customerName:true,customerPhone:true,deliveryCity:true,deliveryState:true,
    deliveryAddress:true,postalCode:true,customerNote:true,subtotalPaise:true,shippingPaise:true,taxPaise:true,totalPaise:true,
    status:true,paymentStatus:true,trackingReference:true,fulfillmentEvidenceUrl:true,adminNote:true,version:true,createdAt:true,updatedAt:true}
  });
  return ok({orders});
 }catch(error){
  if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2021")return fail("Order schema not provisioned.",503);
  return handleApiError(error);
 }
}
export async function PATCH(request:Request){
 try{
  const admin=await getAdminApiUser();if(!admin)return fail("Forbidden",403);
  const input=await validateJson(request,patch);
  const current=await prisma.shopOrder.findUnique({where:{id:input.id}});
  if(!current)return fail("Order not found.",404);
  if(current.version!==input.expectedVersion)return fail("Order changed in another session.",409);
  const legal=moves[current.status]||[];
  if(input.status!==current.status&&!legal.includes(input.status))return fail("Invalid order status transition.",422);
  if(input.status==="CANCELED"&&current.paymentStatus==="PAID")
    return fail("Issue and verify the full Razorpay refund before canceling a paid order.",409);
  const shipping=input.shippingPaise??current.shippingPaise;
  const tax=input.taxPaise??current.taxPaise;
  if(["CONFIRMED","PACKING","DISPATCHED","DELIVERED"].includes(input.status)&&(shipping===null||tax===null))
    return fail("Confirm shipping and applicable tax amounts before accepting an order.",422);
  if(["PACKING","DISPATCHED","DELIVERED"].includes(input.status)&&current.paymentStatus!=="PAID")
    return fail("Captured Razorpay payment must be verified before packing or dispatch.",422);
  if(["DISPATCHED","DELIVERED"].includes(input.status)&&!((input.trackingReference??current.trackingReference)||"").trim())
    return fail("Tracking reference is required for dispatched orders.",422);
  const evidence=input.fulfillmentEvidenceUrl??current.fulfillmentEvidenceUrl;
  if(["CONFIRMED","PACKING","DISPATCHED","DELIVERED"].includes(input.status)){
    if(!evidence||input.adminNote.trim().length<30)
      return fail("Supplier evidence URL and detailed owner fulfilment approval are required.",422);
    const url=new URL(evidence);
    if(url.protocol!=="https:"||url.username||url.password||url.port||!url.hostname.includes("."))
      return fail("Supplier evidence must be an HTTPS reference without embedded credentials.",422);
  }
  if(current.paymentStatus==="PAID" &&
     (shipping!==current.shippingPaise||tax!==current.taxPaise))
    return fail("Shipping and tax totals cannot be changed after a captured payment.",409);
  const total=shipping!==null&&tax!==null?current.subtotalPaise+shipping+tax:null;
  if(total!==null&&(!Number.isSafeInteger(total)||total>1000000000))return fail("Order total exceeds limit.",422);
  const updated=await prisma.$transaction(async tx=>{
   const change=await tx.shopOrder.updateMany({
    where:{id:input.id,version:input.expectedVersion,status:current.status},
    data:{status:input.status,shippingPaise:shipping,taxPaise:tax,totalPaise:total,
     trackingReference:input.trackingReference??current.trackingReference,
     fulfillmentEvidenceUrl:evidence,adminNote:input.adminNote,version:{increment:1}}
   });
   if(change.count!==1)return null;
   const record=await tx.shopOrder.findUniqueOrThrow({where:{id:input.id}});
   await tx.adminActionLog.create({data:{
    adminId:admin.id,action:"shop.order.update",targetType:"ShopOrder",targetId:input.id,
    metadata:{from:current.status,to:record.status,version:record.version,totalPaise:record.totalPaise,
      paymentStatus:record.paymentStatus}
   }});
   return record;
  },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
  if(!updated)return fail("Concurrent order change detected.",409);
  return ok({order:updated,paymentCollected:false,onlinePaymentVerified:false});
 }catch(error){
  if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2021")return fail("Order schema not provisioned.",503);
  return handleApiError(error);
 }
}

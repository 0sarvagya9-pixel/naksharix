import { Prisma } from "@prisma/client";
import { z } from "zod";
import { fail,handleApiError,ok,validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { getShopCatalogue } from "@/lib/shop/catalogue-store";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic="force-dynamic";
const schema=z.object({
 items:z.array(z.object({productId:z.string().regex(/^[a-zA-Z0-9-]{1,128}$/),quantity:z.number().int().min(1).max(10)}).strict()).min(1).max(20),
 customerName:z.string().trim().min(2).max(120),
 customerPhone:z.string().trim().regex(/^[+0-9() -]{8,20}$/),
 deliveryAddress:z.string().trim().min(12).max(350),
 deliveryCity:z.string().trim().min(2).max(90),
 deliveryState:z.string().trim().min(2).max(90),
 postalCode:z.string().trim().regex(/^[0-9]{6}$/),
 customerNote:z.string().trim().max(1000),
}).strict();

export async function GET(){
 try{
  const user=await getCurrentUser();if(!user)return fail("Sign in to view orders.",401);
  const orders=await prisma.shopOrder.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},take:50,
   select:{id:true,items:true,status:true,paymentStatus:true,subtotalPaise:true,shippingPaise:true,taxPaise:true,
     totalPaise:true,trackingReference:true,createdAt:true,updatedAt:true}});
  return ok({orders});
 }catch(error){
  if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2021")return fail("Order storage not yet provisioned.",503);
  return handleApiError(error);
 }
}
export async function POST(request:Request){
 try{
  const user=await getCurrentUser();if(!user)return fail("Sign in before placing an order request.",401);
  const input=await validateJson(request,schema);
  const productIds=input.items.map(i=>i.productId);
  if(new Set(productIds).size!==productIds.length)return fail("Duplicate cart item.",422);
  const products=await getShopCatalogue();
  if(!products.storageReady)return fail("Product catalogue is not ready.",503);
  const active=new Map(products.products.filter(p=>p.status==="active").map(p=>[p.id,p]));
  const canonical=input.items.map(item=>{
   const product=active.get(item.productId);
   if(!product||!Number.isSafeInteger(product.unitPricePaise)||!product.unitPricePaise||product.unitPricePaise<100)
     return null;
   return {productId:product.id,name:product.name.en,quantity:item.quantity,unitPricePaise:product.unitPricePaise,
     lineTotalPaise:product.unitPricePaise*item.quantity};
  });
  if(canonical.some(i=>!i))return fail("One or more products are not priced or active. Request a quote instead.",422);
  const lines=canonical.filter((item):item is NonNullable<typeof item>=>item!==null);
  const subtotal=lines.reduce((amount,item)=>amount+item.lineTotalPaise,0);
  if(!Number.isSafeInteger(subtotal)||subtotal>1000000000)return fail("Order value exceeds limit.",422);
  const lim=await rateLimit("shop-order-intent:"+user.id,5,86400);
  if(!lim.allowed)return fail("Daily order request limit reached.",429);
  const order=await prisma.shopOrder.create({
   data:{userId:user.id,items:lines,customerName:input.customerName,customerPhone:input.customerPhone,
    deliveryAddress:input.deliveryAddress,deliveryCity:input.deliveryCity,deliveryState:input.deliveryState,
    postalCode:input.postalCode,customerNote:input.customerNote,subtotalPaise:subtotal,status:"REQUESTED",
    paymentStatus:"UNPAID",fulfillmentMode:"MANUAL_CONFIRMATION"},
   select:{id:true,status:true,paymentStatus:true,subtotalPaise:true,createdAt:true}
  });
  return ok({order,charged:false,onlineCheckoutAvailable:false,
    nextStep:"Owner confirms delivery charge, applicable taxes, product specifications, fulfilment, and payment method."},
    {status:201});
 }catch(error){
  if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2021")return fail("Order storage not yet provisioned.",503);
  return handleApiError(error);
 }
}

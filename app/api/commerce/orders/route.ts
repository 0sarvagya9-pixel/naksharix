import { Prisma } from "@prisma/client";
import { z } from "zod";
import { fail,handleApiError,ok,validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { getShopCatalogue } from "@/lib/shop/catalogue-store";
import { env } from "@/lib/env";
import { getRazorpayReadiness } from "@/lib/payments/readiness";


export const dynamic="force-dynamic";
const schema=z.object({
 items:z.array(z.object({productId:z.string().regex(/^[a-zA-Z0-9-]{1,128}$/),quantity:z.number().int().min(1).max(10)}).strict()).min(1).max(20),
 expectedSubtotalPaise:z.number().int().min(0).max(1000000000).optional(),
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
  const user=await getCurrentUser();if(!user)return fail("Sign in to checkout. Your cart will stay saved in this browser.",401);
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
  // A user must not submit an order after an administrator changes the price.
  // The canonical server-owned subtotal remains the only persisted amount.
  if(input.expectedSubtotalPaise!==undefined&&input.expectedSubtotalPaise!==subtotal)
    return fail("Cart prices changed. Refresh the cart and review the current prices before ordering.",409);
  // Cross-instance abuse protection with no new table or Redis provisioning:
  // a transaction-scoped advisory lock serializes count + persist per user.
  // Failure to acquire/query the DB fails closed before an order is created.
  const order=await prisma.$transaction(async tx=>{
    await tx.$queryRaw<Array<{locked:string}>>`
      SELECT pg_advisory_xact_lock(
        hashtext(${user.id}),hashtext('naksharix-shop-request-v1')
      )::text AS locked
    `;
    const recent=await tx.shopOrder.count({where:{
      userId:user.id,createdAt:{gte:new Date(Date.now()-86400_000)}
    }});
    if(recent>=5)return null;
    const checkoutReady=env.SHOP_PAYMENTS_ENABLED==="true" && getRazorpayReadiness().enabled;
    return tx.shopOrder.create({
      data:{userId:user.id,items:lines,customerName:input.customerName,customerPhone:input.customerPhone,
        deliveryAddress:input.deliveryAddress,deliveryCity:input.deliveryCity,deliveryState:input.deliveryState,
        postalCode:input.postalCode,customerNote:input.customerNote,subtotalPaise:subtotal,
        // Displayed selling prices are the full online payable totals for this
        // launch. No undisclosed shipping/tax is added at checkout.
        shippingPaise:0,taxPaise:0,totalPaise:subtotal,
        status:checkoutReady?"CONFIRMED":"REQUESTED",
        paymentStatus:"UNPAID",fulfillmentMode:"SELLER_FULFILLED"},
      select:{id:true,status:true,paymentStatus:true,subtotalPaise:true,createdAt:true}
    });
  });
  if(!order)return fail("Daily order request limit reached.",429);
  return ok({order,charged:false,
    onlineCheckoutAvailable:env.SHOP_PAYMENTS_ENABLED==="true"&&getRazorpayReadiness().enabled,
    nextStep:order.status==="CONFIRMED"?"Pay the displayed total securely with Razorpay.":"Order saved. Payment will be available after checkout activation."},
    {status:201});
 }catch(error){
  if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2021")return fail("Order storage not yet provisioned.",503);
  return handleApiError(error);
 }
}

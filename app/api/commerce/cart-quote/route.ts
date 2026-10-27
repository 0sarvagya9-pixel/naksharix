import { z } from "zod";
import { fail,handleApiError,ok,validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getShopCatalogue } from "@/lib/shop/catalogue-store";

export const dynamic="force-dynamic";
const schema=z.object({
  items:z.array(z.object({
    productId:z.string().regex(/^[a-zA-Z0-9-]{1,128}$/),
    quantity:z.number().int().min(1).max(10)
  }).strict()).min(1).max(20),
  city:z.string().trim().min(2).max(90),
  message:z.string().trim().min(10).max(1200)
}).strict();

export async function POST(request:Request){
 try{
   const user=await getCurrentUser();
   if(!user)return fail("Sign in before requesting a quote.",401);
   const body=await validateJson(request,schema);
   const ids=body.items.map(item=>item.productId);
   if(new Set(ids).size!==ids.length)return fail("Duplicate product in cart.",422);
   const catalogue=await getShopCatalogue();
   const active=new Map(catalogue.products.filter(p=>p.status==="active").map(p=>[p.id,p]));
   if(body.items.some(item=>!active.has(item.productId)))return fail("A selected product is no longer offered.",422);
   const limited=await rateLimit("shop-cart-quote:"+user.id,3,86400);
   if(!limited.allowed)return fail("Daily quote request limit reached.",429);
   // All names, prices and product identities resolved from the server-owned catalogue.
   const lines=body.items.map(item=>{
     const p=active.get(item.productId)!;
     return p.name.en+" (ID "+p.id+") × "+item.quantity+"; approved numeric price: "+
       (p.unitPricePaise ? "INR "+(p.unitPricePaise/100).toFixed(2)+" before shipping/taxes" : "NOT YET VERIFIED");
   });
   const detail=[
     "Customer cart quote request — NOT AN ORDER",
     ...lines,
     "Delivery city: "+body.city,
     "Shipping, authenticity, capacity, final tax and fulfilment: NOT VERIFIED",
     "Payment collected: NO",
     "Customer note: "+body.message
   ].join("\n");
   const ticket=await prisma.supportTicket.create({
     data:{userId:user.id,subject:"[SHOP CART QUOTE] "+body.items.length+" item types",priority:"NORMAL",status:"OPEN",
       messages:[{author:"USER",text:detail,at:new Date().toISOString()}]},
     select:{id:true,status:true,createdAt:true}
   });
   return ok({ticket,trackingPath:"/support",paymentRequired:false,orderCreated:false,fulfillmentConfirmed:false,
     nextStep:"Review confirmed stock, authenticity, shipping and final payable quote"},
     {status:201,headers:{"Cache-Control":"private, no-store"}});
 }catch(error){return handleApiError(error)}
}

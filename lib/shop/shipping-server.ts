import "server-only";
import {createHash} from "node:crypto";
import {prisma} from "@/lib/db";
import {getShopCatalogue} from "@/lib/shop/catalogue-store";
import {computeShipping,normalizePostal,type CanonicalShippingLine,type ShippingResult} from "@/lib/shop/shipping-rules";
import { z } from "zod";
export const cartItemSchema=z.array(z.object({productId:z.string().regex(/^[a-zA-Z0-9-]{1,128}$/),quantity:z.number().int().min(1).max(10)}).strict()).min(1).max(20);
export async function resolveCanonicalCart(items:{productId:string;quantity:number}[]){
 const catalogue=await getShopCatalogue();
 if(!catalogue.storageReady)return null;
 const active=new Map(catalogue.products.filter(p=>p.status==="active").map(p=>[p.id,p]));
 const lines:CanonicalShippingLine[]=[];
 for(const i of items){const p=active.get(i.productId);if(!p||!Number.isSafeInteger(p.unitPricePaise)||!p.unitPricePaise||p.unitPricePaise<100)return null;lines.push({productId:p.id,name:p.name.en,quantity:i.quantity,unitPricePaise:p.unitPricePaise,lineTotalPaise:p.unitPricePaise*i.quantity})}
 return lines;
}
export async function resolveShipping(country:string,postal:string,lines:CanonicalShippingLine[]){
 const rates=country==="IN"?[]:await prisma.shopShippingRate.findMany({where:{country,active:true,expiresAt:{gt:new Date()},productId:{in:lines.map(i=>i.productId)}}});
 return computeShipping(country,postal,lines,rates);
}
export function quoteKey(country:string,postal:string,lines:CanonicalShippingLine[],quote:ShippingResult){
 return createHash("sha256").update(JSON.stringify({country,postal:normalizePostal(country,postal),items:[...lines].sort((a,b)=>a.productId.localeCompare(b.productId)).map(l=>[l.productId,l.quantity,l.unitPricePaise]),quote})).digest("hex");
}

import {Prisma} from "@prisma/client";
import {z} from "zod";
import {getAdminApiUser} from "@/lib/auth/roles";
import {prisma} from "@/lib/db";
import {getShopCatalogue} from "@/lib/shop/catalogue-store";
import {fail,ok,handleApiError,validateJson} from "@/lib/api";
import {isShippingCountry,hasPublishedPostalPolicy} from "@/lib/shop/shipping-rules";
export const dynamic="force-dynamic";
const schema=z.object({
 id:z.string().min(1).max(140).optional(),expectedVersion:z.number().int().min(0),
 country:z.string().length(2).refine(c=>c!=="IN"&&isShippingCountry(c)),
 productId:z.string().regex(/^[a-zA-Z0-9-]{1,128}$/),
 postalPrefix:z.string().trim().regex(/^[A-Z0-9]{0,12}$/),
 shippingPaisePerUnit:z.number().int().min(0).max(10000000),
 taxPaisePerUnit:z.number().int().min(0).max(10000000),
 maxQuantity:z.number().int().min(1).max(10),
 carrier:z.string().trim().min(2).max(120),
 evidenceReference:z.string().trim().min(8).max(500),
 dutiesMode:z.enum(["INCLUDED","RECIPIENT_MAY_PAY"]),
 expiresAt:z.string().datetime(),active:z.boolean(),confirmed:z.boolean()
}).strict();
export async function GET(){
 try{
  const admin=await getAdminApiUser();if(!admin)return fail("Forbidden",403);
  const [rates,catalogue]=await Promise.all([prisma.shopShippingRate.findMany({orderBy:[{country:"asc"},{productId:"asc"},{postalPrefix:"desc"}],take:2000}),getShopCatalogue()]);
  if(!catalogue.storageReady)return fail("Catalogue unavailable.",503);
  return ok({rates,products:catalogue.products.map(p=>({id:p.id,name:p.name.en,names:p.name,status:p.status}))});
 }catch(e){return handleApiError(e)}
}
export async function PUT(request:Request){
 try{
  const admin=await getAdminApiUser();if(!admin)return fail("Forbidden",403);
  const input=await validateJson(request,schema);
  if(input.active&&(!input.confirmed||Date.parse(input.expiresAt)<=Date.now()||Date.parse(input.expiresAt)>Date.now()+90*86400000))return fail("Verify the real carrier rate and use a future expiry within 90 days.",422);
  if(input.active){
   if(!hasPublishedPostalPolicy(input.country))return fail("Destination address validation is not yet qualified for automatic rates. Use a verified manual courier quote.",422);
   const catalogue=await getShopCatalogue();if(!catalogue.storageReady)return fail("Catalogue unavailable.",503);
   if(!catalogue.products.some(p=>p.id===input.productId&&p.status==="active"&&Number.isSafeInteger(p.unitPricePaise)&&Number(p.unitPricePaise)>0))return fail("Choose an active priced product.",422);
  }
  const {id,expectedVersion,confirmed,...rest}=input;
  if(input.active&&!confirmed)return fail("Carrier verification required.",422);
  const data={...rest,expiresAt:new Date(rest.expiresAt),reviewedBy:admin.id};
  const saved=await prisma.$transaction(async tx=>{
   let record;
   if(id){
    const updated=await tx.shopShippingRate.updateMany({where:{id,version:expectedVersion},data:{...data,version:{increment:1}}});
    if(updated.count!==1)return null;
    record=await tx.shopShippingRate.findUniqueOrThrow({where:{id}});
   }else{
    if(expectedVersion!==0)return null;
    record=await tx.shopShippingRate.create({data});
   }
   await tx.adminActionLog.create({data:{adminId:admin.id,action:"shop.shipping.rate.save",targetType:"ShopShippingRate",targetId:record.id,metadata:{country:record.country,productId:record.productId,active:record.active,version:record.version,shippingPaisePerUnit:record.shippingPaisePerUnit,taxPaisePerUnit:record.taxPaisePerUnit,expiresAt:record.expiresAt.toISOString(),evidenceReference:record.evidenceReference}}});
   return record;
  });
  if(!saved)return fail("Rate changed. Reload before editing.",409);
  return ok({rate:saved});
 }catch(e){
  if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==="P2002")return fail("A rate already exists for this country, product and postal region. Edit that rate.",409);
  return handleApiError(e)
 }
}

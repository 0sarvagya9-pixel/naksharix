import {getCurrentUser} from "@/lib/auth/jwt";
import {env} from "@/lib/env";
import {fail,ok,handleApiError} from "@/lib/api";
import {sharedRateLimitResponse} from "@/lib/security/rate-limit";
import {claimPackageItem,completePackageItem,releasePackageItem} from "@/lib/digital-packages/ledger";
import {renderPackageItem} from "@/lib/digital-packages/render";
export const runtime="nodejs";
export const maxDuration=120;
type Params=Promise<{orderId:string;itemId:string}>;
export async function POST(_request:Request,{params}:{params:Params}){
 try{
 const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);
 if(env.DIGITAL_PACKAGE_GENERATION_ENABLED!=="true")return fail("Package generation is temporarily unavailable. Your purchase remains recorded.",503);
 const limited=await sharedRateLimitResponse("package-item-generate",user.id,5,60000);if(limited)return limited;
 const {orderId,itemId}=await params;
 if(!/^[a-zA-Z0-9_-]{1,100}$/.test(orderId)||!/^[a-zA-Z0-9_-]{1,100}$/.test(itemId))return fail("Invalid reference",422);
 const claim=await claimPackageItem(user.id,orderId,itemId);
 if(claim.kind==="ready")return ok({ready:true});
 if(claim.kind!=="claimed")return fail(claim.kind==="denied"?"Verified package ownership is required.":claim.kind==="busy"?"A package document is already being generated.":"Document needs support review. Do not pay again.",claim.kind==="denied"?403:409);
 try{
  const bytes=await renderPackageItem(claim.item,claim.createdAt);
  const saved=await completePackageItem(user.id,orderId,itemId,claim.leaseToken,bytes);
  if(!saved){await releasePackageItem(user.id,orderId,itemId,claim.leaseToken).catch(()=>{});return fail("Entitlement or generation state changed. Refresh your package.",409);}
  return ok({ready:true});
 }catch{await releasePackageItem(user.id,orderId,itemId,claim.leaseToken).catch(()=>{});return fail("Document generation needs a retry or support review. No further payment is required.",503);}
 }catch(e){return handleApiError(e);}
}

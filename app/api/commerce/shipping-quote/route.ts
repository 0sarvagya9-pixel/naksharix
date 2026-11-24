import {z} from "zod";
import {fail,ok,handleApiError,validateJson} from "@/lib/api";
import {getCurrentUser} from "@/lib/auth/jwt";
import {rateLimitResponse} from "@/lib/security/rate-limit";
import {cartItemSchema,resolveCanonicalCart,resolveShipping,quoteKey} from "@/lib/shop/shipping-server";
import {isShippingCountry,validPostal,normalizePostal} from "@/lib/shop/shipping-rules";
export const dynamic="force-dynamic";
const schema=z.object({items:cartItemSchema,country:z.string().length(2).refine(isShippingCountry),postalCode:z.string().max(16)}).strict();
export async function POST(request:Request){
 try{
  const user=await getCurrentUser();if(!user)return fail("Sign in to calculate a shipping quote.",401);
  const limit=rateLimitResponse("shipping-quote",user.id,30,60_000);if(limit)return limit;
  const input=await validateJson(request,schema);
  if(!validPostal(input.country,input.postalCode))return fail("Enter a valid postal code for your delivery country.",422);
  if(new Set(input.items.map(i=>i.productId)).size!==input.items.length)return fail("Duplicate cart item.",422);
  const lines=await resolveCanonicalCart(input.items);if(!lines)return fail("Current product prices could not be verified.",409);
  const subtotal=lines.reduce((n,l)=>n+l.lineTotalPaise,0);
  if(!Number.isSafeInteger(subtotal)||subtotal>1000000000)return fail("Order value exceeds limit.",422);
  const postal=normalizePostal(input.country,input.postalCode);
  const quote=await resolveShipping(input.country,postal,lines);
  return ok({kind:quote.kind,subtotalPaise:quote.subtotalPaise,shippingPaise:quote.shippingPaise,taxPaise:quote.taxPaise,totalPaise:quote.totalPaise,carrier:quote.snapshot?.carrier??null,dutiesMode:quote.snapshot?.dutiesMode??null,expiresAt:quote.snapshot?.expiresAt??null,quoteKey:quoteKey(input.country,postal,lines,quote)}, {headers:{"Cache-Control":"private, no-store"}});
 }catch(error){return handleApiError(error)}
}

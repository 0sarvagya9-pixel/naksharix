import {z} from "zod";
import {approveMobilePair} from "@/lib/mobile/account-link";
import {getCurrentUser} from "@/lib/auth/jwt";
import {fail,handleApiError,ok,validateJson} from "@/lib/api";
const schema=z.object({ticket:z.string().regex(/^[A-Za-z0-9_-]{43}$/)}).strict();
export const dynamic="force-dynamic";
export async function POST(request:Request){
 try{
  // This route retains normal website CSRF, unlike the bearer-only native endpoints.
  if(request.headers.get("origin")!==new URL(request.url).origin)
    return fail("Cross-origin approval denied.",403);
  const user=await getCurrentUser();
  if(!user)return fail("Sign in to your website account first.",401);
  const body=await validateJson(request,schema);
  if(!await approveMobilePair(body.ticket,user.id))
    return fail("Pairing link already used or expired.",410);
  return ok({approved:true});
 }catch(error){return handleApiError(error);}
}

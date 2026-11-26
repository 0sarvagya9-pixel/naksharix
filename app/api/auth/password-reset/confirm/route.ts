import { authErrorResponses } from "@/lib/auth/api-error-language";
import {z} from "zod";
import {ok,validateJson} from "@/lib/api";
import {claimPublicAuthQuota,trustedPublicClientIp} from "@/lib/auth/public-quota";
import {completePasswordReset} from "@/lib/auth/password-reset";
import {validResetToken} from "@/lib/auth/password-reset-contract";
import {clearAuthCookie} from "@/lib/auth/jwt";
const schema=z.object({token:z.string().refine(validResetToken,"Invalid reset link"),password:z.string().min(8).max(72).refine(p=>new TextEncoder().encode(p).length<=72,"Password is too long")});
export async function POST(request:Request){
  const { fail, handleApiError } = authErrorResponses(request);
 try{
   if(!await claimPublicAuthQuota({scope:"password-reset-confirm-ip",key:trustedPublicClientIp(request),limit:10,windowSeconds:900}))return fail("Too many attempts. Try again later.",429);
   const body=await validateJson(request,schema,["password"]);
   if(!await completePasswordReset(body.token,body.password))return fail("This reset link is invalid, expired or already used.",400);
   await clearAuthCookie();
   return ok({reset:true});
 }catch(e){return handleApiError(e);}
}

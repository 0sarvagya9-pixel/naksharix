import {z} from "zod";
import {fail,ok,validateJson,handleApiError} from "@/lib/api";
import {getEmailReadiness} from "@/lib/email/email-service";
import {claimPublicAuthQuota,trustedPublicClientIp} from "@/lib/auth/public-quota";
import {requestPasswordReset} from "@/lib/auth/password-reset";
import {logger} from "@/lib/monitoring/logger";
const schema=z.object({email:z.string().trim().max(254).email()});
export async function POST(request:Request){
 try{
   const {email:raw}=await validateJson(request,schema);const email=raw.toLowerCase();
   if(!await claimPublicAuthQuota({scope:"password-reset-request-ip",key:trustedPublicClientIp(request),limit:6,windowSeconds:900})||
      !await claimPublicAuthQuota({scope:"password-reset-request-destination",key:email,limit:3,windowSeconds:3600}))return fail("Too many reset requests. Try again later.",429);
   if(!getEmailReadiness().emailEnabled)return fail("Password reset email is temporarily unavailable.",503);
   // Keep the same public response for unknown, OAuth-only, privileged and
   // eligible accounts. Provider acceptance is never disclosed as inbox delivery.
   try{await requestPasswordReset(email);}catch{logger.warn("password_reset_request_unavailable");}
   return ok({accepted:true});
 }catch(e){return handleApiError(e);}
}

import {NextRequest} from "next/server";
import {z} from "zod";
import {pollMobilePair} from "@/lib/mobile/account-link";
import {fail,handleApiError,ok,validateJson} from "@/lib/api";
import {claimPublicAuthQuota,trustedPublicClientIp} from "@/lib/auth/public-quota";
const schema=z.object({deviceCode:z.string().regex(/^[A-Za-z0-9_-]{43}$/)}).strict();
export const dynamic="force-dynamic";
export async function POST(request:NextRequest){
 try{
  if(request.headers.get("cookie"))return fail("Mobile pairing requires no browser cookies.",400);
  const allowed=await claimPublicAuthQuota({scope:"mobile-link-poll-ip",
    key:trustedPublicClientIp(request),limit:100,windowSeconds:600});
  if(!allowed)return fail("Pairing request limit exceeded.",429);
  const input=await validateJson(request,schema);
  return ok(await pollMobilePair(input.deviceCode));
 }catch(error){return handleApiError(error);}
}

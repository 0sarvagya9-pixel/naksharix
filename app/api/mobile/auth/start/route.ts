import {NextRequest} from "next/server";
import {beginMobilePair} from "@/lib/mobile/account-link";
import {fail,handleApiError,ok} from "@/lib/api";
import {claimPublicAuthQuota,trustedPublicClientIp} from "@/lib/auth/public-quota";
export const dynamic="force-dynamic";
export async function POST(request:NextRequest){
 try{
  if(request.headers.get("cookie"))return fail("Start pairing without browser cookies.",400);
  const allowed=await claimPublicAuthQuota({scope:"mobile-link-start-ip",
    key:trustedPublicClientIp(request),limit:6,windowSeconds:600});
  if(!allowed)return fail("Too many pairing attempts.",429);
  return ok(await beginMobilePair());
 }catch(error){return handleApiError(error);}
}

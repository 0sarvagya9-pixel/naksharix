import {NextRequest} from "next/server";
import {z} from "zod";
import {env} from "@/lib/env";
import {getCurrentUser} from "@/lib/auth/jwt";
import {canBypassPayment} from "@/lib/auth/permissions";
import {getManualReportCheckout} from "@/lib/reports/checkout-catalogue";
import {checkAutomaticInputs} from "@/lib/reports/automatic-report-input";
import {getActiveAstrologyProviderName} from "@/lib/astrology/provider";
import {issueReportPreflight} from "@/lib/reports/preflight-contract";
import {getRequestIp,rateLimitResponse} from "@/lib/security/rate-limit";
import {fail,ok,validateJson,handleApiError} from "@/lib/api";
const schema=z.object({reportSlug:z.string().min(1).max(100),deliveryEmail:z.string().email(),birth:z.unknown(),automaticDetails:z.unknown(),concern:z.string().trim().min(1).max(2000)});
export async function POST(request:NextRequest){
 try{
  const user=await getCurrentUser();
  if(!user)return fail("Unauthenticated",401);
  if(canBypassPayment(user))return fail("Use the administrator report review flow.",403);
  const limited=rateLimitResponse("report-preflight",user.id||getRequestIp(request),8,60_000);
  if(limited)return limited;
  const body=await validateJson(request,schema);
  if(body.deliveryEmail.toLowerCase()!==user.email.toLowerCase())return fail("Delivery email must match your account.",403);
  const checkout=getManualReportCheckout(body.reportSlug);
  if(!checkout)return fail("Unknown fixed-price report.",422);
  if(env.AUTO_REPORT_DELIVERY_ENABLED==="true"&&getActiveAstrologyProviderName()!=="own_engine")return fail("Report calculation is temporarily unavailable. No payment is required.",503);
  const checked=checkAutomaticInputs(body.reportSlug,body.birth,body.automaticDetails);
  if(!checked.ok)return fail(checked.reason,422);
  // The server only validates the submitted details and signs a short-lived
  // eligibility claim. No birth data, concern or email is placed in the token
  // or payment metadata, and no draft is written to the database.
  const token=issueReportPreflight({userId:user.id,reportId:checkout.reportId,purpose:checkout.purpose,amountPaise:Math.round(checkout.amount*100)},env.JWT_SECRET);
  return ok({token,reportId:checkout.reportId,price:checkout.price,expiresInSeconds:1200});
 }catch(error){return handleApiError(error);}
}

import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { googleSources, googleMedia, reportPurposes, isLiveReportPurchase, publicEventParams, commerceParams, type GoogleSession } from "@/lib/analytics/google-contract";
import type { AggregateEventName } from "@/lib/analytics/public-routes";

export const googleSessionSchema = z.object({
  client_id:z.string().regex(/^\d{1,10}\.\d{10}$/),
  session_id:z.number().int().positive().max(4102444800),
  source:z.enum(googleSources),medium:z.enum(googleMedia)
}).strict();
export function googleAnalyticsEnabled() {
  return process.env.VERCEL_ENV === "production" &&
    /^G-[A-Z0-9]+$/.test(process.env.GA4_MEASUREMENT_ID || "") &&
    Boolean(process.env.GA4_MEASUREMENT_PROTOCOL_SECRET);
}
export function liveRazorpayAnalyticsOrder() {
  return process.env.VERCEL_ENV === "production" &&
    Boolean(env.RAZORPAY_KEY_ID?.startsWith("rzp_live_") && env.RAZORPAY_KEY_ID===env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
}
export function analyticsPrivacyAllowed(request:Request) {
  return request.headers.get("dnt") !== "1" && request.headers.get("sec-gpc") !== "1";
}
async function send(session:GoogleSession,events:{name:string;params:Record<string,unknown>}[]) {
  if (!googleAnalyticsEnabled()) return false;
  const now=Math.floor(Date.now()/1000);
  if (session.session_id > now+60 || session.session_id < now-86400) return false;
  try {
    const url=new URL("https://www.google-analytics.com/mp/collect");
    url.searchParams.set("measurement_id",process.env.GA4_MEASUREMENT_ID!);
    url.searchParams.set("api_secret",process.env.GA4_MEASUREMENT_PROTOCOL_SECRET!);
    const response=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},
      signal:AbortSignal.timeout(2200),cache:"no-store",
      body:JSON.stringify({client_id:session.client_id,consent:{ad_user_data:"DENIED",ad_personalization:"DENIED"},events})});
    return response.ok;
  } catch { return false; }
}
export async function sendPublicGoogleEvent(session:GoogleSession,event:AggregateEventName,route:string) {
  const params=publicEventParams(session,route);
  const events:{name:string;params:Record<string,unknown>}[]=[{name:event,params}];
  if(event==="page_view" && route==="/reports/:public-page") events.push({name:"view_item",params:{...params,items:[{item_id:"digital-report",item_name:"Digital astrology report",item_category:"Digital report"}]}});
  return send(session,events);
}
export async function sendGoogleCheckout(request:Request,session:GoogleSession|undefined,purpose:string,value:number) {
  if(!session || !analyticsPrivacyAllowed(request) || !liveRazorpayAnalyticsOrder() || !reportPurposes.some(p=>p===purpose) ||
    !Number.isFinite(value) || value<=0 || value>10000000) return;
  await send(session,[{name:"begin_checkout",params:commerceParams(session,value)}]);
}
type Purchase = {id:string;status:string;provider:string;purpose:string;amount:unknown;currency:string;providerPaymentId?:string|null;metadata?:unknown};
export async function sendVerifiedGooglePurchase(request:Request,session:GoogleSession|undefined,payment:Purchase) {
  if(!session || !analyticsPrivacyAllowed(request) || !googleAnalyticsEnabled() || !isLiveReportPurchase(payment,liveRazorpayAnalyticsOrder()))return;
  const transactionId=createHash("sha256").update("naksharix-ga4-v1:"+payment.id).digest("hex");
  const id="ga4-purchase:"+transactionId;
  try {
    // Atomic unique claim across callback retries. No actor or personal data.
    await prisma.auditLog.create({data:{id,action:"analytics.ga4_purchase",targetType:"analytics_transaction",targetId:transactionId,metadata:{state:"attempted"}}});
  } catch { return; }
  try {
    const accepted=await send(session,[{name:"purchase",params:commerceParams(session,Number(payment.amount),transactionId)}]);
    // A timeout may follow a successful remote receipt. Retain the claim rather
    // than risk a second purchase submission from another browser session.
    await prisma.auditLog.update({where:{id},data:{metadata:{state:accepted?"transport_accepted":"transport_failed_or_unknown"}}}).catch(()=>{});
  } catch { await prisma.auditLog.update({where:{id},data:{metadata:{state:"transport_failed_or_unknown"}}}).catch(()=>{}); }
}

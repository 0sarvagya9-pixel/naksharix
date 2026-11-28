import {fail,ok,handleApiError} from "@/lib/api";
import {businessEnabled,businessPdfEnabled,businessSchemaReady,claimBusinessCalculation,finishBusinessCalculation} from "@/lib/business-integrations/ledger";
import {businessCalculationSchema} from "@/lib/business-integrations/input";
import {calculateBusinessResult} from "@/lib/business-integrations/calculate";
import {issueWidgetGrant} from "@/lib/business-integrations/widget-grant";
import {sharedRateLimitResponse,getRequestIp} from "@/lib/security/rate-limit";
import {readBoundedUtf8Body} from "@/lib/security/request-body";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 try{
 if(!businessEnabled())return fail("Partner API not available.",503);
 const limited=await sharedRateLimitResponse("partner-api",getRequestIp(request),120,60000);if(limited)return limited;
 if(!(request.headers.get("content-type")??"").includes("application/json"))return fail("Use bounded JSON.",422);
 const raw=await readBoundedUtf8Body(request,8192);
 if(!raw.ok)return fail(raw.reason==="too_large"?"Payload too large.":"Invalid request body.",raw.reason==="too_large"?413:422);
 let body:unknown;try{body=JSON.parse(raw.text);}catch{return fail("Invalid JSON.",422);}
 const parsed=businessCalculationSchema.safeParse(body);if(!parsed.success)return fail("Invalid request or missing subject permission.",422);
 if(parsed.data.scope==="chart-pdf"&&!businessPdfEnabled())return fail("Partner chart PDF unavailable.",503);
 if(!await businessSchemaReady())return fail("Partner API registry unavailable.",503);
 // Bearer-only; no cookie authentication or broad CORS. Birth inputs are not stored in usage logs.
 const claim=await claimBusinessCalculation(request.headers.get("authorization"),parsed.data.scope,parsed.data.requestId);
 if(claim.kind!=="claimed")return fail(claim.kind==="unauthorized"?"Invalid or unauthorized API credential.":claim.kind==="limit"?"Monthly contract quota exhausted.":"Request ID already recorded; do not duplicate.",claim.kind==="unauthorized"?401:claim.kind==="limit"?429:409);
 try{
 if(parsed.data.scope==="panchang-widget"&&parsed.data.browserOrigin){
  const signed=issueWidgetGrant({tenantId:claim.tenantId,keyId:claim.keyId,requestId:claim.requestId,origin:parsed.data.browserOrigin,location:parsed.data.location});
  return ok({...signed,requestId:claim.requestId,usageUnits:claim.units,status:"RESERVED",redeemPath:"/api/partner/v1/widget"},{headers:{"Cache-Control":"private, no-store"}});
 }
 const result=await calculateBusinessResult(parsed.data,claim.brandName);
 if(!await finishBusinessCalculation(claim.tenantId,claim.requestId,true))return fail("Contract or key changed during calculation.",409);
 const response=ok({requestId:claim.requestId,usageUnits:claim.units,brand:{name:claim.brandName,poweredBy:"Naksharix"},result},{headers:{"X-Robots-Tag":"noindex, nofollow"}});
 // Shared ok() sets no-store; explicitly retain the narrower private directive.
 response.headers.set("Cache-Control","private, no-store");
 return response;
 }catch{
 await finishBusinessCalculation(claim.tenantId,claim.requestId,false).catch(()=>false);
 return fail("Calculation unavailable. Failed attempts are not included in completed-unit statements.",503);
 }
 }catch(e){return handleApiError(e);}
}

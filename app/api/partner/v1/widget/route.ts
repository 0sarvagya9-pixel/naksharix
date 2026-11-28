import {z} from "zod";
import {fail,ok,handleApiError} from "@/lib/api";
import {businessEnabled,businessSchemaReady,activeWidgetReservation,finishBusinessCalculation} from "@/lib/business-integrations/ledger";
import {canonicalWidgetOrigin} from "@/lib/business-integrations/widget-origin";
import {readWidgetGrant} from "@/lib/business-integrations/widget-grant";
import {calculateBusinessResult} from "@/lib/business-integrations/calculate";
import {sharedRateLimitResponse,getRequestIp} from "@/lib/security/rate-limit";
import {readBoundedUtf8Body} from "@/lib/security/request-body";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const bodySchema=z.object({grant:z.string().min(1).max(2048)}).strict();
function cors(response:Response,origin:string|null){
 response.headers.set("Cache-Control","private, no-store");
 response.headers.set("Vary","Origin");
 response.headers.set("X-Robots-Tag","noindex, nofollow");
 if(origin)response.headers.set("Access-Control-Allow-Origin",origin);
 return response;
}
export function OPTIONS(request:Request){
 const origin=canonicalWidgetOrigin(request.headers.get("origin"));
 if(!origin||request.headers.get("access-control-request-method")!=="POST"||(request.headers.get("access-control-request-headers")??"").split(",").some(h=>h.trim()&&h.trim().toLowerCase()!=="content-type"))return cors(fail("Invalid publisher preflight",403),null);
 // Preflight cannot grant a calculation. Actual POST requires an origin-bound signed token.
 return cors(new Response(null,{status:204,headers:{"Access-Control-Allow-Methods":"POST","Access-Control-Allow-Headers":"Content-Type","Access-Control-Max-Age":"120"}}),origin);
}
export async function POST(request:Request){
 const origin=canonicalWidgetOrigin(request.headers.get("origin"));
 if(!origin)return cors(fail("Invalid publisher origin",403),null);
 try{
 if(!businessEnabled())return cors(fail("Publisher widget unavailable",503),origin);
 const limited=await sharedRateLimitResponse("partner-widget",getRequestIp(request),120,60000);if(limited)return cors(limited,origin);
 if(!(request.headers.get("content-type")??"").includes("application/json"))return cors(fail("Use bounded JSON",422),origin);
 const raw=await readBoundedUtf8Body(request,4096);if(!raw.ok||!raw.text)return cors(fail("Invalid or oversized request",413),origin);
 let json:unknown;try{json=JSON.parse(raw.text);}catch{return cors(fail("Invalid JSON",422),origin);}
 const parsed=bodySchema.safeParse(json);if(!parsed.success)return cors(fail("Invalid widget grant",422),origin);
 const grant=readWidgetGrant(parsed.data.grant,origin);
 if(!grant)return cors(fail("Expired or unauthorized widget grant",401),origin);
 if(!await businessSchemaReady())return cors(fail("Partner registry unavailable",503),origin);
 const reservation=await activeWidgetReservation(grant.tenantId,grant.keyId,grant.requestId);
 if(!reservation)return cors(fail("Widget reservation unavailable or already used",409),origin);
 try{
  const result=await calculateBusinessResult({scope:"panchang-widget",requestId:grant.requestId,location:grant.location},reservation.brandName);
  // The final locked ledger transition is the single-use gate even when two requests race.
  if(!await finishBusinessCalculation(grant.tenantId,grant.requestId,true))return cors(fail("Widget reservation no longer available",409),origin);
  return cors(ok({requestId:grant.requestId,brand:{name:reservation.brandName,poweredBy:"Naksharix"},result}),origin);
 }catch{
  await finishBusinessCalculation(grant.tenantId,grant.requestId,false).catch(()=>false);
  return cors(fail("Widget calculation unavailable",503),origin);
 }
 }catch(e){return cors(handleApiError(e),origin);}
}

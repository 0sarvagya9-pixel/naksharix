import "server-only";
import {createHmac,timingSafeEqual} from "node:crypto";
import {z} from "zod";
import {env} from "@/lib/env";
import {businessPanchangLocation} from "@/lib/business-integrations/input";
import {canonicalWidgetOrigin,WIDGET_GRANT_MAX_AGE_SECONDS} from "@/lib/business-integrations/widget-origin";
const schema=z.object({v:z.literal(1),tenantId:z.string().min(1).max(100),keyId:z.string().regex(/^[a-f0-9]{32}$/),requestId:z.string().uuid(),origin:z.string().max(253).refine(v=>canonicalWidgetOrigin(v)===v),location:businessPanchangLocation,iat:z.number().int().nonnegative(),exp:z.number().int().nonnegative()}).strict();
type Grant=z.infer<typeof schema>;
function secretReady(){return env.JWT_SECRET.length>=32&&!env.JWT_SECRET.includes("development-secret");}
function sign(value:string){return createHmac("sha256",env.JWT_SECRET).update("naksharix-widget-v1:"+value).digest();}
export function issueWidgetGrant(input:Omit<Grant,"v"|"iat"|"exp">,now=new Date()){
 if(!secretReady())throw Error("WIDGET_SIGNING_UNAVAILABLE");
 const iat=Math.floor(now.getTime()/1000),payload=schema.parse({...input,v:1,iat,exp:iat+WIDGET_GRANT_MAX_AGE_SECONDS});
 const data=Buffer.from(JSON.stringify(payload),"utf8").toString("base64url");
 return {grant:"nxwg1."+data+"."+sign(data).toString("base64url"),expiresAt:new Date(payload.exp*1000).toISOString()};
}
export function readWidgetGrant(raw:unknown,origin:unknown,now=new Date()):Grant|null{
 if(!secretReady()||typeof raw!=="string"||raw.length>2048||canonicalWidgetOrigin(origin)!==origin||typeof origin!=="string")return null;
 const parts=raw.match(/^nxwg1\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]{43})$/);if(!parts)return null;
 try{
 const bytes=Buffer.from(parts[1],"base64url"),sig=Buffer.from(parts[2],"base64url");
 if(bytes.toString("base64url")!==parts[1]||sig.toString("base64url")!==parts[2]||sig.length!==32||!timingSafeEqual(sig,sign(parts[1])))return null;
 const parsed=schema.safeParse(JSON.parse(bytes.toString("utf8")));if(!parsed.success)return null;
 const p=parsed.data,t=Math.floor(now.getTime()/1000);
 if(p.origin!==origin||p.exp-p.iat!==WIDGET_GRANT_MAX_AGE_SECONDS||p.iat>t||p.exp<=t)return null;
 return p;
 }catch{return null;}
}

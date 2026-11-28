import "server-only";
import {createCipheriv,createDecipheriv,createECDH,createHash,createHmac,createPrivateKey,randomBytes,sign,type KeyObject} from "node:crypto";
import {env} from "@/lib/env";
import {allowedPushEndpoint,pushOutcome} from "@/lib/notifications/push-contract";
type PushConfig={publicKey:string;keyFingerprint:string;signingKey:KeyObject;endpointKey:Buffer};
export function pushConfiguration():PushConfig|null{
 if(env.WEB_PUSH_ENABLED!=="true")return null;
 try{
 const pub=env.WEB_PUSH_PUBLIC_KEY??"",priv=env.WEB_PUSH_PRIVATE_KEY??"",rawKey=env.WEB_PUSH_ENDPOINT_KEY??"";
 if(!/^[A-Za-z0-9_-]{87}$/.test(pub)||!/^[A-Za-z0-9_-]{43}$/.test(priv)||!/^[a-fA-F0-9]{64}$/.test(rawKey))return null;
 const d=Buffer.from(priv,"base64url"),p=Buffer.from(pub,"base64url");
 if(d.length!==32||p.length!==65||p[0]!==4)return null;
 const ecdh=createECDH("prime256v1");ecdh.setPrivateKey(d);
 if(!ecdh.getPublicKey().equals(p))return null;
 const signingKey=createPrivateKey({format:"jwk",key:{kty:"EC",crv:"P-256",d:priv,x:p.subarray(1,33).toString("base64url"),y:p.subarray(33,65).toString("base64url")}});
 return {publicKey:pub,keyFingerprint:createHash("sha256").update(p).digest("hex").slice(0,24),signingKey,endpointKey:Buffer.from(rawKey,"hex")};
 }catch{return null;}
}
function subKey(c:PushConfig,scope:string){return createHmac("sha256",c.endpointKey).update("naksharix-web-push-v1:"+scope).digest();}
export function pushDigest(c:PushConfig,value:string){return createHmac("sha256",subKey(c,"index")).update(value).digest("hex");}
export function sealEndpoint(c:PushConfig,endpoint:string,userId:string,digest:string){
 const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",subKey(c,"cipher"),iv);
 cipher.setAAD(Buffer.from("push-v1:"+userId+":"+digest));
 const ciphertext=Buffer.concat([cipher.update(endpoint,"utf8"),cipher.final()]);
 return Buffer.concat([iv,cipher.getAuthTag(),ciphertext]).toString("base64url");
}
export function openEndpoint(c:PushConfig,value:string,userId:string,digest:string){
 if(value.length>3000)throw Error("PUSH_ENVELOPE_INVALID");
 const bytes=Buffer.from(value,"base64url");if(bytes.length<29)throw Error("PUSH_ENVELOPE_INVALID");
 const d=createDecipheriv("aes-256-gcm",subKey(c,"cipher"),bytes.subarray(0,12));d.setAAD(Buffer.from("push-v1:"+userId+":"+digest));d.setAuthTag(bytes.subarray(12,28));
 const endpoint=Buffer.concat([d.update(bytes.subarray(28)),d.final()]).toString("utf8");
 if(!allowedPushEndpoint(endpoint)||pushDigest(c,endpoint)!==digest)throw Error("PUSH_ENDPOINT_INVALID");
 return endpoint;
}
// RFC 8292 ES256 VAPID. Empty RFC 8030 push avoids sending any personal payload.
// Browser displays its fixed generic notification in public/sw.js.
const tokens=new Map<string,{token:string;expires:number}>();
function authorization(c:PushConfig,origin:string){
 const now=Math.floor(Date.now()/1000),key=c.keyFingerprint+":"+origin,cached=tokens.get(key);
 if(cached&&cached.expires-now>300)return cached.token;
 const expires=now+12*3600;
 const encode=(v:unknown)=>Buffer.from(JSON.stringify(v)).toString("base64url");
 const input=encode({typ:"JWT",alg:"ES256"})+"."+encode({aud:origin,exp:expires,sub:"mailto:care@naksharix.com"});
 const signature=sign("sha256",Buffer.from(input),{key:c.signingKey,dsaEncoding:"ieee-p1363"}).toString("base64url");
 const token="vapid t="+input+"."+signature+", k="+c.publicKey;
 if(tokens.size>=32)tokens.clear();
 tokens.set(key,{token,expires});return token;
}
export async function sendGenericPush(c:PushConfig,rawEndpoint:string){
 const endpoint=allowedPushEndpoint(rawEndpoint);if(!endpoint)return "failed_or_unknown" as const;
 try{
 const response=await fetch(endpoint,{method:"POST",headers:{Authorization:authorization(c,new URL(endpoint).origin),TTL:"300",Urgency:"normal",Topic:"naksharix-account-update"},redirect:"error",cache:"no-store",signal:AbortSignal.timeout(4000)});
 return pushOutcome(response.status);
 }catch{return "failed_or_unknown" as const;}
}

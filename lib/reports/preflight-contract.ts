import {createHmac,timingSafeEqual} from "node:crypto";
export const REPORT_PREFLIGHT_TTL_MS=20*60*1000;
type Identity={userId:string;reportId:string;purpose:string;amountPaise:number;inputDigest?:string};
function mac(message:string,secret:string){return createHmac("sha256",secret).update("naksharix-report-preflight-v1:"+message).digest();}
export function issueReportPreflight(identity:Identity,secret:string,now=Date.now()){
 const payload=Buffer.from(JSON.stringify({v:1,...identity,exp:now+REPORT_PREFLIGHT_TTL_MS})).toString("base64url");
 return payload+"."+mac(payload,secret).toString("base64url");
}
export function verifyReportPreflight(token:unknown,identity:Identity,secret:string,now=Date.now()){
 if(typeof token!=="string"||token.length>1024||!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token))return false;
 try{
  const [payload,signature]=token.split(".");
  const provided=Buffer.from(signature,"base64url"),expected=mac(payload,secret);
  if(provided.length!==expected.length||!timingSafeEqual(provided,expected))return false;
  const claim=JSON.parse(Buffer.from(payload,"base64url").toString("utf8"));
  return claim.v===1&&claim.userId===identity.userId&&claim.reportId===identity.reportId&&claim.purpose===identity.purpose&&claim.amountPaise===identity.amountPaise&&claim.inputDigest===identity.inputDigest&&Number.isSafeInteger(claim.exp)&&claim.exp>now&&claim.exp<=now+REPORT_PREFLIGHT_TTL_MS;
 }catch{return false;}
}

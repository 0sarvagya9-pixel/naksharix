import "server-only";
import {createHash,createHmac,randomBytes,randomUUID} from "node:crypto";
import {SignJWT,jwtVerify} from "jose";
import {prisma} from "@/lib/db";
export const MOBILE_PAIR_PURPOSE="MOBILE_ACCOUNT_LINK_V1";
export const MOBILE_AUDIENCE="naksharix-mobile-account-v1";
const PAIR_MS=300000,SESSION_MS=7*86400000;
export const mobileDigest=(v:string)=>createHash("sha256").update("naksharix-mobile-link-v1:").update(v).digest("hex");
function signingKey(){
  const raw=process.env.JWT_SECRET||process.env.NEXTAUTH_SECRET;
  if(!raw||raw.length<32)throw Error("Mobile authentication requires configured 32+ character secret");
  return createHmac("sha256",raw).update("naksharix-mobile-session-v1").digest();
}
export async function beginMobilePair(){
  const deviceCode=randomBytes(32).toString("base64url"),ticket=randomBytes(32).toString("base64url");
  await prisma.otpToken.create({data:{purpose:MOBILE_PAIR_PURPOSE,codeHash:mobileDigest(deviceCode),
    email:mobileDigest(ticket),expiresAt:new Date(Date.now()+PAIR_MS)}});
  return {deviceCode,approvalUrl:"https://www.naksharix.com/mobile/link?ticket="+ticket,
    expiresInSeconds:300,intervalSeconds:3};
}
export async function approveMobilePair(ticket:string,userId:string){
  const result=await prisma.otpToken.updateMany({where:{purpose:MOBILE_PAIR_PURPOSE,
    email:mobileDigest(ticket),userId:null,consumedAt:null,expiresAt:{gt:new Date()}},data:{userId}});
  return result.count===1;
}
export async function pollMobilePair(deviceCode:string):Promise<
  {state:"pending"|"expired"}|{state:"linked";accessToken:string;expiresInSeconds:number}
>{
  const row=await prisma.otpToken.findFirst({where:{purpose:MOBILE_PAIR_PURPOSE,
    codeHash:mobileDigest(deviceCode),consumedAt:null,expiresAt:{gt:new Date()}},select:{id:true,userId:true}});
  if(!row)return {state:"expired"};
  if(!row.userId)return {state:"pending"};
  const claimed=await prisma.otpToken.updateMany({where:{id:row.id,userId:row.userId,
    consumedAt:null,expiresAt:{gt:new Date()}},data:{consumedAt:new Date()}});
  if(claimed.count!==1)return {state:"expired"};
  const expiry=new Date(Date.now()+SESSION_MS);
  const accessToken=await new SignJWT({kind:"naksharix-mobile",scope:"account:read profile:write"})
    .setProtectedHeader({alg:"HS256"}).setIssuer("naksharix").setAudience(MOBILE_AUDIENCE)
    .setSubject(row.userId).setJti(randomUUID()).setIssuedAt()
    .setExpirationTime(Math.floor(expiry.getTime()/1000)).sign(signingKey());
  await prisma.session.create({data:{userId:row.userId,sessionToken:randomUUID(),
    tokenHash:mobileDigest(accessToken),expires:expiry,expiresAt:expiry,userAgent:"NAKSHARIX_ANDROID_V2"}});
  return {state:"linked",accessToken,expiresInSeconds:Math.floor(SESSION_MS/1000)};
}
function bearer(request:Request){
  return /^Bearer ([A-Za-z0-9_.-]{90,1500})$/.exec(request.headers.get("authorization")||"")?.[1]||null;
}
export async function getMobileAccountUser(request:Request){
  const token=bearer(request);
  if(!token)return null; // Website cookies never authorize the native API.
  let subject:string|undefined;
  try{
    const {payload}=await jwtVerify(token,signingKey(),{
      algorithms:["HS256"],issuer:"naksharix",audience:MOBILE_AUDIENCE});
    if(payload.kind!=="naksharix-mobile"||payload.scope!=="account:read profile:write")return null;
    subject=payload.sub;
  }catch{return null;}
  if(!subject)return null;
  const session=await prisma.session.findUnique({where:{tokenHash:mobileDigest(token)},
    select:{userId:true,revokedAt:true,expiresAt:true}});
  if(!session||session.userId!==subject||session.revokedAt||
    !session.expiresAt||session.expiresAt.getTime()<=Date.now())return null;
  return prisma.user.findUnique({where:{id:subject},select:{id:true,name:true,email:true,role:true}});
}
export async function revokeMobileSession(request:Request){
  const user=await getMobileAccountUser(request),token=bearer(request);
  if(!user||!token)return false;
  const result=await prisma.session.updateMany({where:{userId:user.id,
    tokenHash:mobileDigest(token),revokedAt:null},data:{revokedAt:new Date()}});
  return result.count===1;
}

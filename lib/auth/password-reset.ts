import "server-only";
import {prisma} from "@/lib/db";
import {env} from "@/lib/env";
import {sendEmail} from "@/lib/email/email-service";
import {hashPassword} from "@/lib/auth/password";
import {createResetToken,passwordResetDigest,PASSWORD_RESET_PURPOSE,PASSWORD_RESET_TTL_MS,resetRoleEligible} from "@/lib/auth/password-reset-contract";

export async function requestPasswordReset(email:string){
  const user=await prisma.user.findFirst({where:{email:{equals:email,mode:"insensitive"}},select:{id:true,email:true,name:true,role:true,passwordHash:true,emailVerified:true,emailVerifiedAt:true}});
  if(!user||!user.passwordHash||!resetRoleEligible(user.role)||(!user.emailVerified&&!user.emailVerifiedAt)||user.email.toLowerCase()===env.ADMIN_EMAIL?.toLowerCase())return;
  const token=createResetToken(),digest=passwordResetDigest(token,env.JWT_SECRET);
  const issued=await prisma.$transaction(async tx=>{
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${user.id}),hashtext('naksharix-password-reset-v1'))::text`;
    const fresh=await tx.user.findUnique({where:{id:user.id},select:{role:true,passwordHash:true,email:true,emailVerified:true,emailVerifiedAt:true}});
    if(!fresh||!resetRoleEligible(fresh.role)||!fresh.passwordHash||fresh.email!==user.email||(!fresh.emailVerified&&!fresh.emailVerifiedAt))return false;
    await tx.otpToken.deleteMany({where:{userId:user.id,purpose:PASSWORD_RESET_PURPOSE,consumedAt:null}});
    await tx.otpToken.create({data:{userId:user.id,email:user.email.toLowerCase(),purpose:PASSWORD_RESET_PURPOSE,codeHash:digest,expiresAt:new Date(Date.now()+PASSWORD_RESET_TTL_MS)}});
    return true;
  });
  if(!issued)return;
  // A fragment avoids sending the secret to the HTTP server or ordinary referrer.
  const link=new URL("/reset-password",env.NEXT_PUBLIC_APP_URL);
  link.hash="token="+token;
  await sendEmail({to:user.email,subject:"Reset your Naksharix password",text:"Hello "+user.name+",\n\nA password reset was requested for your Naksharix account. Open this private one-time link within 20 minutes:\n"+link.toString()+"\n\nDo not forward this link. If you did not request a reset, ignore this email. No password has changed."});
}
export async function completePasswordReset(token:string,password:string){
  const digest=passwordResetDigest(token,env.JWT_SECRET);
  const candidate=await prisma.otpToken.findFirst({where:{purpose:PASSWORD_RESET_PURPOSE,codeHash:digest,consumedAt:null,expiresAt:{gt:new Date()}},select:{id:true,userId:true,email:true}});
  if(!candidate?.userId)return false;
  const newHash=await hashPassword(password);
  return prisma.$transaction(async tx=>{
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${candidate.userId!}),hashtext('naksharix-password-reset-v1'))::text`;
    const user=await tx.user.findUnique({where:{id:candidate.userId!},select:{id:true,email:true,passwordHash:true,role:true,emailVerified:true,emailVerifiedAt:true}});
    if(!user||!user.passwordHash||!resetRoleEligible(user.role)||(!user.emailVerified&&!user.emailVerifiedAt)||user.email.toLowerCase()!==candidate.email||user.email.toLowerCase()===env.ADMIN_EMAIL?.toLowerCase())return false;
    const now=new Date();
    const claim=await tx.otpToken.updateMany({where:{id:candidate.id,userId:user.id,purpose:PASSWORD_RESET_PURPOSE,codeHash:digest,consumedAt:null,expiresAt:{gt:now}},data:{consumedAt:now}});
    if(claim.count!==1)return false;
    await tx.user.update({where:{id:user.id},data:{passwordHash:newHash}});
    await tx.session.updateMany({where:{userId:user.id,revokedAt:null},data:{revokedAt:now}});
    await tx.otpToken.deleteMany({where:{userId:user.id,purpose:{in:[PASSWORD_RESET_PURPOSE,"EMAIL_VERIFY"]},consumedAt:null}});
    return true;
  });
}

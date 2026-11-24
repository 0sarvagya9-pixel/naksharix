import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser, setAuthCookie } from "@/lib/auth/jwt";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const schema = z.object({ role: z.enum(["ASTROLOGER", "CONSULTANT"]).default("ASTROLOGER") });

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthorized", 401);
        if (user.role !== "USER" || user.isAdminLogin) return fail("This action is available for user accounts only", 403);
    const body = await validateJson(request, schema);
    const nextRole = body.role;
    const updatedUser = await prisma.$transaction(async tx=>{
      const current=await tx.user.findUnique({where:{id:user.id},select:{role:true,emailVerified:true,emailVerifiedAt:true}});
      if(!current||current.role!=="USER"||(!current.emailVerified&&!current.emailVerifiedAt))return null;
      const claim=await tx.user.updateMany({where:{id:user.id,role:"USER"},data:{role:nextRole}});
      if(claim.count!==1)return null;
      const profile={userId:user.id,displayName:user.name||user.email,bio:"",status:"PENDING_REVIEW" as const};
      if(nextRole==="ASTROLOGER")await tx.astrologerProfile.upsert({where:{userId:user.id},create:profile,update:{status:"PENDING_REVIEW"}});
      else await tx.consultantProfile.upsert({where:{userId:user.id},create:profile,update:{status:"PENDING_REVIEW"}});
      return tx.user.findUniqueOrThrow({where:{id:user.id},select:{id:true,email:true,name:true,role:true}});
    });
    if(!updatedUser)return fail("A verified personal account is required; refresh before retrying.",409);

    const token = await createSession({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      effectiveRole: nextRole,
      isAdminLogin: Boolean(user.isAdminLogin),
      canBypassPayment: Boolean(user.isAdminLogin)
    }, request);
    await setAuthCookie(token);

    return ok({ redirectTo: "/astrologer/profile", role: updatedUser.role, effectiveRole: nextRole, isAdminLogin: Boolean(user.isAdminLogin), canBypassPayment: Boolean(user.isAdminLogin) });
  } catch (error) {
    return handleApiError(error);
  }
}
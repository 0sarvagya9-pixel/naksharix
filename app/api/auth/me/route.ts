import { getCurrentUser } from "@/lib/auth/jwt";
import { ok, fail } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET() {
  const authUser = await getCurrentUser();
  if (!authUser) return fail("Unauthenticated", 401);

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, email: true, name: true, role: true, image: true, avatarUrl: true, locale: true }
  });

  return ok({ user: user ? { ...user, effectiveRole: authUser.effectiveRole, isAdminLogin: authUser.isAdminLogin, canBypassPayment: authUser.canBypassPayment } : authUser });
}
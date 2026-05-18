import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { authCookieName, signAuthToken, toEffectiveRole, verifyAuthToken, type AuthUser } from "@/lib/auth/token";
import { prisma } from "@/lib/db";

export { authCookieName, signAuthToken, verifyAuthToken, type AuthUser };

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName)?.value;
  const tokenUser = await verifyAuthToken(token);

  if (!tokenUser || !token) {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) return null;
    const dbUser = await prisma.user.findFirst({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email! },
      select: { id: true, email: true, name: true, role: true }
    });
    if (!dbUser) return null;
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name ?? "Naksharix User",
      role: dbUser.role,
      effectiveRole: session.user.effectiveRole ?? toEffectiveRole(dbUser.role),
      isAdminLogin: Boolean(session.user.isAdminLogin),
      canBypassPayment: Boolean(session.user.isAdminLogin)
    };
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    select: { revokedAt: true, expiresAt: true }
  });
  if (!session || session.revokedAt || !session.expiresAt || session.expiresAt < new Date()) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: tokenUser.id },
    select: { id: true, email: true, name: true, role: true }
  });
  if (!dbUser) return null;
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name ?? "Naksharix User",
    role: dbUser.role,
    effectiveRole: tokenUser.effectiveRole ?? toEffectiveRole(dbUser.role),
    isAdminLogin: Boolean(tokenUser.isAdminLogin),
    canBypassPayment: Boolean(tokenUser.isAdminLogin)
  };
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(authCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(authCookieName);
}
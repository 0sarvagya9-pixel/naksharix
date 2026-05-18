import { NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";
import { ok, fail, handleApiError, validateJson } from "@/lib/api";
import { loginSchema } from "@/lib/validations/auth";
import { verifyPassword } from "@/lib/auth/password";
import { setAuthCookie } from "@/lib/auth/jwt";
import { rateLimit } from "@/lib/rate-limit";
import { createSession } from "@/lib/auth/session";
import { env } from "@/lib/env";
import type { EffectiveRole } from "@/lib/auth/token";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    const limited = await rateLimit(`login:${ip}`, 8, 60);
    if (!limited.allowed) return fail("Too many login attempts. Please try again soon.", 429);

    const body = await validateJson(request, loginSchema);
    const loginMode = body.loginMode as EffectiveRole;
    const adminUser = await authorizeAdmin(body.email, body.password);
    if (adminUser) {
      const effectiveRole = loginMode === "ADMIN" ? "ADMIN" : loginMode;
      const token = await createSession({
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        effectiveRole,
        isAdminLogin: true,
        canBypassPayment: true
      }, request);
      await setAuthCookie(token);
      if (process.env.NODE_ENV === "development") {
        console.info("[Naksharix login success]", { selectedMode: body.roleIntent, loginMode, role: adminUser.role, effectiveRole });
      }
      return ok({ user: { id: adminUser.id, email: adminUser.email, name: adminUser.name, role: adminUser.role, effectiveRole, isAdminLogin: true, canBypassPayment: true } });
    }

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user?.passwordHash) return fail("Invalid email or password", 401);
    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) return fail("Invalid email or password", 401);
    const isAstroAccount = user.role === "ASTROLOGER" || user.role === "CONSULTANT";
    if (loginMode === "ASTROLOGER" && !isAstroAccount) return fail("This email is not registered as an astrologer/consultant account.", 403);
    if (body.roleIntent === "ASTROLOGER" && !isAstroAccount && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return fail("This email is registered as a user account. Continue as User or apply as an astrologer/consultant.", 403);
    }
    const effectiveRole: EffectiveRole = user.role === "ASTROLOGER" ? "ASTROLOGER" : user.role === "CONSULTANT" ? "CONSULTANT" : "USER";
    const token = await createSession({ id: user.id, email: user.email, name: user.name, role: user.role, effectiveRole, isAdminLogin: false, canBypassPayment: false }, request);
    await setAuthCookie(token);
    if (process.env.NODE_ENV === "development") {
      console.info("[Naksharix login success]", { selectedMode: body.roleIntent, loginMode, role: user.role, effectiveRole });
    }
    return ok({ user: { id: user.id, email: user.email, name: user.name, role: user.role, effectiveRole, isAdminLogin: false, canBypassPayment: false } });
  } catch (error) {
    return handleApiError(error);
  }
}

async function authorizeAdmin(emailValue: string, passwordValue: string) {
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = env.ADMIN_PASSWORD ?? "";
  const email = emailValue.trim().toLowerCase();
  if (!adminEmail || !adminPassword || email !== adminEmail || !constantTimeEqual(passwordValue, adminPassword)) return null;

  return prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", name: "Naksharix Admin", emailVerified: new Date(), emailVerifiedAt: new Date() },
    create: { email: adminEmail, name: "Naksharix Admin", role: "ADMIN", emailVerified: new Date(), emailVerifiedAt: new Date() }
  });
}

function constantTimeEqual(value: string, expected: string) {
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

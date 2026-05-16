import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, fail, handleApiError, validateJson } from "@/lib/api";
import { loginSchema } from "@/lib/validations/auth";
import { verifyPassword } from "@/lib/auth/password";
import { setAuthCookie } from "@/lib/auth/jwt";
import { rateLimit } from "@/lib/rate-limit";
import { createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    const limited = await rateLimit(`login:${ip}`, 8, 60);
    if (!limited.allowed) return fail("Too many login attempts. Please try again soon.", 429);

    const body = await validateJson(request, loginSchema);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user?.passwordHash) return fail("Invalid email or password", 401);
    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) return fail("Invalid email or password", 401);
    const isAstroAccount = user.role === "ASTROLOGER" || user.role === "CONSULTANT";
    if (body.roleIntent === "ASTROLOGER" && !isAstroAccount && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return fail("This email is registered as a user account. Continue as User or apply as an astrologer/consultant.", 403);
    }
    if (body.roleIntent === "USER" && isAstroAccount) {
      return fail("This email is registered as an astrologer/consultant account. Continue as Astrologer / Consultant.", 403);
    }
    const token = await createSession({ id: user.id, email: user.email, name: user.name, role: user.role }, request);
    await setAuthCookie(token);
    return ok({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    return handleApiError(error);
  }
}

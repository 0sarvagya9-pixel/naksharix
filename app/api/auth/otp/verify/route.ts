import { createHash } from "node:crypto";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { verifyEmailVerificationOtp } from "@/lib/auth/otp-service";
import { createSession } from "@/lib/auth/session";
import { setAuthCookie } from "@/lib/auth/jwt";
import { toEffectiveRole } from "@/lib/auth/token";
import { rateLimit } from "@/lib/rate-limit";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/)
});

function keyForEmail(email: string) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await validateJson(request, verifySchema);
    const email = body.email.trim().toLowerCase();
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "local";

    const ipLimit = await rateLimit(`otp-email-verify-ip:${ip}`, 15, 600);
    if (!ipLimit.allowed) {
      return fail("Too many verification attempts. Please try again later.", 429);
    }

    const emailLimit = await rateLimit(
      `otp-email-verify-destination:${keyForEmail(email)}`,
      10,
      600
    );

    if (!emailLimit.allowed) {
      return fail("Too many verification attempts. Please request a new code later.", 429);
    }

    const result = await verifyEmailVerificationOtp({
      email,
      code: body.code
    });

    if (!result.ok) {
      return fail("Invalid or expired verification code.", 400);
    }

    const effectiveRole = toEffectiveRole(result.user.role);

    const token = await createSession(
      {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        effectiveRole,
        isAdminLogin: false,
        canBypassPayment: false
      },
      request
    );

    await setAuthCookie(token);

    return ok({
      verified: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        effectiveRole
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

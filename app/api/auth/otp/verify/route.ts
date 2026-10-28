import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { verifyEmailVerificationOtp } from "@/lib/auth/otp-service";
import { createSession } from "@/lib/auth/session";
import { setAuthCookie } from "@/lib/auth/jwt";
import { toEffectiveRole } from "@/lib/auth/token";
import { claimPublicAuthQuota, trustedPublicClientIp } from "@/lib/auth/public-quota";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/)
});

export async function POST(request: Request) {
  try {
    const body = await validateJson(request, verifySchema);
    const email = body.email.trim().toLowerCase();
    const ipAllowed = await claimPublicAuthQuota({
      scope: "otp-verify-ip",
      key: trustedPublicClientIp(request),
      limit: 15,
      windowSeconds: 600
    });
    if (!ipAllowed) {
      return fail("Too many verification attempts. Please try again later.", 429);
    }

    const emailAllowed = await claimPublicAuthQuota({
      scope: "otp-verify-destination",
      key: email,
      limit: 10,
      windowSeconds: 600
    });
    if (!emailAllowed) {
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

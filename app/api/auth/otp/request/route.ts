import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { prisma } from "@/lib/db";
import {
  issueEmailVerificationOtp,
  normalizeAuthEmail
} from "@/lib/auth/otp-service";
import { getEmailReadiness } from "@/lib/email/email-service";
import { claimPublicAuthQuota, trustedPublicClientIp } from "@/lib/auth/public-quota";

const requestSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  try {
    const body = await validateJson(request, requestSchema);
    const email = normalizeAuthEmail(body.email);

    const ipAllowed = await claimPublicAuthQuota({
      scope: "otp-request-ip",
      key: trustedPublicClientIp(request),
      limit: 8,
      windowSeconds: 600
    });
    if (!ipAllowed) {
      return fail(
        "Too many verification-code requests. Please try again later.",
        429
      );
    }

    const emailAllowed = await claimPublicAuthQuota({
      scope: "otp-request-destination",
      key: email,
      limit: 4,
      windowSeconds: 600
    });
    if (!emailAllowed) {
      return fail(
        "Please wait before requesting another verification code.",
        429
      );
    }

    const readiness = getEmailReadiness();

    if (!readiness.emailEnabled) {
      return fail(
        "Verification email delivery is temporarily unavailable.",
        503,
        { code: "OTP_DELIVERY_UNAVAILABLE" }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive"
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        emailVerifiedAt: true
      }
    });

    if (!user || user.emailVerified || user.emailVerifiedAt) {
      return ok({
        accepted: true
      });
    }

    await issueEmailVerificationOtp({
      userId: user.id,
      email: user.email,
      name: user.name
    });

    return ok({
      accepted: true
    });
  } catch (error) {
    return handleApiError(error);
  }
}

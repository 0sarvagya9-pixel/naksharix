import { createHash } from "node:crypto";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { prisma } from "@/lib/db";
import {
  issueEmailVerificationOtp,
  normalizeAuthEmail
} from "@/lib/auth/otp-service";
import { getEmailReadiness } from "@/lib/email/email-service";
import { rateLimit } from "@/lib/rate-limit";

const requestSchema = z.object({
  email: z.string().email()
});

function keyForEmail(email: string) {
  return createHash("sha256")
    .update(normalizeAuthEmail(email))
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await validateJson(request, requestSchema);
    const email = normalizeAuthEmail(body.email);

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "local";

    const ipLimit = await rateLimit(
      `otp-email-request-ip:${ip}`,
      8,
      600
    );

    if (!ipLimit.allowed) {
      return fail(
        "Too many verification-code requests. Please try again later.",
        429
      );
    }

    const emailLimit = await rateLimit(
      `otp-email-request-destination:${keyForEmail(email)}`,
      4,
      600
    );

    if (!emailLimit.allowed) {
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

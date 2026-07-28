import "server-only";

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getEmailReadiness, sendEmail } from "@/lib/email/email-service";
import { logger } from "@/lib/monitoring/logger";

export const EMAIL_VERIFY_PURPOSE = "EMAIL_VERIFY";
export const EMAIL_OTP_TTL_SECONDS = 10 * 60;
export const EMAIL_OTP_MAX_ATTEMPTS = 5;

export function normalizeAuthEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function digestCode(email: string, code: string) {
  return createHmac("sha256", env.JWT_SECRET)
    .update(`${EMAIL_VERIFY_PURPOSE}:${normalizeAuthEmail(email)}:${code}`)
    .digest();
}

function matchesDigest(storedHex: string, email: string, code: string) {
  const expected = Buffer.from(storedHex, "hex");
  const actual = digestCode(email, code);

  return (
    expected.length === actual.length &&
    timingSafeEqual(expected, actual)
  );
}

export function prepareEmailVerificationOtp(email: string) {
  const normalizedEmail = normalizeAuthEmail(email);
  const code = generateCode();

  return {
    email: normalizedEmail,
    code,
    codeHash: digestCode(normalizedEmail, code).toString("hex"),
    expiresAt: new Date(Date.now() + EMAIL_OTP_TTL_SECONDS * 1000)
  };
}

export async function replaceEmailVerificationOtpRecord(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    email: string;
    codeHash: string;
    expiresAt: Date;
  }
) {
  const email = normalizeAuthEmail(input.email);

  await tx.otpToken.deleteMany({
    where: {
      userId: input.userId,
      email,
      purpose: EMAIL_VERIFY_PURPOSE,
      consumedAt: null
    }
  });

  return tx.otpToken.create({
    data: {
      userId: input.userId,
      email,
      purpose: EMAIL_VERIFY_PURPOSE,
      codeHash: input.codeHash,
      attempts: 0,
      expiresAt: input.expiresAt
    }
  });
}

export async function deliverEmailVerificationOtp(input: {
  email: string;
  code: string;
  name?: string | null;
}) {
  const readiness = getEmailReadiness();

  if (!readiness.emailEnabled) {
    return {
      sent: false,
      reason: "Email delivery is not configured."
    };
  }

  try {
    const result = await sendEmail({
      to: normalizeAuthEmail(input.email),
      subject: "Your Naksharix verification code",
      text: [
        `Hello ${input.name?.trim() || "Naksharix user"},`,
        "",
        `Your Naksharix verification code is: ${input.code}`,
        "",
        "This code expires in 10 minutes.",
        "Do not share this code with anyone.",
        "",
        "If you did not create a Naksharix account, you can ignore this email."
      ].join("\n")
    });

    return {
      sent: result.sent,
      reason: result.reason
    };
  } catch {
    logger.warn("email_verification_delivery_failed", {
      provider: readiness.provider
    });

    return {
      sent: false,
      reason: "Verification email delivery failed."
    };
  }
}

export async function issueEmailVerificationOtp(input: {
  userId: string;
  email: string;
  name?: string | null;
}) {
  const prepared = prepareEmailVerificationOtp(input.email);

  await prisma.$transaction(async (tx) => {
    await replaceEmailVerificationOtpRecord(tx, {
      userId: input.userId,
      email: prepared.email,
      codeHash: prepared.codeHash,
      expiresAt: prepared.expiresAt
    });
  });

  const delivery = await deliverEmailVerificationOtp({
    email: prepared.email,
    code: prepared.code,
    name: input.name
  });

  return {
    ...delivery,
    expiresAt: prepared.expiresAt
  };
}

export async function verifyEmailVerificationOtp(input: {
  email: string;
  code: string;
}) {
  const email = normalizeAuthEmail(input.email);

  const token = await prisma.otpToken.findFirst({
    where: {
      email,
      purpose: EMAIL_VERIFY_PURPOSE,
      consumedAt: null
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!token || !token.userId) {
    return {
      ok: false as const,
      reason: "INVALID_OR_EXPIRED" as const
    };
  }

  if (
    token.attempts >= EMAIL_OTP_MAX_ATTEMPTS ||
    token.expiresAt.getTime() <= Date.now()
  ) {
    return {
      ok: false as const,
      reason: "INVALID_OR_EXPIRED" as const
    };
  }

  if (!matchesDigest(token.codeHash, email, input.code)) {
    await prisma.otpToken.updateMany({
      where: {
        id: token.id,
        consumedAt: null,
        attempts: {
          lt: EMAIL_OTP_MAX_ATTEMPTS
        }
      },
      data: {
        attempts: {
          increment: 1
        }
      }
    });

    return {
      ok: false as const,
      reason: "INVALID_CODE" as const
    };
  }

  const verifiedAt = new Date();

  const user = await prisma.$transaction(async (tx) => {
    const claim = await tx.otpToken.updateMany({
      where: {
        id: token.id,
        consumedAt: null,
        expiresAt: {
          gt: verifiedAt
        },
        attempts: {
          lt: EMAIL_OTP_MAX_ATTEMPTS
        }
      },
      data: {
        consumedAt: verifiedAt
      }
    });

    if (claim.count !== 1) return null;

    return tx.user.update({
      where: {
        id: token.userId!
      },
      data: {
        emailVerified: verifiedAt,
        emailVerifiedAt: verifiedAt
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
  });

  if (!user) {
    return {
      ok: false as const,
      reason: "INVALID_OR_EXPIRED" as const
    };
  }

  return {
    ok: true as const,
    user
  };
}

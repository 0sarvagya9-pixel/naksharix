import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, fail, handleApiError, validateJson } from "@/lib/api";
import { signupSchema } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/auth/password";
import { slugify } from "@/lib/utils";
import {
  deliverEmailVerificationOtp,
  normalizeAuthEmail,
  prepareEmailVerificationOtp,
  replaceEmailVerificationOtpRecord
} from "@/lib/auth/otp-service";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "local";

    const signupLimit = await rateLimit(
      `signup-ip:${ip}`,
      5,
      3600
    );

    if (!signupLimit.allowed) {
      return fail(
        "Too many signup attempts. Please try again later.",
        429
      );
    }

    const body = await validateJson(request, signupSchema);
    const email = normalizeAuthEmail(body.email);

    const existing = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive"
        }
      },
      select: {
        id: true
      }
    });

    if (existing) {
      return fail("Email is already registered", 409);
    }

    const passwordHash = await hashPassword(body.password);
    const preparedOtp = prepareEmailVerificationOtp(email);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          name: body.name,
          locale: body.locale,
          role: body.role,
          passwordHash,
          referralCode: `${slugify(body.name).slice(0, 12)}-${Math.random()
            .toString(36)
            .slice(2, 7)}`
        }
      });

      if (body.role === "ASTROLOGER") {
        await tx.astrologerProfile.create({
          data: {
            userId: createdUser.id,
            displayName: body.name,
            specialization: "Vedic Astrology",
            experienceYears: 0,
            languages: ["Hindi", "English"],
            consultationPrice: 0,
            bio: "",
            status: "PENDING_REVIEW",
            availabilityStatus: "OFFLINE"
          }
        });
      } else if (body.role === "CONSULTANT") {
        await tx.consultantProfile.create({
          data: {
            userId: createdUser.id,
            displayName: body.name,
            specialization: "Spiritual Consultant",
            experienceYears: 0,
            languages: ["Hindi", "English"],
            consultationPrice: 0,
            bio: "",
            status: "PENDING_REVIEW",
            availabilityStatus: "OFFLINE"
          }
        });
      }

      await replaceEmailVerificationOtpRecord(tx, {
        userId: createdUser.id,
        email,
        codeHash: preparedOtp.codeHash,
        expiresAt: preparedOtp.expiresAt
      });

      return createdUser;
    });

    const delivery = await deliverEmailVerificationOtp({
      email: user.email,
      name: user.name,
      code: preparedOtp.code
    });

    return ok(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        verificationRequired: true,
        deliverySent: delivery.sent
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

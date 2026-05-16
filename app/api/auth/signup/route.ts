import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, fail, handleApiError, validateJson } from "@/lib/api";
import { signupSchema } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/auth/password";
import { setAuthCookie } from "@/lib/auth/jwt";
import { createSession } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await validateJson(request, signupSchema);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return fail("Email is already registered", 409);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        locale: body.locale,
        role: body.role,
        passwordHash: await hashPassword(body.password),
        referralCode: `${slugify(body.name).slice(0, 12)}-${Math.random().toString(36).slice(2, 7)}`
      }
    });
    if (body.role === "ASTROLOGER") {
      await prisma.astrologerProfile.create({
        data: {
          userId: user.id,
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
      await prisma.consultantProfile.create({
        data: {
          userId: user.id,
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
    const token = await createSession({ id: user.id, email: user.email, name: user.name, role: user.role }, request);
    await setAuthCookie(token);
    return ok({ user: { id: user.id, email: user.email, name: user.name, role: user.role } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { setAuthCookie } from "@/lib/auth/jwt";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(120),
  role: z.enum(["ASTROLOGER", "CONSULTANT"]),
  specialization: z.string().min(2).max(120),
  experienceYears: z.coerce.number().min(0).max(80),
  languages: z.string().min(2).max(160),
  consultationPrice: z.coerce.number().min(0).max(100000),
  bio: z.string().min(10).max(1000)
});

export async function POST(request: NextRequest) {
  try {
    const body = await validateJson(request, schema);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return fail("Email is already registered", 409);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        role: body.role,
        passwordHash: await hashPassword(body.password),
        referralCode: `${slugify(body.name).slice(0, 12)}-${Math.random().toString(36).slice(2, 7)}`
      }
    });

    const profileData = {
      userId: user.id,
      displayName: body.name,
      bio: body.bio,
      specialization: body.specialization,
      experienceYears: body.experienceYears,
      languages: body.languages.split(",").map((item) => item.trim()).filter(Boolean),
      consultationPrice: body.consultationPrice,
      skills: [body.specialization],
      status: "PENDING_REVIEW" as const,
      availabilityStatus: "OFFLINE" as const
    };

    if (body.role === "ASTROLOGER") {
      await prisma.astrologerProfile.create({ data: profileData });
    } else {
      await prisma.consultantProfile.create({ data: profileData });
    }

    const token = await createSession({ id: user.id, email: user.email, name: user.name, role: user.role }, request);
    await setAuthCookie(token);
    return ok({ user: { id: user.id, email: user.email, name: user.name, role: user.role } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

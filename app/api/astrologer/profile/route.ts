import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

const schema = z.object({
  displayName: z.string().min(2).max(80),
  photoUrl: z.string().url().optional().or(z.literal("")),
  bio: z.string().min(10).max(1200),
  experienceYears: z.coerce.number().min(0).max(80),
  specialization: z.string().min(2).max(120),
  languages: z.string().min(2).max(160),
  consultationPrice: z.coerce.number().min(0).max(100000),
  skills: z.string().min(2).max(300),
  availabilityStatus: z.enum(["ONLINE", "BUSY", "OFFLINE"])
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !["ASTROLOGER", "CONSULTANT", "ADMIN", "SUPER_ADMIN"].includes(user.role)) return fail("Unauthorized", 403);
    const body = await validateJson(request, schema);
    const data = {
      displayName: body.displayName,
      photoUrl: body.photoUrl || null,
      bio: body.bio,
      experienceYears: body.experienceYears,
      specialization: body.specialization,
      languages: body.languages.split(",").map((item) => item.trim()).filter(Boolean),
      consultationPrice: body.consultationPrice,
      skills: body.skills.split(",").map((item) => item.trim()).filter(Boolean),
      availabilityStatus: body.availabilityStatus,
      status: "PENDING_REVIEW" as const
    };
    const profile = user.role === "CONSULTANT"
      ? await prisma.consultantProfile.upsert({ where: { userId: user.id }, create: { userId: user.id, ...data }, update: data })
      : await prisma.astrologerProfile.upsert({ where: { userId: user.id }, create: { userId: user.id, ...data }, update: data });
    return ok({ profile });
  } catch (error) {
    return handleApiError(error);
  }
}

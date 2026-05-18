import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

const schema = z.object({
  displayName: z.string().min(2).max(80),
  photoUrl: z.string().url().optional().or(z.literal("")),
  bio: z.string().min(10).max(1200),
  introLine: z.string().max(160).optional().or(z.literal("")),
  experienceYears: z.coerce.number().min(0).max(80),
  specialization: z.string().min(2).max(160),
  languages: z.string().min(2).max(200),
  consultationPrice: z.coerce.number().min(0).max(100000),
  pricePerSession: z.coerce.number().min(0).max(100000).optional().or(z.literal("")),
  skills: z.string().min(2).max(400),
  city: z.string().max(80).optional().or(z.literal("")),
  country: z.string().max(80).optional().or(z.literal("")),
  availabilityStatus: z.enum(["ONLINE", "BUSY", "OFFLINE"]),
  availableForChat: z.coerce.boolean().default(false),
  availableForCall: z.coerce.boolean().default(false),
  availableForVideo: z.coerce.boolean().default(false)
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const effectiveRole = user?.effectiveRole;
    if (!user || !["ASTROLOGER", "CONSULTANT"].includes(effectiveRole ?? "")) return fail("Unauthorized", 403);
    const body = await validateJson(request, schema);
    const data = {
      displayName: body.displayName,
      photoUrl: body.photoUrl || null,
      bio: body.bio,
      introLine: body.introLine || null,
      experienceYears: body.experienceYears,
      specialization: body.specialization,
      languages: splitList(body.languages),
      consultationPrice: body.consultationPrice,
      pricePerSession: body.pricePerSession === "" || body.pricePerSession === undefined ? null : Number(body.pricePerSession),
      skills: splitList(body.skills),
      city: body.city || null,
      country: body.country || null,
      availabilityStatus: body.availabilityStatus,
      availableForChat: body.availableForChat,
      availableForCall: body.availableForCall,
      availableForVideo: body.availableForVideo,
      status: "PENDING_REVIEW" as const,
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null
    };
    const profile = effectiveRole === "CONSULTANT"
      ? await prisma.consultantProfile.upsert({ where: { userId: user.id }, create: { userId: user.id, ...data }, update: data })
      : await prisma.astrologerProfile.upsert({ where: { userId: user.id }, create: { userId: user.id, ...data }, update: data });
    return ok({ profile });
  } catch (error) {
    return handleApiError(error);
  }
}

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

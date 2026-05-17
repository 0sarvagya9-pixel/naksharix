import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/jwt";

type SearchParams = Promise<{ role?: string }>;

export default async function GoogleCompletePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const requestedRole = params.role === "CONSULTANT" ? "CONSULTANT" : params.role === "ASTROLOGER" ? "ASTROLOGER" : "USER";
  const current = await getCurrentUser();
  if (!current) redirect("/login");

  let user = await prisma.user.findUnique({ where: { id: current.id } });
  if (!user) redirect("/login");

  if (requestedRole === "ASTROLOGER" && user.role === "USER") {
    user = await prisma.user.update({ where: { id: user.id }, data: { role: "ASTROLOGER" } });
    await prisma.astrologerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: user.name,
        specialization: "Vedic Astrology",
        experienceYears: 0,
        languages: ["Hindi", "English"],
        consultationPrice: 0,
        bio: "",
        status: "PENDING_REVIEW",
        availabilityStatus: "OFFLINE"
      }
    });
  }

  if (requestedRole === "CONSULTANT" && user.role === "USER") {
    user = await prisma.user.update({ where: { id: user.id }, data: { role: "CONSULTANT" } });
    await prisma.consultantProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: user.name,
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

  if (user.role === "ASTROLOGER" || user.role === "CONSULTANT") redirect("/astrologer/dashboard");
  redirect("/dashboard");
}



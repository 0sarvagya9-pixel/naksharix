import type { Metadata } from "next";
import { AstrologersPageContent } from "@/components/astrologers-page-content";
import { prisma } from "@/lib/db";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Astrologer Profiles - Naksharix",
  description: "Explore verified Naksharix astrologers for Vedic astrology, tarot, numerology, panchang, muhurat, and live consultations.",
  path: "/astrologers",
  keywords: ["Astrologers", "Astrology Consultation", "Vedic Astrologer", "Tarot Reader"]
});

export const dynamic = "force-dynamic";

export default async function AstrologersPage() {
  const profiles = await prisma.astrologerProfile.findMany({
    where: { status: "APPROVED" },
    orderBy: [{ availabilityStatus: "asc" }, { rating: "desc" }],
    take: 30
  }).then((items) => items.map((profile) => ({
    id: profile.id,
    name: profile.displayName,
    specialty: profile.specialization,
    languages: profile.languages,
    experienceYears: profile.experienceYears,
    rating: profile.rating || 4.8,
    pricePerMinute: Number(profile.consultationPrice),
    bio: profile.bio,
    status: profile.availabilityStatus
  }))).catch(() => []);

  return <AstrologersPageContent profiles={profiles} />;
}

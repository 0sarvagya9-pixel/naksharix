import type { Metadata } from "next";
import { AstrologersPageContent } from "@/components/astrologers-page-content";
import { EditorialServiceBanner } from "@/components/home/editorial-service-banner";
import { prisma } from "@/lib/db";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
    title: "Astrology Consultations",
    description: "Book a live consultation with approved Vedic astrologers for chat, phone call, or video session guidance.",
    path: "/consultation",
    keywords: ["Astrology Consultation", "Astrologer Booking", "Vedic Astrologer", "Live Consultation"]
  }),
  robots: { index: true, follow: true }
};

export const dynamic = "force-dynamic";

export default async function ConsultationPage() {
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
    rating: profile.rating || 0,
    reviewCount: profile.reviewCount,
    pricePerMinute: Number(profile.consultationPrice),
    pricePerSession: profile.pricePerSession ? Number(profile.pricePerSession) : null,
    bio: profile.bio,
    introLine: profile.introLine,
    photoUrl: profile.photoUrl,
    city: profile.city,
    country: profile.country,
    status: profile.availabilityStatus,
    availableForChat: profile.availableForChat,
    availableForCall: profile.availableForCall,
    availableForVideo: profile.availableForVideo
  }))).catch(() => []);

  return <><EditorialServiceBanner eyebrow="PERSONAL CONSULTATIONS"
    headline="Real conversations, meaningful questions"
    caption="Browse the approved profiles and read session details before choosing a consultation. External meeting rooms depend on assigned providers."
    image="/naksharix/editorial-consultation.svg" imageAlt="Original illustration of an astrology consultation"
    link="/ask-astrologer" linkLabel="Ask a written question" />
    <AstrologersPageContent profiles={profiles} /></>;
}

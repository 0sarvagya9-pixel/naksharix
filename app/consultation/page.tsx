import type { Metadata } from "next";
import { AstrologersPageContent } from "@/components/astrologers-page-content";
import { ConsultationGallery } from "@/components/consultation-gallery";
import { EditorialServiceBanner } from "@/components/home/editorial-service-banner";
import { prisma } from "@/lib/db";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
    title: "Astrology Consultations",
    description: "Explore Vedic astrology consultation options, session formats and available specialists.",
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

  return <><EditorialServiceBanner eyebrow="HOME / EXPERT GUIDANCE"
    headline="Astrologer Consultations"
    caption="Explore ways to connect with an astrologer and find guidance for your questions."
    image="https://upload.wikimedia.org/wikipedia/commons/0/04/Astrologer.jpg" imageAlt="Representative astrology consultation exhibition photograph, by Ravikiran, CC BY-SA 4.0"
    link="/ask-astrologer" linkLabel="Ask a written question" />
    <ConsultationGallery hasAvailableExperts={profiles.length > 0} />
    <AstrologersPageContent profiles={profiles} /></>;
}

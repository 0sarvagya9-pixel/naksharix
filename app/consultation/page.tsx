import type { Metadata } from "next";
import { ConsultationBooking } from "@/components/consultation-booking";
import { Section } from "@/components/section";
import { prisma } from "@/lib/db";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Astrology Consultation Booking - Naksharix",
  description: "Book chat, audio, and video consultations with Naksharix astrologers for kundli, horoscope, numerology, tarot, panchang, and remedies.",
  path: "/consultation",
  keywords: ["Astrology Consultation", "Astrologer Booking", "Live Astrology"]
});

export default async function ConsultationPage({ searchParams }: { searchParams: Promise<{ astrologer?: string }> }) {
  const params = await searchParams;
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

  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Live Guidance</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Consult an Astrologer</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">
          Request a secure chat, audio, or video session for kundli review, marriage compatibility, career timing, tarot clarity, numerology, or panchang-based muhurat.
        </p>
        <div className="mt-8">
          <ConsultationBooking selectedAstrologerId={params.astrologer} profiles={profiles} />
        </div>
      </Section>
    </main>
  );
}

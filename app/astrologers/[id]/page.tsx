import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CalendarClock, Languages, MapPin, MessageCircle, Phone, Star, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { prisma } from "@/lib/db";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const astrologer = await prisma.astrologerProfile.findFirst({ where: { id, status: "APPROVED" } }).catch(() => null);
  if (!astrologer) return {};
  return seo({
    title: `${astrologer.displayName} - ${astrologer.specialization} at Naksharix`,
    description: `${astrologer.bio} Book a Naksharix consultation in ${astrologer.languages.join(", ")}.`,
    path: `/astrologers/${astrologer.id}`,
    keywords: [astrologer.specialization, "Astrologer Profile", "Astrology Consultation"]
  });
}

export default async function AstrologerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const astrologer = await prisma.astrologerProfile.findFirst({ where: { id, status: "APPROVED" } });
  if (!astrologer) notFound();

  const focusAreas = astrologer.skills.length ? astrologer.skills : astrologer.specialization.split(",").map((item) => item.trim()).filter(Boolean);
  const modes = [
    astrologer.availableForChat ? { label: "Chat", icon: MessageCircle } : null,
    astrologer.availableForCall ? { label: "Call", icon: Phone } : null,
    astrologer.availableForVideo ? { label: "Video", icon: Video } : null
  ].filter(Boolean) as { label: string; icon: typeof MessageCircle }[];

  return (
    <main className="star-field">
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">{astrologer.specialization}</p>
            <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border border-[#F5C542]/30 bg-[#12051f] text-3xl font-bold text-[#FFD36A]">
                {astrologer.photoUrl ? <Image src={astrologer.photoUrl} alt={astrologer.displayName} width={96} height={96} className="h-full w-full object-cover" /> : astrologer.displayName.slice(0, 1)}
              </div>
              <div>
                <h1 className="font-cinzel text-4xl font-black">{astrologer.displayName}</h1>
                {astrologer.introLine ? <p className="mt-2 text-lg naksh-muted-text">{astrologer.introLine}</p> : null}
              </div>
            </div>
            <p className="mt-6 max-w-3xl naksh-muted-text">{astrologer.bio}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#F5C542]/25 px-3 py-2">
                <BadgeCheck className="h-4 w-4 text-[#FFD36A]" /> Verified astrologer
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#F5C542]/25 px-3 py-2">
                <Star className="h-4 w-4 text-[#FFD36A]" /> {(astrologer.rating || 0).toFixed(1)} rating ({astrologer.reviewCount} reviews)
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#F5C542]/25 px-3 py-2">
                <CalendarClock className="h-4 w-4 text-[#FFD36A]" /> {astrologer.experienceYears}+ years
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#F5C542]/25 px-3 py-2">
                <Languages className="h-4 w-4 text-[#FFD36A]" /> {astrologer.languages.join(", ")}
              </span>
              {astrologer.city || astrologer.country ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-[#F5C542]/25 px-3 py-2">
                  <MapPin className="h-4 w-4 text-[#FFD36A]" /> {[astrologer.city, astrologer.country].filter(Boolean).join(", ")}
                </span>
              ) : null}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/consultation?astrologer=${astrologer.id}`}>Book Consultation</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Booking system coming soon</Link>
              </Button>
            </div>
          </div>
          <Card className="glass">
            <CardContent className="space-y-6 pt-6">
              <div>
                <p className="text-sm naksh-muted-text">Consultation rate</p>
                <p className="font-cinzel text-3xl font-bold text-[#FFD36A]">₹{Number(astrologer.consultationPrice).toLocaleString("en-IN")}/min</p>
                {astrologer.pricePerSession ? <p className="mt-1 text-sm naksh-muted-text">₹{Number(astrologer.pricePerSession).toLocaleString("en-IN")} per session</p> : null}
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-[#FFD36A]">Available for</p>
                <div className="flex flex-wrap gap-2">
                  {modes.length ? modes.map(({ label, icon: Icon }) => (
                    <span key={label} className="inline-flex items-center gap-2 rounded-full border border-[#F5C542]/20 px-3 py-2 text-sm"><Icon className="h-4 w-4" /> {label}</span>
                  )) : <span className="text-sm naksh-muted-text">Availability will be updated soon.</span>}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#FFD36A]">Expertise</p>
                {focusAreas.map((area) => (
                  <div key={area} className="rounded-md border border-[#F5C542]/20 bg-[#201037]/70 px-3 py-2 text-sm">
                    {area}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </main>
  );
}
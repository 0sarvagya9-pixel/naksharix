import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarClock, Languages, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { featuredAstrologers } from "@/lib/astrologers";
import { seo } from "@/lib/seo";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return featuredAstrologers.map((astrologer) => ({ id: astrologer.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const astrologer = featuredAstrologers.find((item) => item.id === id);
  if (!astrologer) return {};
  return seo({
    title: `${astrologer.name} - ${astrologer.specialty} at Naksharix`,
    description: `${astrologer.bio} Book a Naksharix consultation in ${astrologer.languages.join(", ")}.`,
    path: `/astrologers/${astrologer.id}`,
    keywords: [astrologer.specialty, "Astrologer Profile", "Astrology Consultation"]
  });
}

export default async function AstrologerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const astrologer = featuredAstrologers.find((item) => item.id === id);
  if (!astrologer) notFound();

  const focusAreas = ["Kundli review", "Career timing", "Relationship clarity", "Remedies", "Premium report guidance"];

  return (
    <main className="star-field">
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">{astrologer.specialty}</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black">{astrologer.name}</h1>
            <p className="mt-4 max-w-3xl text-muted-foreground">{astrologer.bio}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 px-3 py-2">
                <Star className="h-4 w-4 text-amber-200" /> {astrologer.rating} rating
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 px-3 py-2">
                <CalendarClock className="h-4 w-4 text-amber-200" /> {astrologer.experienceYears}+ years
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 px-3 py-2">
                <Languages className="h-4 w-4 text-amber-200" /> {astrologer.languages.join(", ")}
              </span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/consultation?astrologer=${astrologer.id}`}>Book Consultation</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/pricing">View Plans</Link>
              </Button>
            </div>
          </div>
          <Card className="glass">
            <CardContent className="space-y-5 pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Consultation rate</p>
                <p className="font-cinzel text-3xl font-bold text-amber-200">₹{astrologer.pricePerMinute}/min</p>
              </div>
              <div className="space-y-2">
                {focusAreas.map((area) => (
                  <div key={area} className="rounded-md border border-amber-200/15 bg-card/60 px-3 py-2 text-sm">
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

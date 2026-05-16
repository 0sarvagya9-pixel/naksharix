import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { seoLandingPages } from "@/lib/seo-pages";
import { seo } from "@/lib/seo";
import { env } from "@/lib/env";

export const metadata: Metadata = seo({
  title: "Astrology Services - Horoscope, Kundli, Numerology, Tarot Reading and Panchang",
  description: "Explore Naksharix Astrology services including Horoscope, Kundli, Numerology, Tarot Reading, Panchang, AI guidance, and premium cosmic reports.",
  path: "/astrology",
  keywords: ["Astrology", "Astrology Services", "AI Astrology", "Vedic Astrology"]
});

export default function AstrologySeoIndexPage() {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Naksharix Astrology Services",
    itemListElement: seoLandingPages.map((page, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: page.keyword,
      url: `${env.NEXT_PUBLIC_APP_URL}/astrology/${page.slug}`
    }))
  };

  return (
    <main className="star-field">
      <Script id="astrology-services-schema" type="application/ld+json">
        {JSON.stringify(itemListSchema)}
      </Script>
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Naksharix SEO Hub</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black sm:text-5xl">Astrology Services</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
          Discover premium astrology tools for Horoscope, Kundli, Numerology, Tarot Reading, Panchang, compatibility, AI remedies, and personalized cosmic guidance.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {seoLandingPages.map(({ slug, keyword, description, icon: Icon }) => (
            <Link key={slug} href={`/astrology/${slug}`}>
              <Card className="h-full border-amber-200/15 bg-card/75 transition hover:-translate-y-1 hover:border-amber-200/45">
                <CardContent className="p-6">
                  <Icon className="h-6 w-6 text-amber-200" />
                  <h2 className="mt-5 font-cinzel text-xl font-bold">{keyword}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
                  <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-200">
                    Explore <ArrowRight className="h-4 w-4" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { nakshatras, titleFromSlug } from "@/lib/growth-pages";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "27 Nakshatra Pages - Naksharix",
  description: "Explore all 27 Nakshatra pages with meaning, personality themes, remedies, and internal links to Kundli and horoscope tools.",
  path: "/nakshatra",
  keywords: ["Nakshatra", "27 Nakshatra"]
});

export default function NakshatraIndexPage() {
  return (
    <main className="star-field">
      <Section>
        <h1 className="font-cinzel text-4xl font-black">27 Nakshatra Pages</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">Explore lunar mansion meanings and connect them with Kundli, horoscope, and AI guidance workflows.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nakshatras.map((slug) => (
            <Link key={slug} href={`/nakshatra/${slug}`}>
              <Card className="h-full border-[#D4AF37]/20 bg-[#061D3C]/75 transition hover:border-[#D4AF37]/55">
                <CardContent className="p-5">
                  <h2 className="font-cinzel text-xl font-bold">{titleFromSlug(slug)}</h2>
                  <p className="mt-2 text-sm naksh-muted-text">Meaning, traits, remedies, and Kundli links.</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </main>
  );
}

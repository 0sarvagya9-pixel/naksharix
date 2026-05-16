import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Search Naksharix Astrology Tools",
  description: "Search Naksharix astrology tools for horoscope, kundli, numerology, tarot reading, panchang, paid reports, and AI astrology chat.",
  path: "/search",
  keywords: ["Astrology Search", "Horoscope", "Kundli", "Tarot"]
});

const results = [
  ["Today Horoscope", "/horoscope/all-signs/today"],
  ["Free Kundli", "/kundli"],
  ["Kundli Milan", "/matchmaking"],
  ["Premium Reports", "/reports"],
  ["AI Astrology Chat", "/chatbot"],
  ["Astrology Blog", "/blog"]
];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = params.q?.trim();
  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Search</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Search Naksharix</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">{query ? `Showing recommended astrology tools for "${query}".` : "Explore the most-used Naksharix astrology tools."}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(([label, href]) => (
            <Link key={href} href={href}>
              <Card className="glass h-full transition hover:border-amber-200/45">
                <CardHeader><CardTitle className="flex items-center gap-2 font-cinzel"><Search className="h-4 w-4 text-amber-200" />{label}</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">Open {label.toLowerCase()} on Naksharix.</CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </main>
  );
}


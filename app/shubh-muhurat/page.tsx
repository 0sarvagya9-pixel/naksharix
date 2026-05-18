import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";
import { getPanchang } from "@/lib/astrology/engine";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Shubh Muhurat Finder - Naksharix",
  description: "Find Shubh Muhurat for marriage, griha pravesh, business start, puja, travel, and important decisions with Naksharix Panchang.",
  path: "/shubh-muhurat",
  keywords: ["Shubh Muhurat", "Muhurat Finder", "Panchang", "Auspicious Time"]
});

const categories = ["Marriage Muhurat", "Griha Pravesh", "Business Start", "Vehicle Purchase", "Puja Muhurat", "Travel Muhurat"];

export default function ShubhMuhuratPage() {
  const panchang = getPanchang();
  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">Muhurat Finder</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Shubh Muhurat</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">Use Naksharix for auspicious timing categories and daily panchang context. For major rituals, confirm with a qualified astrologer.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild><Link href="/consultation">Consult Astrologer</Link></Button>
          <Button variant="outline" asChild><Link href="/panchang">View Panchang</Link></Button>
        </div>
        <Card className="glass mt-10">
          <CardContent className="p-6">
            <Clock className="h-6 w-6 text-[#FFD36A]" />
            <h2 className="mt-4 font-cinzel text-2xl font-black">Today&apos;s highlighted Muhurat</h2>
            <p className="mt-3 text-lg text-[#FFD36A]">{panchang.muhurat}</p>
            <p className="mt-2 text-sm naksh-muted-text">Choghadiya: {panchang.choghadiya} · Nakshatra: {panchang.nakshatra} · Tithi: {panchang.tithi}</p>
          </CardContent>
        </Card>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category} className="border-[#F5C542]/20 bg-[#201037]/75">
              <CardContent className="p-5">
                <Sparkles className="h-5 w-5 text-[#FFD36A]" />
                <h2 className="mt-4 font-cinzel text-xl font-bold">{category}</h2>
                <p className="mt-3 text-sm leading-6 naksh-muted-text">Use location, panchang, lunar day, nakshatra, and family context before finalizing this timing.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}

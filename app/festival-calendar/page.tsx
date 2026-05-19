import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Hindu Festival Calendar 2026 - Naksharix",
  description: "Explore Naksharix festival calendar with Hindu festivals, vrata days, panchang links, and shubh muhurat planning.",
  path: "/festival-calendar",
  keywords: ["Festival Calendar", "Hindu Calendar", "Panchang", "Vrata"]
});

const festivals = [
  ["Makar Sankranti", "January 2026", "Sun transition and harvest gratitude."],
  ["Maha Shivratri", "February 2026", "Devotional discipline, fasting, and Shiva worship."],
  ["Holi", "March 2026", "Color, renewal, and relationship repair."],
  ["Akshaya Tritiya", "April 2026", "Auspicious start, charity, and prosperity rituals."],
  ["Raksha Bandhan", "August 2026", "Family bonds and protection prayers."],
  ["Diwali", "November 2026", "Lakshmi puja, light, prosperity, and renewal."]
];

export default function FestivalCalendarPage() {
  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Hindu Calendar</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Festival Calendar 2026</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">Plan important festivals, vrata days, devotional routines, and auspicious windows with Naksharix Panchang and Muhurat tools.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild><Link href="/panchang">Today&apos;s Panchang</Link></Button>
          <Button variant="outline" asChild><Link href="/shubh-muhurat">Find Shubh Muhurat</Link></Button>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {festivals.map(([name, date, copy]) => (
            <Card key={name} className="border-[#D4AF37]/20 bg-[#061D3C]/75">
              <CardContent className="p-5">
                <CalendarDays className="h-5 w-5 text-[#FFD700]" />
                <h2 className="mt-4 font-cinzel text-xl font-bold">{name}</h2>
                <p className="mt-1 text-sm text-[#FFD700]">{date}</p>
                <p className="mt-3 text-sm leading-6 naksh-muted-text">{copy}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
    title: "Today Panchang Coming Soon | Naksharix",
    description: "Naksharix is holding Today Panchang until location-aware tithi, nakshatra, yoga, karana, rahu kaal, and muhurat calculations are fully verified.",
    path: "/panchang",
    keywords: ["Panchang", "Today Panchang", "Tithi", "Rahu Kaal"]
  }),
  robots: { index: false, follow: true }
};

export default function PanchangComingSoonPage() {
  return (
    <main className="inner-page-shell star-field min-h-screen">
      <Section>
        <div className="inner-section rounded-3xl border border-[#263957] p-6 text-center md:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#dca956]/35 bg-[#142647] text-[#f3d382] shadow-[0_0_34px_rgba(0,245,160,0.14)]">
            <CalendarDays className="h-8 w-8" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-[#00f5a0]">Coming Soon</p>
          <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382] sm:text-5xl">Today&apos;s Panchang Coming Soon</h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-[#a8b3c7]">
            Accurate Panchang depends on date, location, timezone, sunrise, sunset, lunar position, tithi, nakshatra, yoga, karana, Rahu Kaal, Yamaganda, Gulika Kaal, and Abhijit Muhurat.
          </p>
          <Card className="inner-card mx-auto mt-8 max-w-3xl text-left">
            <CardContent className="p-6">
              <ShieldCheck className="h-6 w-6 text-[#00f5a0]" />
              <h2 className="mt-4 font-cinzel text-2xl font-bold text-[#f3d382]">Why this is on hold</h2>
              <p className="mt-3 text-sm leading-7 text-[#a8b3c7]">
                Naksharix will not show approximate or static Panchang as a live result. This page will be activated only after the calculation engine is verified with deterministic location-aware test cases.
              </p>
            </CardContent>
          </Card>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-[#009b72] text-white hover:bg-[#008766]"><Link href="/kundli">Use Kundli Generator</Link></Button>
            <Button variant="outline" asChild><Link href="/free-calculators">Explore Free Calculators</Link></Button>
          </div>
        </div>
      </Section>
    </main>
  );
}

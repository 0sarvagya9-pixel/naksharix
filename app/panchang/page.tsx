import { getPanchang } from "@/lib/astrology/engine";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, Moon, Sparkles, Sun, TimerReset } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import type React from "react";
import { seo } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = seo({
  title: "Panchang - Tithi, Nakshatra, Rahu Kaal and Muhurat",
  description: "View Naksharix Panchang details including tithi, nakshatra, rahu kaal, choghadiya, sunrise, sunset, festivals, and muhurat.",
  path: "/panchang",
  keywords: ["Panchang", "Tithi", "Nakshatra", "Rahu Kaal", "Muhurat"]
});

export default function PanchangPage() {
  const panchang = getPanchang();
  const highlights = [
    { label: "Tithi", value: panchang.tithi, icon: Moon },
    { label: "Nakshatra", value: panchang.nakshatra, icon: Sparkles },
    { label: "Rahu Kaal", value: panchang.rahuKaal, icon: TimerReset },
    { label: "Muhurat", value: panchang.muhurat, icon: Clock }
  ];

  return (
    <main className="star-field">
      <Section>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Daily Panchang</p>
          <h1 className="mt-3 font-cinzel text-4xl font-black sm:text-5xl">Today&apos;s Panchang</h1>
          <p className="mt-4 text-muted-foreground">A clean daily view of tithi, nakshatra, rahu kaal, choghadiya, sunrise, sunset, festivals, and auspicious timing.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild><Link href="/festival-calendar">Festival Calendar</Link></Button>
            <Button variant="outline" asChild><Link href="/shubh-muhurat">Shubh Muhurat</Link></Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Icon className="h-5 w-5 text-amber-200" />{label}</CardTitle>
              </CardHeader>
              <CardContent><p className="font-cinzel text-2xl font-bold">{value}</p></CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="glass">
            <CardHeader><CardTitle className="font-cinzel text-2xl">Auspicious Day Planner</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <PanchangRow label="Date" value={panchang.date} />
              <PanchangRow label="Choghadiya" value={panchang.choghadiya} />
              <PanchangRow label="Sunrise" value={panchang.sunrise} icon={<Sun className="h-4 w-4" />} />
              <PanchangRow label="Sunset" value={panchang.sunset} icon={<Sun className="h-4 w-4" />} />
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader><CardTitle className="font-cinzel text-2xl">Festival Note</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border border-amber-200/20 bg-white/[0.04] p-4">
                <CalendarDays className="mb-3 h-5 w-5 text-amber-200" />
                <p className="leading-7 text-muted-foreground">{panchang.festival ?? "No major festival is highlighted for this generated panchang. Use the muhurat window for focused planning and devotional routines."}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </main>
  );
}

function PanchangRow({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  return <div className="rounded-lg border border-amber-200/20 bg-white/[0.04] p-4"><p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{icon}{label}</p><p className="mt-2 font-semibold">{value ?? "None"}</p></div>;
}

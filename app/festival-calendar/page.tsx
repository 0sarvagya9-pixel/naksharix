import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { seo } from "@/lib/seo";
import { nextTwoYearsPujaCalendar } from "@/lib/puja/observances";

export const dynamic = "force-dynamic";
export const metadata: Metadata = seo({
  title: "Upcoming Hindu Festival Calendar | Naksharix",
  description: "Explore a rolling, source-reviewed two-year calendar for Hindu Puja festivals, vrats and traditional celebrations. Cross-check local tithi and muhurat.",
  path: "/festival-calendar",
  keywords: ["Festival Calendar", "Hindu Calendar", "Panchang", "Puja Dates", "Vrat"]
});

export default function FestivalCalendarPage() {
  const calendar = nextTwoYearsPujaCalendar();
  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Hindu Calendar</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Upcoming Festival Calendar</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">
          Major India-reference dates automatically follow the current two-year window.
          Regional tithi, city-specific muhurat and actual temple availability must be confirmed.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild><Link href="/puja-calendar">Explore full two-year Puja calendar</Link></Button>
          <Button variant="outline" asChild><Link href="/panchang">Check local Panchang</Link></Button>
          <Button variant="outline" asChild><Link href="/puja-enquiry">Enquire about Puja</Link></Button>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {calendar.events.slice(0, 12).map((event) => (
            <Card key={event.id} className="border-[#D4AF37]/20 bg-[#061D3C]/75">
              <CardContent className="p-5">
                <CalendarDays className="h-5 w-5 text-[#FFD700]" />
                <h2 className="mt-4 font-cinzel text-xl font-bold">{event.name}</h2>
                <p className="mt-2 text-sm text-[#FFD700]">{event.date}</p>
                <p className="mt-3 text-xs naksh-muted-text">
                  Reference date only. No confirmed temple or payment booking.
                </p>
                <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs underline text-[#FFD700]">Check date source</a>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}

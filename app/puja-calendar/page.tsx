import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/seo";
import { nextTwoYearsPujaCalendar } from "@/lib/puja/observances";

export const dynamic = "force-dynamic";

export const metadata: Metadata = seo({
  title: "Next Two Years Hindu Puja and Festival Calendar",
  description: "Explore a rolling two-year Hindu festival and Puja schedule, using reviewed India-reference dates. Local muhurat and bookings must be confirmed.",
  path: "/puja-calendar",
  keywords: ["Hindu Puja Calendar", "Diwali", "Navratri", "Hindu Festival Calendar", "Panchang", "Puja dates"]
});

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  timeZone: "UTC", day: "numeric", month: "long", year: "numeric", weekday: "short"
});
function displayDate(iso: string) {
  return dateFormat.format(new Date(iso + "T12:00:00Z"));
}

export default function PujaCalendarPage() {
  const calendar = nextTwoYearsPujaCalendar();
  const groups = new Map<string, typeof calendar.events>();
  for (const item of calendar.events) {
    const month = item.date.slice(0, 7);
    groups.set(month, [...(groups.get(month) || []), item]);
  }
  return (
    <main className="star-field min-h-screen">
      <Section>
        <div className="rounded-3xl border border-[#D4AF37]/30 bg-[#061D3C]/80 p-6 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FFD700]">Hindu calendar • India reference</p>
          <h1 className="mt-3 font-cinzel text-3xl font-black sm:text-5xl">Upcoming Puja Calendar</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 naksh-muted-text">
            A date-ordered list of major Hindu pujas, vrats and festivals. The next two calendar years
            automatically move forward with today&apos;s date in India. All dates are reference dates,
            not guaranteed ceremony slots.
          </p>
          <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#FFD700]">
            <CalendarDays className="h-4 w-4" /> {displayDate(calendar.from)} to before {displayDate(calendar.untilExclusive)}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild><Link href="/panchang">Verify local Panchang</Link></Button>
            <Button variant="outline" asChild><Link href="/puja-enquiry">Ask about Puja arrangements</Link></Button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#061D3C]/75 p-5 text-sm leading-7 naksh-muted-text">
            <MapPin className="mb-2 h-5 w-5 text-[#FFD700]" />
            Festival observance may differ by city, sect and local sunrise/tithi.
            Confirm muhurat with a local Panchang and your priest before planning a ceremony.
          </div>
          <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#061D3C]/75 p-5 text-sm leading-7 naksh-muted-text">
            <ShieldCheck className="mb-2 h-5 w-5 text-[#FFD700]" />
            No temple, priest, price, stock, payment or fulfillment is reserved by a listing.
            This is a curated major-festival index, not every regional observance.
          </div>
        </div>
        <div className="mt-9 space-y-9">
          {[...groups.entries()].map(([month, items]) => (
            <section key={month} aria-labelledby={"calendar-" + month}>
              <h2 id={"calendar-" + month} className="mb-4 font-cinzel text-2xl font-bold text-[#FFD700]">
                {new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", month: "long", year: "numeric" })
                  .format(new Date(month + "-01T12:00:00Z"))}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((event) => (
                  <Card key={event.id} className="border-[#D4AF37]/20 bg-[#061D3C]/75">
                    <CardContent className="flex h-full flex-col p-5">
                      <CalendarDays className="h-5 w-5 text-[#FFD700]" />
                      <h3 className="mt-3 font-cinzel text-xl font-bold">{event.name}</h3>
                      <p className="mt-2 text-sm text-[#FFD700]">{displayDate(event.date)}</p>
                      <p className="mt-3 text-xs naksh-muted-text">Information only • booking not available</p>
                      <div className="mt-auto flex flex-wrap gap-4 pt-5 text-sm">
                        <Link href={"/commerce-enquiry?kind=PUJA&item=" + encodeURIComponent(event.id)} className="font-semibold text-[#FFD700] hover:underline">Enquire about this Puja</Link>
                        <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="naksh-muted-text hover:underline">Source date</a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
        {!calendar.events.length && <p className="mt-8 naksh-muted-text">No reviewed observances are available in this window. Calendar source review is required.</p>}
        {calendar.futureYearsRequireReview &&
          <p className="mt-8 rounded-xl border border-amber-500/30 p-4 text-sm naksh-muted-text">
            A future calendar year is not yet source-reviewed. Missing dates are intentionally not invented.
          </p>}
      </Section>
    </main>
  );
}

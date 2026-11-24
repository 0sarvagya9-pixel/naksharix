import { EditorialServiceBanner } from "@/components/home/editorial-service-banner";
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/seo";
import { nextTwoYearsPujaCalendar } from "@/lib/puja/observances";
import { pujaEditorialImage } from "@/lib/puja/editorial-photos";
import { getPujaRequestState as getPujaLaunchState } from "@/lib/puja/request-readiness";
import { KumbhEventCards } from "@/components/puja/kumbh-event-promotion";

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

export default async function PujaCalendarPage() {
  const launch = await getPujaLaunchState();
  const calendar = nextTwoYearsPujaCalendar();
  const groups = new Map<string, typeof calendar.events>();
  for (const item of calendar.events) {
    const month = item.date.slice(0, 7);
    groups.set(month, [...(groups.get(month) || []), item]);
  }
  return (
    <main className="star-field min-h-screen nx-puja-calendar">
      <EditorialServiceBanner eyebrow="TRADITIONAL HINDU CALENDAR"
        headline="Follow the seasons of worship"
        caption="Explore a rolling two-year reference list of major Puja and festival dates. Confirm regional customs and local tithi independently."
        image={pujaEditorialImage("griha-pravesh-puja","/naksharix/editorial-puja.svg","family")} imageAlt="Representative licensed photograph of a traditional Puja ceremony"
        link="/pujas" linkLabel={launch.enabled ? "Explore available Pujas" : "Puja service availability"} />
      {launch.enabled && <KumbhEventCards offerings={launch.offers} initialNow={Date.now()}/>}
      <Section>
        <div className="rounded-[1.7rem] border border-[#D6AB67]/55 bg-[linear-gradient(115deg,#421b2b_0%,#702a39_60%,#8b4239_100%)] p-6 text-[#fffaf2] shadow-[0_25px_70px_rgba(65,23,36,.17)] md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FFD700]">Hindu calendar • India reference</p>
          <h1 className="mt-3 font-cinzel text-3xl font-black text-[#fffaf2] sm:text-5xl">Upcoming Puja Calendar</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#f8e9de]">
            A date-ordered list of major Hindu pujas, vrats and festivals. The next two calendar years
            automatically move forward with today&apos;s date in India. All dates are reference dates,
            not guaranteed ceremony slots.
          </p>
          <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#FFD700]">
            <CalendarDays className="h-4 w-4" /> {displayDate(calendar.from)} to before {displayDate(calendar.untilExclusive)}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild><Link href="/panchang">Verify local Panchang</Link></Button>
            <Button variant="outline" asChild><Link href="/kumbh-mela-2027">Kumbh Mela 2027 dates</Link></Button>
            <Button variant="outline" asChild><Link href="/festival-calendar">Festival and vrat guide</Link></Button>
            <Button variant="outline" asChild><Link href="/pujas">{launch.enabled ? "Explore available Puja services" : "Check current Puja service status"}</Link></Button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#e6c49a] bg-[#fff8ee] p-5 text-sm leading-7 text-[#503942]">
            <MapPin className="mb-2 h-5 w-5 text-[#8b3041]" />
            Festival observance may differ by city, sect and local sunrise/tithi.
            Confirm muhurat with a local Panchang and your priest before planning a ceremony.
          </div>
          <div className="rounded-2xl border border-[#e6c49a] bg-[#fff8ee] p-5 text-sm leading-7 text-[#503942]">
            <ShieldCheck className="mb-2 h-5 w-5 text-[#8b3041]" />
            {launch.enabled
              ? "These festival dates are educational reference dates, not reserved slots. For listed services, request a date first; a verified Pandit must accept and the final schedule must be confirmed before payment."
              : "These dates are for planning and education only. New Naksharix Puja bookings and online Puja payments are currently paused."}
          </div>
        </div>
        <div className="mt-9 space-y-9">
          {[...groups.entries()].map(([month, items]) => (
            <section key={month} aria-labelledby={"calendar-" + month}>
              <h2 id={"calendar-" + month} className="mb-4 font-cinzel text-2xl font-bold text-[#702638]">
                {new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", month: "long", year: "numeric" })
                  .format(new Date(month + "-01T12:00:00Z"))}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((event) => (
                  <Card key={event.id} className="h-full border-[#e9d0b0] bg-[#fffcf8] text-[#36252d] shadow-[0_12px_30px_rgba(80,39,45,.055)]">
                    <CardContent className="flex h-full flex-col p-5">
                      <CalendarDays className="h-5 w-5 text-[#a35b32]" />
                      <h3 className="mt-3 font-cinzel text-xl font-bold text-[#412834]">{event.name}</h3>
                      <p className="mt-2 text-sm font-semibold text-[#863345]">{displayDate(event.date)}</p>
                      
                      <div className="mt-auto flex flex-wrap gap-4 pt-5 text-sm">
                        <Link href="/pujas" className="font-semibold text-[#83303f] underline-offset-4 hover:underline">{launch.enabled ? "Browse available Pujas — request before payment" : "Puja bookings currently paused"}</Link>
                        <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#68565a] underline-offset-4 hover:underline">Source date</a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
        {!calendar.events.length && <p className="mt-8 text-[#55434b]">No festival dates are listed for this period. Please check again later.</p>}
        {calendar.futureYearsRequireReview &&
          <p className="mt-8 rounded-xl border border-[#dec59c] bg-[#fff6e8] p-4 text-sm text-[#674539]">
            Additional festival dates will appear as they become available.
          </p>}
      </Section>
    </main>
  );
}

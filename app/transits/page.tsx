import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionShell, StatusBadge, TrustNote } from "@/components/premium-light-ui";
import { calculateInternalTransitSnapshot, calculateUpcomingTransitTimeline } from "@/lib/astrology/transit/engine";

export const metadata: Metadata = {
  title: "Current Gochar Snapshot | Naksharix",
  description: "Provider-calculated current transit planet positions for general spiritual reflection. Not a personalized transit prediction.",
  alternates: { canonical: "https://naksharix.com/transits" },
  openGraph: {
    title: "Current Gochar Snapshot | Naksharix",
    description: "Provider-calculated transit positions with clear source and limitation notes.",
    url: "https://naksharix.com/transits",
    siteName: "Naksharix"
  }
};

const planetMeanings: Record<string, string> = {
  Sun: "identity, vitality, and visible direction",
  Moon: "mood, responsiveness, and emotional rhythm",
  Mars: "drive, courage, and action style",
  Mercury: "thinking, speech, learning, and trade",
  Jupiter: "growth, wisdom, and long-range guidance",
  Venus: "harmony, comfort, love, and aesthetics",
  Saturn: "discipline, responsibility, structure, and maturity",
  Rahu: "worldly focus, amplification, and unfamiliar growth",
  Ketu: "detachment, insight, and inward refinement"
};

export default function TransitsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const snapshot = calculateInternalTransitSnapshot({
    date: today,
    timezone: "+05:30",
    latitude: 28.6139,
    longitude: 77.209,
    place: "Delhi, India",
    ayanamsa: "lahiri"
  });
  const timeline = calculateUpcomingTransitTimeline(snapshot.input!, 45);

  return (
    <main className="inner-page-shell min-h-screen">
    <SectionShell className="space-y-8">
      <div className="max-w-4xl space-y-4">
        <StatusBadge label="Provider-calculated gochar" tone="gold" />
        <h1 className="font-cinzel text-4xl font-black text-[#1F2933] md:text-5xl">Current Transit Snapshot</h1>
        <p className="max-w-3xl text-[#6B7280]">
          This page shows a general transit position snapshot calculated by the Naksharix internal astrology engine for a fixed Delhi reference at local noon.
          It is educational and is not a personalized birth-chart transit prediction.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {snapshot.positions.map((position) => (
          <Card key={position.planet} className="border-[#E7D8BE] bg-white/88">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg text-[#1F2933]">
                {position.planet}
                <span className="rounded-full border border-[#D8AF66]/35 bg-[#F7EAD3]/70 px-3 py-1 text-xs text-[#B8862E]">{position.sign}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[#6B7280]">
              <p><span className="font-semibold text-[#1F2933]">Degree:</span> {position.degree == null ? "Unavailable" : `${position.degree.toFixed(2)} deg`}</p>
              <p><span className="font-semibold text-[#1F2933]">Absolute longitude:</span> {position.absoluteLongitude?.toFixed(2) ?? "Unavailable"} deg</p>
              <p><span className="font-semibold text-[#1F2933]">Retrograde:</span> {position.retrograde === null ? "Not supported" : position.retrograde ? "Yes" : "No"}</p>
              <p>{planetMeanings[position.planet] ?? "general transit reflection"}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#D8AF66]/35 bg-white/88">
        <CardHeader>
          <CardTitle className="text-[#1F2933]">Upcoming Provider-Scanned Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-[#6B7280]">
          {timeline.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {timeline.slice(0, 8).map((event) => (
                <div key={`${event.planet}-${event.eventType}-${event.date}`} className="rounded-lg border border-[#E7D8BE] bg-[#FFF9F0]/75 p-4">
                  <p className="font-semibold text-[#1F2933]">{event.planet} {event.eventType.replaceAll("_", " ")}</p>
                  <p className="text-[#B8862E]">{event.date}</p>
                  <p>{String(event.from ?? "Unavailable")} → {String(event.to ?? "Unavailable")}</p>
                  <p className="mt-2 text-xs text-[#6B7280]">{event.note}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No provider-scanned sign or retrograde changes were detected in the next 45 days for this reference snapshot.</p>
          )}
        </CardContent>
      </Card>

      <TrustNote>
        <div className="space-y-3">
          <h2 className="font-cinzel text-xl font-bold text-[#1F2933]">Source & Limits</h2>
          <p>Source: {snapshot.metadata.provider}. Verification level: {snapshot.metadata.verificationLevel}.</p>
          <p>The timeline is detected by daily provider scans, so exact ingress or station minutes still require external transit fixtures. Personalized transit impact remains Coming Soon until natal overlay rules pass QA.</p>
          <p>Values may vary slightly by source. Use this for spiritual reflection and cross-check critical decisions with a qualified professional.</p>
          <Link href="/reports" className="inline-flex font-semibold text-[#B8862E] hover:underline">Explore detailed reports</Link>
        </div>
      </TrustNote>
    </SectionShell>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateInternalTransitSnapshot } from "@/lib/astrology/transit/engine";

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

  return (
    <Section className="space-y-8">
      <div className="max-w-4xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f3d382]">Provider-calculated gochar</p>
        <h1 className="font-cinzel text-4xl text-white md:text-5xl">Current Transit Snapshot</h1>
        <p className="max-w-3xl text-slate-300">
          This page shows a general transit position snapshot calculated by the Naksharix internal astrology engine for a fixed Delhi reference at local noon.
          It is educational and is not a personalized birth-chart transit prediction.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {snapshot.positions.map((position) => (
          <Card key={position.planet} className="border-[#1e293b] bg-[#0f1c3a]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg text-white">
                {position.planet}
                <span className="rounded-full border border-[#dca956]/30 px-3 py-1 text-xs text-[#f3d382]">{position.sign}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p><span className="text-white">Degree:</span> {position.degree == null ? "Unavailable" : `${position.degree.toFixed(2)} deg`}</p>
              <p><span className="text-white">Absolute longitude:</span> {position.absoluteLongitude?.toFixed(2) ?? "Unavailable"} deg</p>
              <p><span className="text-white">Retrograde:</span> {position.retrograde === null ? "Not supported" : position.retrograde ? "Yes" : "No"}</p>
              <p>{planetMeanings[position.planet] ?? "general transit reflection"}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#dca956]/25 bg-[#0a1224]">
        <CardHeader>
          <CardTitle className="text-white">Source & Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          <p>Source: {snapshot.metadata.provider}. Verification level: {snapshot.metadata.verificationLevel}.</p>
          <p>Ingress dates, retrograde windows, and personalized transit impact remain Coming Soon until stricter fixtures and natal overlay rules pass QA.</p>
          <p>Values may vary slightly by source. Use this for spiritual reflection and cross-check critical decisions with a qualified professional.</p>
          <Link href="/reports" className="inline-flex text-[#f3d382] hover:underline">Explore detailed reports</Link>
        </CardContent>
      </Card>
    </Section>
  );
}

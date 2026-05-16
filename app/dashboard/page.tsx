"use client";

import Link from "next/link";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { Bell, Bot, CalendarClock, Clock, CreditCard, FileText, Gem, HeartPulse, MoonStar, Sparkles, Star, type LucideIcon } from "lucide-react";
import { AstroTool } from "@/components/astro-tool";
import { PaymentHistory } from "@/components/payment-history";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [{ name: "Mon", v: 4 }, { name: "Tue", v: 8 }, { name: "Wed", v: 6 }, { name: "Thu", v: 12 }, { name: "Fri", v: 10 }];
const stats = [
  { label: "Saved Kundlis", value: "12", icon: FileText, tone: "from-violet-500/25 to-amber-300/15" },
  { label: "Cosmic Credits", value: "125", icon: Star, tone: "from-amber-300/25 to-violet-500/15" },
  { label: "Plan", value: "Premium", icon: CreditCard, tone: "from-fuchsia-500/20 to-amber-300/15" },
  { label: "AI Sessions", value: "34", icon: Bot, tone: "from-indigo-400/25 to-amber-300/15" }
];
const premiumActions: { title: string; copy: string; icon: LucideIcon }[] = [
  { title: "Premium Remedies", copy: "AI-generated gemstone, mantra, and puja recommendations.", icon: Gem },
  { title: "Daily Rituals", copy: "Personalized horoscope nudges and notification-ready rituals.", icon: Sparkles },
  { title: "Report Vault", copy: "Favorite kundlis, tarot readings, invoices, and paid reports.", icon: FileText }
];
const upcoming = [
  { title: "Vedic consultation request", meta: "Today - 7:30 PM - Chat" },
  { title: "Kundli Pro Report", meta: "Ready for checkout" },
  { title: "Friday tarot reflection", meta: "Saved to favorites" }
];
const dailyGuidance = [
  { label: "Cosmic Score", value: "82/100", detail: "Strong for planning and honest conversations.", icon: Sparkles },
  { label: "Lucky Number", value: "7", detail: "Use it for focus, not superstition.", icon: Star },
  { label: "Lucky Color", value: "Royal Gold", detail: "Best for confidence and visibility.", icon: Gem },
  { label: "Lucky Time", value: "6:30 PM", detail: "Good window for reflection and outreach.", icon: Clock }
];
const planetStrength = [
  ["Sun", 76],
  ["Moon", 64],
  ["Mars", 58],
  ["Mercury", 82],
  ["Jupiter", 71]
];
const dashas = [
  ["Mercury", "Now - Aug 2026"],
  ["Ketu", "Aug 2026 - Jul 2027"],
  ["Venus", "Jul 2027 - Jul 2030"]
];
const remedies = ["10 minutes morning silence", "Offer gratitude before major decisions", "Keep communication direct but gentle"];

export default function DashboardPage() {
  return (
    <Section className="star-field">
      <div className="relative overflow-hidden rounded-lg border border-amber-200/20 bg-[linear-gradient(135deg,rgba(72,36,128,0.78),rgba(18,9,31,0.94)_58%,rgba(166,119,42,0.48))] p-6 sm:p-8">
        <div className="absolute right-8 top-6 hidden h-28 w-28 rounded-full border border-amber-200/20 md:block" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Naksharix Premium</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black">Cosmic Dashboard</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">Track kundlis, horoscope history, AI guidance, subscriptions, credits, and premium astrology reports from one refined workspace.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/consultation">
                  <CalendarClock className="h-4 w-4" />
                  Book Consultation
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/reports">Buy Report</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/chatbot">Open AI Chat</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/dashboard/consultations">Consultation History</Link>
              </Button>
            </div>
          </div>
          <div className="grid h-20 w-20 place-items-center rounded-lg border border-amber-200/25 bg-amber-200/10">
            <MoonStar className="h-9 w-9 text-amber-200" />
          </div>
        </div>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className={`border-amber-200/15 bg-gradient-to-br ${tone}`}>
            <CardContent className="pt-5">
              <Icon className="h-5 w-5 text-amber-200" />
              <p className="mt-4 font-cinzel text-3xl font-black">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-4">
        {dailyGuidance.map(({ label, value, detail, icon: Icon }) => (
          <Card key={label} className="border-amber-200/15 bg-card/75">
            <CardContent className="p-5">
              <Icon className="h-5 w-5 text-amber-200" />
              <p className="mt-4 font-cinzel text-2xl font-black">{value}</p>
              <p className="text-sm font-medium">{label}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-amber-200/15 bg-card/75">
          <CardHeader><CardTitle className="font-cinzel">Weekly Cosmic Activity</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%"><BarChart data={data}><XAxis dataKey="name" /><Tooltip /><Bar dataKey="v" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
          </CardContent>
        </Card>
        <AstroTool type="chat" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="border-amber-200/15 bg-card/75">
          <CardHeader><CardTitle className="font-cinzel">Kundli Overview</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {["Lagna: Virgo", "Moon sign: Taurus", "Nakshatra: Rohini", "Current focus: steady career growth"].map((item) => <p key={item} className="rounded-md border border-amber-200/15 bg-background/45 p-3">{item}</p>)}
          </CardContent>
        </Card>
        <Card className="border-amber-200/15 bg-card/75">
          <CardHeader><CardTitle className="font-cinzel">Planet Strength</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {planetStrength.map(([planet, value]) => (
              <div key={planet}>
                <div className="mb-1 flex justify-between text-sm"><span>{planet}</span><span>{value}%</span></div>
                <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-amber-200" style={{ width: `${value}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-amber-200/15 bg-card/75">
          <CardHeader><CardTitle className="font-cinzel">Dasha Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {dashas.map(([planet, time]) => (
              <div key={planet} className="border-l border-amber-200/30 pl-3">
                <p className="font-semibold">{planet}</p>
                <p className="text-sm text-muted-foreground">{time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-amber-200/15 bg-card/75">
          <CardHeader><CardTitle className="font-cinzel">Upcoming and Recent</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {upcoming.map((item) => (
              <div key={item.title} className="rounded-md border border-amber-200/15 bg-background/45 p-3">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.meta}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-amber-200/15 bg-card/75">
          <CardHeader><CardTitle className="font-cinzel">Account Workspace</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              ["Subscription", "/pricing"],
              ["Payment history", "/reports"],
              ["Saved kundlis", "/kundli"],
              ["Favorite reports", "/dashboard"]
            ].map(([label, href]) => (
              <Button key={label} variant="outline" asChild>
                <Link href={href}>{label}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="border-amber-200/15 bg-card/75">
          <CardHeader><CardTitle className="font-cinzel">Streak and Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="rounded-md border border-amber-200/15 bg-background/45 p-3 text-sm text-muted-foreground">12-day guidance streak. Ask today’s question to keep it alive.</p>
            {["Daily horoscope", "Report delivery", "Consultation reminders"].map((label) => (
              <label key={label} className="flex items-center justify-between rounded-md border border-amber-200/15 bg-background/45 p-3 text-sm">
                <span className="flex items-center gap-2"><Bell className="h-4 w-4 text-amber-200" />{label}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </label>
            ))}
          </CardContent>
        </Card>
        <Card className="border-amber-200/15 bg-card/75">
          <CardHeader><CardTitle className="font-cinzel">Recommended Remedies</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {remedies.map((remedy) => <p key={remedy} className="rounded-md border border-amber-200/15 bg-background/45 p-3 text-sm text-muted-foreground"><HeartPulse className="mr-2 inline h-4 w-4 text-amber-200" />{remedy}</p>)}
          </CardContent>
        </Card>
        <Card className="border-amber-200/15 bg-card/75">
          <CardHeader><CardTitle className="font-cinzel">Today’s Question</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">Ask one focused question about your day, then save the answer in chat history.</p>
            <Button className="mt-4 w-full" asChild><Link href="/chatbot">Ask today’s question</Link></Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <PaymentHistory />
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {premiumActions.map(({ title, copy, icon: Icon }) => (
          <Card key={title} className="border-amber-200/15 bg-card/70">
            <CardContent className="p-5">
              <Icon className="h-5 w-5 text-amber-200" />
              <h2 className="mt-4 font-cinzel text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}


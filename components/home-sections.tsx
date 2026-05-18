"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CalendarDays,
  CheckCircle2,
  Gem,
  MessageCircle,
  MoonStar,
  PlayCircle,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  WandSparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { SolarSystemHero } from "@/components/solar-system-hero";
import { featuredAstrologers } from "@/lib/astrologers";
import { useLanguage } from "@/components/language-provider";

const features = [
  { title: "Free Kundli Summary", description: "Collect birth details, generate chart data, show clear insights, then upsell a premium PDF report.", icon: MoonStar, href: "/kundli" },
  { title: "AI Astrologer", description: "Ask Gemini-powered guidance about career, marriage, finance, health, dosha, remedies, and daily choices.", icon: Bot, href: "/chatbot" },
  { title: "Premium Reports", description: "Focused report pages for kundli, career, marriage, finance, health, yearly prediction, and numerology.", icon: Sparkles, href: "/reports" },
  { title: "Human Consultation", description: "Astrologer marketplace, profile cards, booking CTAs, language support, and coming-soon call/chat states.", icon: Users, href: "/astrologers" },
  { title: "Daily Retention", description: "Cosmic score, streaks, lucky number, lucky color, lucky time, and notification preferences.", icon: CalendarDays, href: "/dashboard" },
  { title: "SEO Growth Engine", description: "Programmatic zodiac, horoscope, kundli, panchang, numerology, compatibility, and nakshatra pages.", icon: Gem, href: "/zodiac" }
];

const counters = [
  ["120K+", "Users served"],
  ["86K+", "Kundlis generated"],
  ["18K+", "AI questions answered"],
  ["9.4K+", "Consultations booked"]
];

const testimonials = [
  ["Aarav Mehta", "Founder", "The free kundli to premium report flow feels polished and conversion-ready.", "video"],
  ["Isha Rao", "Product Lead", "Naksharix makes horoscope, AI chat, reports, and consultation feel like one platform.", "card"],
  ["Devika S.", "Astrology Creator", "The UI feels premium without hiding the practical actions users need every day.", "card"]
];

const featuredIn = ["AstroTech Weekly", "FounderStack", "SaaS India", "Vedic AI Review", "Cosmic Product Lab"];

const faqs = [
  ["Is Naksharix only AI-generated?", "No. Naksharix combines traditional Vedic astrology principles with AI-assisted interpretation, structured forms, reports, and human astrologer workflows."],
  ["Can I generate a free Kundli?", "Yes. The free kundli flow gives a readable summary first and then offers an optional premium report."],
  ["Does Naksharix support Hindi?", "Yes. Horoscope and AI guidance support English, Hindi, and Hinglish modes, with Hindi output generated in Devanagari."],
  ["What happens if payment keys are missing?", "Payment buttons stay visible but show a Payments coming soon state until Razorpay keys are configured."]
];

export function HomeHero() {
  const { tr } = useLanguage();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(139,92,246,0.34),transparent_28rem),radial-gradient(circle_at_85%_20%,rgba(245,190,88,0.22),transparent_24rem)]" />
      <div className="absolute left-1/2 top-12 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full border border-[#F5C542]/15" />
      <Section className="relative grid min-h-[calc(100vh-4rem)] items-center gap-10 pb-24 lg:grid-cols-[1fr_0.88fr]">
        <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="mb-5 inline-flex rounded-full border border-[#F5C542]/35 bg-[#F5C542]/10 px-4 py-2 text-sm font-semibold text-[#FFD36A]">
            {tr("heroEyebrow")}
          </p>
          <h1 className="max-w-4xl text-balance font-decorative text-5xl font-black tracking-wide text-[#FFF7E8] sm:text-6xl lg:text-7xl">
            Naksharix
          </h1>
          <p className="mt-4 font-cinzel text-2xl font-bold text-[#FFD36A]">{tr("tagline")}</p>
          <p className="mt-6 max-w-2xl text-lg leading-8 naksh-muted-text">
            {tr("heroCopy")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/kundli">
                {tr("generateFreeKundli")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/chatbot">{tr("askAiAstrologer")}</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/reports">{tr("buyPremiumReport")}</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-3 text-sm naksh-muted-text sm:grid-cols-3">
            {(["personalBirthChart", "hindiEnglish", "paymentsReadyReports"] as const).map((item) => (
              <span key={item} className="rounded-md border border-[#F5C542]/20 bg-[#201037]/60 px-4 py-3">{tr(item)}</span>
            ))}
          </div>
        </motion.div>
        <motion.div initial={false} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1 }}>
          <SolarSystemHero />
        </motion.div>
      </Section>
    </section>
  );
}

export function TrustCounters() {
  return (
    <Section className="pt-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {counters.map(([value, label]) => (
          <Card key={label} className="border-[#F5C542]/20 bg-[#201037]/75">
            <CardContent className="p-5">
              <p className="font-cinzel text-3xl font-black text-[#FFD36A]">{value}</p>
              <p className="mt-1 text-sm naksh-muted-text">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function FeatureGrid() {
  return (
    <Section className="pt-8">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">AI Astrology Suite</p>
        <h2 className="mt-3 font-cinzel text-4xl font-black">A complete platform, not a single horoscope tool</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map(({ title, description, icon: Icon, href }, index) => (
          <motion.div key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}>
            <Link href={href} className="block h-full">
              <Card className="h-full border-[#F5C542]/20 bg-[#201037]/75 transition hover:-translate-y-1 hover:border-[#F5C542]/55">
                <CardContent className="p-6">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-[linear-gradient(135deg,rgba(126,72,255,0.35),rgba(245,190,88,0.28))] text-[#FFD36A]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-cinzel text-xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 naksh-muted-text">{description}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

export function CTASection() {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-lg border border-[#F5C542]/25 bg-[linear-gradient(135deg,rgba(72,36,128,0.88),rgba(21,15,48,0.96)_52%,rgba(180,128,45,0.62))] p-8 sm:p-12">
        <div className="absolute right-8 top-8 h-32 w-32 rounded-full border border-[#F5C542]/25" />
        <div className="relative max-w-3xl">
          <ShieldCheck className="h-8 w-8 text-[#FFD36A]" />
          <h2 className="mt-5 font-cinzel text-4xl font-black">Start with a free kundli, upgrade when you want depth</h2>
          <p className="mt-4 naksh-muted-text">
            Naksharix shows useful free guidance first, then gives clear paths to premium reports, AI chat, subscriptions, and human astrologer consultation.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" asChild><Link href="/kundli">Generate Free Kundli</Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/pricing">View Plans</Link></Button>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function AstrologerShowcase() {
  return (
    <Section>
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">Human Guidance</p>
          <h2 className="mt-3 font-cinzel text-4xl font-black">Featured astrologers</h2>
        </div>
        <Button variant="outline" asChild><Link href="/astrologers">Explore marketplace</Link></Button>
      </div>
      <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 md:grid md:grid-cols-3 md:overflow-visible">
        {featuredAstrologers.map((astrologer) => (
          <Card key={astrologer.id} className="min-w-[82vw] snap-start border-[#F5C542]/20 bg-[#201037]/75 sm:min-w-[22rem] md:min-w-0">
            <CardContent className="p-6">
              <div className="grid h-16 w-16 place-items-center rounded-lg bg-[#F5C542]/10 font-cinzel text-2xl font-black text-[#FFD36A]">
                {astrologer.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
              </div>
              <h3 className="mt-5 flex items-center gap-2 font-cinzel text-xl font-bold">{astrologer.name}<BadgeCheck className="h-5 w-5 text-[#FFD36A]" /></h3>
              <p className="mt-1 text-sm text-[#FFD36A]">{astrologer.specialty}</p>
              <p className="mt-3 text-sm leading-6 naksh-muted-text">{astrologer.experienceYears} years experience · {astrologer.languages.join(", ")} · {astrologer.rating} rating · INR {astrologer.pricePerMinute}/min</p>
              <div className="mt-5 flex gap-2">
                <Button asChild className="flex-1"><Link href={`/astrologers/${astrologer.id}`}>View profile</Link></Button>
                <Button variant="outline" asChild className="flex-1"><Link href={`/consultation?astrologer=${astrologer.id}`}>Book</Link></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function Testimonials() {
  return (
    <Section className="pt-4">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">Client Trust</p>
          <h2 className="mt-3 font-cinzel text-4xl font-black">Built for daily guidance and serious decisions</h2>
        </div>
        <WandSparkles className="hidden h-10 w-10 text-[#FFD36A] md:block" />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map(([name, role, quote, kind]) => (
          <Card key={name} className="border-[#F5C542]/20 bg-[#201037]/75">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {kind === "video" ? <PlayCircle className="h-7 w-7 text-[#FFD36A]" /> : <Quote className="h-6 w-6 text-[#FFD36A]" />}
                <div className="flex gap-1 text-[#FFD36A]">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-3 w-3 fill-current" />)}</div>
              </div>
              <p className="mt-5 leading-7 naksh-muted-text">{quote}</p>
              <p className="mt-6 font-cinzel font-bold">{name}</p>
              <p className="text-sm naksh-muted-text">{role}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function FeaturedIn() {
  return (
    <Section className="py-8">
      <div className="rounded-lg border border-[#F5C542]/20 bg-[#201037]/60 p-5">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">Featured in and trusted by builders</p>
        <div className="mt-5 grid gap-3 text-center text-sm naksh-muted-text sm:grid-cols-3 lg:grid-cols-5">
          {featuredIn.map((item) => <span key={item} className="rounded-md bg-[#201037]/70 px-3 py-3">{item}</span>)}
        </div>
      </div>
    </Section>
  );
}

export function FAQSection() {
  return (
    <Section>
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">FAQ</p>
        <h2 className="mt-3 font-cinzel text-4xl font-black">Clear answers before you begin</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {faqs.map(([question, answer]) => (
          <Card key={question} className="border-[#F5C542]/20 bg-[#201037]/75">
            <CardContent className="p-5">
              <h3 className="flex gap-2 font-cinzel text-lg font-bold"><CheckCircle2 className="mt-1 h-4 w-4 text-[#FFD36A]" />{question}</h3>
              <p className="mt-3 text-sm leading-6 naksh-muted-text">{answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function StickyMobileCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#F5C542]/25 bg-[#12051f]/95 p-3 backdrop-blur md:hidden">
      <div className="grid grid-cols-3 gap-2">
        <Button size="sm" asChild><Link href="/kundli"><MoonStar className="h-4 w-4" />Kundli</Link></Button>
        <Button size="sm" variant="outline" asChild><Link href="/chatbot"><MessageCircle className="h-4 w-4" />AI</Link></Button>
        <Button size="sm" variant="secondary" asChild><Link href="/reports"><Sparkles className="h-4 w-4" />Report</Link></Button>
      </div>
    </div>
  );
}

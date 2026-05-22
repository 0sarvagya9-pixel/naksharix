"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gem,
  Grid3X3,
  HeartHandshake,
  LineChart,
  LockKeyhole,
  MessageCircle,
  MoonStar,
  Phone,
  ShieldCheck,
  Sparkles,
  SunMoon,
  Users,
  WandSparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { featuredAstrologers } from "@/lib/astrologers";
import { useLanguage } from "@/components/language-provider";

const featureStrip = [
  ["homeFeatureKundliGenerator", MoonStar, "/kundli"],
  ["homeFeatureAiAstrologer", Bot, "/talk-to-kundli"],
  ["homeFeatureMatchingCompatibility", HeartHandshake, "/matchmaking"],
  ["homeFeaturePremiumReports", BriefcaseBusiness, "/reports"],
  ["homeFeatureTarotReading", Gem, "/tarot"],
  ["homeFeatureConsultationExperts", Users, "/astrologers"]
] as const;

const intelligenceLayers = [
  ["homeVedicAstrology", "homeVedicAstrologyCopy", SunMoon, "chart"],
  ["homeNumerologyLoShu", "homeNumerologyLoShuCopy", Grid3X3, "loshu"],
  ["homeWealthGrowthMeter", "homeWealthGrowthCopy", LineChart, "wealth"],
  ["homeAiInsights", "homeAiInsightsCopy", BrainCircuit, "ai"],
  ["homePersonalizedRemedies", "homePersonalizedRemediesCopy", WandSparkles, "remedy"]
] as const;

const reportBenefits = ["homeDetailedKundliAnalysis", "homeCareerFinanceOutlook", "homeLoveRelationships", "homeHealthWellbeing", "homeRemediesGuidance"];

const trustItems = [
  ["homeTrustSecurePrivate", ShieldCheck],
  ["homeTrustMillions", Users],
  ["homeTrustVedic", SunMoon],
  ["homeTrustAiAccuracy", BrainCircuit],
  ["homeTrustSupport", MessageCircle]
] as const;

export function HomeHero() {
  const { tr } = useLanguage();

  return (
    <section className="nx-night-sky relative overflow-x-hidden overflow-y-visible">
      <CosmicBackground />
      <div className="nx-nebula-layer" aria-hidden="true" />
      <div className="nx-starfield" aria-hidden="true" />
      <div className="nx-star-depth" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[-12rem] top-14 hidden h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(0,245,160,0.18)_0%,rgba(220,169,86,0.11)_30%,rgba(10,18,36,0.18)_48%,transparent_72%)] blur-3xl lg:block" aria-hidden="true" />
      <div className="relative mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-10 overflow-visible px-6 pb-12 pt-24 sm:px-8 lg:min-h-[calc(100vh-96px)] lg:grid-cols-[minmax(0,1.1fr)_minmax(400px,0.9fr)] lg:gap-16 lg:px-12 lg:pb-16 lg:pt-10 xl:gap-20">
        <motion.div className="relative z-20 max-w-[62rem] overflow-visible" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#dca956]/40 bg-white/[0.035] px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[#dca956] shadow-[0_0_30px_rgba(220,169,86,0.13)] backdrop-blur">
            <Sparkles className="h-4 w-4 text-[#f3d382]" />
            {tr("heroEyebrow")}
          </div>
          <h1 className="max-w-[62rem] overflow-visible pb-2 pr-3 bg-[linear-gradient(180deg,#f3d382_0%,#dca956_52%,#dca956_100%)] bg-clip-text font-decorative text-[clamp(3rem,4.45vw,4.95rem)] font-black uppercase leading-[0.96] tracking-[-0.025em] text-transparent antialiased drop-shadow-[0_10px_30px_rgba(0,0,0,0.44)] sm:text-[clamp(3.65rem,4.45vw,4.95rem)]">
            <span className="block sm:whitespace-nowrap">UNLOCK YOUR</span>
            <span className="block sm:whitespace-nowrap">COSMIC DESTINY</span>
          </h1>
          <div className="relative mt-5 flex w-full max-w-[35rem] items-center justify-center gap-4 text-center text-lg font-semibold leading-relaxed text-[#dca956] sm:text-2xl">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#dca956] sm:w-16" />
            <span>अपनी कॉस्मिक नियति समझें</span>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#dca956] sm:w-16" />
          </div>
          <p className="mt-5 max-w-2xl text-base leading-7 tracking-wide text-[#94a3b8] sm:text-lg">
            {tr("heroCopy")}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" variant="secondary" className="shadow-[0_0_26px_rgba(220,169,86,0.18),0_12px_30px_rgba(0,0,0,0.32)]" asChild>
              <Link href="/kundli">{tr("generateKundli")}<ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button size="lg" className="shadow-[0_0_25px_rgba(0,245,160,0.25),0_12px_30px_rgba(0,0,0,0.28)]" asChild>
              <Link href="/talk-to-kundli">{tr("talkToAiAstrologer")}<ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="mt-7 grid max-w-3xl grid-cols-2 gap-0 overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0a1224]/72 shadow-[0_18px_50px_rgba(0,5,16,0.34)] backdrop-blur sm:grid-cols-4">
            {[
              ["1M+", "Happy Users"],
              ["4.8★", "App Rating"],
              ["10k+", "Expert Astrologers"],
              ["98%", "Accuracy Rate"]
            ].map(([value, label]) => (
              <div key={label} className="border-b border-r border-[#1e293b] px-4 py-3 last:border-r-0 sm:border-b-0">
                <p className="font-cinzel text-xl font-black text-[#fbc02d]">{value}</p>
                <p className="mt-0.5 text-xs text-[#94a3b8]">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          className="relative z-20 mx-auto flex w-full max-w-[42rem] items-center justify-center lg:max-w-none"
          initial={{ opacity: 0, x: 24, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.12 }}
          aria-hidden="true"
        >
          <div className="pointer-events-none absolute inset-[-10%] rounded-full bg-[radial-gradient(circle_at_center,rgba(220,169,86,0.18)_0%,rgba(0,245,160,0.1)_30%,transparent_58%)] blur-3xl" />
          <div className="pointer-events-none absolute right-[-8%] top-[6%] h-40 w-40 rounded-full bg-[#00f5a0]/10 blur-3xl" />
          <div className="relative aspect-[1553/672] w-full max-w-[740px] bg-transparent lg:ml-auto lg:scale-[1.02] xl:scale-[1.04]">
            <Image
              src="/images/naksharix-hero-right-visual.png"
              alt=""
              fill
              priority
              sizes="(min-width: 1280px) 48vw, (min-width: 1024px) 50vw, 92vw"
              className="object-contain drop-shadow-[0_0_34px_rgba(220,169,86,0.22)]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function FeatureGrid() {
  const { tr } = useLanguage();

  return (
    <>
      <Section className="relative max-w-[1440px] px-6 py-3 lg:px-12">
        <CosmicBackground soft />
        <div className="relative grid gap-2 overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0a1224]/82 p-3 shadow-[0_24px_80px_rgba(0,5,16,0.42)] backdrop-blur md:grid-cols-3 xl:grid-cols-6">
          {featureStrip.map(([titleKey, Icon, href], index) => (
            <Link key={titleKey} href={href} className="group flex min-h-16 items-center gap-3 rounded-xl border border-[#1e293b] bg-[#0f1c3a] px-4 py-3 transition hover:-translate-y-0.5 hover:border-[#dca956]/50 hover:shadow-[0_0_24px_rgba(0,245,160,0.1)]">
              <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg border border-[#dca956]/28 bg-[#dca956]/10 text-[#f3d382]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold leading-tight text-[#ffffff]">{tr(titleKey)}</span>
              {index < featureStrip.length - 1 ? <span className="ml-auto hidden h-8 w-px bg-[#1e293b] xl:block" /> : null}
            </Link>
          ))}
        </div>
      </Section>

      <Section className="relative max-w-[1440px] px-6 py-4 lg:px-12">
        <CosmicBackground soft />
        <div className="relative grid gap-4 xl:grid-cols-[1fr_1.25fr_1fr]">
          <Panel title={tr("homeCosmicIntelligencePlatform")} subtitle={tr("homeCosmicIntelligenceSubtitle")}>
            <div className="grid gap-3">
              {intelligenceLayers.map(([titleKey, copyKey, Icon, type]) => (
                  <div key={titleKey} className="group grid min-h-[5.6rem] grid-cols-[2.8rem_1fr_auto] items-center gap-3 rounded-2xl border border-[#1e293b] bg-[#0f1c3a] p-3 transition hover:-translate-y-0.5 hover:border-[#dca956]/40 hover:shadow-[0_0_24px_rgba(0,245,160,0.1)]">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[radial-gradient(circle_at_35%_25%,rgba(243,211,130,0.16),rgba(0,245,160,0.08))] text-[#f3d382] shadow-[0_0_16px_rgba(220,169,86,0.12)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-cinzel text-sm font-bold leading-snug text-[#f3d382]">{tr(titleKey)}</p>
                    <p className="mt-1 text-xs leading-5 text-[#94a3b8]">{tr(copyKey)}</p>
                  </div>
                  <IntelligencePreview type={type} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={tr("homeDashboardTitle")} subtitle={tr("homeDashboardSubtitle")}>
            <DashboardPreview />
          </Panel>

          <Panel title={tr("homePremiumReportPreview")} subtitle={tr("homePremiumReportSubtitle")}>
            <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr] xl:grid-cols-1 2xl:grid-cols-[0.9fr_1fr]">
              <div className="relative min-h-52 rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(220,169,86,0.16),transparent_11rem),#0a1224] p-5 shadow-[inset_0_0_0_1px_rgba(220,169,86,0.22),0_20px_45px_rgba(0,0,0,0.34)]">
                <div className="absolute left-8 top-8 h-36 w-28 rotate-[-8deg] rounded-lg bg-gradient-to-br from-[#f3d382] via-[#dca956] to-[#dca956] shadow-[18px_18px_45px_rgba(0,0,0,0.42),inset_-10px_0_18px_rgba(2,6,18,0.28)]" />
                <div className="absolute left-12 top-10 h-36 w-28 rotate-[5deg] rounded-lg border border-[#f3d382]/45 bg-[linear-gradient(135deg,#0f1c3a,#0a1224_45%,#0f1c3a)] p-4 shadow-[18px_18px_55px_rgba(0,0,0,0.5)]">
                  <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[#dca956]">Naksharix</p>
                  <p className="mt-5 font-cinzel text-sm font-black leading-tight text-[#f3d382]">{tr("homeReportBookTitle")}</p>
                  <MoonStar className="mt-6 h-9 w-9 text-[#dca956]" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#dca956]">{tr("homePremiumReportPreview")}</p>
                {reportBenefits.map((itemKey) => (
                  <div key={itemKey} className="flex items-center gap-2 text-sm text-[#ffffff]/82">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#f3d382]" />
                    {tr(itemKey)}
                  </div>
                ))}
                <Button className="mt-4 w-full" size="sm" variant="secondary" asChild><Link href="/reports"><LockKeyhole className="h-4 w-4" />{tr("homeUnlockFullReport")}</Link></Button>
              </div>
            </div>
          </Panel>
        </div>
      </Section>
    </>
  );
}

function DashboardPreview() {
  const { tr } = useLanguage();

  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-[#1e293b] bg-[#0f1c3a] p-4">
        <div className="flex items-center gap-3">
          <div className="relative grid h-11 w-11 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_25%,rgba(243,211,130,0.34),rgba(0,245,160,0.12))] text-[#f3d382]">
            ॐ
            <span className="absolute -right-0.5 bottom-1 h-3 w-3 rounded-full border-2 border-[#0a1224] bg-[#00f5a0]" />
          </div>
          <div>
            <p className="font-cinzel text-sm font-bold text-[#f3d382]">{tr("homeHelloArjun")}</p>
            <p className="text-xs text-[#ffffff]/64">{tr("homeExploreInsights")}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[0.88fr_1.12fr]">
        <div className="rounded-2xl border border-[#1e293b] bg-[radial-gradient(circle_at_20%_0%,rgba(88,28,135,0.22),transparent_11rem),#0f1c3a] p-4">
          <p className="text-xs text-[#94a3b8]">{tr("homeLifePathNumber")}</p>
          <p className="mt-2 font-cinzel text-5xl font-black text-[#f3d382]">7</p>
          <p className="mt-1 text-sm font-semibold text-[#dca956]">{tr("homeSeeker")}</p>
        </div>
        <div className="rounded-2xl border border-[#1e293b] bg-[radial-gradient(circle_at_80%_15%,rgba(0,245,160,0.18),transparent_11rem),#0f1c3a] p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-[#94a3b8]">{tr("homeTodaysCosmicEnergy")}</p>
              <p className="font-cinzel text-xl font-bold text-[#00f5a0]">{tr("homeFavorable")}</p>
              <div className="mt-3 grid grid-cols-4 gap-1">
                {["▾", "▾", "▾", "▾"].map((item, index) => (
                  <span key={`${item}-${index}`} className="grid h-6 w-6 place-items-center rounded-full bg-[#00f5a0]/12 text-xs text-[#00f5a0]">{item}</span>
                ))}
              </div>
            </div>
            <ProgressRing value={86} />
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-2xl border border-[#1e293b] bg-[#0f1c3a] p-4">
          <p className="text-xs text-[#94a3b8]">{tr("homePlanetaryOverview")}</p>
          {["homeSunStrong", "homeMoonFavorable", "homeMarsGood", "homeJupiterStrong"].map((itemKey) => <p key={itemKey} className="mt-1 text-xs text-[#ffffff]/78">{tr(itemKey)}</p>)}
        </div>
        <div className="rounded-2xl border border-[#1e293b] bg-[linear-gradient(135deg,rgba(0,155,114,0.12),rgba(88,28,135,0.08))] p-4">
          <p className="text-xs font-semibold text-[#00f5a0]">{tr("homeAiPredictionForYou")}</p>
          <p className="mt-2 text-xs leading-5 text-[#ffffff]/72">{tr("homeCareerShiftPrediction")}</p>
          <Link href="/dashboard" className="mt-3 inline-flex rounded-full bg-[#00f5a0]/12 px-3 py-1 text-xs font-semibold text-[#00f5a0] transition hover:bg-[#00f5a0]/20">
            {tr("viewDetails")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function IntelligencePreview({ type }: { type: "chart" | "loshu" | "wealth" | "ai" | "remedy" }) {
  if (type === "loshu") {
    return (
      <div className="grid h-14 w-14 grid-cols-3 gap-0.5 rounded-lg bg-[#0a1224]/80 p-1 shadow-[inset_0_0_0_1px_rgba(220,169,86,0.18)]">
        {[4, 9, 2, 3, 5, 7, 8, 1, 6].map((number) => (
          <span key={number} className="grid place-items-center rounded bg-[#dca956]/10 text-[0.62rem] font-bold text-[#f3d382]">{number}</span>
        ))}
      </div>
    );
  }

  if (type === "wealth") {
    return (
      <div className="flex h-14 w-16 items-end gap-1 rounded-lg bg-[#009b72]/18 p-2 shadow-[inset_0_0_0_1px_rgba(0,245,160,0.14)]">
        {[35, 52, 44, 70, 86].map((height, index) => (
          <span key={height} className="w-2 rounded-t bg-gradient-to-t from-[#009b72] to-[#00f5a0]" style={{ height: `${height}%`, opacity: 0.72 + index * 0.05 }} />
        ))}
      </div>
    );
  }

  if (type === "ai") {
    return <div className="h-14 w-14 rounded-full bg-[radial-gradient(circle_at_35%_25%,rgba(88,28,135,0.7),rgba(0,245,160,0.22)_48%,transparent_70%)] shadow-[0_0_24px_rgba(88,28,135,0.22)]" />;
  }

  if (type === "remedy") {
    return (
      <div className="relative h-14 w-14">
        <span className="absolute left-1/2 top-2 h-9 w-5 -translate-x-1/2 rounded-full bg-[#dca956]/20 shadow-[0_0_18px_rgba(220,169,86,0.18)]" />
        <span className="absolute bottom-2 left-3 h-6 w-6 rotate-45 rounded-full bg-[#f3d382]/24" />
        <span className="absolute bottom-2 right-3 h-6 w-6 -rotate-45 rounded-full bg-[#f3d382]/24" />
      </div>
    );
  }

  return (
    <div className="relative h-14 w-14 rounded-lg bg-[#0a1224]/80 shadow-[inset_0_0_0_1px_rgba(220,169,86,0.18)]">
      <span className="absolute inset-x-2 top-1/2 h-px bg-[#dca956]/50" />
      <span className="absolute inset-y-2 left-1/2 w-px bg-[#dca956]/50" />
      <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#dca956]/45" />
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative h-[4.6rem] w-[4.6rem] flex-shrink-0">
      <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="url(#energyGradient)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="energyGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#00f5a0" />
            <stop offset="100%" stopColor="#00f5a0" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-black text-white">{value}%</span>
    </div>
  );
}

export function AstrologerShowcase() {
  const { tr } = useLanguage();

  return (
    <Section className="relative max-w-[1440px] px-6 py-4 lg:px-12">
      <CosmicBackground soft />
      <Panel title={tr("homeAstrologerTitle")} subtitle={tr("homeAstrologerSubtitle")}>
        <div className="relative">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {featuredAstrologers.slice(0, 5).map((astrologer) => (
            <Card key={astrologer.id} className="group border-[#1e293b] bg-[#0f1c3a] shadow-[0_18px_48px_rgba(0,5,16,0.25)] transition hover:-translate-y-1 hover:border-[#dca956]/40 hover:shadow-[0_0_28px_rgba(0,245,160,0.12)]">
              <CardContent className="p-4">
                <div className="relative flex items-center gap-3">
                  <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-full border border-[#dca956]/45 bg-[radial-gradient(circle_at_35%_25%,rgba(243,211,130,0.34),rgba(0,155,114,0.42))] font-cinzel text-lg font-black text-[#f3d382] shadow-[0_0_18px_rgba(220,169,86,0.12)]">
                    {astrologer.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-cinzel text-sm font-bold text-[#f3d382]">{astrologer.name}</h3>
                    <p className="truncate text-xs text-[#ffffff]/62">{astrologer.specialty}</p>
                    <p className="mt-0.5 text-xs text-[#94a3b8]">{astrologer.experienceYears}+ Yrs</p>
                    <p className="mt-1 text-xs font-semibold text-[#fbc02d]">{astrologer.rating} ★ <span className="text-[#94a3b8]">({Math.round(astrologer.rating * 470)})</span></p>
                  </div>
                  <Button size="icon" className="absolute -bottom-8 right-0 h-9 w-9 rounded-full bg-[#009b72] text-white shadow-[0_0_18px_rgba(0,245,160,0.25)]" asChild><Link href={`/consultation/book/${astrologer.id}`} aria-label={`Book ${astrologer.name}`}><Phone className="h-4 w-4" /></Link></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" aria-label="Previous astrologers" className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.035] text-[#f3d382] shadow-[inset_0_0_0_1px_rgba(220,169,86,0.24)] transition hover:bg-[#dca956]/10">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Next astrologers" className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.035] text-[#f3d382] shadow-[inset_0_0_0_1px_rgba(220,169,86,0.24)] transition hover:bg-[#dca956]/10">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Panel>
    </Section>
  );
}

export function TrustBar() {
  const { tr } = useLanguage();

  return (
    <Section className="relative max-w-[1440px] px-6 pb-28 pt-4 md:pb-10 lg:px-12">
      <CosmicBackground soft />
      <div className="relative grid gap-3 border-y border-[#1e293b] bg-[#0a1224]/80 p-4 shadow-[0_0_30px_rgba(220,169,86,0.06)] backdrop-blur sm:grid-cols-2 lg:grid-cols-5">
        {trustItems.map(([labelKey, Icon]) => (
          <div key={labelKey} className="flex items-center justify-center gap-3 border-[#1e293b] px-3 py-2 lg:border-r lg:last:border-r-0">
            <Icon className="h-5 w-5 text-[#dca956]" />
            <span className="text-sm font-semibold text-[#94a3b8]">{tr(labelKey)}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function StickyMobileCTA() {
  const { tr } = useLanguage();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#dca956]/25 bg-[#020612]/95 p-3 backdrop-blur md:hidden">
      <div className="grid grid-cols-3 gap-2">
        <Button size="sm" variant="secondary" asChild><Link href="/kundli"><MoonStar className="h-4 w-4" />{tr("kundli")}</Link></Button>
        <Button size="sm" asChild><Link href="/talk-to-kundli"><MessageCircle className="h-4 w-4" />AI</Link></Button>
        <Button size="sm" variant="outline" asChild><Link href="/reports"><Sparkles className="h-4 w-4" />{tr("reports")}</Link></Button>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0a1224]/86 p-5 shadow-[0_24px_80px_rgba(0,5,16,0.42),inset_0_1px_0_rgba(243,211,130,0.05)] backdrop-blur">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(220,169,86,0.1),transparent_16rem),radial-gradient(circle_at_88%_100%,rgba(0,155,114,0.1),transparent_18rem)]" />
      <div className="relative">
        <p className="font-cinzel text-lg font-black uppercase tracking-wide text-[#f3d382]">+ {title}</p>
        <p className="mt-1 text-sm text-[#ffffff]/68">{subtitle}</p>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function CosmicBackground({ soft = false }: { soft?: boolean }) {
  const stars = [
    ["left-[6%] top-[12%] h-1 w-1 opacity-70 blur-[0.2px]", "bg-white"],
    ["left-[18%] top-[28%] h-1.5 w-1.5 opacity-70 blur-[0.4px]", "bg-[#f3d382]"],
    ["left-[32%] top-[14%] h-1 w-1 opacity-50 blur-[0.1px]", "bg-white"],
    ["left-[44%] top-[38%] h-2 w-2 opacity-50 blur-[0.7px]", "bg-[#00f5a0]"],
    ["left-[58%] top-[18%] h-1.5 w-1.5 opacity-60 blur-[0.3px]", "bg-[#f3d382]"],
    ["left-[72%] top-[30%] h-1 w-1 opacity-70 blur-[0.1px]", "bg-white"],
    ["left-[86%] top-[14%] h-2 w-2 opacity-55 blur-[0.8px]", "bg-[#f3d382]"],
    ["left-[12%] bottom-[18%] h-2 w-2 opacity-45 blur-[0.8px]", "bg-[#00f5a0]"],
    ["left-[36%] bottom-[12%] h-1 w-1 opacity-60 blur-[0.2px]", "bg-white"],
    ["left-[64%] bottom-[20%] h-1.5 w-1.5 opacity-55 blur-[0.4px]", "bg-[#f3d382]"],
    ["left-[90%] bottom-[24%] h-1 w-1 opacity-70 blur-[0.2px]", "bg-white"],
    ["left-[23%] top-[58%] h-3 w-3 opacity-25 blur-[1.4px]", "bg-[#00f5a0]"],
    ["left-[76%] top-[54%] h-2.5 w-2.5 opacity-35 blur-[1.2px]", "bg-[#00f5a0]"],
    ["left-[50%] bottom-[34%] h-1 w-1 opacity-55 blur-[0.2px]", "bg-white"],
    ["left-[8%] bottom-[42%] h-1.5 w-1.5 opacity-42 blur-[0.5px]", "bg-[#f3d382]"],
    ["right-[6%] bottom-[46%] h-3 w-3 opacity-24 blur-[1.5px]", "bg-[#00f5a0]"]
  ];
  return (
    <>
      <div className={`pointer-events-none absolute inset-0 ${soft ? "opacity-45" : "opacity-92"} bg-[radial-gradient(circle_at_80%_20%,rgba(10,18,36,0.42),transparent_50%),radial-gradient(circle_at_15%_22%,rgba(0,245,160,0.14),transparent_26rem),radial-gradient(circle_at_78%_18%,rgba(220,169,86,0.13),transparent_28rem),radial-gradient(circle_at_62%_78%,rgba(0,155,114,0.11),transparent_32rem),linear-gradient(135deg,rgba(2,6,18,0.82)_0%,rgba(10,18,36,0.74)_52%,rgba(10,18,36,0.42)_100%)]`} />
      <div className={`pointer-events-none absolute inset-0 ${soft ? "opacity-38" : "opacity-76"} bg-[radial-gradient(circle_at_7%_16%,rgba(255,255,255,0.62)_0_1px,transparent_2px),radial-gradient(circle_at_18%_62%,rgba(255,255,255,0.48)_0_1px,transparent_2px),radial-gradient(circle_at_31%_28%,rgba(243,211,130,0.58)_0_1px,transparent_2px),radial-gradient(circle_at_46%_72%,rgba(255,255,255,0.46)_0_1px,transparent_2px),radial-gradient(circle_at_62%_34%,rgba(0,245,160,0.5)_0_1px,transparent_2px),radial-gradient(circle_at_79%_18%,rgba(243,211,130,0.56)_0_1px,transparent_2px),radial-gradient(circle_at_92%_66%,rgba(255,255,255,0.54)_0_1px,transparent_2px),radial-gradient(circle_at_70%_88%,rgba(0,245,160,0.44)_0_1px,transparent_2px)]`} />
      <div className={`pointer-events-none absolute inset-0 ${soft ? "opacity-28" : "opacity-58"} bg-[radial-gradient(circle_at_22%_36%,rgba(220,169,86,0.54)_0_1.4px,transparent_3px),radial-gradient(circle_at_38%_11%,rgba(255,255,255,0.38)_0_1.2px,transparent_3px),radial-gradient(circle_at_57%_58%,rgba(243,211,130,0.46)_0_1.5px,transparent_3px),radial-gradient(circle_at_84%_42%,rgba(0,245,160,0.38)_0_1.4px,transparent_3px),radial-gradient(circle_at_11%_78%,rgba(0,245,160,0.32)_0_1.5px,transparent_3px)] blur-[0.3px]`} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_35%_40%,rgba(0,155,114,0.12),transparent_34rem),radial-gradient(ellipse_at_82%_62%,rgba(220,169,86,0.1),transparent_30rem)] blur-[1px]" />
      {stars.map(([position, color], index) => (
        <span
          key={`${position}-${index}`}
          className={`pointer-events-none absolute rounded-full ${position} ${color} shadow-[0_0_16px_currentColor]`}
          style={{ animation: `cosmic-float ${8 + index * 0.7}s ease-in-out infinite`, animationDelay: `${index * 0.35}s` }}
        />
      ))}
    </>
  );
}

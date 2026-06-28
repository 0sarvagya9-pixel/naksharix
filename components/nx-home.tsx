"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Heart,
  Star,
  Sparkles,
  Moon,
  Sun,
  Compass,
  Shield,
  CheckCircle,
  Clock3,
  Users,
  HeartHandshake,
  Briefcase,
  Coins,
  Eye,
  HelpCircle,
} from "lucide-react";

/* ============================================================
   DATA CONSTANTS
   ============================================================ */
const CORE_SERVICES = [
  { label: "Kundli Analysis", copy: "Deep planetary chart insights & ascendant paths.", href: "/kundli", icon: Moon },
  { label: "Horoscopes", copy: "Daily, weekly, and yearly transit predictions.", href: "/daily-horoscope", icon: Sun },
  { label: "Panchang", copy: "Auspicious timings, Vaar, and solar alignments.", href: "/panchang", icon: CalendarDays },
  { label: "Numerology", copy: "Lo Shu grid patterns & destiny numbers.", href: "/numerology", icon: Sparkles },
  { label: "Tarot Readings", copy: "Fated reflections & major arcana spreads.", href: "/tarot", icon: Compass },
  { label: "Compatibility", copy: "Match metrics & relationship harmony score.", href: "/matchmaking", icon: Heart },
  { label: "Remedies", copy: "Practical gems, mantras, and balancing guidelines.", href: "/free-calculators", icon: Shield },
  { label: "Muhurat", copy: "Identify optimal hours for critical decisions.", href: "/panchang", icon: Clock3 }
];

const SIGNATURE_TOOLS = [
  { label: "Kundli Matching",    sub: "Check compatibility",          href: "/matchmaking",      icon: HeartHandshake },
  { label: "Career Guidance",    sub: "Align your path with stars",   href: "/career-astrology", icon: Briefcase },
  { label: "Finance & Wealth",   sub: "Unlock abundance",             href: "/free-calculators", icon: Coins },
  { label: "Love & Relations",   sub: "Strengthen cosmic bonds",      href: "/matchmaking",      icon: Heart },
  { label: "Spiritual Growth",   sub: "Elevate consciousness",        href: "/free-calculators", icon: Eye },
  { label: "Ask a Question",     sub: "Expert astrologer answers",    href: "/consultation",     icon: HelpCircle },
];

const PREMIUM_FEATURES = [
  { icon: Moon,        label: "Advanced Kundli",    sub: "Deep planetary insights" },
  { icon: Star,        label: "Premium Reports",    sub: "Comprehensive life reports" },
  { icon: Shield,      label: "Priority Support",   sub: "Top astrologer access" },
  { icon: CheckCircle, label: "Ad-Free Journey",    sub: "Seamless premium experience" },
];

const TESTIMONIALS = [
  { name: "Priya S.",  text: "Naksharix gave me clarity I was looking for. Truly life-changing.", avatar: "PS", rating: 5 },
  { name: "Rahul K.",  text: "Most accurate predictions ever. Grateful for this platform.",       avatar: "RK", rating: 5 },
  { name: "Meena K.",  text: "Found peace, purpose and a new sense of direction.",                 avatar: "MK", rating: 5 },
];

/* ============================================================
   MAIN HOME COMPONENT
   ============================================================ */
export function NxHome() {
  return (
    <div className="bg-transparent flex flex-col gap-10 py-8">

      {/* 1. HERO SECTION */}
      <section className="px-4 sm:px-8 xl:px-12 pt-8 md:pt-16">
        <div className="mx-auto max-w-[1440px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.20em] text-[#d89a2b] bg-[rgba(216,154,43,0.08)] border border-[rgba(216,154,43,0.18)]">
                <Sparkles size={11} className="animate-pulse" /> Timeless Vedic Wisdom
              </span>
              <h1
                className="mt-4 font-cinzel text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.2]"
                style={{ textShadow: "0 4px 28px rgba(0,0,0,0.32)" }}
              >
                <span className="text-[#fffaf0]">Decode Your Destiny.</span><br />
                <span className="bg-gradient-to-r from-[#f7d17a] to-[#c98924] bg-clip-text text-transparent italic font-medium">Design Your Future.</span>
              </h1>
              <p
                className="mt-4 text-base md:text-lg font-medium leading-relaxed"
                style={{ color: "rgba(255,255,255,0.78)", maxWidth: "560px", fontSize: "18px" }}
              >
                Align your career, relationships, and life path with sub-second accurate planetary calculations and certified Vedic insights.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/kundli"
                className="rounded-lg bg-gradient-to-r from-[#f2c56b] to-[#c98924] px-6 py-3 text-sm font-bold text-slate-950 shadow-[0_4px_14px_rgba(242,197,107,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(242,197,107,0.35)]"
                style={{ textDecoration: "none" }}
              >
                Create Free Kundli
              </Link>
              <Link
                href="/daily-horoscope"
                className="rounded-lg border border-[rgba(255,255,255,0.45)] bg-[rgba(255,255,255,0.24)] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_14px_rgba(15,18,30,0.05)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/30"
                style={{ textDecoration: "none" }}
              >
                Daily Horoscope
              </Link>
            </div>

            {/* Trust / Features Row */}
            <div className="flex flex-wrap items-center gap-6 border-t border-[rgba(255,255,255,0.18)] pt-6 mt-2">
              <div className="flex items-center gap-2">
                <CheckCircle size={15} className="text-[#f2c56b]" />
                <span className="text-xs font-semibold text-[rgba(255,255,255,0.78)]">100% Secure Calculations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={15} className="text-[#f2c56b]" />
                <span className="text-xs font-semibold text-[rgba(255,255,255,0.78)]">Certified Vedic Astrologers</span>
              </div>
            </div>
          </div>

          {/* Right Side - Cosmic Outlook Card */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute inset-0 -m-10 bg-[radial-gradient(circle_at_center,rgba(216,154,43,0.18)_0%,transparent_60%)] blur-2xl pointer-events-none" />

            <div
              className="relative w-full max-w-md p-6 transition-all duration-300 hover:scale-[1.01]"
              style={{
                background: "rgba(255,255,255,0.64)",
                backdropFilter: "blur(24px) saturate(145%)",
                WebkitBackdropFilter: "blur(24px) saturate(145%)",
                border: "1px solid rgba(255,255,255,0.58)",
                borderRadius: "24px",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.78), 0 18px 55px rgba(20,12,8,0.16)"
              }}
            >
              <div className="flex items-center justify-between border-b border-[rgba(20,20,20,0.06)] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Sun size={16} className="text-[#c98924] animate-spin-slow" />
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#c98924]">Cosmic Outlook</span>
                </div>
                <span className="text-xs font-bold text-[#525866]">Sunday, Shukla Paksha</span>
              </div>

              <div className="space-y-4">
                <div
                  className="flex items-center justify-between p-3"
                  style={{
                    background: "rgba(255,255,255,0.46)",
                    border: "1px solid rgba(255,255,255,0.42)",
                    borderRadius: "12px"
                  }}
                >
                  <span className="text-xs font-bold text-[#525866] uppercase">Planetary Host</span>
                  <span className="text-sm font-bold text-[#17181d] flex items-center gap-1">Moon in Scorpio ♏</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="p-3 text-center shadow-sm"
                    style={{
                      background: "rgba(255,255,255,0.46)",
                      border: "1px solid rgba(255,255,255,0.42)",
                      borderRadius: "12px"
                    }}
                  >
                    <span className="block text-[10px] uppercase font-bold text-[#525866]">Sunrise</span>
                    <span className="block text-sm font-black text-[#17181d] mt-1">05:42 AM</span>
                  </div>
                  <div
                    className="p-3 text-center shadow-sm"
                    style={{
                      background: "rgba(255,255,255,0.46)",
                      border: "1px solid rgba(255,255,255,0.42)",
                      borderRadius: "12px"
                    }}
                  >
                    <span className="block text-[10px] uppercase font-bold text-[#525866]">Sunset</span>
                    <span className="block text-sm font-black text-[#17181d] mt-1">07:08 PM</span>
                  </div>
                </div>

                <div
                  className="p-3 shadow-sm"
                  style={{
                    background: "rgba(255,255,255,0.46)",
                    border: "1px solid rgba(255,255,255,0.42)",
                    borderRadius: "12px"
                  }}
                >
                  <span className="block text-[10px] uppercase font-bold text-[#525866] mb-1">Rahu Kaal Alert</span>
                  <p className="text-xs font-semibold text-[#525866] leading-relaxed">
                    Auspicious tasks should be deferred between <strong className="text-[#17181d]">04:19 PM – 06:00 PM</strong> due to Rahu presence.
                  </p>
                </div>
              </div>

              <Link
                href="/panchang"
                className="w-full mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#f2c56b] to-[#c98924] py-2.5 text-xs font-bold text-slate-950 shadow-[0_2px_8px_rgba(242,197,107,0.18)] transition-all hover:opacity-90"
                style={{ textDecoration: "none" }}
              >
                View Full Panchang →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. METRIC STRIP */}
      <section className="px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div
            className="flex flex-col md:flex-row md:items-center w-full p-2 md:p-3"
            style={{
              background: "rgba(255,255,255,0.38)",
              backdropFilter: "blur(22px)",
              border: "1px solid rgba(255,255,255,0.52)",
              borderRadius: "28px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 18px 50px rgba(0,0,0,0.18)"
            }}
          >
            {[
              { label: "Happy Users", value: "1M+ Happy Seekers", icon: <Users className="h-5 w-5 text-[#c98924]" /> },
              { label: "Accuracy Rate", value: "98% Accuracy Rate", icon: <Compass className="h-5 w-5 text-[#c98924]" /> },
              { label: "Avg App Rating", value: "4.9+ Avg Rating", icon: <Star className="h-5 w-5 text-[#c98924]" /> },
              { label: "Expert Support", value: "24/7 Expert Support", icon: <Shield className="h-5 w-5 text-[#c98924]" /> }
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className="flex-1 flex items-center gap-3 px-4 py-3 md:py-2 border-b md:border-b-0 md:border-r border-[rgba(255,255,255,0.35)] last:border-b-0 last:border-r-0"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/40 border border-white/50">{icon}</span>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#525866]">{label}</span>
                  <span className="block text-sm font-black text-[#17181d] mt-0.5">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE SERVICES GRID */}
      <section className="px-4 sm:px-8 xl:px-12 py-4">
        <div className="mx-auto max-w-[1440px]">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.20em] text-[#d89a2b] bg-[rgba(216,154,43,0.08)] px-2.5 py-1 rounded-full">
              Core Services
            </span>
            <h2 className="mt-3 font-cinzel text-3xl font-bold tracking-tight text-white">
              Explore Cosmic Paths
            </h2>
            <p className="mt-1 text-sm text-slate-300 italic">
              Traditional Vedic calculators optimized for digital speed and sub-second accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORE_SERVICES.map(({ label, copy, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="group rounded-[20px] border border-[rgba(255,255,255,0.58)] bg-[rgba(255,255,255,0.64)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_18px_55px_rgba(20,12,8,0.16)] backdrop-blur-[24px] saturate-[145%] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(242,197,107,0.65)] hover:shadow-[0_20px_60px_rgba(201,137,36,0.16)]"
                style={{ textDecoration: "none" }}
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[rgba(216,154,43,0.08)] text-[#c98924] transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-cinzel text-lg font-bold text-[#17181d]">{label}</h3>
                <p className="mt-2 text-xs text-[#525866] leading-relaxed">{copy}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#c98924]">
                  Launch Tool <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Alignment Status Strip */}
      <section className="px-4 sm:px-8 xl:px-12 my-2">
        <div className="mx-auto max-w-[1440px]">
          <div className="rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left bg-[rgba(20,24,34,0.6)] border border-[rgba(255,255,255,0.15)] shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#f2c56b] animate-pulse" />
              <span className="text-white text-xs md:text-sm font-bold tracking-[0.05em]">Cosmic Alignment Status: Active</span>
            </div>
            <p className="text-slate-300 text-xs md:text-sm font-medium m-0">
              Calculations certified in coordination with planetary ephemeris datasets.
            </p>
            <Link href="/reports" className="text-[#f2c56b] hover:text-[#c98924] text-xs font-bold transition-all" style={{ textDecoration: "none" }}>
              Explore Transit Reports →
            </Link>
          </div>
        </div>
      </section>

      {/* 4. SIGNATURE TOOLS */}
      <section className="px-4 sm:px-8 xl:px-12 py-4">
        <div className="mx-auto max-w-[1440px]">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.20em] text-[#c98924] bg-[rgba(216,154,43,0.08)] px-2.5 py-1 rounded-full">
              Signature Tools
            </span>
            <h2 className="mt-3 font-cinzel text-3xl font-bold tracking-tight text-white">
              Personalized Guidance
            </h2>
            <p className="mt-1 text-sm text-slate-300 italic">
              Empower your choices through custom blueprints and astrological maps.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            {SIGNATURE_TOOLS.map(({ label, sub, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="group rounded-[20px] border border-[rgba(255,255,255,0.58)] bg-[rgba(255,255,255,0.64)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_18px_55px_rgba(20,12,8,0.16)] backdrop-blur-[24px] saturate-[145%] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(242,197,107,0.65)] hover:shadow-[0_20px_60px_rgba(201,137,36,0.16)]"
                style={{ textDecoration: "none" }}
              >
                <div className="h-16 w-full rounded-lg bg-[rgba(216,154,43,0.05)] border border-[rgba(216,154,43,0.12)] flex items-center justify-center flex-shrink-0 text-[#c98924] transition-transform duration-300 group-hover:scale-105">
                  <Icon size={24} />
                </div>
                <h3 className="mt-3 text-xs font-bold text-[#17181d] leading-snug">{label}</h3>
                <p className="mt-1 text-[10px] text-[#525866] leading-normal">{sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PREMIUM MEMBERSHIP ROW */}
      <section className="px-4 sm:px-8 xl:px-12 py-4">
        <div className="mx-auto max-w-[1440px]">
          <div className="rounded-[20px] border border-[rgba(255,255,255,0.58)] bg-[rgba(255,255,255,0.64)] p-8 sm:p-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_18px_55px_rgba(20,12,8,0.16)] backdrop-blur-[24px] saturate-[145%]">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_auto] gap-8 items-center">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c98924]">
                  Naksharix Premium
                </span>
                <h2 className="font-cinzel text-3xl font-black text-[#17181d] leading-tight">
                  Go Deeper.<br />
                  <span className="bg-gradient-to-r from-[#f7d17a] to-[#c98924] bg-clip-text text-transparent">Live Aligned.</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {PREMIUM_FEATURES.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center gap-2 text-center">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[rgba(216,154,43,0.06)] border border-[rgba(216,154,43,0.18)]">
                      <Icon size={16} className="text-[#c98924]" />
                    </span>
                    <span className="text-xs font-bold text-[#17181d]">{label}</span>
                    <span className="text-[10px] text-[#525866] leading-tight">{sub}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-2 text-center border-t lg:border-t-0 lg:border-l border-[rgba(20,20,20,0.06)] pt-6 lg:pt-0 lg:pl-8">
                <span className="text-xs font-bold text-[#17181d]">Unlock Premium</span>
                <span className="text-[10px] text-[#525866]">Plans from ₹199/month</span>
                <Link href="/pricing" className="rounded-lg bg-gradient-to-r from-[#f7d17a] to-[#c98924] px-4 py-2 text-xs font-bold text-[#17181d] shadow-[0_10px_28px_rgba(201,137,36,0.28)] mt-2 hover:-translate-y-0.5 transition-all">
                  Upgrade Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="px-4 sm:px-8 xl:px-12 py-4">
        <div className="mx-auto max-w-[1440px]">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.20em] text-[#c98924] bg-[rgba(216,154,43,0.08)] px-2.5 py-1 rounded-full">
              Testimonials
            </span>
            <h2 className="mt-3 font-cinzel text-3xl font-bold tracking-tight text-white">
              Trusted by Seekers Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, text, avatar, rating }) => (
              <div
                key={name}
                className="rounded-[20px] border border-[rgba(255,255,255,0.58)] bg-[rgba(255,255,255,0.64)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_18px_55px_rgba(20,12,8,0.16)] backdrop-blur-[24px] saturate-[145%] transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(242,197,107,0.65)] hover:shadow-[0_20px_60px_rgba(201,137,36,0.16)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full font-black text-[#17181d] text-xs bg-gradient-to-br from-[#f7d17a] to-[#c98924] shadow-[0_2px_8px_rgba(201,137,36,0.22)]">
                    {avatar}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-[#17181d] block">{name}</span>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: rating }, (_, i) => (
                        <Star key={i} size={10} className="text-[#c98924] fill-[#c98924]" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#525866] leading-relaxed italic">&ldquo;{text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA BAND */}
      <section className="px-4 sm:px-8 xl:px-12 py-6">
        <div className="mx-auto max-w-[1440px]">
          <div className="rounded-[20px] border border-[rgba(255,255,255,0.58)] bg-[rgba(255,255,255,0.64)] p-8 sm:p-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_18px_55px_rgba(20,12,8,0.16)] backdrop-blur-[24px] saturate-[145%]">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
              <div className="max-w-xl">
                <h2 className="font-cinzel text-3xl font-black text-[#17181d] leading-tight">
                  Begin Your Cosmic Journey
                </h2>
                <p className="text-xs text-[#525866] leading-relaxed mt-2">
                  Unlock the secrets written in the stars and build a life of absolute clarity, peace &amp; aligned purpose.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="rounded-lg px-4 py-2.5 text-xs outline-none border border-[rgba(255,255,255,0.58)] bg-white/70 text-[#17181d] placeholder:text-[#525866]/60 focus:border-[#c98924] shadow-sm"
                  style={{ minWidth: 220 }}
                />
                <Link href="/signup" className="rounded-lg bg-gradient-to-r from-[#f7d17a] to-[#c98924] px-5 py-2.5 text-xs font-bold text-[#17181d] shadow-[0_10px_28px_rgba(201,137,36,0.28)] inline-flex items-center gap-1.5 justify-center hover:-translate-y-0.5 transition-all">
                  Get Started <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
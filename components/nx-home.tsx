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
          {/* Left Side with local text-safe readability gradient */}
          <div
            className="flex flex-col gap-6 p-6 sm:p-8 rounded-[24px]"
            style={{
              background: "linear-gradient(90deg, rgba(4, 6, 14, 0.32) 0%, rgba(4, 6, 14, 0.12) 65%, transparent 100%)",
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)"
            }}
          >
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
                Naksharix blends authentic Vedic Astrology with modern clarity to illuminate your path with purpose.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/kundli"
                className="rounded-lg bg-gradient-to-r from-[#f2c56b] to-[#c98924] px-6 py-3 text-sm font-bold text-slate-950 shadow-[0_4px_14px_rgba(242,197,107,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(242,197,107,0.35)]"
                style={{ textDecoration: "none" }}
              >
                Get Your Personal Reading
              </Link>
              <Link
                href="/free-calculators"
                className="rounded-lg border border-[rgba(255,255,255,0.45)] bg-[rgba(255,255,255,0.24)] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_14px_rgba(15,18,30,0.05)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/30"
                style={{ textDecoration: "none" }}
              >
                Explore Free Tools
              </Link>
            </div>

            {/* Trust / Features Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[rgba(255,255,255,0.18)] pt-6 mt-2">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#f2c56b]" />
                <span className="text-xs font-semibold text-[rgba(255,255,255,0.78)]">Rooted in Vedic Tradition</span>
              </div>
              <div className="flex items-center gap-2">
                <Compass size={14} className="text-[#f2c56b]" />
                <span className="text-xs font-semibold text-[rgba(255,255,255,0.78)]">Guided by Expert Astrologers</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-[#f2c56b]" />
                <span className="text-xs font-semibold text-[rgba(255,255,255,0.78)]">Personalized & Confidential</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#f2c56b]" />
                <span className="text-xs font-semibold text-[rgba(255,255,255,0.78)]">Trusted by Thousands</span>
              </div>
            </div>
          </div>

          {/* Right Side - Cosmic Outlook Card */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute inset-0 -m-10 bg-[radial-gradient(circle_at_center,rgba(216,154,43,0.18)_0%,transparent_60%)] blur-2xl pointer-events-none" />

            {/* SVG/CSS Golden orbits / planet focal richness accent behind Outlook Card */}
            <div className="absolute inset-0 -m-20 pointer-events-none flex items-center justify-center select-none opacity-45 z-0">
              <svg className="w-[500px] h-[500px] animate-[spin_120s_linear_infinite]" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Ring 1 */}
                <circle cx="250" cy="250" r="120" stroke="rgba(242,197,107,0.45)" strokeWidth="1.5" strokeDasharray="3 6" />
                {/* Ring 2 */}
                <circle cx="250" cy="250" r="180" stroke="rgba(242,197,107,0.35)" strokeWidth="1" />
                <circle cx="250" cy="250" r="180" stroke="rgba(242,197,107,0.55)" strokeWidth="3" strokeDasharray="1 40" />
                {/* Ring 3 */}
                <ellipse cx="250" cy="250" rx="230" ry="140" stroke="rgba(242,197,107,0.30)" strokeWidth="1.5" transform="rotate(-15 250 250)" />
                {/* Golden Dots on Ring 1 */}
                <circle cx="165" cy="165" r="3" fill="#f2c56b" />
                <circle cx="335" cy="335" r="3.5" fill="#c98924" />
                {/* A small planet sphere on Ring 2 */}
                <g transform="translate(377, 250)">
                  <circle cx="0" cy="0" r="8" fill="url(#planetGrad)" className="animate-pulse" />
                  {/* Planet rings */}
                  <ellipse cx="0" cy="0" rx="14" ry="4" stroke="rgba(242,197,107,0.7)" strokeWidth="1.2" transform="rotate(-20)" />
                </g>
                <defs>
                  <radialGradient id="planetGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(-3 -3) rotate(45) scale(12)">
                    <stop offset="0%" stopColor="#f7d17a" />
                    <stop offset="70%" stopColor="#c98924" />
                    <stop offset="100%" stopColor="#2b1b04" />
                  </radialGradient>
                </defs>
              </svg>
            </div>

            <div
              className="relative w-full max-w-md p-6 transition-all duration-300 hover:scale-[1.01] z-10"
              style={{
                background: "rgba(255, 255, 255, 0.68)",
                border: "1px solid rgba(255, 255, 255, 0.55)",
                backdropFilter: "blur(12px) saturate(140%)",
                borderRadius: "28px",
                boxShadow: "0 22px 60px rgba(20, 12, 8, 0.18), inset 0 1px 0 rgba(255,255,255,0.80)",
                color: "#17181d"
              }}
            >
              <div className="flex items-center justify-between border-b border-[rgba(20,20,20,0.06)] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Sun size={16} className="text-[#c98924] animate-spin-slow" />
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#c98924]">Today’s Cosmic Overview</span>
                </div>
                <span className="text-xs font-bold text-[#525866]">Sunday, Shukla Paksha</span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="p-3 shadow-sm"
                    style={{
                      background: "rgba(255,255,255,0.52)",
                      border: "1px solid rgba(255,255,255,0.50)",
                      borderRadius: "12px"
                    }}
                  >
                    <span className="block text-[10px] uppercase font-bold text-[#525866]">Tithi</span>
                    <span className="block text-sm font-black text-[#17181d] mt-1">Dwitiya</span>
                  </div>
                  <div
                    className="p-3 shadow-sm"
                    style={{
                      background: "rgba(255, 255, 255, 0.52)",
                      border: "1px solid rgba(255, 255, 255, 0.50)",
                      borderRadius: "12px"
                    }}
                  >
                    <span className="block text-[10px] uppercase font-bold text-[#525866]">Nakshatra</span>
                    <span className="block text-sm font-black text-[#17181d] mt-1">Anuradha</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="p-3 shadow-sm"
                    style={{
                      background: "rgba(255,255,255,0.52)",
                      border: "1px solid rgba(255,255,255,0.50)",
                      borderRadius: "12px"
                    }}
                  >
                    <span className="block text-[10px] uppercase font-bold text-[#525866]">Yoga</span>
                    <span className="block text-sm font-black text-[#17181d] mt-1">Siddha</span>
                  </div>
                  <div
                    className="p-3 shadow-sm"
                    style={{
                      background: "rgba(255, 255, 255, 0.52)",
                      border: "1px solid rgba(255, 255, 255, 0.50)",
                      borderRadius: "12px"
                    }}
                  >
                    <span className="block text-[10px] uppercase font-bold text-[#525866]">Karana</span>
                    <span className="block text-sm font-black text-[#17181d] mt-1">Balava</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="p-3 text-center shadow-sm"
                    style={{
                      background: "rgba(255,255,255,0.52)",
                      border: "1px solid rgba(255,255,255,0.50)",
                      borderRadius: "12px"
                    }}
                  >
                    <span className="block text-[10px] uppercase font-bold text-[#525866]">Sunrise</span>
                    <span className="block text-sm font-black text-[#17181d] mt-1">05:42 AM</span>
                  </div>
                  <div
                    className="p-3 text-center shadow-sm"
                    style={{
                      background: "rgba(255,255,255,0.52)",
                      border: "1px solid rgba(255,255,255,0.50)",
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
                    background: "rgba(255,255,255,0.52)",
                    border: "1px solid rgba(255,255,255,0.50)",
                    borderRadius: "12px"
                  }}
                >
                  <span className="block text-[10px] uppercase font-bold text-[#525866] mb-1">Rahu Kaal Alert</span>
                  <p className="text-xs font-semibold text-[#525866] leading-relaxed">
                    Auspicious tasks should be deferred between <strong className="text-[#17181d]">04:19 PM – 06:00 PM</strong>.
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
              background: "rgba(255, 255, 255, 0.46)",
              backdropFilter: "blur(12px) saturate(130%)",
              WebkitBackdropFilter: "blur(12px) saturate(130%)",
              border: "1px solid rgba(255, 255, 255, 0.62)",
              borderRadius: "28px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 18px 50px rgba(0,0,0,0.16)"
            }}
          >
            {[
              { label: "Happy Seekers", value: "1M+ Happy Seekers", icon: <Users className="h-5 w-5 text-[#c98924]" /> },
              { label: "Accuracy Rate", value: "98% Accuracy Rate", icon: <Compass className="h-5 w-5 text-[#c98924]" /> },
              { label: "Avg Rating", value: "4.9★ Avg Rating", icon: <Star className="h-5 w-5 text-[#c98924]" /> },
              { label: "Expert Support", value: "24/7 Expert Support", icon: <Shield className="h-5 w-5 text-[#c98924]" /> }
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className="flex-1 flex items-center gap-3 px-4 py-3 md:py-2 border-b md:border-b-0 md:border-r border-[rgba(255,255,255,0.35)] last:border-b-0 last:border-r-0"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/40 border border-white/50">{icon}</span>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5c6170]">{label}</span>
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
            <span className="nx-section-kicker">
              Core Services
            </span>
            <h2 className="mt-3 font-cinzel text-3xl font-bold tracking-tight text-white">
              Explore Our Core Services
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
                className="group nx-glass-card rounded-[20px] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.70),0_14px_42px_rgba(0,0,0,0.10)]"
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
            <span className="nx-section-kicker">
              Signature Tools
            </span>
            <h2 className="mt-3 font-cinzel text-3xl font-bold tracking-tight text-white">
              Signature Tools for Deeper Insights
            </h2>
            <p className="mt-1 text-sm text-slate-300 italic">
              Empower your choices through custom blueprints and astrological maps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {SIGNATURE_TOOLS.map(({ label, sub, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="group nx-glass-card flex items-center gap-3 p-3.5 rounded-[16px] shadow-[inset_0_1px_0_rgba(255,255,255,0.70),0_8px_24px_rgba(0,0,0,0.06)]"
                style={{ textDecoration: "none" }}
              >
                <div className="h-9 w-9 rounded-lg bg-[rgba(216,154,43,0.06)] border border-[rgba(216,154,43,0.18)] flex items-center justify-center flex-shrink-0 text-[#c98924] transition-transform duration-300 group-hover:scale-105">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-[#17181d] leading-snug truncate">{label}</h3>
                  <p className="text-[10px] text-[#525866] leading-normal truncate mt-0.5">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PREMIUM MEMBERSHIP ROW */}
      <section className="px-4 sm:px-8 xl:px-12 py-4">
        <div className="mx-auto max-w-[1440px]">
          <div className="nx-glass-card rounded-[20px] p-8 sm:p-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.70),0_14px_42px_rgba(0,0,0,0.08)]">
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
            <span className="nx-section-kicker">
              Testimonials
            </span>
            <h2 className="mt-3 font-cinzel text-3xl font-bold tracking-tight text-white">
              Trusted by Seekers, Guided by Stars
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, text, avatar, rating }) => (
              <div
                key={name}
                className="group nx-glass-card rounded-[20px] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.70),0_14px_42px_rgba(0,0,0,0.10)]"
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
          <div className="nx-glass-card-strong rounded-[20px] p-8 sm:p-12">
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
                  className="rounded-lg px-4 py-2.5 text-xs outline-none border border-[rgba(255,255,255,0.68)] bg-white/70 text-[#17181d] placeholder:text-[#525866]/60 focus:border-[#c98924] shadow-sm"
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

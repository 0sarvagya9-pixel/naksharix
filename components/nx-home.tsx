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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ============================================================
   DATA CONSTANTS
   ============================================================ */

const TOOLS = [
  { label: "Kundli Analysis", copy: "Deep planetary insights",         href: "/kundli",          icon: Moon },
  { label: "Daily Horoscope", copy: "Personalized daily predictions",  href: "/daily-horoscope", icon: Sun },
  { label: "Panchang",        copy: "Tithi, Nakshatra & Yoga",         href: "/panchang",        icon: CalendarDays },
  { label: "Numerology",      copy: "Numbers reveal your purpose",     href: "/numerology",      icon: Sparkles },
  { label: "Tarot Reading",   copy: "Intuitive card guidance",         href: "/tarot",           icon: Star },
  { label: "Compatibility",   copy: "Match insights for relationships", href: "/matchmaking",     icon: Heart },
  { label: "Remedies",        copy: "Powerful life remedies",          href: "/free-calculators",icon: Shield },
  { label: "Muhurat",         copy: "Find auspicious timings",         href: "/panchang",        icon: Compass },
];

const SIGNATURE_TOOLS = [
  { label: "Kundli Matching",    sub: "Check compatibility",          href: "/matchmaking",      emoji: "💑" },
  { label: "Career Guidance",    sub: "Align your path with stars",   href: "/career-astrology", emoji: "⛰️" },
  { label: "Finance & Wealth",   sub: "Unlock abundance",             href: "/free-calculators", emoji: "🌳" },
  { label: "Love & Relations",   sub: "Strengthen cosmic bonds",      href: "/matchmaking",      emoji: "🌅" },
  { label: "Spiritual Growth",   sub: "Elevate consciousness",        href: "/free-calculators", emoji: "🧘" },
  { label: "Ask a Question",     sub: "Expert astrologer answers",    href: "/consultation",     emoji: "🔮" },
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
    <div className="min-h-screen py-6 bg-[#f7f7f8] flex flex-col gap-6">

      {/* 1. First Fold Functional Section (not hero) */}
      <section className="px-4 sm:px-8 xl:px-12 pt-6">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e6941a] bg-[rgba(230,148,26,0.06)] px-2.5 py-1 rounded">
              Cosmic Dashboard
            </span>
            <h1 className="mt-2 font-cinzel text-3xl font-bold tracking-tight text-[#1e1e1f] sm:text-4xl">
              Ancient Wisdom. Modern Clarity.
            </h1>
            <p className="mt-1 text-sm text-[#66666b]">
              Naksharix cosmic coordinates — calculated with sub-second accuracy.
            </p>
          </div>

          {/* DASHBOARD PREVIEW CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* TODAY'S HIGHLIGHTS */}
            <div className="glass-card p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Moon size={15} style={{ color: "#e6941a" }} />
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.20em", color: "#e6941a", textTransform: "uppercase" }}>
                  Today&apos;s Highlights
                </span>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1e1e1f" }}>Sunday · Shukla Paksha</p>
              {[
                { icon: "🌙", label: "Moon in Scorpio" },
                { icon: "⚡", label: "Ravana Nakshatra" },
                { icon: "🌟", label: "Panchami Tithi" },
                { icon: "🔴", label: "Rahu Kaal: 04:19 – 06:00 PM" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-sm">{icon}</span>
                  <span style={{ fontSize: 13, color: "#1e1e1f", fontWeight: 600 }}>{label}</span>
                </div>
              ))}
              <Link
                href="/panchang"
                className="saffron-button mt-1"
                style={{ fontSize: 13, padding: "9px 18px", borderRadius: 10 }}
              >
                View Full Panchang
              </Link>
            </div>

            {/* YOUR COSMIC BLUEPRINT */}
            <div className="glass-card p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Star size={15} style={{ color: "#e6941a" }} />
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.20em", color: "#e6941a", textTransform: "uppercase" }}>
                  Cosmic Blueprint
                </span>
              </div>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#1e1e1f", fontFamily: "var(--font-cinzel), serif" }}>
                Namaste, Ananya ✨
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { sign: "♈", name: "Aries",   label: "Sun" },
                  { sign: "♏", name: "Scorpio", label: "Moon" },
                  { sign: "♌", name: "Leo",     label: "Ascendant" },
                ].map(({ sign, name, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl"
                    style={{ background: "rgba(230,148,26,0.06)", border: "1px solid rgba(20,20,20,0.06)" }}
                  >
                    <span style={{ fontSize: 20, color: "#e6941a" }}>{sign}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#1e1e1f" }}>{name}</span>
                    <span style={{ fontSize: 9, color: "#66666b", textTransform: "uppercase", letterSpacing: "0.10em" }}>{label}</span>
                  </div>
                ))}
              </div>
              <p className="font-cinzel text-center italic" style={{ fontSize: 11, color: "#66666b" }}>
                &ldquo;The stars incline, they do not bind.&rdquo;
              </p>
              <Link
                href="/kundli"
                className="saffron-button mt-1"
                style={{ fontSize: 13, padding: "9px 18px", borderRadius: 10 }}
              >
                View My Kundli <ArrowRight size={13} />
              </Link>
            </div>

            {/* DAILY HOROSCOPE */}
            <div className="glass-card p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Sun size={15} style={{ color: "#e6941a" }} />
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.20em", color: "#e6941a", textTransform: "uppercase" }}>
                  Daily Horoscope
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 32, color: "#e6941a" }}>♈</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: "#1e1e1f", fontFamily: "var(--font-cinzel), serif" }}>Aries</span>
              </div>
              <p style={{ fontSize: 13, color: "#66666b", lineHeight: 1.75, fontWeight: 500 }}>
                Today is filled with motivation and positive energy. Focus on your
                goals and trust your instincts for best results.
              </p>
              <div className="flex items-center justify-between mt-1">
                <Link
                  href="/daily-horoscope"
                  style={{ fontSize: 13, fontWeight: 800, color: "#e6941a", textDecoration: "none" }}
                >
                  Read Full →
                </Link>
                <div className="flex items-center gap-1" style={{ fontSize: 11, color: "#66666b" }}>
                  <ChevronLeft size={13} />
                  <span>1 / 12</span>
                  <ChevronRight size={13} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Black/Charcoal Translucent Glass Strip (Area Black requirement) */}
      <section className="px-4 sm:px-8 xl:px-12 my-2">
        <div className="mx-auto max-w-[1440px]">
          <div className="rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left" style={{ background: "rgba(20,20,24,0.85)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e6941a] animate-pulse" />
              <span style={{ color: "#ffffff", fontSize: 13, fontWeight: 700, letterSpacing: "0.05em" }}>Cosmic Alignment Status: Active</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, margin: 0, fontWeight: 500 }}>
              Ephemeris calculated with sub-second accuracy using Vedic AstroEngine 2.0.
            </p>
            <Link href="/reports" style={{ color: "#e6941a", fontSize: 12, fontWeight: 800, textDecoration: "none" }}>
              Explore Transit Reports →
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Key Tool Grid / Service Cards */}
      <section className="py-4 px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="glass-panel p-5 sm:p-7" style={{ borderRadius: 20 }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
              {TOOLS.map(({ label, copy, href, icon: Icon }) => (
                <Link key={label} href={href} className="astrology-tool-card">
                  <span
                    className="flex items-center justify-center w-11 h-11 rounded-xl"
                    style={{
                      background: "rgba(230,148,26,0.08)",
                      border: "1px solid rgba(230,148,26,0.2)",
                    }}
                  >
                    <Icon size={19} style={{ color: "#e6941a" }} />
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#1e1e1f" }}>{label}</span>
                  <span style={{ fontSize: 10, color: "#66666b", lineHeight: 1.4, textAlign: "center" }}>{copy}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Signature Tools Grid */}
      <section className="py-4 px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="h-px w-14 bg-gradient-to-r from-transparent to-[#e6941a] opacity-35" />
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.22em", color: "#e6941a", textTransform: "uppercase" }}>
                ✦ Signature Tools ✦
              </span>
              <div className="h-px w-14 bg-gradient-to-l from-transparent to-[#e6941a] opacity-35" />
            </div>
            <p style={{ color: "#66666b", fontSize: 13, fontStyle: "italic" }}>Premium. Personalized. Purposeful.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            {SIGNATURE_TOOLS.map(({ label, sub, href, emoji }) => (
              <Link
                key={label}
                href={href}
                className="glass-card flex flex-col gap-3 p-4 no-underline hover:scale-[1.02] transition-transform duration-200"
                style={{ borderRadius: 16, minHeight: 156 }}
              >
                <div
                  className="w-full rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    height: 68,
                    background: "rgba(230,148,26,0.06)",
                    border: "1px solid rgba(230,148,26,0.15)",
                    fontSize: 32,
                  }}
                >
                  {emoji}
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#1e1e1f", lineHeight: 1.3 }}>{label}</span>
                <span style={{ fontSize: 11, color: "#66666b", lineHeight: 1.4 }}>{sub}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Premium Membership Row */}
      <section className="py-4 px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="premium-card p-8 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-8 items-center">
              <div className="flex flex-col gap-2">
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: "#e6941a", textTransform: "uppercase" }}>
                  Naksharix Premium
                </span>
                <h2 className="font-decorative" style={{ fontSize: "clamp(24px, 3vw, 38px)", color: "#1e1e1f", lineHeight: 1.1 }}>
                  Go Deeper.<br />
                  <span style={{ color: "#e6941a" }}>Live Aligned.</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {PREMIUM_FEATURES.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center gap-2 text-center">
                    <span
                      className="flex items-center justify-center w-10 h-10 rounded-xl"
                      style={{ background: "rgba(230,148,26,0.06)", border: "1px solid rgba(230,148,26,0.2)" }}
                    >
                      <Icon size={18} style={{ color: "#e6941a" }} />
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#1e1e1f" }}>{label}</span>
                    <span style={{ fontSize: 10, color: "#66666b", lineHeight: 1.3 }}>{sub}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-3 text-center">
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1e1e1f" }}>Unlock Premium</span>
                <span style={{ fontSize: 11, color: "#66666b" }}>Plans from ₹199/month</span>
                <Link href="/pricing" className="saffron-button" style={{ padding: "10px 20px", fontSize: 14, borderRadius: 10 }}>
                  Upgrade Now <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials / Trust */}
      <section className="py-4 px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#e6941a] opacity-35" />
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.22em", color: "#e6941a", textTransform: "uppercase" }}>
                ✦ Trusted by Seekers Worldwide ✦
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#e6941a] opacity-35" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, text, avatar, rating }) => (
              <div key={name} className="testimonial-card">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="flex items-center justify-center w-11 h-11 rounded-full font-bold text-white text-sm flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #e6941a, #c97308)" }}
                  >
                    {avatar}
                  </span>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#1e1e1f", display: "block" }}>{name}</span>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: rating }, (_, i) => (
                        <Star key={i} size={11} style={{ color: "#e6941a", fill: "#e6941a" }} />
                      ))}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "#66666b", lineHeight: 1.72, fontStyle: "italic" }}>&ldquo;{text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Final CTA Band */}
      <section className="py-6 px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="final-cta-card relative overflow-hidden p-8 sm:p-12">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
              <div className="max-w-xl">
                <h2 className="font-decorative" style={{ fontSize: "clamp(24px, 3vw, 36px)", color: "#1e1e1f", lineHeight: 1.2 }}>
                  Begin Your Cosmic Journey
                </h2>
                <p style={{ color: "#66666b", fontSize: 14, marginTop: 10, lineHeight: 1.65 }}>
                  Unlock the secrets written in the stars and create a life of clarity, peace &amp; purpose.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="rounded-lg px-4 py-2.5 text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1.5px solid var(--nx-border)",
                    color: "#1e1e1f",
                    minWidth: 220,
                  }}
                />
                <Link href="/signup" className="saffron-button" style={{ whiteSpace: "nowrap", borderRadius: 10 }}>
                  Get Started <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

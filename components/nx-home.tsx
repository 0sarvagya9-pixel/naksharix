"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
const STATS = [
  { value: "1M+",  label: "Happy Users",      icon: "😊" },
  { value: "5M+",  label: "Kundlis Generated", icon: "📜" },
  { value: "25K+", label: "Astrologers",       icon: "🔮" },
  { value: "4.9★", label: "Avg Rating",        icon: "⭐" },
];

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
   ZODIAC WHEEL SVG — rendered inline, blends into background
   ============================================================ */
function ZodiacWheelSVG({ opacity = 1 }: { opacity?: number }) {
  const signs = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  return (
    <svg
      viewBox="0 0 400 400"
      width="100%"
      height="100%"
      aria-hidden="true"
      style={{ opacity }}
    >
      <defs>
        <radialGradient id="wg" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#FFF8EA" stopOpacity="0.95" />
          <stop offset="70%"  stopColor="#FFF3DC" stopOpacity="0.60" />
          <stop offset="100%" stopColor="#FFF8EA" stopOpacity="0.10" />
        </radialGradient>
        <filter id="gl" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="sg" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Outer rings */}
      <circle cx="200" cy="200" r="188" fill="none" stroke="rgba(212,160,55,0.14)" strokeWidth="1" />
      <circle cx="200" cy="200" r="178" fill="none" stroke="rgba(212,160,55,0.22)" strokeWidth="1" />
      {/* Main disc */}
      <circle cx="200" cy="200" r="168" fill="url(#wg)" stroke="rgba(212,160,55,0.38)" strokeWidth="1.5"/>
      {/* Inner rings */}
      <circle cx="200" cy="200" r="144" fill="none" stroke="rgba(212,160,55,0.22)" strokeWidth="0.8"/>
      <circle cx="200" cy="200" r="112" fill="none" stroke="rgba(212,160,55,0.18)" strokeWidth="0.7"/>
      <circle cx="200" cy="200" r="72"  fill="rgba(255,248,234,0.70)" stroke="rgba(212,160,55,0.40)" strokeWidth="1.5"/>
      {/* Spokes */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i * 30) - 90) * (Math.PI / 180);
        return (
          <line key={i}
            x1={200 + 75 * Math.cos(a)}  y1={200 + 75 * Math.sin(a)}
            x2={200 + 144 * Math.cos(a)} y2={200 + 144 * Math.sin(a)}
            stroke="rgba(212,160,55,0.28)" strokeWidth="0.7"
          />
        );
      })}
      {/* Zodiac glyphs */}
      {signs.map((s, i) => {
        const a = ((i * 30) - 90) * (Math.PI / 180);
        return (
          <text key={s}
            x={200 + 128 * Math.cos(a)} y={200 + 128 * Math.sin(a)}
            textAnchor="middle" dominantBaseline="central"
            fontSize="15" fill="#D97706" fontFamily="serif" fontWeight="bold" filter="url(#gl)"
          >{s}</text>
        );
      })}
      {/* Sun rays */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30) * (Math.PI / 180);
        return (
          <line key={`r${i}`}
            x1={200 + 42 * Math.cos(a)} y1={200 + 42 * Math.sin(a)}
            x2={200 + 58 * Math.cos(a)} y2={200 + 58 * Math.sin(a)}
            stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round"
          />
        );
      })}
      {/* Sun centre */}
      <circle cx="200" cy="200" r="38" fill="rgba(255,248,234,0.90)" stroke="#D97706" strokeWidth="1.8" filter="url(#sg)"/>
      <circle cx="200" cy="200" r="28" fill="rgba(245,158,11,0.12)" stroke="rgba(212,160,55,0.45)" strokeWidth="0.8"/>
      <text x="200" y="207" textAnchor="middle" dominantBaseline="central"
        fontSize="26" fill="#D97706" fontFamily="serif" fontWeight="bold" filter="url(#sg)">
        ॐ
      </text>
    </svg>
  );
}

/* ============================================================
   GANESH HERO — decorative left panel
   ============================================================ */
function GaneshHero() {
  return (
    <div className="relative w-full h-full flex items-end justify-center" style={{ minHeight: 420 }}>
      {/* Soft radial aura behind Ganesh */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 80%, rgba(245,158,11,0.22) 0%, rgba(248,217,139,0.12) 45%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />
      {/* Lotus glow disc */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 260,
          height: 60,
          background: "radial-gradient(ellipse at center, rgba(245,158,11,0.30) 0%, transparent 70%)",
          filter: "blur(12px)",
        }}
      />
      {/* Floating gold dust particles */}
      {[
        { top:"18%", left:"14%",  s:5, d:"0s"   },
        { top:"30%", left:"82%",  s:4, d:"1.2s"  },
        { top:"58%", left:"10%",  s:3, d:"2.4s"  },
        { top:"72%", left:"78%",  s:6, d:"0.6s"  },
        { top:"44%", left:"22%",  s:4, d:"1.8s"  },
        { top:"20%", left:"65%",  s:3, d:"3.0s"  },
      ].map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: p.top, left: p.left,
            width: p.s, height: p.s,
            background: "radial-gradient(circle, rgba(245,158,11,0.9), rgba(212,160,55,0.4))",
            animation: `float-gentle ${3.2 + i * 0.35}s ease-in-out infinite`,
            animationDelay: p.d,
            opacity: 0.55,
          }}
        />
      ))}
      {/* Ganesh image */}
      <div
        className="relative z-10"
        style={{ width: "100%", maxWidth: 360, height: 440, position: "relative" }}
      >
        <Image
          src="/naksharix/ganesh-hero-light-saffron.jpg"
          alt="Lord Ganesh ji — Divine blessings"
          fill
          priority
          sizes="(max-width: 1024px) 0px, 360px"
          className="object-contain object-bottom"
          style={{
            filter: "drop-shadow(0 8px 40px rgba(245,158,11,0.28)) drop-shadow(0 0 16px rgba(217,119,6,0.15))",
            maskImage: "linear-gradient(to top, rgba(0,0,0,1) 55%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 55%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   MAIN HOME COMPONENT
   ============================================================ */
export function NxHome() {
  return (
    <div className="overflow-hidden">

      {/* ======================================================
          HERO SECTION
          ====================================================== */}
      <section
        className="relative"
        style={{
          background:
            "radial-gradient(ellipse at 8% 0%, rgba(245,158,11,0.18) 0%, transparent 48%)," +
            "radial-gradient(ellipse at 92% 8%, rgba(212,160,55,0.14) 0%, transparent 44%)," +
            "#FFF8EA",
          minHeight: "calc(100vh - 64px)",
          overflow: "hidden",
        }}
      >
        {/* Background zodiac ring — very faint watermark */}
        <div
          className="absolute pointer-events-none select-none"
          style={{ top: "-8%", right: "-4%", width: 620, height: 620, opacity: 0.055 }}
        >
          <ZodiacWheelSVG />
        </div>
        {/* Second faint ring bottom-left */}
        <div
          className="absolute pointer-events-none select-none"
          style={{ bottom: "-15%", left: "-8%", width: 480, height: 480, opacity: 0.045 }}
        >
          <ZodiacWheelSVG />
        </div>

        <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-8 xl:px-12 pt-10 pb-8 lg:pt-14 lg:pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_360px] xl:grid-cols-[380px_1fr_420px] gap-6 xl:gap-10 items-center">

            {/* LEFT — Ganesh Ji (desktop only) */}
            <div className="hidden lg:block">
              <GaneshHero />
            </div>

            {/* CENTER — Hero Copy */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left gap-5 py-6 lg:py-0">
              {/* Eyebrow */}
              <span className="section-eyebrow">
                <Sparkles size={11} />
                Vedic Astrology · Ancient Wisdom
              </span>

              {/* Headline */}
              <h1
                className="font-decorative leading-[1.02]"
                style={{ fontSize: "clamp(44px, 5.5vw, 84px)", color: "#2F2418" }}
              >
                Your Destiny.{" "}
                <span
                  className="block"
                  style={{
                    background: "linear-gradient(135deg, #C2410C 0%, #D97706 50%, #F59E0B 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Your Dharma.
                </span>
              </h1>

              {/* Subheadline */}
              <p
                className="font-cinzel italic"
                style={{ fontSize: "clamp(15px, 1.8vw, 20px)", color: "#D97706", fontWeight: 600 }}
              >
                Ancient Wisdom. Modern Clarity.
              </p>

              {/* Description */}
              <p
                className="max-w-[460px]"
                style={{ color: "#5C4530", fontSize: 15, lineHeight: 1.78, fontWeight: 500 }}
              >
                Naksharix is your cosmic guide to self-discovery, clarity and a
                life aligned with your purpose.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mt-1">
                <Link href="/kundli" className="saffron-button">
                  Generate My Kundli <ArrowRight size={15} />
                </Link>
                <Link href="/daily-horoscope" className="outline-saffron-button">
                  Explore Predictions
                </Link>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 w-full lg:max-w-[500px]">
                {STATS.map((s) => (
                  <div key={s.label} className="stat-card">
                    <span style={{ fontSize: 20, fontWeight: 900, color: "#D97706", fontFamily: "var(--font-cinzel), serif" }}>
                      {s.value}
                    </span>
                    <span style={{ fontSize: 10, color: "#7A6145", fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Zodiac SVG Wheel (desktop only) */}
            <div className="hidden lg:flex flex-col items-center justify-center relative" style={{ height: 440 }}>
              {/* Ambient glow behind wheel */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(245,158,11,0.20) 0%, rgba(248,217,139,0.10) 45%, transparent 70%)",
                  filter: "blur(20px)",
                }}
              />
              {/* SVG wheel — blends naturally, no hard edges */}
              <div
                className="relative w-full"
                style={{ maxWidth: 380, animation: "solar-drift 10s ease-in-out infinite" }}
              >
                <ZodiacWheelSVG opacity={0.88} />
              </div>
              {/* Crescent accent */}
              <div
                className="absolute top-2 right-2"
                style={{
                  fontSize: 44,
                  color: "#D97706",
                  filter: "drop-shadow(0 0 14px rgba(245,158,11,0.45))",
                  animation: "float-gentle 5.5s ease-in-out infinite",
                  animationDelay: "1s",
                  opacity: 0.75,
                  lineHeight: 1,
                }}
              >
                🌙
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================
          TOOL CARDS ROW
          ====================================================== */}
      <section className="relative z-10 py-8 px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="glass-panel p-5 sm:p-7" style={{ borderRadius: 28 }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
              {TOOLS.map(({ label, copy, href, icon: Icon }) => (
                <Link key={label} href={href} className="astrology-tool-card">
                  <span
                    className="flex items-center justify-center w-11 h-11 rounded-2xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(245,158,11,0.14), rgba(212,160,55,0.22))",
                      border: "1px solid rgba(212,160,55,0.35)",
                    }}
                  >
                    <Icon size={19} style={{ color: "#D97706" }} />
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#2F2418" }}>{label}</span>
                  <span style={{ fontSize: 10, color: "#7A6145", lineHeight: 1.4, textAlign: "center" }}>{copy}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          DASHBOARD PREVIEW
          ====================================================== */}
      <section className="py-8 px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* TODAY'S HIGHLIGHTS */}
            <div className="glass-card p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Moon size={15} style={{ color: "#D97706" }} />
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.20em", color: "#D97706", textTransform: "uppercase" }}>
                  Today&apos;s Highlights
                </span>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#5C4530" }}>Sunday · Shukla Paksha</p>
              {[
                { icon: "🌙", label: "Moon in Scorpio" },
                { icon: "⚡", label: "Ravana Nakshatra" },
                { icon: "🌟", label: "Panchami Tithi" },
                { icon: "🔴", label: "Rahu Kaal: 04:19 – 06:00 PM" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-sm">{icon}</span>
                  <span style={{ fontSize: 13, color: "#2F2418", fontWeight: 600 }}>{label}</span>
                </div>
              ))}
              <Link
                href="/panchang"
                className="saffron-button mt-1"
                style={{ fontSize: 13, padding: "9px 18px", borderRadius: 12 }}
              >
                View Full Panchang
              </Link>
            </div>

            {/* YOUR COSMIC BLUEPRINT */}
            <div className="glass-card p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Star size={15} style={{ color: "#D97706" }} />
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.20em", color: "#D97706", textTransform: "uppercase" }}>
                  Cosmic Blueprint
                </span>
              </div>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#2F2418", fontFamily: "var(--font-cinzel), serif" }}>
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
                    style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(212,160,55,0.28)" }}
                  >
                    <span style={{ fontSize: 20, color: "#D97706" }}>{sign}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#2F2418" }}>{name}</span>
                    <span style={{ fontSize: 9, color: "#7A6145", textTransform: "uppercase", letterSpacing: "0.10em" }}>{label}</span>
                  </div>
                ))}
              </div>
              <p className="font-cinzel text-center italic" style={{ fontSize: 11, color: "#7A6145" }}>
                &ldquo;The stars incline, they do not bind.&rdquo;
              </p>
              <Link
                href="/kundli"
                className="saffron-button mt-1"
                style={{ fontSize: 13, padding: "9px 18px", borderRadius: 12 }}
              >
                View My Kundli <ArrowRight size={13} />
              </Link>
            </div>

            {/* DAILY HOROSCOPE */}
            <div className="glass-card p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Sun size={15} style={{ color: "#D97706" }} />
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.20em", color: "#D97706", textTransform: "uppercase" }}>
                  Daily Horoscope
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 32, color: "#D97706" }}>♈</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: "#2F2418", fontFamily: "var(--font-cinzel), serif" }}>Aries</span>
              </div>
              <p style={{ fontSize: 13, color: "#5C4530", lineHeight: 1.75, fontWeight: 500 }}>
                Today is filled with motivation and positive energy. Focus on your
                goals and trust your instincts for best results.
              </p>
              <div className="flex items-center justify-between mt-1">
                <Link
                  href="/daily-horoscope"
                  style={{ fontSize: 13, fontWeight: 800, color: "#D97706", textDecoration: "none" }}
                >
                  Read Full →
                </Link>
                <div className="flex items-center gap-1" style={{ fontSize: 11, color: "#7A6145" }}>
                  <ChevronLeft size={13} />
                  <span>1 / 12</span>
                  <ChevronRight size={13} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================
          EXPLORE SIGNATURE TOOLS
          ====================================================== */}
      <section className="py-8 px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          {/* Section header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="h-px w-14 bg-gradient-to-r from-transparent to-[#D97706] opacity-35" />
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.22em", color: "#D97706", textTransform: "uppercase" }}>
                ✦ Signature Tools ✦
              </span>
              <div className="h-px w-14 bg-gradient-to-l from-transparent to-[#D97706] opacity-35" />
            </div>
            <p style={{ color: "#7A6145", fontSize: 13, fontStyle: "italic" }}>Premium. Personalized. Purposeful.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            {SIGNATURE_TOOLS.map(({ label, sub, href, emoji }) => (
              <Link
                key={label}
                href={href}
                className="glass-card flex flex-col gap-3 p-4 no-underline hover:scale-[1.03] transition-transform duration-200"
                style={{ borderRadius: 20, minHeight: 156 }}
              >
                <div
                  className="w-full rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    height: 68,
                    background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(212,160,55,0.22))",
                    border: "1px solid rgba(212,160,55,0.30)",
                    fontSize: 32,
                  }}
                >
                  {emoji}
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#2F2418", lineHeight: 1.3 }}>{label}</span>
                <span style={{ fontSize: 11, color: "#7A6145", lineHeight: 1.4 }}>{sub}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          PREMIUM CTA SECTION
          ====================================================== */}
      <section className="py-8 px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="premium-card p-8 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-8 items-center">

              <div className="flex flex-col gap-2">
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: "#D97706", textTransform: "uppercase" }}>
                  Naksharix Premium
                </span>
                <h2 className="font-decorative" style={{ fontSize: "clamp(24px, 3vw, 38px)", color: "#2F2418", lineHeight: 1.1 }}>
                  Go Deeper.<br />
                  <span style={{ color: "#D97706" }}>Live Aligned.</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {PREMIUM_FEATURES.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center gap-2 text-center">
                    <span
                      className="flex items-center justify-center w-10 h-10 rounded-2xl"
                      style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(212,160,55,0.35)" }}
                    >
                      <Icon size={18} style={{ color: "#D97706" }} />
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#2F2418" }}>{label}</span>
                    <span style={{ fontSize: 10, color: "#7A6145", lineHeight: 1.3 }}>{sub}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-3 text-center">
                <span style={{ fontSize: 13, fontWeight: 700, color: "#2F2418" }}>Unlock Premium</span>
                <span style={{ fontSize: 11, color: "#7A6145" }}>Plans from ₹199/month</span>
                <Link href="/pricing" className="saffron-button" style={{ padding: "11px 22px", fontSize: 14 }}>
                  Upgrade Now <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          TESTIMONIALS
          ====================================================== */}
      <section className="py-8 px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D97706] opacity-35" />
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.22em", color: "#D97706", textTransform: "uppercase" }}>
                ✦ Trusted by Seekers Worldwide ✦
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D97706] opacity-35" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map(({ name, text, avatar, rating }) => (
              <div key={name} className="testimonial-card">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="flex items-center justify-center w-11 h-11 rounded-full font-bold text-white text-sm flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #D97706, #F59E0B)" }}
                  >
                    {avatar}
                  </span>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#2F2418", display: "block" }}>{name}</span>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: rating }, (_, i) => (
                        <Star key={i} size={11} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
                      ))}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "#5C4530", lineHeight: 1.72, fontStyle: "italic" }}>&ldquo;{text}&rdquo;</p>
              </div>
            ))}

            {/* 1M+ card */}
            <div
              className="testimonial-card flex flex-col items-center justify-center gap-2 text-center"
              style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(212,160,55,0.06))" }}
            >
              <span style={{ fontSize: 44, lineHeight: 1 }}>😊</span>
              <span className="font-decorative" style={{ fontSize: 30, color: "#D97706", fontWeight: 900 }}>1M+</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#2F2418" }}>Happy Users</span>
              <span style={{ fontSize: 12, color: "#7A6145" }}>and Growing</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          FINAL CTA
          ====================================================== */}
      <section className="py-10 px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="final-cta-card relative overflow-hidden p-8 sm:p-12">
            {/* Decorative zodiac watermark */}
            <div
              className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block"
              style={{ width: 220, height: 220, opacity: 0.09 }}
            >
              <ZodiacWheelSVG />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
              <div className="max-w-xl lg:pl-6">
                <h2 className="font-decorative" style={{ fontSize: "clamp(26px, 3.2vw, 44px)", color: "#2F2418", lineHeight: 1.18 }}>
                  Begin Your Cosmic Journey
                </h2>
                <p style={{ color: "#5C4530", fontSize: 14, marginTop: 10, lineHeight: 1.65 }}>
                  Unlock the secrets written in the stars and create a life of clarity, peace &amp; purpose.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:pr-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="rounded-full px-5 py-3 text-sm outline-none"
                  style={{
                    background: "rgba(255,252,245,0.90)",
                    border: "1.5px solid rgba(212,160,55,0.48)",
                    color: "#2F2418",
                    minWidth: 200,
                    backdropFilter: "blur(8px)",
                  }}
                />
                <Link href="/signup" className="saffron-button" style={{ whiteSpace: "nowrap" }}>
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

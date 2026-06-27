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
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ============================================================
   DATA CONSTANTS
   ============================================================ */
const STATS = [
  { value: "1M+", label: "Happy Users", icon: "😊" },
  { value: "5M+", label: "Kundlis Generated", icon: "📜" },
  { value: "25K+", label: "Expert Astrologers", icon: "🔮" },
  { value: "4.9★", label: "Average Rating", icon: "⭐" },
];

const TOOLS = [
  { label: "Kundli Analysis",  copy: "Deep insights for every chart",       href: "/kundli",         icon: Moon },
  { label: "Daily Horoscope",  copy: "Personalized daily predictions",      href: "/daily-horoscope", icon: Sun },
  { label: "Panchang",         copy: "Tithi, Nakshatra, Yoga & Karan",      href: "/panchang",        icon: CalendarDays },
  { label: "Numerology",       copy: "Numbers that reveal your purpose",    href: "/numerology",      icon: Sparkles },
  { label: "Tarot Reading",    copy: "Intuitive guidance through cards",    href: "/tarot",           icon: Star },
  { label: "Compatibility",    copy: "Match insights for relationships",     href: "/matchmaking",     icon: Heart },
  { label: "Remedies",         copy: "Powerful remedies for life challenges",href: "/free-calculators",icon: Shield },
  { label: "Auspicious Timing",copy: "Find Muhurat & auspicious times",     href: "/panchang",        icon: Compass },
];

const SIGNATURE_TOOLS = [
  { label: "Kundli Matching",    sub: "Check compatibility with your partner",  href: "/matchmaking",       gradient: "from-amber-100 to-orange-100" },
  { label: "Career Guidance",    sub: "Align your path with the stars",          href: "/career-astrology",  gradient: "from-orange-50 to-amber-100" },
  { label: "Finance & Wealth",   sub: "Unlock abundance and prosperity",          href: "/free-calculators",  gradient: "from-yellow-50 to-amber-100" },
  { label: "Love & Relationships",sub: "Strengthen bonds with cosmic insight",   href: "/matchmaking",       gradient: "from-amber-50 to-orange-100" },
  { label: "Spiritual Growth",   sub: "Elevate your soul and consciousness",      href: "/free-calculators",  gradient: "from-orange-100 to-yellow-50" },
  { label: "Ask a Question",     sub: "Get answers from expert astrologers",      href: "/consultation",      gradient: "from-amber-100 to-yellow-50" },
];

const PREMIUM_FEATURES = [
  { icon: Moon,     label: "Advanced Kundli",   sub: "In-depth planetary insights" },
  { icon: Star,     label: "Premium Reports",   sub: "Comprehensive life reports" },
  { icon: Shield,   label: "Priority Support",  sub: "Connect with top astrologers" },
  { icon: CheckCircle, label: "Ad-Free Experience", sub: "Enjoy seamless premium journey" },
];

const TESTIMONIALS = [
  {
    name: "Priya S.",
    text: "\"Naksharix gave me the clarity I was looking for. Life-changing insights!\"",
    avatar: "PS",
    rating: 5,
  },
  {
    name: "Rahul K.",
    text: "\"The most accurate predictions I've ever received. Grateful always.\"",
    avatar: "RK",
    rating: 5,
  },
  {
    name: "Meen K.",
    text: "\"I found peace, purpose and a new sense of direction.\"",
    avatar: "MK",
    rating: 5,
  },
];

const FOOTER_GROUPS = [
  {
    title: "Explore",
    links: [
      ["Kundli",     "/kundli"],
      ["Horoscope",  "/daily-horoscope"],
      ["Panchang",   "/panchang"],
      ["Numerology", "/numerology"],
      ["Tarot",      "/tarot"],
    ],
  },
  {
    title: "Services",
    links: [
      ["Compatibility",     "/matchmaking"],
      ["Remedies",          "/free-calculators"],
      ["Auspicious Timing", "/panchang"],
      ["Consultation",      "/consultation"],
      ["Reports",           "/reports"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Blog",             "/blog"],
      ["Astrology Basics", "/about"],
      ["Vedic Wisdom",     "/about"],
      ["FAQs",             "/contact"],
      ["Privacy Policy",   "/privacy-policy"],
    ],
  },
  {
    title: "Support",
    links: [
      ["Contact Us",     "/contact"],
      ["Help Center",    "/contact"],
      ["Terms of Use",   "/terms"],
      ["Refund Policy",  "/refund-policy"],
    ],
  },
];

/* ============================================================
   ZODIAC SIGNS SVG WHEEL COMPONENT
   ============================================================ */
function ZodiacWheelSVG() {
  const signs = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" aria-hidden="true">
      <defs>
        <radialGradient id="wheelGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#FFF8EA" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFF3DC" stopOpacity="0.4" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="sunGlow">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Outer glow ring */}
      <circle cx="200" cy="200" r="185" fill="none" stroke="rgba(212,160,55,0.20)" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="175" fill="none" stroke="rgba(212,160,55,0.35)" strokeWidth="1" />

      {/* Main wheel background */}
      <circle cx="200" cy="200" r="165" fill="url(#wheelGrad)" stroke="rgba(212,160,55,0.4)" strokeWidth="1.5" />

      {/* Inner rings */}
      <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(212,160,55,0.25)" strokeWidth="1" />
      <circle cx="200" cy="200" r="110" fill="none" stroke="rgba(212,160,55,0.20)" strokeWidth="0.8" />
      <circle cx="200" cy="200" r="68"  fill="rgba(255,248,234,0.8)" stroke="rgba(212,160,55,0.45)" strokeWidth="1.5" />

      {/* Spokes */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x1 = 200 + 72 * Math.cos(angle);
        const y1 = 200 + 72 * Math.sin(angle);
        const x2 = 200 + 140 * Math.cos(angle);
        const y2 = 200 + 140 * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(212,160,55,0.30)" strokeWidth="0.8" />;
      })}

      {/* Zodiac sign labels */}
      {signs.map((sign, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const r = 125;
        const x = 200 + r * Math.cos(angle);
        const y = 200 + r * Math.sin(angle);
        return (
          <text key={sign} x={x} y={y} textAnchor="middle" dominantBaseline="central"
            fontSize="16" fill="#D97706" fontFamily="Georgia, serif" fontWeight="bold" filter="url(#glow)">
            {sign}
          </text>
        );
      })}

      {/* Center sun */}
      {/* Sun rays */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30) * (Math.PI / 180);
        const x1 = 200 + 40 * Math.cos(angle);
        const y1 = 200 + 40 * Math.sin(angle);
        const x2 = 200 + 55 * Math.cos(angle);
        const y2 = 200 + 55 * Math.sin(angle);
        return <line key={`ray-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />;
      })}

      <circle cx="200" cy="200" r="36" fill="url(#wheelGrad)" stroke="#D97706" strokeWidth="2" filter="url(#sunGlow)" />
      <circle cx="200" cy="200" r="28" fill="rgba(245,158,11,0.15)" stroke="rgba(212,160,55,0.5)" strokeWidth="1" />

      {/* OM symbol */}
      <text x="200" y="207" textAnchor="middle" dominantBaseline="central"
        fontSize="28" fill="#D97706" fontFamily="serif" fontWeight="bold" filter="url(#sunGlow)">
        ॐ
      </text>
    </svg>
  );
}

/* ============================================================
   GANESH HERO COMPONENT (IMAGE + SVG GLOW OVERLAY)
   ============================================================ */
function GaneshHero() {
  return (
    <div className="relative flex items-end justify-center w-full h-full min-h-[360px]">
      {/* Lotus glow background */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(245,158,11,0.18) 0%, rgba(248,217,139,0.10) 50%, transparent 75%)",
          filter: "blur(32px)",
        }}
      />
      {/* Floating particles */}
      {(
        [
          { top: "15%", left: "12%",  right: undefined, delay: "0s",   size: 6 },
          { top: "25%", left: undefined, right: "10%",  delay: "1.2s", size: 5 },
          { top: "60%", left: "8%",   right: undefined, delay: "2.4s", size: 4 },
          { top: "70%", left: undefined, right: "15%",  delay: "0.6s", size: 7 },
          { top: "40%", left: "20%",  right: undefined, delay: "1.8s", size: 5 },
        ] as { top: string; left?: string; right?: string; delay: string; size: number }[]
      ).map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full opacity-60"
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            width: p.size,
            height: p.size,
            background: "radial-gradient(circle, #F59E0B, #D97706)",
            animation: `float-gentle ${3 + i * 0.4}s ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}
      {/* The Ganesh image */}
      <div className="relative z-10 w-full h-full" style={{ maxWidth: 380, maxHeight: 460 }}>
        <Image
          src="/naksharix/ganesh-hero-light-saffron.jpg"
          alt="Lord Ganesh ji — Divine blessings for Naksharix"
          fill
          priority
          className="object-contain object-bottom drop-shadow-[0_0_48px_rgba(245,158,11,0.35)]"
          sizes="(max-width: 768px) 0px, 380px"
        />
      </div>
      {/* Lotus petals below */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-12 opacity-40"
        style={{
          background: "radial-gradient(ellipse at center bottom, rgba(245,158,11,0.5), transparent 70%)",
          filter: "blur(8px)",
        }}
      />
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
            "radial-gradient(ellipse at 10% 0%, rgba(245,158,11,0.16) 0%, transparent 50%), radial-gradient(ellipse at 90% 10%, rgba(212,160,55,0.12) 0%, transparent 45%), #FFF8EA",
          minHeight: "calc(100vh - 96px)",
          overflow: "hidden",
        }}
      >
        {/* Decorative background zodiac ring */}
        <div
          className="absolute opacity-[0.06] pointer-events-none"
          style={{
            top: "-10%", right: "-5%",
            width: "650px", height: "650px",
          }}
        >
          <ZodiacWheelSVG />
        </div>

        <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-8 xl:px-12 pt-12 pb-8 lg:pt-16 lg:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_340px] xl:grid-cols-[380px_1fr_400px] gap-8 items-center min-h-[600px]">

            {/* LEFT — Ganesh Ji */}
            <div className="hidden lg:flex items-end justify-center h-full min-h-[480px]">
              <GaneshHero />
            </div>

            {/* CENTER — Hero Copy */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left gap-5 py-8 lg:py-0">
              {/* Eyebrow */}
              <span className="section-eyebrow">
                <Sparkles size={12} />
                Vedic Astrology · Ancient Wisdom
              </span>

              {/* Headline */}
              <h1
                className="font-decorative leading-[1.0]"
                style={{ fontSize: "clamp(48px, 6vw, 88px)", color: "#2F2418" }}
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
                style={{ fontSize: "clamp(16px, 2vw, 22px)", color: "#D97706", fontWeight: 600 }}
              >
                Ancient Wisdom. Modern Clarity.
              </p>

              {/* Description */}
              <p
                className="max-w-[480px]"
                style={{ color: "#7A6145", fontSize: 16, lineHeight: 1.75, fontWeight: 500 }}
              >
                Naksharix is your cosmic guide to self-discovery, clarity and a life aligned with your purpose.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mt-2">
                <Link href="/kundli" className="saffron-button">
                  Generate My Kundli <ArrowRight size={16} />
                </Link>
                <Link href="/daily-horoscope" className="outline-saffron-button">
                  Explore Predictions
                </Link>
              </div>

              {/* Stats Row inline */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 w-full lg:max-w-[520px]">
                {STATS.map((s) => (
                  <div key={s.label} className="stat-card">
                    <span style={{ fontSize: 22, fontWeight: 900, color: "#D97706", fontFamily: "var(--font-cinzel), serif" }}>
                      {s.value}
                    </span>
                    <span style={{ fontSize: 11, color: "#7A6145", fontWeight: 600, textAlign: "center" }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Zodiac Wheel + Temple */}
            <div className="hidden lg:flex flex-col items-center justify-center gap-4 relative h-full min-h-[480px]">
              {/* Temple/celestial background glow */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(248,217,139,0.3) 0%, transparent 70%)",
                }}
              />

              {/* Zodiac wheel image */}
              <div className="relative w-full" style={{ maxWidth: 360, maxHeight: 360 }}>
                <Image
                  src="/naksharix/zodiac-wheel-gold.jpg"
                  alt="Golden Vedic Zodiac Wheel"
                  width={360}
                  height={360}
                  priority
                  className="object-contain drop-shadow-[0_0_40px_rgba(245,158,11,0.35)]"
                  style={{ animation: "solar-drift 8s ease-in-out infinite" }}
                />
              </div>

              {/* Crescent moon accent */}
              <div
                className="absolute top-4 right-4 opacity-60"
                style={{
                  fontSize: 48,
                  color: "#D97706",
                  filter: "drop-shadow(0 0 16px rgba(245,158,11,0.5))",
                  animation: "float-gentle 5s ease-in-out infinite",
                  animationDelay: "1s",
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
      <section className="relative z-10 py-12 px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          {/* Glass container */}
          <div
            className="glass-panel p-6 sm:p-8"
            style={{ borderRadius: 28 }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-4">
              {TOOLS.map(({ label, copy, href, icon: Icon }) => (
                <Link key={label} href={href} className="astrology-tool-card">
                  <span
                    className="flex items-center justify-center w-11 h-11 rounded-2xl"
                    style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(212,160,55,0.30)" }}
                  >
                    <Icon size={20} style={{ color: "#D97706" }} />
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
          DASHBOARD PREVIEW SECTION
          ====================================================== */}
      <section className="py-12 px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* TODAY'S HIGHLIGHTS */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <Moon size={16} style={{ color: "#D97706" }} />
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: "#D97706", textTransform: "uppercase" }}>
                  Today&apos;s Highlights
                </span>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#7A6145" }}>
                May 25, 2025 · Sunday
              </p>
              {[
                { icon: "🌙", label: "Moon in Scorpio" },
                { icon: "⚡", label: "Ravana Nakshatra" },
                { icon: "🌟", label: "Shukla Paksha · Panchami Tithi" },
                { icon: "🔴", label: "Rahu Kaal: 04:19 PM – 06:00 PM" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-base">{icon}</span>
                  <span style={{ fontSize: 13, color: "#2F2418", fontWeight: 600 }}>{label}</span>
                </div>
              ))}
              <Link
                href="/panchang"
                className="saffron-button mt-2"
                style={{ fontSize: 13, padding: "10px 20px", borderRadius: 12 }}
              >
                View Full Panchang
              </Link>
            </div>

            {/* YOUR COSMIC BLUEPRINT */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <Star size={16} style={{ color: "#D97706" }} />
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: "#D97706", textTransform: "uppercase" }}>
                  Your Cosmic Blueprint
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 22, fontWeight: 900, color: "#2F2418", fontFamily: "var(--font-cinzel), serif" }}>
                  Namaste, Ananya ✨
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { sign: "♈", name: "Aries",   label: "Sun Sign" },
                  { sign: "♏", name: "Scorpio",  label: "Moon Sign" },
                  { sign: "♌", name: "Leo",      label: "Ascendant" },
                ].map(({ sign, name, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-2xl" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(212,160,55,0.25)" }}>
                    <span style={{ fontSize: 22, color: "#D97706" }}>{sign}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#2F2418" }}>{name}</span>
                    <span style={{ fontSize: 9, color: "#7A6145", textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</span>
                  </div>
                ))}
              </div>
              <p className="font-cinzel text-center italic" style={{ fontSize: 12, color: "#7A6145" }}>
                &ldquo;The stars incline, they do not bind.&rdquo;
                <br /><span style={{ fontSize: 10, color: "#D97706" }}>— Indian Wisdom</span>
              </p>
              <Link
                href="/kundli"
                className="saffron-button mt-1"
                style={{ fontSize: 13, padding: "10px 20px", borderRadius: 12 }}
              >
                View My Kundli <ArrowRight size={14} />
              </Link>
            </div>

            {/* DAILY HOROSCOPE */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <Sun size={16} style={{ color: "#D97706" }} />
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: "#D97706", textTransform: "uppercase" }}>
                  Daily Horoscope
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 36, color: "#D97706" }}>♈</span>
                <span style={{ fontSize: 24, fontWeight: 900, color: "#2F2418", fontFamily: "var(--font-cinzel), serif" }}>Aries</span>
              </div>
              <p style={{ fontSize: 14, color: "#7A6145", lineHeight: 1.7, fontWeight: 500 }}>
                Today is full of motivation and positive energy. Focus on your goals and trust your instincts.
              </p>
              <div className="flex items-center justify-between mt-2">
                <Link
                  href="/daily-horoscope"
                  style={{ fontSize: 13, fontWeight: 800, color: "#D97706", textDecoration: "none" }}
                >
                  Read Full Horoscope →
                </Link>
                <div className="flex items-center gap-2" style={{ fontSize: 12, color: "#7A6145" }}>
                  <ChevronLeft size={14} />
                  <span>1 / 12</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          EXPLORE SIGNATURE TOOLS
          ====================================================== */}
      <section className="py-12 px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          {/* Section header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#D97706] opacity-40" />
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.22em", color: "#D97706", textTransform: "uppercase" }}>
                ✦ Explore Our Signature Tools ✦
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#D97706] opacity-40" />
            </div>
            <p style={{ color: "#7A6145", fontSize: 14, fontStyle: "italic" }}>Premium. Personalized. Purposeful.</p>
          </div>

          {/* Tool cards with imagery-style glass cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            {SIGNATURE_TOOLS.map(({ label, sub, href, gradient }) => (
              <Link
                key={label}
                href={href}
                className={`glass-card bg-gradient-to-br ${gradient} flex flex-col gap-3 p-4 hover:scale-[1.03] transition-transform duration-200 no-underline`}
                style={{ minHeight: 160, borderRadius: 20 }}
              >
                {/* Icon area - decorative colored block simulating imagery */}
                <div
                  className="w-full rounded-xl flex items-center justify-center"
                  style={{
                    height: 72,
                    background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(212,160,55,0.25))",
                    border: "1px solid rgba(212,160,55,0.30)",
                    fontSize: 32,
                  }}
                >
                  {label === "Kundli Matching"     ? "💑"
                  : label === "Career Guidance"    ? "⛰️"
                  : label === "Finance & Wealth"   ? "🌳"
                  : label === "Love & Relationships" ? "🌅"
                  : label === "Spiritual Growth"   ? "🧘"
                  : "🔮"}
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#2F2418" }}>{label}</span>
                <span style={{ fontSize: 11, color: "#7A6145", lineHeight: 1.4 }}>{sub}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          NAKSHARIX PREMIUM CTA
          ====================================================== */}
      <section className="py-12 px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="premium-card p-8 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-8 items-center">

              {/* Left — Lotus + Copy */}
              <div className="flex flex-col gap-2">
                <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", color: "#D97706", textTransform: "uppercase" }}>
                  Naksharix Premium
                </span>
                <h2 className="font-decorative" style={{ fontSize: "clamp(26px, 3vw, 40px)", color: "#2F2418", lineHeight: 1.1 }}>
                  Go Deeper.<br />
                  <span style={{ color: "#D97706" }}>Live Aligned.</span>
                </h2>
              </div>

              {/* Center — Feature icons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {PREMIUM_FEATURES.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center gap-2 text-center">
                    <span
                      className="flex items-center justify-center w-11 h-11 rounded-2xl"
                      style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(212,160,55,0.35)" }}
                    >
                      <Icon size={20} style={{ color: "#D97706" }} />
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#2F2418" }}>{label}</span>
                    <span style={{ fontSize: 10, color: "#7A6145", lineHeight: 1.3 }}>{sub}</span>
                  </div>
                ))}
              </div>

              {/* Right — CTA */}
              <div className="flex flex-col items-center gap-3 text-center">
                <span style={{ fontSize: 13, fontWeight: 700, color: "#2F2418" }}>Unlock Premium</span>
                <span style={{ fontSize: 11, color: "#7A6145" }}>Plans starting at ₹199/month</span>
                <Link href="/pricing" className="saffron-button" style={{ padding: "12px 24px", fontSize: 14 }}>
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
      <section className="py-12 px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          {/* Section header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D97706] opacity-40" />
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.22em", color: "#D97706", textTransform: "uppercase" }}>
                ✦ Trusted by Seekers Across the World ✦
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D97706] opacity-40" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map(({ name, text, avatar, rating }) => (
              <div key={name} className="testimonial-card">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="flex items-center justify-center w-12 h-12 rounded-full font-bold text-white text-sm flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #D97706, #F59E0B)" }}
                  >
                    {avatar}
                  </span>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#2F2418" }}>{name}</span>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: rating }, (_, i) => (
                        <Star key={i} size={12} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
                      ))}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "#7A6145", lineHeight: 1.7, fontStyle: "italic" }}>{text}</p>
              </div>
            ))}

            {/* 1M+ happy users card */}
            <div
              className="testimonial-card flex flex-col items-center justify-center gap-2 text-center"
              style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(212,160,55,0.08))" }}
            >
              <span style={{ fontSize: 48, lineHeight: 1 }}>😊</span>
              <span className="font-decorative" style={{ fontSize: 32, color: "#D97706", fontWeight: 900 }}>1M+</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#2F2418" }}>Happy Users</span>
              <span style={{ fontSize: 12, color: "#7A6145" }}>and Growing</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          FINAL CTA — BEGIN YOUR COSMIC JOURNEY
          ====================================================== */}
      <section className="py-16 px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="final-cta-card relative overflow-hidden p-8 sm:p-12">
            {/* Decorative elements */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[280px] opacity-20 pointer-events-none hidden lg:block"
              style={{
                background: "url('/naksharix/zodiac-wheel-gold.jpg') no-repeat center/contain",
                filter: "sepia(1) saturate(0.5)",
              }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-[160px] opacity-15 pointer-events-none hidden lg:block"
              style={{
                background: "radial-gradient(ellipse at right, rgba(245,158,11,0.3), transparent 70%)",
              }}
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
              <div className="max-w-xl lg:pl-8">
                <h2 className="font-decorative" style={{ fontSize: "clamp(28px, 3.5vw, 48px)", color: "#2F2418", lineHeight: 1.15 }}>
                  Begin Your Cosmic Journey
                </h2>
                <p style={{ color: "#7A6145", fontSize: 15, marginTop: 12, lineHeight: 1.6 }}>
                  Unlock the secrets written in the stars and create a life of clarity, peace &amp; purpose.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:pr-8">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="rounded-full px-5 py-3 text-sm outline-none flex-1"
                  style={{
                    background: "rgba(255,252,245,0.85)",
                    border: "1.5px solid rgba(212,160,55,0.45)",
                    color: "#2F2418",
                    minWidth: 220,
                    backdropFilter: "blur(8px)",
                  }}
                />
                <Link href="/signup" className="saffron-button" style={{ whiteSpace: "nowrap" }}>
                  Get Started <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          FOOTER
          ====================================================== */}
      <NxFooter />
    </div>
  );
}

/* ============================================================
   NX FOOTER — Light saffron glass style
   ============================================================ */
function NxFooter() {
  return (
    <footer
      style={{
        background: "linear-gradient(180deg, rgba(255,252,245,0.95) 0%, rgba(255,248,234,1) 100%)",
        borderTop: "1px solid rgba(212,160,55,0.35)",
      }}
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 xl:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_2.5fr] gap-10">

          {/* Left brand block */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Image
                src="/images/naksharix-final-logo-symbol.png"
                alt="Naksharix"
                width={44}
                height={44}
                className="object-contain"
              />
              <span
                className="font-cinzel text-xl font-black tracking-[0.16em]"
                style={{
                  background: "linear-gradient(135deg, #C2410C, #D97706, #F59E0B)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Naksharix
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#7A6145", lineHeight: 1.75, maxWidth: 280 }}>
              Your trusted companion for Vedic Astrology, spiritual growth and meaningful life.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: Youtube,    href: "#", label: "YouTube"   },
                { icon: Instagram,  href: "#", label: "Instagram" },
                { icon: Facebook,   href: "#", label: "Facebook"  },
                { icon: Twitter,    href: "#", label: "Twitter"   },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:-translate-y-1"
                  style={{
                    background: "rgba(245,158,11,0.10)",
                    border: "1px solid rgba(212,160,55,0.30)",
                    color: "#D97706",
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>

            {/* Stay connected */}
            <div className="flex flex-col gap-2">
              <span style={{ fontSize: 12, fontWeight: 800, color: "#2F2418" }}>Stay Connected</span>
              <p style={{ fontSize: 11, color: "#7A6145" }}>Get daily horoscope &amp; updates straight to your inbox.</p>
              <div className="flex gap-2 mt-1">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-full px-4 py-2 text-xs outline-none"
                  style={{
                    background: "rgba(255,252,245,0.9)",
                    border: "1px solid rgba(212,160,55,0.40)",
                    color: "#2F2418",
                  }}
                />
                <button
                  type="submit"
                  className="saffron-button"
                  style={{ padding: "8px 14px", fontSize: 12, borderRadius: 999 }}
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Right links grid */}
          <nav aria-label="Footer navigation" className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {FOOTER_GROUPS.map(({ title, links }) => (
              <div key={title}>
                <p
                  className="font-cinzel font-bold mb-3"
                  style={{ fontSize: 13, color: "#2F2418", letterSpacing: "0.06em" }}
                >
                  {title}
                </p>
                <div className="flex flex-col gap-2">
                  {links.map(([label, href]) => (
                    <Link
                      key={`${title}-${href}`}
                      href={href}
                      style={{ fontSize: 12, color: "#7A6145", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}
                      onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = "#D97706"; }}
                      onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = "#7A6145"; }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-10 pt-6"
          style={{ borderTop: "1px solid rgba(212,160,55,0.25)" }}
        >
          <p style={{ fontSize: 12, color: "#7A6145" }}>© 2025 Naksharix. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 12, color: "#7A6145" }}>🌐</span>
            <span style={{ fontSize: 12, color: "#7A6145" }}>English</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

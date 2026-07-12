"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  CheckCircle,
  Clock3,
  Coins,
  Compass,
  Eye,
  Heart,
  HeartHandshake,
  HelpCircle,
  Moon,
  Shield,
  Sparkles,
  Star,
  Sun,
  Users,
} from "lucide-react";

const CORE_SERVICES = [
  { label: "Kundli Analysis", copy: "Generate chart-based birth insights from the details you provide.", href: "/kundli", icon: Moon },
  { label: "Horoscopes", copy: "Explore daily, weekly, yearly, and zodiac guidance.", href: "/horoscope", icon: Sun },
  { label: "Panchang", copy: "Calculate date-and-location-based Panchang details and timings.", href: "/panchang", icon: CalendarDays },
  { label: "Numerology", copy: "Explore deterministic name, date, mobile, vehicle, and Lo Shu tools.", href: "/numerology", icon: Sparkles },
  { label: "Tarot Readings", copy: "Use reflective card spreads for personal contemplation.", href: "/tarot", icon: Compass },
  { label: "Compatibility", copy: "Review traditional compatibility factors with clear limitations.", href: "/matchmaking", icon: Heart },
  { label: "Spiritual Guidance", copy: "Browse available tools without guaranteed remedy or outcome claims.", href: "/free-calculators", icon: Shield },
  { label: "Muhurat", copy: "Review traditional timing information using available Panchang data.", href: "/panchang", icon: Clock3 },
];

const SIGNATURE_TOOLS = [
  { label: "Kundli Matching", sub: "Review traditional factors", href: "/matchmaking", icon: HeartHandshake },
  { label: "Career Guidance", sub: "Explore reflective themes", href: "/career-astrology", icon: Briefcase },
  { label: "Finance Reflection", sub: "Use guidance responsibly", href: "/free-calculators", icon: Coins },
  { label: "Love & Relations", sub: "Explore compatibility context", href: "/matchmaking", icon: Heart },
  { label: "Spiritual Growth", sub: "Browse reflective tools", href: "/free-calculators", icon: Eye },
  { label: "Consult an Astrologer", sub: "Book an approved profile", href: "/consultation", icon: HelpCircle },
];

const PREMIUM_FEATURES = [
  { icon: Moon, label: "Advanced Kundli", sub: "Eligible report sections" },
  { icon: Star, label: "Premium Reports", sub: "Account-linked access" },
  { icon: Users, label: "Consultations", sub: "Approved astrologer profiles" },
  { icon: CheckCircle, label: "Saved Access", sub: "Reopen eligible reports" },
];

const TRUST_PRINCIPLES = [
  {
    title: "Calculation Transparency",
    text: "Outputs depend on the details entered, the selected calculation provider, and the modules currently available.",
    icon: Compass,
  },
  {
    title: "Privacy-Conscious Access",
    text: "Saved reports and bookings are linked to authenticated accounts, while payment credentials remain with Razorpay.",
    icon: Shield,
  },
  {
    title: "Responsible Guidance",
    text: "Astrology, numerology, tarot, and consultations support reflection; they do not guarantee professional or future outcomes.",
    icon: CheckCircle,
  },
];

const METRICS = [
  { label: "Report Access", value: "Account protected", icon: Users },
  { label: "Payment Status", value: "Server verified", icon: Shield },
  { label: "Consultations", value: "Approved profiles", icon: Star },
  { label: "Product Trust", value: "Clear limitations", icon: Compass },
];

const previewCellStyle = {
  background: "rgba(255,255,255,0.52)",
  border: "1px solid rgba(255,255,255,0.50)",
  borderRadius: "12px",
};

export function NxHome() {
  return (
    <div className="flex flex-col gap-10 bg-transparent py-8">
      <section className="px-4 pt-8 sm:px-8 md:pt-16 xl:px-12">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div
            className="flex flex-col gap-6 rounded-[24px] p-6 sm:p-8"
            style={{
              background: "linear-gradient(90deg, rgba(4, 6, 14, 0.32) 0%, rgba(4, 6, 14, 0.12) 65%, transparent 100%)",
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
            }}
          >
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(216,154,43,0.18)] bg-[rgba(216,154,43,0.08)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.20em] text-[#d89a2b]">
                <Sparkles size={11} className="animate-pulse" /> Traditional Vedic Tools
              </span>
              <h1
                className="mt-4 font-cinzel text-4xl font-semibold leading-[1.2] tracking-tight sm:text-5xl lg:text-6xl"
                style={{ textShadow: "0 4px 28px rgba(0,0,0,0.32)" }}
              >
                <span className="text-[#fffaf0]">Decode Your Destiny.</span>
                <br />
                <span className="bg-gradient-to-r from-[#f7d17a] to-[#c98924] bg-clip-text font-medium italic text-transparent">
                  Design Your Future.
                </span>
              </h1>
              <p
                className="mt-4 text-base font-medium leading-relaxed md:text-lg"
                style={{ color: "rgba(255,255,255,0.78)", maxWidth: "560px", fontSize: "18px" }}
              >
                Naksharix combines traditional astrology frameworks with digital tools for reflection, planning, saved reports, and consultations.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/kundli"
                className="rounded-lg bg-gradient-to-r from-[#f2c56b] to-[#c98924] px-6 py-3 text-sm font-bold text-slate-950 shadow-[0_4px_14px_rgba(242,197,107,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(242,197,107,0.35)]"
                style={{ textDecoration: "none" }}
              >
                Generate Your Kundli
              </Link>
              <Link
                href="/free-calculators"
                className="rounded-lg border border-[rgba(255,255,255,0.45)] bg-[rgba(255,255,255,0.24)] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_14px_rgba(15,18,30,0.05)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/30"
                style={{ textDecoration: "none" }}
              >
                Explore Free Tools
              </Link>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[rgba(255,255,255,0.18)] pt-6">
              <TrustItem icon={Sparkles} label="Traditional calculation frameworks" />
              <TrustItem icon={Users} label="Approved consultation profiles" />
              <TrustItem icon={Shield} label="Account-protected reports" />
              <TrustItem icon={Compass} label="Guidance, not guarantees" />
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="pointer-events-none absolute inset-0 -m-10 bg-[radial-gradient(circle_at_center,rgba(216,154,43,0.18)_0%,transparent_60%)] blur-2xl" />
            <div className="pointer-events-none absolute inset-0 -m-20 z-0 flex select-none items-center justify-center opacity-45">
              <svg className="h-[500px] w-[500px] animate-[spin_120s_linear_infinite]" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="250" cy="250" r="120" stroke="rgba(242,197,107,0.45)" strokeWidth="1.5" strokeDasharray="3 6" />
                <circle cx="250" cy="250" r="180" stroke="rgba(242,197,107,0.35)" strokeWidth="1" />
                <circle cx="250" cy="250" r="180" stroke="rgba(242,197,107,0.55)" strokeWidth="3" strokeDasharray="1 40" />
                <ellipse cx="250" cy="250" rx="230" ry="140" stroke="rgba(242,197,107,0.30)" strokeWidth="1.5" transform="rotate(-15 250 250)" />
                <circle cx="165" cy="165" r="3" fill="#f2c56b" />
                <circle cx="335" cy="335" r="3.5" fill="#c98924" />
                <g transform="translate(377, 250)">
                  <circle cx="0" cy="0" r="8" fill="url(#planetGrad)" className="animate-pulse" />
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
              className="relative z-10 w-full max-w-md p-6 transition-all duration-300 hover:scale-[1.01]"
              style={{
                background: "rgba(255, 255, 255, 0.68)",
                border: "1px solid rgba(255, 255, 255, 0.55)",
                backdropFilter: "blur(12px) saturate(140%)",
                borderRadius: "28px",
                boxShadow: "0 22px 60px rgba(20, 12, 8, 0.18), inset 0 1px 0 rgba(255,255,255,0.80)",
                color: "#17181d",
              }}
            >
              <div className="mb-4 flex items-center justify-between border-b border-[rgba(20,20,20,0.06)] pb-4">
                <div className="flex items-center gap-2">
                  <Sun size={16} className="text-[#c98924]" />
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#c98924]">Panchang Preview</span>
                </div>
                <span className="text-xs font-bold text-[#525866]">Date + location based</span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <PreviewCell label="Tithi" value="Calculated" />
                  <PreviewCell label="Nakshatra" value="Calculated" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <PreviewCell label="Yoga" value="Calculated" />
                  <PreviewCell label="Karana" value="Calculated" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <PreviewCell label="Sunrise" value="By location" centered />
                  <PreviewCell label="Sunset" value="By location" centered />
                </div>
                <div className="p-3 shadow-sm" style={previewCellStyle}>
                  <span className="mb-1 block text-[10px] font-bold uppercase text-[#525866]">Timing Note</span>
                  <p className="text-xs font-semibold leading-relaxed text-[#525866]">
                    Use the Panchang calculator for current timings. Results depend on the selected date and location.
                  </p>
                </div>
              </div>

              <Link
                href="/panchang"
                className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#f2c56b] to-[#c98924] py-2.5 text-xs font-bold text-slate-950 shadow-[0_2px_8px_rgba(242,197,107,0.18)] transition-all hover:opacity-90"
                style={{ textDecoration: "none" }}
              >
                Calculate Current Panchang →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div
            className="flex w-full flex-col p-2 md:flex-row md:items-center md:p-3"
            style={{
              background: "rgba(255, 255, 255, 0.46)",
              backdropFilter: "blur(12px) saturate(130%)",
              WebkitBackdropFilter: "blur(12px) saturate(130%)",
              border: "1px solid rgba(255, 255, 255, 0.62)",
              borderRadius: "28px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 18px 50px rgba(0,0,0,0.16)",
            }}
          >
            {METRICS.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-1 items-center gap-3 border-b border-[rgba(255,255,255,0.35)] px-4 py-3 last:border-b-0 md:border-b-0 md:border-r md:py-2 md:last:border-r-0"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/50 bg-white/40">
                  <Icon className="h-5 w-5 text-[#c98924]" />
                </span>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5c6170]">{label}</span>
                  <span className="mt-0.5 block text-sm font-black text-[#17181d]">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 text-center">
            <span className="nx-section-kicker">Core Services</span>
            <h2 className="mt-3 font-cinzel text-3xl font-bold tracking-tight text-white">Explore Our Core Services</h2>
            <p className="mt-1 text-sm italic text-slate-300">
              Digital astrology and reflection tools with feature-specific inputs, calculations, and stated limitations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                <p className="mt-2 text-xs leading-relaxed text-[#525866]">{copy}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#c98924]">
                  Open Tool <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="my-2 px-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[rgba(255,255,255,0.15)] bg-[rgba(20,24,34,0.6)] p-4 text-center shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl md:flex-row md:text-left">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#f2c56b]" />
              <span className="text-xs font-bold tracking-[0.05em] text-white md:text-sm">Calculation Status: Data Dependent</span>
            </div>
            <p className="m-0 text-xs font-medium text-slate-300 md:text-sm">
              Results depend on accurate inputs, available provider data, and the modules enabled for each tool.
            </p>
            <Link href="/disclaimer" className="text-xs font-bold text-[#f2c56b] transition-all hover:text-[#c98924]" style={{ textDecoration: "none" }}>
              Read Limitations →
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 text-center">
            <span className="nx-section-kicker">Signature Tools</span>
            <h2 className="mt-3 font-cinzel text-3xl font-bold tracking-tight text-white">Tools for Deeper Reflection</h2>
            <p className="mt-1 text-sm italic text-slate-300">Use each result as context alongside practical judgment.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {SIGNATURE_TOOLS.map(({ label, sub, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="group nx-glass-card flex items-center gap-3 rounded-[16px] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.70),0_8px_24px_rgba(0,0,0,0.06)]"
                style={{ textDecoration: "none" }}
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[rgba(216,154,43,0.18)] bg-[rgba(216,154,43,0.06)] text-[#c98924] transition-transform duration-300 group-hover:scale-105">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-xs font-bold leading-snug text-[#17181d]">{label}</h3>
                  <p className="mt-0.5 truncate text-[10px] leading-normal text-[#525866]">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="nx-glass-card rounded-[20px] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.70),0_14px_42px_rgba(0,0,0,0.08)] sm:p-10">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_2fr_auto]">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c98924]">Naksharix Premium</span>
                <h2 className="font-cinzel text-3xl font-black leading-tight text-[#17181d]">
                  Go Deeper.
                  <br />
                  <span className="bg-gradient-to-r from-[#f7d17a] to-[#c98924] bg-clip-text text-transparent">Stay Informed.</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {PREMIUM_FEATURES.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center gap-2 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(216,154,43,0.18)] bg-[rgba(216,154,43,0.06)]">
                      <Icon size={16} className="text-[#c98924]" />
                    </span>
                    <span className="text-xs font-bold text-[#17181d]">{label}</span>
                    <span className="text-[10px] leading-tight text-[#525866]">{sub}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-2 border-t border-[rgba(20,20,20,0.06)] pt-6 text-center lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <span className="text-xs font-bold text-[#17181d]">Premium Access</span>
                <span className="text-[10px] text-[#525866]">Pricing is shown before payment</span>
                <Link href="/reports" className="mt-2 rounded-lg bg-gradient-to-r from-[#f7d17a] to-[#c98924] px-4 py-2 text-xs font-bold text-[#17181d] shadow-[0_10px_28px_rgba(201,137,36,0.28)] transition-all hover:-translate-y-0.5">
                  Explore Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-4 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 text-center">
            <span className="nx-section-kicker">Trust Principles</span>
            <h2 className="mt-3 font-cinzel text-3xl font-bold tracking-tight text-white">Clarity Before Claims</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {TRUST_PRINCIPLES.map(({ title, text, icon: Icon }) => (
              <div key={title} className="group nx-glass-card rounded-[20px] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.70),0_14px_42px_rgba(0,0,0,0.10)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#f7d17a] to-[#c98924] text-[#17181d] shadow-[0_2px_8px_rgba(201,137,36,0.22)]">
                  <Icon size={18} />
                </span>
                <h3 className="mt-4 font-cinzel text-base font-bold text-[#17181d]">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#525866]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="nx-glass-card-strong rounded-[20px] p-8 sm:p-12">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div className="max-w-xl">
                <h2 className="font-cinzel text-3xl font-black leading-tight text-[#17181d]">Begin Your Reflective Journey</h2>
                <p className="mt-2 text-xs leading-relaxed text-[#525866]">
                  Create an account to save eligible reports and bookings. Use every result as guidance alongside practical judgment.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#f7d17a] to-[#c98924] px-5 py-2.5 text-xs font-bold text-[#17181d] shadow-[0_10px_28px_rgba(201,137,36,0.28)] transition-all hover:-translate-y-0.5">
                  Create Account <ArrowRight size={13} />
                </Link>
                <Link href="/disclaimer" className="inline-flex items-center justify-center rounded-lg border border-[#c98924]/30 bg-white/45 px-5 py-2.5 text-xs font-bold text-[#6f4912] transition-all hover:bg-white/60">
                  Read Disclaimer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TrustItem({ icon: Icon, label }: { icon: typeof Sparkles; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-[#f2c56b]" />
      <span className="text-xs font-semibold text-[rgba(255,255,255,0.78)]">{label}</span>
    </div>
  );
}

function PreviewCell({ label, value, centered = false }: { label: string; value: string; centered?: boolean }) {
  return (
    <div className={`p-3 shadow-sm${centered ? " text-center" : ""}`} style={previewCellStyle}>
      <span className="block text-[10px] font-bold uppercase text-[#525866]">{label}</span>
      <span className="mt-1 block text-sm font-black text-[#17181d]">{value}</span>
    </div>
  );
}

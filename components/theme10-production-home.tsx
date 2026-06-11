import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, Grid3X3, HeartHandshake, MoonStar, ShieldCheck, Sparkles, Star, SunMedium } from "lucide-react";

const tools = [
  { label: "Kundli", copy: "Birth Chart", href: "/kundli", icon: MoonStar },
  { label: "Panchang", copy: "Daily Guide", href: "/panchang", icon: CalendarDays },
  { label: "Horoscope", copy: "Predictions", href: "/daily-horoscope", icon: SunMedium },
  { label: "Numerology", copy: "Numbers", href: "/numerology", icon: Grid3X3 },
  { label: "Match Making", copy: "Compatibility", href: "/matchmaking", icon: HeartHandshake },
  { label: "Tarot", copy: "Insights", href: "/tarot", icon: Sparkles },
  { label: "Transits", copy: "Planetary Moves", href: "/transits", icon: Star },
  { label: "More Tools", copy: "All Calculators", href: "/free-calculators", icon: Grid3X3 }
];

const reports = ["Birth Chart", "Life Path", "Year Ahead"];
const zodiac = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

export function Theme10ProductionHome() {
  return (
    <main className="theme10-home relative isolate overflow-hidden bg-[#fbf6ea] text-[#172536]">
      <Theme10Styles />
      <section className="relative overflow-hidden px-4 pb-6 pt-7 sm:px-6 lg:px-10 lg:pb-7 lg:pt-10">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_63%_32%,rgba(216,175,102,.34),transparent_22rem),radial-gradient(circle_at_80%_44%,rgba(137,169,197,.32),transparent_31rem),linear-gradient(135deg,#fffaf1_0%,#fbf6ea_48%,#eef5fb_100%)]" />
        <div className="mx-auto grid max-w-[1520px] grid-cols-1 items-center gap-8 lg:min-h-[calc(100vh-116px)] lg:grid-cols-[minmax(0,0.41fr)_minmax(0,0.59fr)] lg:gap-10 xl:gap-14">
          <div className="relative z-10 max-w-[42rem] overflow-visible py-2">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d8af66]/55 bg-white/72 px-4 py-2 text-[.72rem] font-extrabold uppercase tracking-[.28em] text-[#b8862e] shadow-[0_10px_28px_rgba(184,134,46,.12)] backdrop-blur">
              <Sparkles className="h-4 w-4" /> Your Cosmic Blueprint
            </div>
            <h1 className="theme10-title font-decorative text-[clamp(3.35rem,5.15vw,6.35rem)] font-black uppercase leading-[.9] tracking-[-.035em] text-[#172536]">
              <span className="block">Master the</span>
              <span className="block text-[#bd8627]">Cosmos.</span>
              <span className="block">Live Your Destiny.</span>
            </h1>
            <p className="mt-6 max-w-[36rem] text-base leading-8 text-[#566575] sm:text-lg">
              Premium astrology tools, daily Panchang, Kundli insights and review-based personalized reports crafted through the Naksharix workflow.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <ThemeButton href="/kundli" primary>Get My Kundli</ThemeButton>
              <ThemeButton href="/free-calculators">Explore Tools</ThemeButton>
            </div>
            <div className="mt-7 grid max-w-[42rem] grid-cols-1 gap-3 sm:grid-cols-3">
              {["Provider calculated", "Secure workflow", "Review-based reports"].map((item) => <div key={item} className="rounded-2xl border border-[#e7d8be] bg-white/66 px-4 py-3 text-sm font-bold text-[#172536] shadow-[0_12px_32px_rgba(31,41,51,.06)] backdrop-blur">{item}</div>)}
            </div>
          </div>
          <CosmicScene />
          <MobileHero />
        </div>
      </section>
      <ToolStrip />
      <InfoSections />
    </main>
  );
}

function ThemeButton({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
  const className = primary ? "bg-gradient-to-r from-[#bf8422] to-[#d8af66] text-white shadow-[0_18px_42px_rgba(184,134,46,.28)]" : "border border-[#d8af66]/65 bg-white/70 text-[#172536] shadow-[0_16px_34px_rgba(31,41,51,.08)]";
  return <Link href={href} className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold backdrop-blur transition hover:-translate-y-.5 ${className}`}>{children}<ArrowRight className="h-4 w-4" /></Link>;
}

function CosmicScene() {
  return (
    <div className="relative mx-auto hidden w-full max-w-[850px] lg:block" aria-hidden="true">
      <div className="absolute inset-x-[-2rem] bottom-[4%] z-20 h-36 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,.94)_0%,rgba(246,239,217,.70)_44%,transparent_76%)] blur-xl" />
      <div className="relative mx-auto aspect-[1.18/1] w-[min(49vw,850px)] max-h-[73vh]">
        <div className="absolute inset-[3%_0%_0%_5%] rounded-[46%] bg-[radial-gradient(circle_at_52%_52%,rgba(255,231,154,.48)_0%,rgba(137,169,197,.26)_38%,transparent_72%)] blur-3xl" />
        <div className="theme10-wheel absolute inset-[8%_7%_6%_4%] rounded-[45%] border border-[#d8af66]/35 bg-[radial-gradient(circle_at_center,#fff8dc_0%,#ffe3a1_8%,#173653_17%,#0d2438_36%,rgba(13,36,56,.90)_55%,rgba(220,234,247,.52)_78%,transparent_100%)] shadow-[0_28px_90px_rgba(13,36,56,.22),inset_0_0_0_2px_rgba(255,255,255,.30)]">
          <div className="absolute inset-[7%] rounded-full border border-[#d8af66]/70" />
          <div className="theme10-reverse absolute inset-[15%] rounded-full border border-white/55" />
          <div className="absolute inset-[23%] rounded-full border border-[#d8af66]/35" />
          <div className="absolute inset-[4%] rounded-full opacity-80 [background:repeating-conic-gradient(from_0deg,rgba(216,175,102,.42)_0deg,rgba(216,175,102,.42)_1deg,transparent_1deg,transparent_30deg)]" />
          <div className="absolute inset-[10%] rounded-full opacity-80 [background:repeating-conic-gradient(from_10deg,transparent_0deg,transparent_27deg,rgba(255,255,255,.48)_28deg,transparent_29deg)]" />
          {zodiac.map((item, index) => (
            <span key={item} className="theme10-zodiac absolute left-1/2 top-1/2 text-2xl font-black text-[#f1c66f] drop-shadow-[0_0_12px_rgba(216,175,102,.65)]" style={{ transform: `translate(-50%,-50%) rotate(${index * 30}deg) translateY(-15.7rem) rotate(-${index * 30}deg)` }}>{item}</span>
          ))}
          <div className="theme10-sun absolute left-1/2 top-1/2 z-30 grid h-[9rem] w-[9rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#d8af66] bg-[radial-gradient(circle,#fff9dc_0%,#ffe6a4_42%,#d8af66_76%,#b8862e_100%)] text-7xl font-black text-[#8f5b10] shadow-[0_0_40px_rgba(255,221,139,.92),0_0_108px_rgba(216,175,102,.80)]">
            <span className="absolute inset-[-5rem] -z-10 rounded-full bg-[repeating-conic-gradient(from_0deg,rgba(255,210,105,.82)_0deg,rgba(255,210,105,.82)_2deg,transparent_3deg,transparent_9deg)] opacity-85" />
            ॐ
          </div>
        </div>
        <Planet className="theme10-orbit-a left-[19%] top-[4%] h-16 w-16 from-[#0b8092] via-[#2ab0c8] to-[#07344d]" />
        <Planet className="theme10-orbit-b right-[9%] top-[4%] h-24 w-24 from-[#fff1c9] via-[#d58a43] to-[#7d4217]" />
        <Planet className="theme10-orbit-c bottom-[20%] left-[12%] h-20 w-20 from-[#fff1c9] via-[#d9a64d] to-[#7b5417] ringed" />
        <Planet className="theme10-orbit-d bottom-[21%] right-[8%] h-24 w-24 from-[#e9f7ff] via-[#2c86c3] to-[#0a3d63]" />
        <Planet className="theme10-orbit-e left-[3%] top-[53%] h-12 w-12 from-[#c8fff0] via-[#22a598] to-[#07545a]" />
        <Planet className="theme10-orbit-f right-[34%] top-[38%] h-10 w-10 from-[#ffd98f] via-[#e86b27] to-[#8e2f12]" />
      </div>
    </div>
  );
}

function Planet({ className }: { className: string }) {
  const ringed = className.includes("ringed");
  return <div className={`absolute z-40 ${className.replace(" ringed", "")}`}><span className="relative block h-full w-full rounded-full bg-gradient-to-br shadow-[inset_-14px_-14px_24px_rgba(0,0,0,.28),0_18px_38px_rgba(13,36,56,.28)]">{ringed ? <span className="absolute left-1/2 top-1/2 h-[42%] w-[150%] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-full border-[5px] border-[#f0d18b]/80" /> : null}</span></div>;
}

function MobileHero() {
  return <div className="lg:hidden"><div className="rounded-[2rem] border border-[#e7d8be] bg-white/82 p-4 shadow-[0_24px_70px_rgba(31,41,51,.13)] backdrop-blur"><div className="grid grid-cols-[1fr_8rem] items-center gap-4 rounded-3xl bg-[#fff9f0] p-4"><div><p className="text-[.66rem] font-extrabold uppercase tracking-[.18em] text-[#b8862e]">Your Cosmic Blueprint</p><h2 className="mt-2 font-cinzel text-3xl font-black leading-[.96] text-[#172536]">Understand.<br />Align. Elevate.</h2><Link href="/kundli" className="mt-4 inline-flex rounded-xl bg-[#b8862e] px-4 py-2 text-xs font-extrabold text-white">Get My Kundli</Link></div><div className="grid aspect-square place-items-center rounded-full bg-[radial-gradient(circle,#fff4cc_0%,#d8af66_28%,#0d2438_45%,#dce8f7_78%,transparent_100%)] text-4xl text-[#8f5b10] shadow-[0_0_46px_rgba(216,175,102,.38)]">ॐ</div></div><div className="mt-4 grid grid-cols-4 gap-2">{tools.map(({ label, href, icon: Icon }) => <Link key={label} href={href} className="rounded-2xl border border-[#e7d8be] bg-white p-2 text-center text-[.68rem] font-bold text-[#172536]"><Icon className="mx-auto mb-1 h-4 w-4 text-[#b8862e]" />{label.split(' ')[0]}</Link>)}</div></div></div>;
}

function ToolStrip() {
  return <section className="px-4 pb-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1500px] rounded-3xl border border-[#e7d8be] bg-white/78 p-3 shadow-[0_22px_70px_rgba(31,41,51,.09)] backdrop-blur"><div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">{tools.map(({ label, copy, href, icon: Icon }) => <Link key={label} href={href} className="group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 transition hover:-translate-y-.5 hover:border-[#d8af66]/55 hover:bg-[#fff9f0]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff4df] text-[#b8862e] shadow-inner"><Icon className="h-5 w-5" /></span><span className="min-w-0"><span className="block text-sm font-extrabold text-[#172536]">{label}</span><span className="block text-[.68rem] text-[#6b7280]">{copy}</span></span></Link>)}</div></div></section>;
}

function InfoSections() {
  return <section className="px-4 pb-10 sm:px-6 lg:px-10"><div className="mx-auto grid max-w-[1500px] gap-5 xl:grid-cols-[1.1fr_1.1fr_.8fr]"><InfoCard title="Today’s Panchang" href="/panchang"><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{[['Tithi','Shukla Paksha'],['Nakshatra','Provider calculated'],['Yoga','Daily guide'],['Karana','Values may vary']].map(([a,b]) => <div key={a} className="rounded-2xl bg-[#fff9f0] p-4"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#b8862e]">{a}</p><p className="mt-2 text-sm font-bold text-[#172536]">{b}</p></div>)}</div></InfoCard><InfoCard title="Premium Reports" href="/reports"><div className="grid grid-cols-3 gap-3">{reports.map((report) => <Link key={report} href="/reports" className="rounded-2xl border border-[#e7d8be] bg-[#fff9f0] p-4 text-center transition hover:-translate-y-.5"><FileText className="mx-auto h-8 w-8 text-[#b8862e]" /><p className="mt-3 text-sm font-extrabold text-[#172536]">{report}</p><p className="text-xs text-[#6b7280]">Premium report</p></Link>)}</div></InfoCard><InfoCard title="Why Naksharix?" href="/disclaimer"><div className="space-y-3">{["Calculated using Naksharix internal astrology engine", "Secure owner/admin report workflow", "Spiritual guidance, not guaranteed outcome"].map((item) => <div key={item} className="flex gap-3 rounded-2xl bg-[#fff9f0] p-3 text-sm font-bold text-[#172536]"><ShieldCheck className="h-5 w-5 flex-shrink-0 text-[#b8862e]" />{item}</div>)}</div></InfoCard></div></section>;
}

function InfoCard({ title, href, children }: { title: string; href: string; children: ReactNode }) {
  return <div className="rounded-3xl border border-[#e7d8be] bg-white/78 p-5 shadow-[0_18px_58px_rgba(31,41,51,.08)] backdrop-blur"><div className="mb-5 flex items-center justify-between"><h2 className="font-cinzel text-xl font-black text-[#172536]">{title}</h2><Link href={href} className="text-xs font-extrabold uppercase tracking-[.12em] text-[#b8862e]">View →</Link></div>{children}</div>;
}

function Theme10Styles() {
  return <style>{`body:has(.theme10-home){background:#fbf6ea!important}body:has(.theme10-home) header.sticky{border-color:rgba(231,216,190,.9)!important;background:rgba(255,250,241,.86)!important;box-shadow:0 18px 55px rgba(31,41,51,.08)!important;backdrop-filter:blur(18px)}body:has(.theme10-home) header.sticky a,body:has(.theme10-home) header.sticky button{color:#172536!important}.theme10-title{text-wrap:balance}.theme10-wheel{animation:theme10-spin 130s linear infinite}.theme10-reverse{animation:theme10-spin-rev 170s linear infinite}.theme10-sun{animation:theme10-sun 5s ease-in-out infinite}.theme10-zodiac{font-family:serif}.theme10-orbit-a{animation:theme10-orbit 62s linear infinite;transform-origin:335px 335px}.theme10-orbit-b{animation:theme10-orbit-rev 95s linear infinite;transform-origin:-250px 310px}.theme10-orbit-c{animation:theme10-orbit 78s linear infinite;transform-origin:250px -160px}.theme10-orbit-d{animation:theme10-orbit-rev 120s linear infinite;transform-origin:-230px -120px}.theme10-orbit-e{animation:theme10-orbit 48s linear infinite;transform-origin:390px 0}.theme10-orbit-f{animation:theme10-orbit-rev 35s linear infinite;transform-origin:-120px 170px}@keyframes theme10-spin{to{transform:rotate(360deg)}}@keyframes theme10-spin-rev{to{transform:rotate(-360deg)}}@keyframes theme10-orbit{to{transform:rotate(360deg)}}@keyframes theme10-orbit-rev{to{transform:rotate(-360deg)}}@keyframes theme10-sun{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.025)}}@media(prefers-reduced-motion:reduce){.theme10-home *{animation:none!important;scroll-behavior:auto!important}}@media(max-width:1200px){.theme10-title{font-size:clamp(3.1rem,4.8vw,5.45rem)!important}}`}</style>;
}

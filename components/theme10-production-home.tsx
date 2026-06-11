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
      <section className="relative overflow-hidden px-4 pb-8 pt-8 sm:px-6 lg:px-10 lg:pb-8 lg:pt-10">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_66%_28%,rgba(216,175,102,.24),transparent_24rem),radial-gradient(circle_at_82%_50%,rgba(137,169,197,.24),transparent_34rem),linear-gradient(135deg,#fffaf1_0%,#fbf6ea_48%,#eef5fb_100%)]" />
        <div className="mx-auto grid max-w-[1540px] grid-cols-1 items-center gap-7 lg:min-h-[calc(100vh-116px)] lg:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)] lg:gap-10 xl:gap-14">
          <div className="relative z-10 max-w-[41rem] overflow-visible py-2">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d8af66]/55 bg-white/75 px-4 py-2 text-[.72rem] font-extrabold uppercase tracking-[.28em] text-[#b8862e] shadow-[0_10px_28px_rgba(184,134,46,.12)] backdrop-blur">
              <Sparkles className="h-4 w-4" /> Your Cosmic Blueprint
            </div>
            <h1 className="theme10-title font-decorative text-[clamp(3.25rem,4.75vw,5.95rem)] font-black uppercase leading-[.92] tracking-[-.04em] text-[#172536]">
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
  const className = primary
    ? "bg-gradient-to-r from-[#bf8422] to-[#d8af66] text-white shadow-[0_18px_42px_rgba(184,134,46,.28)]"
    : "border border-[#d8af66]/65 bg-white/78 text-[#172536] shadow-[0_16px_34px_rgba(31,41,51,.08)]";
  return <Link href={href} className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold backdrop-blur transition hover:-translate-y-.5 ${className}`}>{children}<ArrowRight className="h-4 w-4" /></Link>;
}

function CosmicScene() {
  return (
    <div className="relative mx-auto hidden w-full max-w-[820px] lg:block" aria-hidden="true">
      <div className="theme10-clouds absolute inset-x-[-8%] bottom-[2%] z-30 h-44 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,.95)_0%,rgba(246,239,217,.72)_42%,rgba(220,234,247,.32)_58%,transparent_76%)] blur-xl" />
      <div className="relative mx-auto aspect-square w-[min(42vw,760px)] max-h-[72vh] rounded-full">
        <div className="absolute inset-[-12%] rounded-full bg-[radial-gradient(circle,rgba(255,232,170,.45)_0%,rgba(137,169,197,.26)_38%,transparent_72%)] blur-3xl" />
        <div className="absolute inset-[3%] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,248,221,.96)_0%,rgba(246,216,144,.82)_12%,rgba(36,77,107,.9)_26%,rgba(13,36,56,.92)_54%,rgba(137,169,197,.32)_79%,transparent_100%)] shadow-[0_30px_100px_rgba(13,36,56,.22),inset_0_0_0_2px_rgba(255,255,255,.34)]" />
        <div className="theme10-wheel absolute inset-[5%] rounded-full border border-[#e4bf72]/55">
          <Ring inset="7%" strong />
          <Ring inset="15%" />
          <Ring inset="24%" />
          <Ring inset="34%" />
          <div className="absolute inset-[3%] rounded-full opacity-80 [background:repeating-conic-gradient(from_0deg,rgba(216,175,102,.48)_0deg,rgba(216,175,102,.48)_1deg,transparent_1deg,transparent_15deg)]" />
          <div className="absolute inset-[8%] rounded-full opacity-70 [background:repeating-conic-gradient(from_8deg,transparent_0deg,transparent_28deg,rgba(255,255,255,.55)_29deg,transparent_30deg)]" />
          <div className="absolute inset-0 rounded-full">
            {zodiac.map((symbol, index) => (
              <span key={symbol} className="theme10-zodiac-glyph absolute left-1/2 top-1/2 text-2xl font-bold text-[#f1c66f] drop-shadow-[0_0_12px_rgba(216,175,102,.58)]" style={{ transform: `translate(-50%,-50%) rotate(${index * 30}deg) translateY(-250px) rotate(-${index * 30}deg)` }}>{symbol}</span>
            ))}
          </div>
          <div className="theme10-sun absolute left-1/2 top-1/2 z-30 grid h-[8.8rem] w-[8.8rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#d8af66] bg-[radial-gradient(circle,#fffdf0_0%,#ffe6a4_40%,#d8af66_73%,#b8862e_100%)] text-7xl font-black text-[#8f5b10] shadow-[0_0_40px_rgba(255,221,139,.9),0_0_120px_rgba(216,175,102,.74)]">
            <span className="absolute inset-[-5.6rem] -z-10 rounded-full bg-[repeating-conic-gradient(from_0deg,rgba(255,210,105,.78)_0deg,rgba(255,210,105,.78)_2deg,transparent_3deg,transparent_8deg)] opacity-90" />
            <span className="absolute inset-[-2.9rem] -z-10 rounded-full bg-[radial-gradient(circle,rgba(255,230,164,.95)_0%,rgba(216,175,102,.4)_42%,transparent_72%)] blur-md" />
            ॐ
          </div>
        </div>
        <Orbit className="theme10-orbit-a inset-[1%]" planetClass="right-[4%] top-[8%] h-24 w-24 from-[#fff1c9] via-[#d58a43] to-[#7d4217]" />
        <Orbit className="theme10-orbit-b inset-[4%]" planetClass="bottom-[18%] right-[3%] h-22 w-22 from-[#e9f7ff] via-[#2c86c3] to-[#0a3d63]" />
        <Orbit className="theme10-orbit-c inset-[9%]" planetClass="bottom-[22%] left-[8%] h-20 w-20 from-[#fff1c9] via-[#d9a64d] to-[#7b5417] ringed" />
        <Orbit className="theme10-orbit-d inset-[13%]" planetClass="left-[5%] top-[20%] h-14 w-14 from-[#0b8092] via-[#2ab0c8] to-[#07344d]" />
        <Orbit className="theme10-orbit-e inset-[17%]" planetClass="right-[20%] top-[19%] h-10 w-10 from-[#ffd98f] via-[#e86b27] to-[#8e2f12]" />
      </div>
    </div>
  );
}

function Ring({ inset, strong }: { inset: string; strong?: boolean }) {
  return <div className="absolute rounded-full" style={{ inset, border: `1px solid ${strong ? "rgba(216,175,102,.72)" : "rgba(255,255,255,.42)"}` }} />;
}

function Orbit({ className, planetClass }: { className: string; planetClass: string }) {
  const ringed = planetClass.includes("ringed");
  return (
    <div className={`absolute z-40 rounded-full ${className}`}>
      <span className={`absolute block rounded-full bg-gradient-to-br ${planetClass.replace(" ringed", "")} shadow-[inset_-14px_-14px_24px_rgba(0,0,0,.28),0_18px_38px_rgba(13,36,56,.28)]`}>
        {ringed ? <span className="absolute left-1/2 top-1/2 h-[42%] w-[152%] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-full border-[5px] border-[#f0d18b]/85" /> : null}
      </span>
    </div>
  );
}

function MobileHero() {
  return <div className="lg:hidden"><div className="rounded-[2rem] border border-[#e7d8be] bg-white/84 p-4 shadow-[0_24px_70px_rgba(31,41,51,.13)] backdrop-blur"><div className="grid grid-cols-[1fr_8rem] items-center gap-4 rounded-3xl bg-[#fff9f0] p-4"><div><p className="text-[.66rem] font-extrabold uppercase tracking-[.18em] text-[#b8862e]">Your Cosmic Blueprint</p><h2 className="mt-2 font-cinzel text-3xl font-black leading-[.96] text-[#172536]">Understand.<br />Align. Elevate.</h2><Link href="/kundli" className="mt-4 inline-flex rounded-xl bg-[#b8862e] px-4 py-2 text-xs font-extrabold text-white">Get My Kundli</Link></div><div className="grid aspect-square place-items-center rounded-full bg-[radial-gradient(circle,#fff4cc_0%,#d8af66_28%,#0d2438_45%,#dce8f7_78%,transparent_100%)] text-4xl text-[#8f5b10] shadow-[0_0_46px_rgba(216,175,102,.38)]">ॐ</div></div><div className="mt-4 grid grid-cols-4 gap-2">{tools.map(({ label, href, icon: Icon }) => <Link key={label} href={href} className="rounded-2xl border border-[#e7d8be] bg-white p-2 text-center text-[.68rem] font-bold text-[#172536]"><Icon className="mx-auto mb-1 h-4 w-4 text-[#b8862e]" />{label.split(" ")[0]}</Link>)}</div></div></div>;
}

function ToolStrip() {
  return <section className="px-4 pb-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1500px] rounded-3xl border border-[#e7d8be] bg-white/82 p-3 shadow-[0_22px_70px_rgba(31,41,51,.09)] backdrop-blur"><div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">{tools.map(({ label, copy, href, icon: Icon }) => <Link key={label} href={href} className="group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 transition hover:-translate-y-.5 hover:border-[#d8af66]/55 hover:bg-[#fff9f0]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff4df] text-[#b8862e] shadow-inner"><Icon className="h-5 w-5" /></span><span className="min-w-0"><span className="block text-sm font-extrabold text-[#172536]">{label}</span><span className="block text-[.68rem] text-[#6b7280]">{copy}</span></span></Link>)}</div></div></section>;
}

function InfoSections() {
  return <section className="px-4 pb-10 sm:px-6 lg:px-10"><div className="mx-auto grid max-w-[1500px] gap-5 xl:grid-cols-[1.1fr_1.1fr_.8fr]"><InfoCard title="Today’s Panchang" href="/panchang"><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{[["Tithi","Shukla Paksha"],["Nakshatra","Provider calculated"],["Yoga","Daily guide"],["Karana","Values may vary"]].map(([a,b]) => <div key={a} className="rounded-2xl bg-[#fff9f0] p-4"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#b8862e]">{a}</p><p className="mt-2 text-sm font-bold text-[#172536]">{b}</p></div>)}</div></InfoCard><InfoCard title="Premium Reports" href="/reports"><div className="grid grid-cols-3 gap-3">{reports.map((report) => <Link key={report} href="/reports" className="rounded-2xl border border-[#e7d8be] bg-[#fff9f0] p-4 text-center transition hover:-translate-y-.5"><FileText className="mx-auto h-8 w-8 text-[#b8862e]" /><p className="mt-3 text-sm font-extrabold text-[#172536]">{report}</p><p className="text-xs text-[#6b7280]">Premium report</p></Link>)}</div></InfoCard><InfoCard title="Why Naksharix?" href="/disclaimer"><div className="space-y-3">{["Calculated using Naksharix internal astrology engine", "Secure owner/admin report workflow", "Spiritual guidance, not guaranteed outcome"].map((item) => <div key={item} className="flex gap-3 rounded-2xl bg-[#fff9f0] p-3 text-sm font-bold text-[#172536]"><ShieldCheck className="h-5 w-5 flex-shrink-0 text-[#b8862e]" />{item}</div>)}</div></InfoCard></div></section>;
}

function InfoCard({ title, href, children }: { title: string; href: string; children: ReactNode }) {
  return <div className="rounded-3xl border border-[#e7d8be] bg-white/80 p-5 shadow-[0_18px_58px_rgba(31,41,51,.08)] backdrop-blur"><div className="mb-5 flex items-center justify-between"><h2 className="font-cinzel text-xl font-black text-[#172536]">{title}</h2><Link href={href} className="text-xs font-extrabold uppercase tracking-[.12em] text-[#b8862e]">View →</Link></div>{children}</div>;
}

function Theme10Styles() {
  return <style>{`.theme10-title{text-wrap:balance}.theme10-wheel{animation:theme10-spin 140s linear infinite}.theme10-reverse{animation:theme10-spin-rev 180s linear infinite}.theme10-sun{animation:theme10-sun 5s ease-in-out infinite}.theme10-clouds{animation:theme10-cloud 10s ease-in-out infinite alternate}.theme10-orbit-a{animation:theme10-orbit 95s linear infinite}.theme10-orbit-b{animation:theme10-orbit-rev 120s linear infinite}.theme10-orbit-c{animation:theme10-orbit 78s linear infinite}.theme10-orbit-d{animation:theme10-orbit-rev 62s linear infinite}.theme10-orbit-e{animation:theme10-orbit 48s linear infinite}@keyframes theme10-spin{to{transform:rotate(360deg)}}@keyframes theme10-spin-rev{to{transform:rotate(-360deg)}}@keyframes theme10-orbit{to{transform:rotate(360deg)}}@keyframes theme10-orbit-rev{to{transform:rotate(-360deg)}}@keyframes theme10-sun{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.025)}}@keyframes theme10-cloud{from{transform:translateX(-10px);opacity:.78}to{transform:translateX(16px);opacity:.98}}@media(prefers-reduced-motion:reduce){.theme10-home *{animation:none!important;scroll-behavior:auto!important}}@media(max-width:1200px){.theme10-title{font-size:clamp(3rem,4.6vw,5.3rem)!important}.theme10-zodiac-glyph{display:none!important}}`}</style>;
}

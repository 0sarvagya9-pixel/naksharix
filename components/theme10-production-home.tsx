import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, Grid3X3, HeartHandshake, MoonStar, ScrollText, ShieldCheck, Sparkles, Star, SunMedium } from "lucide-react";

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

const reports = [
  { title: "Birth Chart", subtitle: "Detailed Kundli", href: "/reports" },
  { title: "Life Path", subtitle: "Comprehensive", href: "/reports" },
  { title: "Year Ahead", subtitle: "2026 Insights", href: "/reports" }
];

export function Theme10ProductionHome() {
  return (
    <div className="theme10-home relative isolate overflow-hidden bg-[#fbf6ea] text-[#172536]">
      <Theme10Styles />
      <section className="relative overflow-hidden px-4 pb-8 pt-8 sm:px-6 lg:px-10 lg:pb-10 lg:pt-12">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_68%_34%,rgba(216,175,102,0.28),transparent_26rem),radial-gradient(circle_at_82%_46%,rgba(137,169,197,0.26),transparent_30rem),linear-gradient(135deg,#fffaf1_0%,#fbf6ea_46%,#eef5fb_100%)]" />
        <div className="pointer-events-none absolute left-[-8rem] top-36 -z-10 h-72 w-72 rounded-full border border-[#d8af66]/20 opacity-40" />
        <div className="mx-auto grid max-w-[1520px] grid-cols-1 items-center gap-8 lg:min-h-[calc(100vh-128px)] lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-12 xl:gap-16">
          <div className="relative z-10 max-w-[43rem] overflow-visible py-2">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d8af66]/55 bg-white/72 px-4 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.28em] text-[#b8862e] shadow-[0_10px_28px_rgba(184,134,46,0.12)] backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Your Cosmic Blueprint
            </div>
            <h1 className="theme10-title font-decorative text-[clamp(3.8rem,5.4vw,6.7rem)] font-black uppercase leading-[0.9] tracking-[-0.035em] text-[#172536]">
              <span className="block">Master the</span>
              <span className="block text-[#bd8627]">Cosmos.</span>
              <span className="block">Live Your Destiny.</span>
            </h1>
            <p className="mt-7 max-w-[38rem] text-base leading-8 text-[#566575] sm:text-lg">
              Premium astrology tools, daily Panchang, Kundli insights and review-based personalized reports crafted through the Naksharix workflow.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/kundli" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#bf8422] to-[#d8af66] px-6 py-3 text-sm font-extrabold text-white shadow-[0_18px_42px_rgba(184,134,46,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(184,134,46,0.34)]">
                Get My Kundli <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/free-calculators" className="inline-flex items-center gap-2 rounded-xl border border-[#d8af66]/65 bg-white/70 px-6 py-3 text-sm font-extrabold text-[#172536] shadow-[0_16px_34px_rgba(31,41,51,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[#b8862e] hover:bg-white">
                Explore Tools <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid max-w-[43rem] grid-cols-1 gap-3 sm:grid-cols-3">
              {["Provider calculated", "Secure workflow", "Review-based reports"].map((item) => (
                <div key={item} className="rounded-2xl border border-[#e7d8be] bg-white/66 px-4 py-3 text-sm font-bold text-[#172536] shadow-[0_12px_32px_rgba(31,41,51,0.06)] backdrop-blur">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto hidden w-full max-w-[840px] lg:block" aria-hidden="true">
            <div className="theme10-clouds absolute inset-x-0 bottom-[-8%] z-20 h-40 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.92)_0%,rgba(246,239,217,0.62)_44%,transparent_74%)] blur-xl" />
            <div className="theme10-wheel-scene relative mx-auto aspect-square w-[min(46vw,820px)] max-h-[74vh] rounded-full">
              <div className="absolute inset-[-9%] rounded-full bg-[radial-gradient(circle,rgba(255,229,166,0.42)_0%,rgba(137,169,197,0.24)_38%,transparent_70%)] blur-3xl" />
              <div className="theme10-wheel absolute inset-[4%] rounded-full border border-[#d8af66]/35 bg-[radial-gradient(circle_at_center,#fff8dd_0%,#f6d890_9%,#173653_18%,#0d2438_36%,rgba(13,36,56,0.88)_58%,rgba(220,234,247,0.48)_78%,transparent_100%)] shadow-[0_28px_90px_rgba(13,36,56,0.22),inset_0_0_0_2px_rgba(255,255,255,0.26)]">
                <div className="theme10-wheel-rings absolute inset-[7%] rounded-full border border-[#d8af66]/65" />
                <div className="theme10-wheel-rings theme10-reverse absolute inset-[15%] rounded-full border border-white/54" />
                <div className="theme10-wheel-rings absolute inset-[23%] rounded-full border border-[#d8af66]/35" />
                <div className="absolute inset-[4%] rounded-full opacity-80 [background:repeating-conic-gradient(from_0deg,rgba(216,175,102,0.38)_0deg,rgba(216,175,102,0.38)_1deg,transparent_1deg,transparent_30deg)]" />
                <div className="absolute inset-[10%] rounded-full opacity-80 [background:repeating-conic-gradient(from_10deg,transparent_0deg,transparent_27deg,rgba(255,255,255,0.55)_28deg,transparent_29deg)]" />
                <div className="theme10-zodiac absolute inset-[9%] rounded-full">
                  {['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'].map((zodiac, index) => (
                    <span key={zodiac} className="absolute left-1/2 top-1/2 text-xl font-bold text-[#f1c66f] drop-shadow-[0_0_12px_rgba(216,175,102,0.5)]" style={{ transform: `rotate(${index * 30}deg) translateY(-235px) rotate(-${index * 30}deg)` }}>{zodiac}</span>
                  ))}
                </div>
                <div className="theme10-sun absolute left-1/2 top-1/2 z-30 grid h-[9.2rem] w-[9.2rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#d8af66] bg-[radial-gradient(circle,#fff9dc_0%,#ffe6a4_42%,#d8af66_76%,#b8862e_100%)] text-7xl font-black text-[#8f5b10] shadow-[0_0_34px_rgba(255,221,139,0.88),0_0_96px_rgba(216,175,102,0.76)]">
                  <span className="absolute inset-[-4.8rem] -z-10 rounded-full bg-[repeating-conic-gradient(from_0deg,rgba(255,210,105,0.76)_0deg,rgba(255,210,105,0.76)_2deg,transparent_3deg,transparent_9deg)] opacity-80 blur-[0.2px]" />
                  <span className="absolute inset-[-2.4rem] -z-10 rounded-full bg-[radial-gradient(circle,rgba(255,229,150,0.88)_0%,rgba(216,175,102,0.34)_42%,transparent_70%)] blur-md" />
                  ॐ
                </div>
              </div>
              <Planet className="left-[18%] top-[7%] h-16 w-16 from-[#0b8092] via-[#2ab0c8] to-[#07344d]" orbit="theme10-orbit-a" />
              <Planet className="right-[5%] top-[10%] h-24 w-24 from-[#fff1c9] via-[#d58a43] to-[#7d4217]" orbit="theme10-orbit-b" />
              <Planet className="bottom-[20%] left-[15%] h-20 w-20 from-[#fff1c9] via-[#d9a64d] to-[#7b5417] ringed" orbit="theme10-orbit-c" />
              <Planet className="bottom-[24%] right-[12%] h-24 w-24 from-[#e9f7ff] via-[#2c86c3] to-[#0a3d63]" orbit="theme10-orbit-d" />
              <Planet className="left-[3%] top-[56%] h-12 w-12 from-[#c8fff0] via-[#22a598] to-[#07545a]" orbit="theme10-orbit-e" />
              <Planet className="right-[22%] top-[24%] h-10 w-10 from-[#ffd98f] via-[#e86b27] to-[#8e2f12]" orbit="theme10-orbit-f" />
            </div>
          </div>

          <div className="lg:hidden">
            <MobileTheme10 />
          </div>
        </div>
      </section>

      <section className="px-4 pb-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1500px] rounded-3xl border border-[#e7d8be] bg-white/78 p-3 shadow-[0_22px_70px_rgba(31,41,51,0.09)] backdrop-blur">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
            {tools.map(({ label, copy, href, icon: Icon }) => (
              <Link key={label} href={href} className="group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 transition hover:-translate-y-0.5 hover:border-[#d8af66]/55 hover:bg-[#fff9f0]">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff4df] text-[#b8862e] shadow-inner"><Icon className="h-5 w-5" /></span>
                <span className="min-w-0"><span className="block text-sm font-extrabold text-[#172536]">{label}</span><span className="block text-[0.68rem] text-[#6b7280]">{copy}</span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[1500px] gap-5 xl:grid-cols-[1.1fr_1.1fr_0.8fr]">
          <InfoCard title="Today’s Panchang" action="View Full Panchang" href="/panchang">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[['Tithi','Shukla Paksha'],['Nakshatra','Provider calculated'],['Yoga','Daily guide'],['Karana','Values may vary']].map(([a,b]) => <div key={a} className="rounded-2xl bg-[#fff9f0] p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b8862e]">{a}</p><p className="mt-2 text-sm font-bold text-[#172536]">{b}</p></div>)}
            </div>
          </InfoCard>
          <InfoCard title="Premium Reports" action="View All" href="/reports">
            <div className="grid grid-cols-3 gap-3">
              {reports.map((report) => <Link key={report.title} href={report.href} className="rounded-2xl border border-[#e7d8be] bg-[radial-gradient(circle_at_50%_10%,rgba(216,175,102,0.35),transparent_55%),#fff9f0] p-4 text-center transition hover:-translate-y-0.5"><FileText className="mx-auto h-8 w-8 text-[#b8862e]" /><p className="mt-3 text-sm font-extrabold text-[#172536]">{report.title}</p><p className="text-xs text-[#6b7280]">{report.subtitle}</p></Link>)}
            </div>
          </InfoCard>
          <InfoCard title="Why Naksharix?" action="Trust" href="/disclaimer">
            <div className="space-y-3">
              {["Calculated using Naksharix internal astrology engine", "Secure owner/admin report workflow", "Spiritual guidance, not guaranteed outcome"].map((item) => <div key={item} className="flex gap-3 rounded-2xl bg-[#fff9f0] p-3 text-sm font-bold text-[#172536]"><ShieldCheck className="h-5 w-5 flex-shrink-0 text-[#b8862e]" />{item}</div>)}
            </div>
          </InfoCard>
        </div>
      </section>
    </div>
  );
}

function Planet({ className, orbit }: { className: string; orbit: string }) {
  const base = className.replace(" ringed", "");
  const ringed = className.includes("ringed");
  return (
    <div className={`${orbit} absolute z-40`}>
      <span className={`relative block rounded-full bg-gradient-to-br ${base} shadow-[inset_-14px_-14px_24px_rgba(0,0,0,0.28),0_18px_38px_rgba(13,36,56,0.28)]`}>
        {ringed ? <span className="absolute left-1/2 top-1/2 h-[42%] w-[150%] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-full border-[5px] border-[#f0d18b]/80" /> : null}
      </span>
    </div>
  );
}

function MobileTheme10() {
  return (
    <div className="rounded-[2rem] border border-[#e7d8be] bg-white/82 p-4 shadow-[0_24px_70px_rgba(31,41,51,0.13)] backdrop-blur">
      <div className="grid grid-cols-[1fr_8rem] items-center gap-4 rounded-3xl bg-[#fff9f0] p-4">
        <div><p className="text-[0.66rem] font-extrabold uppercase tracking-[0.18em] text-[#b8862e]">Your Cosmic Blueprint</p><h2 className="mt-2 font-cinzel text-3xl font-black leading-[0.96] text-[#172536]">Understand.<br />Align. Elevate.</h2><Link href="/kundli" className="mt-4 inline-flex rounded-xl bg-[#b8862e] px-4 py-2 text-xs font-extrabold text-white">Get My Kundli</Link></div>
        <div className="grid aspect-square place-items-center rounded-full bg-[radial-gradient(circle,#fff4cc_0%,#d8af66_28%,#0d2438_45%,#dce8f7_78%,transparent_100%)] text-4xl text-[#8f5b10] shadow-[0_0_46px_rgba(216,175,102,0.38)]">ॐ</div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {tools.slice(0,8).map(({ label, href, icon: Icon }) => <Link key={label} href={href} className="rounded-2xl border border-[#e7d8be] bg-white p-2 text-center text-[0.68rem] font-bold text-[#172536]"><Icon className="mx-auto mb-1 h-4 w-4 text-[#b8862e]" />{label.split(' ')[0]}</Link>)}
      </div>
    </div>
  );
}

function InfoCard({ title, action, href, children }: { title: string; action: string; href: string; children: React.ReactNode }) {
  return <div className="rounded-3xl border border-[#e7d8be] bg-white/78 p-5 shadow-[0_18px_58px_rgba(31,41,51,0.08)] backdrop-blur"><div className="mb-5 flex items-center justify-between"><h2 className="font-cinzel text-xl font-black text-[#172536]">{title}</h2><Link href={href} className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#b8862e]">{action} →</Link></div>{children}</div>;
}

function Theme10Styles() {
  return <style>{`
    body:has(.theme10-home) { background: #fbf6ea !important; }
    body:has(.theme10-home) header.sticky { border-color: rgba(231,216,190,.9)!important; background: rgba(255,250,241,.86)!important; box-shadow: 0 18px 55px rgba(31,41,51,.08)!important; backdrop-filter: blur(18px); }
    body:has(.theme10-home) header.sticky a, body:has(.theme10-home) header.sticky button { color: #172536!important; }
    .theme10-title { text-wrap: balance; }
    .theme10-wheel { animation: theme10-spin 120s linear infinite; }
    .theme10-reverse { animation: theme10-spin-rev 160s linear infinite; }
    .theme10-sun { animation: theme10-sun 5s ease-in-out infinite; }
    .theme10-clouds { animation: theme10-cloud 10s ease-in-out infinite alternate; }
    .theme10-orbit-a { animation: theme10-orbit 62s linear infinite; transform-origin: 335px 335px; }
    .theme10-orbit-b { animation: theme10-orbit-rev 95s linear infinite; transform-origin: -250px 310px; }
    .theme10-orbit-c { animation: theme10-orbit 78s linear infinite; transform-origin: 250px -160px; }
    .theme10-orbit-d { animation: theme10-orbit-rev 120s linear infinite; transform-origin: -230px -120px; }
    .theme10-orbit-e { animation: theme10-orbit 48s linear infinite; transform-origin: 390px 0; }
    .theme10-orbit-f { animation: theme10-orbit-rev 35s linear infinite; transform-origin: -120px 170px; }
    @keyframes theme10-spin { to { transform: rotate(360deg); } }
    @keyframes theme10-spin-rev { to { transform: rotate(-360deg); } }
    @keyframes theme10-orbit { to { transform: rotate(360deg); } }
    @keyframes theme10-orbit-rev { to { transform: rotate(-360deg); } }
    @keyframes theme10-sun { 0%,100% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-50%,-50%) scale(1.025); } }
    @keyframes theme10-cloud { from { transform: translateX(-10px); opacity: .72; } to { transform: translateX(16px); opacity: .96; } }
    @media (prefers-reduced-motion: reduce) { .theme10-home * { animation: none!important; scroll-behavior: auto!important; } }
    @media (max-width: 1200px) { .theme10-title { font-size: clamp(3.2rem,5vw,5.7rem)!important; } }
  `}</style>;
}

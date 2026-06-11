import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, Grid3X3, HeartHandshake, Home, MoonStar, ShieldCheck, Sparkles, Star, SunMedium, UserRound } from "lucide-react";

const tools = [
  { label: "Kundli", copy: "Birth Chart", href: "/kundli", icon: MoonStar },
  { label: "Panchang", copy: "Daily Guide", href: "/panchang", icon: CalendarDays },
  { label: "Horoscope", copy: "Predictions", href: "/daily-horoscope", icon: SunMedium },
  { label: "Numerology", copy: "Numbers", href: "/numerology", icon: Grid3X3 },
  { label: "Match Making", copy: "Compatibility", href: "/matchmaking", icon: HeartHandshake },
  { label: "Tarot", copy: "Insights", href: "/tarot", icon: Sparkles },
  { label: "Transits", copy: "Planetary Moves", href: "/transits", icon: Star },
  { label: "More Tools", copy: "All Tools", href: "/free-calculators", icon: Grid3X3 }
];

const reports = ["Birth Chart", "Life Report", "Year Ahead"];
const zodiac = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

export function Theme10ProductionHome() {
  return (
    <main className="theme10-exact relative overflow-hidden bg-[#fbf6ea] text-[#172536]">
      <ExactStyles />
      <section className="mx-auto w-[min(100%-1.5rem,1580px)] px-2 py-6">
        <div className="grid items-center gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:min-h-[500px]">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d8af66]/60 bg-white/75 px-4 py-2 text-[0.72rem] font-black uppercase tracking-[0.28em] text-[#b8862e] shadow-[0_10px_28px_rgba(184,134,46,0.12)]"><Sparkles className="h-4 w-4" />Your Cosmic Blueprint</div>
            <h1 className="mt-5 max-w-[650px] font-decorative text-[clamp(3.1rem,4.35vw,5.25rem)] font-black uppercase leading-[0.95] tracking-[-0.045em] text-[#172536]">
              <span className="block">Master the</span><span className="block text-[#bd8627]">Cosmos.</span><span className="block">Live Your Destiny.</span>
            </h1>
            <p className="mt-6 max-w-[600px] text-base font-medium leading-8 text-[#566575] sm:text-lg">Premium astrology tools, daily Panchang, Kundli insights and personalized reports crafted for your mindful spiritual journey.</p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link href="/kundli" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#bd8426] to-[#dfb65f] px-6 py-3 font-black text-white shadow-[0_16px_36px_rgba(184,134,46,0.25)]">Get My Kundli <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/free-calculators" className="inline-flex items-center gap-2 rounded-xl border border-[#d8af66]/75 bg-white/75 px-6 py-3 font-black text-[#172536]">Explore Tools <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-6 grid max-w-[640px] gap-3 sm:grid-cols-3">{["Provider calculated", "Secure workflow", "Review-based reports"].map((item) => <span key={item} className="rounded-2xl border border-[#e7d8be] bg-white/70 px-4 py-3 text-sm font-black shadow-[0_10px_28px_rgba(31,41,51,0.06)]">{item}</span>)}</div>
          </div>
          <HeroArt />
        </div>
        <ToolStrip />
        <HomeCards />
        <div className="mt-4 grid gap-3 rounded-3xl border border-[#e7d8be] bg-white/75 p-3 shadow-[0_18px_55px_rgba(31,41,51,0.08)] sm:grid-cols-3 xl:grid-cols-6">{["Trusted workflow", "Secure", "Provider calculated", "Review-based", "Privacy aware", "Responsive web + app"].map((item) => <span key={item} className="flex items-center justify-center gap-2 text-xs font-black text-[#172536]"><ShieldCheck className="h-4 w-4 text-[#b8862e]" />{item}</span>)}</div>
      </section>
    </main>
  );
}

function HeroArt() {
  return (
    <div className="hero-art relative hidden min-h-[510px] lg:block" aria-hidden="true">
      <div className="absolute left-0 top-6 h-[470px] w-[660px] max-w-[76%] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,231,154,0.55),rgba(11,34,53,0.95)_36%,rgba(222,235,245,0.68)_72%,transparent_100%)] shadow-[0_30px_90px_rgba(13,36,56,0.22)]">
        <div className="absolute inset-[-2rem] rounded-full bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.95),rgba(246,239,217,0.65)_42%,transparent_72%)] blur-xl" />
        <div className="wheel exact-spin absolute left-[9%] top-[4%] h-[440px] w-[440px] rounded-full border border-[#d8af66]/50 bg-[radial-gradient(circle,#fff8dc_0%,#ffe19a_9%,#173653_18%,#0b2235_42%,rgba(12,34,53,0.92)_58%,rgba(222,235,245,0.55)_78%,transparent_100%)] shadow-[0_0_0_14px_rgba(255,255,255,0.42),0_0_70px_rgba(216,175,102,0.28)]">
          <div className="absolute inset-[8%] rounded-full border border-[#d8af66]/70" /><div className="absolute inset-[18%] rounded-full border border-white/55" /><div className="absolute inset-[28%] rounded-full border border-[#d8af66]/35" />
          <div className="absolute inset-[6%] rounded-full opacity-60 [background:repeating-conic-gradient(from_0deg,rgba(216,175,102,0.42)_0deg,rgba(216,175,102,0.42)_1deg,transparent_1deg,transparent_15deg)]" />
          {zodiac.map((item, index) => <span key={item} className="absolute left-1/2 top-1/2 font-serif text-xl font-black text-[#f1c66f] drop-shadow-[0_0_12px_rgba(216,175,102,0.65)]" style={{ transform: `translate(-50%,-50%) rotate(${index * 30}deg) translateY(-12.7rem) rotate(-${index * 30}deg)` }}>{item}</span>)}
          <div className="om-sun absolute left-1/2 top-1/2 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle,#fffce5_0%,#ffe79a_45%,#d8af66_76%,#b8862e_100%)] text-6xl font-black text-[#8f5b10] shadow-[0_0_34px_rgba(255,221,139,0.92),0_0_120px_rgba(216,175,102,0.78)]"><span className="absolute inset-[-74px] rounded-full bg-[repeating-conic-gradient(from_0deg,rgba(255,210,105,0.82)_0_2deg,transparent_3deg_8deg)]" /> <b className="relative">ॐ</b></div>
        </div>
        <Planet className="left-[21%] top-[-5%] h-14 w-14 from-[#0b8092] via-[#2ab0c8] to-[#07344d]" />
        <Planet className="right-[12%] top-[-6%] h-24 w-24 from-[#fff1c9] via-[#d58a43] to-[#7d4217]" />
        <Planet className="left-[0%] top-[41%] h-20 w-20 from-[#fff1c9] via-[#d9a64d] to-[#7b5417] ringed" />
        <Planet className="right-[0%] top-[38%] h-24 w-24 from-[#e9f7ff] via-[#2c86c3] to-[#0a3d63]" />
        <Planet className="left-[7%] bottom-[10%] h-14 w-14 from-[#c8fff0] via-[#22a598] to-[#07545a]" />
        <Planet className="left-[38%] top-[50%] h-10 w-10 from-[#ffd98f] via-[#e86b27] to-[#8e2f12]" />
      </div>
      <AppPreview />
    </div>
  );
}

function Planet({ className }: { className: string }) {
  const ringed = className.includes("ringed");
  return <span className={`absolute z-20 block rounded-full bg-gradient-to-br shadow-[inset_-14px_-16px_24px_rgba(0,0,0,0.26),0_18px_40px_rgba(13,36,56,0.24)] ${className.replace(" ringed", "")}`}>{ringed ? <i className="absolute left-1/2 top-1/2 h-[42%] w-[150%] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-full border-[6px] border-[#f0d18b]/80" /> : null}</span>;
}

function AppPreview() {
  return <div className="phone-preview absolute right-0 top-0 z-30 w-[238px] rounded-[34px] border-[9px] border-[#171717] bg-[#fffaf1] p-4 shadow-[0_24px_70px_rgba(31,41,51,0.22)] max-[1320px]:hidden"><div className="flex justify-between text-[0.7rem] font-black"><span>9:41</span><span className="h-4 w-14 rounded-full bg-black" /></div><div className="mt-3 flex items-center justify-between text-xs font-black"><span>☰</span><span className="font-cinzel tracking-[0.14em] text-[#7d4217]">NAKSHARIX</span><span>●</span></div><p className="mt-3 text-[0.7rem] text-[#566575]">Namaste, Arjun 👋</p><div className="mt-2 grid grid-cols-[1fr_76px] gap-2 rounded-2xl border border-[#e7d8be] bg-[#fff9f0] p-3"><div><small className="text-[0.48rem] font-black uppercase tracking-widest text-[#b8862e]">Your Cosmic Blueprint</small><strong className="mt-1 block font-cinzel text-lg leading-none text-[#172536]">Understand.<br />Align. Elevate.</strong><p className="mt-1 text-[0.55rem] text-[#566575]">Explore premium astrology tools.</p></div><div className="grid aspect-square place-items-center rounded-full bg-[radial-gradient(circle,#fff6cc,#d8af66_35%,#0d2438_58%,#dce8f7_78%)] text-3xl text-[#8f5b10]">ॐ</div></div><div className="mt-3 grid grid-cols-4 gap-1.5">{tools.slice(0,8).map(({ label, icon: Icon }) => <span key={label} className="rounded-xl border border-[#e7d8be] bg-white p-1.5 text-center text-[0.5rem] font-black text-[#172536]"><Icon className="mx-auto mb-1 h-3.5 w-3.5 text-[#b8862e]" />{label.split(" ")[0]}</span>)}</div><div className="mt-3 rounded-2xl border border-[#e7d8be] bg-white p-3 text-[0.62rem]"><b>Today's Panchang</b><p className="mt-1 text-[#566575]">Tithi · Nakshatra · Yoga · Karana</p></div><div className="mt-3 grid grid-cols-3 gap-1.5">{reports.map((report) => <span key={report} className="rounded-xl border border-[#e7d8be] bg-white p-2 text-center text-[0.48rem] font-black"><FileText className="mx-auto mb-1 h-3.5 w-3.5 text-[#b8862e]" />{report}</span>)}</div><div className="mt-3 flex items-center justify-around text-[#6b7280]"><Home className="h-4 w-4" /><MoonStar className="h-4 w-4" /><span className="grid h-10 w-10 place-items-center rounded-full bg-[#b8862e] text-xl text-white">ॐ</span><CalendarDays className="h-4 w-4" /><UserRound className="h-4 w-4" /></div></div>;
}

function ToolStrip() { return <div className="mt-2 grid gap-2 rounded-3xl border border-[#e7d8be] bg-white/80 p-3 shadow-[0_22px_70px_rgba(31,41,51,0.09)] sm:grid-cols-4 xl:grid-cols-8">{tools.map(({ label, copy, href, icon: Icon }) => <Link key={label} href={href} className="flex items-center gap-2 rounded-2xl p-3 text-[#172536] hover:bg-[#fff9f0]"><Icon className="h-5 w-5 text-[#b8862e]" /><span><b className="block text-xs">{label}</b><small className="text-[0.62rem] text-[#6b7280]">{copy}</small></span></Link>)}</div>; }

function HomeCards() { return <div className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_1.05fr_0.8fr]"><Card title="Today’s Panchang" href="/panchang"><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{[["Tithi","Shukla Paksha"],["Nakshatra","Provider calculated"],["Yoga","Daily guide"],["Karana","Values may vary"],["Sunrise","Local time"],["Sunset","Local time"]].map(([a,b]) => <span key={a} className="rounded-2xl bg-[#fff9f0] p-3"><small className="block text-[0.58rem] font-black uppercase tracking-widest text-[#b8862e]">{a}</small><b className="text-xs">{b}</b></span>)}</div></Card><Card title="Premium Reports" href="/reports"><div className="grid grid-cols-3 gap-2">{reports.map((report) => <Link key={report} href="/reports" className="rounded-2xl border border-[#e7d8be] bg-[#fff9f0] p-3 text-center text-[#172536]"><FileText className="mx-auto h-5 w-5 text-[#b8862e]" /><b className="mt-2 block text-xs">{report}</b><small className="text-[0.6rem] text-[#6b7280]">Premium report</small></Link>)}</div></Card><Card title="Why Naksharix?" href="/disclaimer">{["Secure workflow","Provider calculated","Review-based reports","Spiritual guidance"].map((item) => <p key={item} className="mt-2 flex items-center gap-2 rounded-2xl bg-[#fff9f0] p-3 text-xs font-black"><ShieldCheck className="h-4 w-4 text-[#0d9b74]" />{item}</p>)}</Card></div>; }

function Card({ title, href, children }: { title: string; href: string; children: React.ReactNode }) { return <section className="rounded-3xl border border-[#e7d8be] bg-white/80 p-5 shadow-[0_18px_55px_rgba(31,41,51,0.08)]"><div className="mb-4 flex items-center justify-between"><h2 className="font-cinzel text-lg font-black">{title}</h2><Link href={href} className="text-xs font-black uppercase tracking-widest text-[#b8862e]">View →</Link></div>{children}</section>; }

function ExactStyles() { return <style>{`.exact-spin{animation:spin 140s linear infinite}.om-sun{animation:sun 5s ease-in-out infinite}.hero-art .absolute[class*="from-"]{animation:float 8s ease-in-out infinite}@keyframes spin{to{transform:rotate(360deg)}}@keyframes sun{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.025)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@media(prefers-reduced-motion:reduce){.exact-spin,.om-sun,.hero-art .absolute[class*="from-"]{animation:none!important}}`}</style>; }

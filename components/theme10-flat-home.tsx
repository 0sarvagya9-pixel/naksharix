import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, Grid3X3, HeartHandshake, Home, Menu, MoonStar, ShieldCheck, Sparkles, Star, SunMedium, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

const navLinks = [["Home", "/"], ["Kundli", "/kundli"], ["Numerology", "/numerology"], ["Free Calculators", "/free-calculators"], ["Horoscope", "/daily-horoscope"], ["Tarot", "/tarot"], ["Reports", "/reports"], ["More", "/free-calculators"]] as const;
const tools = [
  { label: "Kundli", copy: "Birth Chart", href: "/kundli", icon: MoonStar },
  { label: "Panchang", copy: "Daily Guide", href: "/panchang", icon: CalendarDays },
  { label: "Horoscope", copy: "Predictions", href: "/daily-horoscope", icon: SunMedium },
  { label: "Numerology", copy: "Numbers", href: "/numerology", icon: Grid3X3 },
  { label: "Match Making", copy: "Compatibility", href: "/matchmaking", icon: HeartHandshake },
  { label: "Tarot", copy: "Insights", href: "/tarot", icon: Sparkles },
  { label: "Transits", copy: "Planetary Moves", href: "/transits", icon: Star },
  { label: "More Tools", copy: "All Tools", href: "/free-calculators", icon: Grid3X3 }
] as const;
const panchang = [["Tithi", "Shukla Paksha"], ["Nakshatra", "Rohini"], ["Yoga", "Sukarma"], ["Karana", "Balava"], ["Sunrise", "05:45 AM"], ["Sunset", "07:12 PM"]] as const;
const reports = [["Birth Chart", "Detailed Kundli"], ["Life Report", "Comprehensive"], ["Year Ahead", "2026 Insights"]] as const;
const zodiac = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

export function Theme10FlatHome() {
  return (
    <main className="flat2d-home min-h-screen overflow-hidden p-4 text-[#172536]" style={{ background: "#07111f" }}>
      <style>{`body:has(.flat2d-home){background:#07111f!important}body:has(.flat2d-home) header.sticky{display:none!important}`}</style>
      <section className="mx-auto grid w-full max-w-[1540px] gap-5 xl:grid-cols-[minmax(0,1fr)_270px]">
        <div className="relative overflow-hidden rounded-3xl border border-[#e6c482] bg-[#fff8ee] shadow-2xl">
          <div className="absolute inset-0" style={{ background: "linear-gradient(110deg,#fffaf1 0%,#fff4e7 36%,#eaf4fb 100%)" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 63% 35%,rgba(10,31,70,.58),transparent 380px),radial-gradient(circle at 62% 42%,rgba(255,132,43,.34),transparent 330px),radial-gradient(circle at 58% 62%,rgba(255,255,255,.78),transparent 340px)" }} />
          <ReferenceNav />
          <section className="relative z-10 grid min-h-[470px] lg:grid-cols-[42%_58%]">
            <HeroCopy />
            <FlatCosmos />
          </section>
          <ToolStrip />
          <InfoGrid />
          <TrustRow />
        </div>
        <PhonePreview />
      </section>
    </main>
  );
}

function ReferenceNav() {
  return (
    <div className="relative z-20 grid items-center gap-4 border-b border-[#ead9bd] bg-[#fffaf1]/90 px-7 py-4 lg:grid-cols-[230px_minmax(0,1fr)_128px]">
      <BrandLogo />
      <nav className="hidden justify-center gap-2 lg:flex">
        {navLinks.map(([label, href], index) => <Link key={label} href={href} className={`rounded-xl px-3 py-2 text-xs font-black text-[#172536] no-underline ${index === 0 ? "bg-[#fff0dc] text-[#b86612]" : ""}`}>{label}</Link>)}
      </nav>
      <div className="hidden items-center justify-end gap-3 text-[#172536] lg:flex"><span className="rounded-xl border border-[#d89b43] px-3 py-2 text-xs font-black">EN</span><Sparkles size={18} /><UserRound size={19} /></div>
    </div>
  );
}

function HeroCopy() {
  return (
    <div className="px-7 pb-8 pt-12 lg:pl-9">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#deb66c] bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[.22em] text-[#b86612]"><Sparkles size={16} /> Your Cosmic Blueprint</div>
      <h1 className="mt-5 font-cinzel-decorative text-[clamp(48px,5vw,80px)] font-black uppercase leading-[.93] tracking-[-.04em] text-[#172536]"><span className="block">Master the</span><span className="block text-[#c77912]">Cosmos.</span><span className="block">Live Your Destiny.</span></h1>
      <div className="mt-4 h-[2px] w-20 bg-[#c77912]" />
      <p className="mt-4 max-w-[470px] text-base font-semibold leading-7 text-[#42556b]">Premium astrology tools, daily Panchang, Kundli insights and personalized reports crafted for your unique journey.</p>
      <div className="mt-6 flex flex-wrap gap-4"><Link href="/kundli" className="inline-flex items-center gap-3 rounded-2xl bg-[#c87914] px-6 py-4 text-sm font-black text-white shadow-lg no-underline">Get My Kundli <ArrowRight size={16} /></Link><Link href="/free-calculators" className="inline-flex items-center gap-3 rounded-2xl border border-[#e4c28a] bg-white/80 px-6 py-4 text-sm font-black text-[#172536] no-underline">Explore Tools</Link></div>
      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold text-[#42556b]"><span className="flex"><i className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[#d08a30] text-[10px] not-italic text-white">A</i><i className="-ml-2 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[#1e456f] text-[10px] not-italic text-white">N</i><i className="-ml-2 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[#d08a30] text-[10px] not-italic text-white">S</i></span><span>Trusted by 250K+ seekers</span><span className="text-[#c77912]">★★★★★</span><span className="text-[#172536]">4.9/5</span></div>
    </div>
  );
}

function FlatCosmos() {
  return (
    <div className="relative min-h-[470px] overflow-hidden max-lg:hidden">
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 45%,rgba(9,28,64,.78),transparent 360px),radial-gradient(circle at 45% 45%,rgba(242,152,38,.38),transparent 300px)" }} />
      <div className="absolute inset-x-0 bottom-0 h-40" style={{ background: "radial-gradient(ellipse at center,rgba(255,255,255,.96),rgba(255,233,190,.75) 42%,transparent 76%)", filter: "blur(10px)" }} />
      <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(circle,#fff 0 1px,transparent 1.5px),radial-gradient(circle,#f7c15d 0 1px,transparent 1.4px)", backgroundSize: "42px 42px,64px 64px" }} />
      <div className="absolute left-[50%] top-[49%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "#082646", boxShadow: "0 0 0 2px rgba(217,164,71,.8),0 0 80px rgba(234,134,38,.42)" }}>
        {["8%", "18%", "28%", "39%"].map((inset) => <div key={inset} className="absolute rounded-full border border-[#d9a447]/70" style={{ inset }} />)}
        <div className="absolute inset-[5%] rounded-full opacity-70" style={{ background: "repeating-conic-gradient(from 0deg,rgba(217,164,71,.55) 0deg,rgba(217,164,71,.55) 1deg,transparent 1deg,transparent 10deg)" }} />
        {zodiac.map((sign, index) => <span key={sign} className="absolute left-1/2 top-1/2 grid h-8 w-8 place-items-center rounded-full bg-[#102e56] font-serif text-lg font-black text-[#ffd879]" style={{ transform: `translate(-50%,-50%) rotate(${index * 30}deg) translateY(-168px) rotate(-${index * 30}deg)` }}>{sign}</span>)}
        <div className="absolute left-1/2 top-1/2 grid h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full" style={{ background: "radial-gradient(circle,#fff7c8,#ffca4f 52%,#d37012 100%)", boxShadow: "0 0 42px rgba(255,204,83,.95),0 0 120px rgba(255,133,38,.95)" }}><span className="absolute -inset-20 rounded-full" style={{ background: "repeating-conic-gradient(from 0deg,rgba(255,210,88,.85) 0deg,rgba(255,210,88,.85) 2deg,transparent 3deg,transparent 8deg)" }} /><b className="relative z-10 text-[64px] leading-none text-[#9a5208]">ॐ</b></div>
      </div>
      <Planet className="left-[22%] top-[9%] h-16 w-16" colors="linear-gradient(135deg,#50bbff,#104a77)" />
      <Planet className="right-[8%] top-[4%] h-24 w-24" colors="linear-gradient(135deg,#ffe1a2,#bf6d23)" />
      <Planet className="left-[23%] bottom-[21%] h-20 w-20" colors="linear-gradient(135deg,#ffe2aa,#c8872a)" ring />
      <Planet className="right-[20%] bottom-[19%] h-28 w-28" colors="linear-gradient(135deg,#70c3ff,#0a3d68)" />
      <Planet className="left-[44%] bottom-[14%] h-14 w-14" colors="linear-gradient(135deg,#ef8b45,#7b2d1e)" />
    </div>
  );
}

function Planet({ className, colors, ring = false }: { className: string; colors: string; ring?: boolean }) {
  return <span className={`absolute z-30 block rounded-full ${className}`} style={{ background: colors, boxShadow: "inset -12px -14px 18px rgba(0,0,0,.22),0 16px 34px rgba(10,28,46,.25)" }}>{ring ? <i className="absolute left-1/2 top-1/2 h-[36%] w-[150%] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-full border-[6px] border-[#f5d38f]/90" /> : null}</span>;
}

function ToolStrip() { return <div className="relative z-20 mx-7 grid -translate-y-4 grid-cols-8 gap-3 rounded-2xl border border-[#ead9bd] bg-white/90 p-3 shadow-lg max-lg:mx-4 max-lg:grid-cols-2 max-lg:translate-y-0">{tools.map(({ label, copy, href, icon: Icon }) => <Link href={href} key={label} className="flex items-center gap-3 rounded-xl p-3 text-[#172536] no-underline hover:bg-[#fff3df]"><Icon size={20} className="text-[#c87914]" /><span><b className="block text-xs">{label}</b><small className="text-[10px] text-[#6b7280]">{copy}</small></span></Link>)}</div>; }
function PanelHead({ title, href, link }: { title: string; href: string; link: string }) { return <div className="mb-4 flex items-center justify-between"><h2 className="font-cinzel text-lg font-black text-[#8f3f0d]">{title}</h2><Link href={href} className="text-xs font-black text-[#c87914] no-underline">{link}</Link></div>; }
function InfoGrid() { return <div className="relative z-20 mx-7 grid grid-cols-[1.1fr_1fr_.7fr] gap-4 max-lg:mx-4 max-lg:grid-cols-1"><section className="rounded-2xl border border-[#ead9bd] bg-white/85 p-4"><PanelHead title="Today's Panchang" href="/panchang" link="View Full Panchang →" /><div className="grid grid-cols-3 gap-3 max-lg:grid-cols-2">{panchang.map(([a,b])=><span key={a} className="rounded-xl bg-[#fff7ea] p-3"><small className="block text-[10px] font-black uppercase text-[#c87914]">{a}</small><b className="text-xs text-[#172536]">{b}</b></span>)}</div></section><section className="rounded-2xl border border-[#ead9bd] bg-white/85 p-4"><PanelHead title="Premium Reports" href="/reports" link="View All →" /><div className="grid grid-cols-3 gap-3">{reports.map(([a,b])=><Link href="/reports" key={a} className="rounded-xl border border-[#ead9bd] bg-white p-3 text-center text-[#172536] no-underline"><FileText size={22} className="mx-auto text-[#c87914]" /><b className="mt-2 block text-xs">{a}</b><small className="text-[10px] text-[#6b7280]">{b}</small></Link>)}</div></section><section className="rounded-2xl border border-[#ead9bd] bg-white/85 p-4"><h2 className="font-cinzel text-lg font-black text-[#8f3f0d]">Why Naksharix?</h2>{["100% Secure & Private","Accurate Calculations","AI Enhanced Insights","Ancient Wisdom + AI","Expert Verified"].map((item)=><p key={item} className="mt-3 flex items-center gap-2 text-xs font-bold"><ShieldCheck size={16} className="text-[#c87914]" />{item}</p>)}</section></div>; }
function TrustRow() { return <div className="relative z-20 mx-7 mb-5 mt-4 grid grid-cols-6 gap-3 rounded-2xl border border-[#ead9bd] bg-white/85 p-4 max-lg:mx-4 max-lg:grid-cols-2">{["Trusted","Secure","Accurate","15+ Years","100% Private","AI Enhanced"].map((item)=><span key={item} className="flex items-center justify-center gap-2 text-xs font-black"><ShieldCheck size={16} className="text-[#c87914]" />{item}</span>)}</div>; }
function PhonePreview() { return <aside className="hidden min-h-[720px] overflow-hidden rounded-[34px] border-8 border-[#111] bg-[#fffaf1] p-4 shadow-2xl xl:block"><div className="flex items-center justify-between text-xs font-black"><span>9:41</span><i className="h-5 w-16 rounded-full bg-black" /></div><div className="mt-5 flex items-center justify-between"><Menu size={18} /><b className="font-cinzel text-lg tracking-widest text-[#8f3f0d]">NAKSHARIX</b><UserRound size={18} /></div><p className="mt-5 text-sm font-black">Namaste, Arjun 👋<small className="block text-xs font-semibold text-[#6b7280]">May the stars guide you today.</small></p><div className="mt-4 overflow-hidden rounded-2xl border border-[#ead9bd] bg-[#fff7ea] p-4"><small className="font-black uppercase tracking-wider text-[#c87914]">Your Cosmic Blueprint</small><h3 className="mt-2 font-cinzel-decorative text-2xl font-black leading-none"><span>Master the</span><span className="block text-[#c87914]">Cosmos.</span><span className="block">Live Your Destiny.</span></h3><div className="mt-3 grid h-32 place-items-center rounded-full bg-[#082646] text-5xl text-[#c87914]">ॐ</div></div><div className="mt-4 grid grid-cols-4 gap-2">{tools.map(({label,icon:Icon})=><span key={label} className="rounded-xl border border-[#ead9bd] bg-white p-2 text-center text-[10px] font-black"><Icon size={16} className="mx-auto mb-1 text-[#c87914]" />{label.split(" ")[0]}</span>)}</div><div className="mt-4 rounded-2xl border border-[#ead9bd] bg-white p-4"><b>Today's Panchang</b><p className="mt-1 text-xs text-[#6b7280]">Tithi · Nakshatra · Yoga · Karana</p></div><div className="mt-4 flex items-center justify-around"><Home size={18} /><MoonStar size={18} /><strong className="grid h-12 w-12 place-items-center rounded-full bg-[#c87914] text-3xl text-white">ॐ</strong><CalendarDays size={18} /><UserRound size={18} /></div></aside>; }

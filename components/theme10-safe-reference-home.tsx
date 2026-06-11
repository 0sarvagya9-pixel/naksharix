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
const panchang = [["Tithi", "Shukla Paksha"], ["Nakshatra", "Provider calculated"], ["Yoga", "Daily guide"], ["Karana", "Values may vary"], ["Sunrise", "Local time"], ["Sunset", "Local time"]] as const;
const reports = [["Birth Chart", "Detailed Kundli"], ["Life Report", "Comprehensive"], ["Year Ahead", "2026 Insights"]] as const;
const zodiac = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

export function Theme10SafeReferenceHome() {
  return (
    <main className="reference-shell min-h-screen overflow-hidden bg-[#07111f] p-4 text-[#172536]">
      <style>{`body:has(.reference-shell){background:#07111f!important}body:has(.reference-shell) header.sticky{display:none!important}.cosmic-wheel{animation:wheel-spin 160s linear infinite}.cosmic-sun{animation:sun-pulse 5s ease-in-out infinite}.float-planet{animation:planet-float 8s ease-in-out infinite}@keyframes wheel-spin{to{transform:translate(-50%,-50%) rotate(360deg)}}@keyframes sun-pulse{50%{transform:translate(-50%,-50%) scale(1.04)}}@keyframes planet-float{50%{transform:translateY(-10px)}}`}</style>
      <section className="mx-auto grid w-full max-w-[1540px] grid-cols-[minmax(0,1fr)_252px] gap-4 max-xl:grid-cols-1">
        <div className="relative overflow-hidden rounded-[28px] border border-[#d8af66]/50 bg-[linear-gradient(135deg,#fffaf1_0%,#faefe5_45%,#eef6fb_100%)] shadow-[0_26px_90px_rgba(2,8,23,.42)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_60%_24%,rgba(255,126,57,.34),transparent_18rem),radial-gradient(circle_at_66%_37%,rgba(8,25,58,.58),transparent_26rem),radial-gradient(circle_at_60%_65%,rgba(255,255,255,.72),transparent_22rem)]" />
          <ReferenceNav />
          <section className="relative z-10 grid min-h-[386px] grid-cols-[41%_59%] max-lg:block">
            <div className="px-8 pb-4 pt-12 max-lg:p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d8af66]/60 bg-white/75 px-4 py-2 text-[10px] font-black uppercase tracking-[.22em] text-[#b86612]"><Sparkles size={16} /> Your Cosmic Blueprint</div>
              <h1 className="mt-5 font-cinzel-decorative text-[clamp(48px,4.7vw,76px)] font-black uppercase leading-[.92] tracking-[-.04em] text-[#172536] max-lg:text-[clamp(42px,13vw,66px)]"><span className="block">Master the</span><span className="block text-[#cf7c13]">Cosmos.</span><span className="block">Live Your Destiny.</span></h1>
              <p className="mt-4 max-w-[460px] text-[13.5px] font-semibold leading-6 text-[#42556b]">Premium astrology tools, daily Panchang, Kundli insights and personalized reports crafted for your mindful spiritual journey.</p>
              <div className="mt-5 flex flex-wrap gap-3"><Link href="/kundli" className="inline-flex items-center gap-2 rounded-[13px] bg-[linear-gradient(135deg,#c46d14,#f0b453)] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(196,109,20,.28)]">Get My Kundli <ArrowRight size={16} /></Link><Link href="/free-calculators" className="inline-flex items-center gap-2 rounded-[13px] border border-[#d8af66]/70 bg-white/80 px-5 py-3 text-sm font-black text-[#172536]">Explore Tools <ArrowRight size={16} /></Link></div>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-[#172536]"><span className="flex"><i className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[#fff3df] text-[8px] font-black not-italic text-[#b86612]">A</i><i className="-ml-2 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[#fff3df] text-[8px] font-black not-italic text-[#b86612]">N</i><i className="-ml-2 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[#fff3df] text-[8px] font-black not-italic text-[#b86612]">S</i></span><b>Trusted workflow</b><em className="not-italic text-[#df8b1d]">★★★★★</em><b>Review based</b></div>
            </div>
            <CosmicArt />
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
  return <div className="relative z-20 grid grid-cols-[210px_minmax(0,1fr)_122px] items-center gap-4 border-b border-[#e7d8be] bg-[#fffaf1]/75 px-6 py-4 backdrop-blur max-lg:grid-cols-[1fr_auto]"><BrandLogo /><nav className="flex justify-center gap-1 max-lg:hidden">{navLinks.map(([label, href], index) => <Link key={label} href={href} className={`rounded-xl px-3 py-2 text-xs font-black text-[#172536] no-underline ${index === 0 ? "bg-[#fff1dc] text-[#b86612]" : ""}`}>{label}</Link>)}</nav><div className="flex items-center justify-end gap-3 text-[#172536]"><span className="grid h-10 w-11 place-items-center rounded-[13px] bg-[#0b1a39] text-xs font-black text-white">EN</span><Sparkles size={17} /><UserRound size={18} /></div></div>;
}

function CosmicArt() {
  return <div className="relative min-h-[386px] max-lg:hidden"><div className="absolute inset-[6px_20px_16px_0] rounded-[48%] bg-[radial-gradient(circle_at_50%_49%,rgba(255,225,135,.78),rgba(255,135,55,.40)_12%,rgba(18,48,83,.78)_38%,rgba(18,48,83,.24)_64%,transparent_82%)] blur-xl" /><div className="absolute inset-x-4 bottom-2 z-10 h-28 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,.98),rgba(255,235,200,.74)_44%,transparent_76%)] blur-xl" /><div className="cosmic-wheel absolute left-1/2 top-[48%] z-20 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#fff8dc_0%,#ffc664_8%,#184d72_17%,#0b253e_42%,rgba(7,20,39,.94)_62%,rgba(32,74,109,.55)_74%,transparent_100%)] shadow-[0_0_0_10px_rgba(255,255,255,.34),0_0_92px_rgba(255,133,50,.5),inset_0_0_0_2px_rgba(255,255,255,.2)]"><div className="absolute inset-[8%] rounded-full border border-[#f0c669]/70" /><div className="absolute inset-[17%] rounded-full border border-white/50" /><div className="absolute inset-[28%] rounded-full border border-[#d8af66]/40" /><div className="absolute inset-[5%] rounded-full bg-[repeating-conic-gradient(from_0deg,rgba(216,175,102,.5)_0deg,rgba(216,175,102,.5)_1deg,transparent_1deg,transparent_15deg)] opacity-70" />{zodiac.map((sign, index) => <span key={sign} className="absolute left-1/2 top-1/2 z-30 grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,#b481ff,#6f46d6)] font-serif text-lg font-black text-white shadow-[0_8px_20px_rgba(88,54,176,.32)]" style={{ transform: `translate(-50%,-50%) rotate(${index * 30}deg) translateY(-168px) rotate(-${index * 30}deg)` }}>{sign}</span>)}<div className="cosmic-sun absolute left-1/2 top-1/2 z-40 grid h-[124px] w-[124px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle,#fffce7,#ffe09a_43%,#f59e0b_72%,#b7630c)] shadow-[0_0_38px_rgba(255,224,154,.95),0_0_112px_rgba(255,126,57,.86)]"><span className="absolute -inset-[74px] rounded-full bg-[repeating-conic-gradient(from_0deg,rgba(255,208,92,.9)_0deg,rgba(255,208,92,.9)_2deg,transparent_3deg,transparent_8deg)]" /><b className="relative z-10 text-[66px] leading-none text-[#a1570a]">ॐ</b></div></div><Planet className="left-[38%] top-[6%] h-12 w-12" colors="from-[#0aa5bd] via-[#25d0e9] to-[#07344d]" /><Planet className="right-[8%] top-0 h-[72px] w-[72px]" colors="from-[#fff0c8] via-[#e28e35] to-[#7d4217]" /><Planet className="left-[12%] top-[45%] h-[74px] w-[74px]" colors="from-[#fff0c8] via-[#d8a444] to-[#765013]" ringed /><Planet className="right-[4%] bottom-[23%] h-[78px] w-[78px]" colors="from-[#e8f7ff] via-[#2b8dcc] to-[#0b3b64]" /></div>;
}

function Planet({ className, colors, ringed = false }: { className: string; colors: string; ringed?: boolean }) {
  return <span className={`float-planet absolute z-30 block rounded-full ${className}`}><i className={`block h-full w-full rounded-full bg-gradient-to-br ${colors} shadow-[inset_-14px_-15px_23px_rgba(0,0,0,.25),0_17px_36px_rgba(10,28,46,.25)]`} />{ringed ? <em className="absolute left-1/2 top-1/2 h-[40%] w-[148%] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-full border-[6px] border-[#f5d38f]/80" /> : null}</span>;
}

function ToolStrip() {
  return <div className="relative z-20 mx-7 grid -translate-y-2 grid-cols-8 gap-2 rounded-[18px] border border-[#e7d8be] bg-white/90 p-2 shadow-[0_18px_46px_rgba(31,41,51,.10)] max-lg:mx-4 max-lg:mb-4 max-lg:translate-y-0 max-lg:grid-cols-2">{tools.map(({ label, copy, href, icon: Icon }) => <Link href={href} key={label} className="flex min-w-0 items-center gap-2 rounded-[14px] p-2 text-[#172536] no-underline hover:bg-[#fff5e6]"><Icon size={18} className="shrink-0 text-[#d06f18]" /><span className="min-w-0"><b className="block truncate text-[11px]">{label}</b><small className="block text-[9px] leading-tight text-[#6b7280]">{copy}</small></span></Link>)}</div>;
}

function InfoGrid() {
  return <div className="relative z-20 mx-7 mt-1 grid grid-cols-[1.05fr_1fr_.72fr] gap-3 max-lg:mx-4 max-lg:grid-cols-1"><section className="rounded-[20px] border border-[#e7d8be] bg-white/90 p-4 shadow-[0_16px_40px_rgba(31,41,51,.08)]"><PanelHead title="Today's Panchang" href="/panchang" link="View Full Panchang →" /><div className="grid grid-cols-3 gap-2 max-lg:grid-cols-2">{panchang.map(([a, b]) => <span className="rounded-[13px] bg-[#fff7ea] p-2" key={a}><small className="block text-[9px] font-black uppercase tracking-wider text-[#c56b16]">{a}</small><b className="mt-1 block text-[10px] text-[#172536]">{b}</b></span>)}</div></section><section className="rounded-[20px] border border-[#e7d8be] bg-white/90 p-4 shadow-[0_16px_40px_rgba(31,41,51,.08)]"><PanelHead title="Premium Reports" href="/reports" link="View All →" /><div className="grid grid-cols-3 gap-2 max-lg:grid-cols-2">{reports.map(([a, b]) => <Link href="/reports" className="rounded-[14px] border border-[#e7d8be] bg-gradient-to-br from-[#fff7ea] to-white p-3 text-center text-[#172536] no-underline" key={a}><FileText size={21} className="mx-auto text-[#c56b16]" /><b className="mt-1 block text-[11px]">{a}</b><small className="text-[9px] text-[#6b7280]">{b}</small></Link>)}</div></section><section className="rounded-[20px] border border-[#e7d8be] bg-white/90 p-4 shadow-[0_16px_40px_rgba(31,41,51,.08)]"><h2 className="font-cinzel text-base font-black text-[#753c12]">Why Naksharix?</h2>{["Secure workflow", "Provider calculated", "Review-based reports", "Spiritual guidance"].map((item) => <p className="mt-2 flex items-center gap-2 rounded-[13px] bg-[#fff7ea] p-2 text-[11px] font-black text-[#172536]" key={item}><ShieldCheck size={15} className="text-[#d06f18]" />{item}</p>)}</section></div>;
}

function PanelHead({ title, href, link }: { title: string; href: string; link: string }) {
  return <div className="mb-3 flex items-center justify-between gap-2"><h2 className="font-cinzel text-base font-black text-[#753c12]">{title}</h2><Link href={href} className="text-[10px] font-black text-[#c56b16] no-underline">{link}</Link></div>;
}

function TrustRow() {
  return <div className="relative z-20 mx-7 mb-5 mt-4 grid grid-cols-6 gap-2 rounded-[18px] border border-[#e7d8be] bg-white/90 p-3 max-lg:mx-4 max-lg:grid-cols-2">{["Trusted workflow", "Secure", "Provider calculated", "Review based", "Privacy aware", "Web + app ready"].map((item) => <span className="flex items-center justify-center gap-2 text-[10px] font-black text-[#172536]" key={item}><ShieldCheck size={15} className="text-[#c56b16]" />{item}</span>)}</div>;
}

function PhonePreview() {
  return <aside className="min-h-[690px] overflow-hidden rounded-[32px] border-8 border-[#121212] bg-[#fffaf1] p-3 shadow-[0_28px_80px_rgba(2,8,23,.40)] max-xl:hidden"><div className="flex items-center justify-between text-[10px] font-black text-[#172536]"><span>9:41</span><i className="block h-[17px] w-[58px] rounded-full bg-black" /></div><div className="mt-4 flex items-center justify-between text-[11px] font-black text-[#172536]"><Menu size={16} /><b className="font-cinzel tracking-[.16em] text-[#8f3f0d]">NAKSHARIX</b><em className="not-italic text-[#c2410c]">●</em></div><p className="my-3 text-[11px] font-extrabold text-[#172536]">Namaste, Arjun 👋<small className="block text-[9px] text-[#6b7280]">May the stars guide you today.</small></p><div className="grid grid-cols-[1fr_76px] gap-2 rounded-[18px] border border-[#e7d8be] bg-gradient-to-br from-[#fff7ea] to-[#f5e4c8] p-3"><div><small className="text-[7px] font-black uppercase tracking-wider text-[#c56b16]">Your Cosmic Blueprint</small><strong className="mt-1 block font-cinzel text-[17px] leading-none text-[#172536]">Understand.<br />Align. Elevate.</strong><p className="mt-1 text-[8px] text-[#6b7280]">Explore premium astrology tools.</p></div><div className="grid place-items-center rounded-full bg-[radial-gradient(circle,#fff6cc,#f4a61d_28%,#0b253e_54%,#e8f7ff_78%)] text-[31px] text-[#a1570a] shadow-[0_0_38px_rgba(245,166,35,.45)]">ॐ</div></div><div className="mt-3 grid grid-cols-4 gap-2">{tools.map(({ label, icon: Icon }) => <span key={label} className="rounded-xl border border-[#e7d8be] bg-white p-2 text-center text-[8px] font-black text-[#172536]"><Icon size={14} className="mx-auto mb-1 text-[#d06f18]" />{label.split(" ")[0]}</span>)}</div><div className="mt-3 rounded-2xl border border-[#e7d8be] bg-white p-3 text-[10px] text-[#172536]"><b>Today's Panchang</b><p className="mt-1 text-[8px] text-[#6b7280]">Tithi · Nakshatra · Yoga · Karana</p></div><div className="mt-3 grid grid-cols-3 gap-2">{reports.map(([a]) => <span key={a} className="rounded-xl border border-[#e7d8be] bg-white p-2 text-center text-[7px] font-black text-[#172536]"><FileText size={14} className="mx-auto mb-1 text-[#d06f18]" />{a}</span>)}</div><div className="mt-5 flex items-center justify-around text-[#6b7280]"><Home size={16} /><MoonStar size={16} /><strong className="grid h-11 w-11 place-items-center rounded-full bg-[#c56b16] text-2xl text-white shadow-[0_10px_24px_rgba(197,107,22,.36)]">ॐ</strong><CalendarDays size={16} /><UserRound size={16} /></div></aside>;
}

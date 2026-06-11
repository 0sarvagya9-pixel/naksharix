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
    <main className="exactHome">
      <ExactStyles />
      <section className="exactShell">
        <div className="exactHeroGrid">
          <div className="exactCopy">
            <div className="exactEyebrow"><Sparkles size={18} /> Your Cosmic Blueprint</div>
            <h1 className="exactTitle"><span>Master the</span><span>Cosmos.</span><span>Live Your Destiny.</span></h1>
            <p className="exactSubcopy">Premium astrology tools, daily Panchang, Kundli insights and personalized reports crafted for your mindful spiritual journey.</p>
            <div className="exactActions"><Link href="/kundli" className="exactButton exactPrimary">Get My Kundli <ArrowRight size={18} /></Link><Link href="/free-calculators" className="exactButton exactSecondary">Explore Tools <ArrowRight size={18} /></Link></div>
            <div className="exactMiniTrust">{["Provider calculated", "Secure workflow", "Review-based reports"].map((item) => <span key={item}>{item}</span>)}</div>
          </div>
          <HeroArt />
        </div>
        <ToolStrip />
        <HomeCards />
        <TrustRow />
      </section>
    </main>
  );
}

function HeroArt() {
  return (
    <div className="exactArt" aria-hidden="true">
      <div className="cosmicStage">
        <div className="cloud cloudOne" />
        <div className="cloud cloudTwo" />
        <div className="orbit orbitOne" />
        <div className="orbit orbitTwo" />
        <div className="wheelDisc">
          <div className="ring ringA" /><div className="ring ringB" /><div className="ring ringC" /><div className="radialLines" />
          {zodiac.map((item, index) => <span key={item} className="zodiac" style={{ transform: `translate(-50%,-50%) rotate(${index * 30}deg) translateY(-12.65rem) rotate(-${index * 30}deg)` }}>{item}</span>)}
          <div className="omSun"><span /><b>ॐ</b></div>
        </div>
        <Planet className="p1" /><Planet className="p2" /><Planet className="p3 ringed" /><Planet className="p4" /><Planet className="p5" /><Planet className="p6" />
      </div>
      <AppPreview />
    </div>
  );
}

function Planet({ className }: { className: string }) {
  return <i className={`planet ${className}`}><em /></i>;
}

function AppPreview() {
  return (
    <div className="phonePreview">
      <div className="phoneTop"><span>9:41</span><span /></div>
      <div className="phoneHead"><span>☰</span><b>NAKSHARIX</b><span>●</span></div>
      <p>Namaste, Arjun 👋</p>
      <div className="phoneHero"><div><small>Your Cosmic Blueprint</small><strong>Understand.<br />Align. Elevate.</strong><p>Explore premium astrology tools.</p></div><div>ॐ</div></div>
      <div className="phoneTools">{tools.map(({ label, icon: Icon }) => <span key={label}><Icon size={14} />{label.split(" ")[0]}</span>)}</div>
      <div className="phoneCard"><b>Today's Panchang</b><p>Tithi · Nakshatra · Yoga · Karana</p></div>
      <div className="phoneReports">{reports.map((report) => <span key={report}><FileText size={14} />{report}</span>)}</div>
      <div className="phoneNav"><Home size={15} /><MoonStar size={15} /><span>ॐ</span><CalendarDays size={15} /><UserRound size={15} /></div>
    </div>
  );
}

function ToolStrip() {
  return <div className="exactToolStrip">{tools.map(({ label, copy, href, icon: Icon }) => <Link key={label} href={href}><Icon size={20} /><span><b>{label}</b><small>{copy}</small></span></Link>)}</div>;
}

function HomeCards() {
  return <div className="homeCards"><Card title="Today’s Panchang" href="/panchang"><div className="panchangGrid">{[["Tithi","Shukla Paksha"],["Nakshatra","Provider calculated"],["Yoga","Daily guide"],["Karana","Values may vary"],["Sunrise","Local time"],["Sunset","Local time"]].map(([a,b]) => <span key={a}><small>{a}</small><b>{b}</b></span>)}</div></Card><Card title="Premium Reports" href="/reports"><div className="reportGrid">{reports.map((report) => <Link key={report} href="/reports"><FileText size={22} /><b>{report}</b><small>Premium report</small></Link>)}</div></Card><Card title="Why Naksharix?" href="/disclaimer"><div className="whyList">{["Secure workflow","Provider calculated","Review-based reports","Spiritual guidance"].map((item) => <p key={item}><ShieldCheck size={17} />{item}</p>)}</div></Card></div>;
}

function Card({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return <section className="homeCard"><div><h2>{title}</h2><Link href={href}>View →</Link></div>{children}</section>;
}

function TrustRow() {
  return <div className="trustRow">{["Trusted workflow", "Secure", "Provider calculated", "Review-based", "Privacy aware", "Responsive web + app"].map((item) => <span key={item}><ShieldCheck size={18} />{item}</span>)}</div>;
}

function ExactStyles() {
  return <style>{`
.exactHome{min-height:100vh;background:linear-gradient(135deg,#fffaf1 0%,#fbf6ea 52%,#eef5fb 100%);color:#172536;overflow:hidden}.exactShell{width:min(100% - 1.5rem,1580px);margin:0 auto;padding:1.6rem 0 2.4rem}.exactHeroGrid{display:grid;grid-template-columns:minmax(0,.42fr) minmax(0,.58fr);gap:2rem;align-items:center;min-height:500px}.exactCopy{position:relative;z-index:5}.exactEyebrow{display:inline-flex;align-items:center;gap:.5rem;border:1px solid rgba(216,175,102,.6);background:rgba(255,255,255,.75);border-radius:999px;padding:.65rem 1.15rem;font-size:.72rem;font-weight:900;text-transform:uppercase;letter-spacing:.28em;color:#b8862e;box-shadow:0 10px 28px rgba(184,134,46,.12)}.exactTitle{margin:1.2rem 0 0;max-width:650px;font-family:var(--font-cinzel-decorative),var(--font-cinzel),Georgia,serif;font-size:clamp(3.1rem,4.35vw,5.25rem);line-height:.95;letter-spacing:-.045em;text-transform:uppercase;font-weight:900;color:#172536}.exactTitle span{display:block}.exactTitle span:nth-child(2){color:#bd8627}.exactSubcopy{margin:1.5rem 0 0;max-width:600px;color:#566575;font-size:1.04rem;line-height:1.75;font-weight:500}.exactActions{margin-top:1.7rem;display:flex;flex-wrap:wrap;gap:1rem}.exactButton{display:inline-flex;align-items:center;gap:.55rem;border-radius:14px;padding:1rem 1.55rem;text-decoration:none;font-weight:900}.exactPrimary{background:linear-gradient(135deg,#bd8426,#dfb65f);color:#fff;box-shadow:0 16px 36px rgba(184,134,46,.25)}.exactSecondary{border:1px solid rgba(216,175,102,.75);background:rgba(255,255,255,.75);color:#172536}.exactMiniTrust{display:grid;grid-template-columns:repeat(3,1fr);gap:.8rem;margin-top:1.35rem;max-width:640px}.exactMiniTrust span{border:1px solid #e7d8be;border-radius:18px;background:rgba(255,255,255,.7);padding:.8rem .9rem;font-size:.83rem;font-weight:900;box-shadow:0 10px 28px rgba(31,41,51,.06)}.exactArt{position:relative;display:block;min-height:510px}.cosmicStage{position:absolute;left:0;top:.3rem;width:min(74%,660px);height:510px}.cloud{position:absolute;border-radius:999px;filter:blur(18px);z-index:1}.cloudOne{left:-4%;right:0;bottom:4%;height:150px;background:radial-gradient(ellipse at center,rgba(255,255,255,.96),rgba(248,239,214,.68) 48%,transparent 75%)}.cloudTwo{left:6%;right:-9%;top:2%;height:180px;background:radial-gradient(ellipse at center,rgba(225,239,247,.72),rgba(255,246,225,.28) 52%,transparent 78%)}.orbit{position:absolute;border:1px solid rgba(216,175,102,.42);border-radius:50%;z-index:3}.orbitOne{inset:44px 38px 28px 36px;transform:rotate(-9deg)}.orbitTwo{inset:6px -34px 8px 66px;transform:rotate(18deg)}.wheelDisc{position:absolute;z-index:5;left:9%;top:4%;width:440px;height:440px;border-radius:50%;background:radial-gradient(circle,#fff8dc 0%,#ffe19a 9%,#173653 18%,#0b2235 42%,rgba(12,34,53,.92) 58%,rgba(222,235,245,.55) 78%,transparent 100%);box-shadow:0 0 0 14px rgba(255,255,255,.42),0 0 70px rgba(216,175,102,.28);animation:spin 140s linear infinite}.ring{position:absolute;border-radius:50%;border:1px solid rgba(216,175,102,.7)}.ringA{inset:8%}.ringB{inset:18%;border-color:rgba(255,255,255,.55)}.ringC{inset:28%;border-color:rgba(216,175,102,.35)}.radialLines{position:absolute;inset:6%;border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(216,175,102,.42) 0deg,rgba(216,175,102,.42) 1deg,transparent 1deg,transparent 15deg);opacity:.6}.zodiac{position:absolute;left:50%;top:50%;font-family:Georgia,serif;font-size:1.25rem;font-weight:900;color:#f1c66f;text-shadow:0 0 12px rgba(216,175,102,.65)}.omSun{position:absolute;left:50%;top:50%;z-index:12;width:128px;height:128px;transform:translate(-50%,-50%);display:grid;place-items:center;border-radius:50%;background:radial-gradient(circle,#fffce5 0%,#ffe79a 45%,#d8af66 76%,#b8862e 100%);color:#8f5b10;box-shadow:0 0 34px rgba(255,221,139,.92),0 0 120px rgba(216,175,102,.78);animation:sun 5s ease-in-out infinite}.omSun span{position:absolute;inset:-74px;border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(255,210,105,.82) 0deg,rgba(255,210,105,.82) 2deg,transparent 3deg,transparent 8deg)}.omSun b{position:relative;font-size:4.2rem;line-height:1}.planet{position:absolute;z-index:20;display:block;border-radius:50%;box-shadow:inset -14px -16px 24px rgba(0,0,0,.26),0 18px 40px rgba(13,36,56,.24);animation:float 8s ease-in-out infinite}.planet em{display:block;width:100%;height:100%;border-radius:inherit}.p1{width:54px;height:54px;left:21%;top:-5%}.p1 em{background:linear-gradient(135deg,#0b8092,#2ab0c8,#07344d)}.p2{width:92px;height:92px;right:12%;top:-6%}.p2 em{background:linear-gradient(135deg,#fff1c9,#d58a43,#7d4217)}.p3{width:76px;height:76px;left:0;top:41%}.p3 em{background:linear-gradient(135deg,#fff1c9,#d9a64d,#7b5417)}.p3:after{content:"";position:absolute;left:50%;top:50%;width:150%;height:42%;transform:translate(-50%,-50%) rotate(-12deg);border:6px solid rgba(240,209,139,.8);border-radius:999px}.p4{width:98px;height:98px;right:0;top:38%}.p4 em{background:linear-gradient(135deg,#e9f7ff,#2c86c3,#0a3d63)}.p5{width:56px;height:56px;left:7%;bottom:10%}.p5 em{background:linear-gradient(135deg,#c8fff0,#22a598,#07545a)}.p6{width:42px;height:42px;left:38%;top:50%}.p6 em{background:linear-gradient(135deg,#ffd98f,#e86b27,#8e2f12)}.phonePreview{position:absolute;right:0;top:0;z-index:30;width:238px;border:9px solid #171717;border-radius:34px;background:#fffaf1;padding:1rem;box-shadow:0 24px 70px rgba(31,41,51,.22)}.phoneTop,.phoneHead{display:flex;justify-content:space-between;align-items:center;font-size:.7rem;font-weight:900}.phoneTop span:last-child{width:56px;height:16px;border-radius:999px;background:#111}.phoneHead{margin-top:.75rem}.phoneHead b{font-family:var(--font-cinzel),Georgia,serif;color:#7d4217;letter-spacing:.14em}.phonePreview p{font-size:.7rem;color:#566575}.phoneHero{display:grid;grid-template-columns:1fr 76px;gap:.5rem;border:1px solid #e7d8be;border-radius:18px;background:#fff9f0;padding:.75rem}.phoneHero small{font-size:.48rem;font-weight:900;text-transform:uppercase;letter-spacing:.12em;color:#b8862e}.phoneHero strong{display:block;margin-top:.25rem;font-family:var(--font-cinzel),Georgia,serif;font-size:1.12rem;line-height:1.05}.phoneHero div:last-child{display:grid;place-items:center;border-radius:50%;background:radial-gradient(circle,#fff6cc,#d8af66 35%,#0d2438 58%,#dce8f7 78%);font-size:2rem;color:#8f5b10}.phoneTools{display:grid;grid-template-columns:repeat(4,1fr);gap:.4rem;margin-top:.7rem}.phoneTools span,.phoneReports span{border:1px solid #e7d8be;border-radius:12px;background:#fff;padding:.4rem .15rem;text-align:center;font-size:.5rem;font-weight:900}.phoneTools svg,.phoneReports svg{display:block;margin:0 auto .15rem;color:#b8862e}.phoneCard{margin-top:.7rem;border:1px solid #e7d8be;background:#fff;border-radius:16px;padding:.7rem;font-size:.62rem}.phoneReports{display:grid;grid-template-columns:repeat(3,1fr);gap:.4rem;margin-top:.65rem}.phoneNav{display:flex;justify-content:space-around;align-items:center;margin-top:.75rem;color:#6b7280}.phoneNav span{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:#b8862e;color:#fff;font-size:1.25rem}.exactToolStrip{display:grid;grid-template-columns:repeat(8,1fr);gap:.65rem;margin-top:.8rem;border:1px solid #e7d8be;background:rgba(255,255,255,.8);border-radius:24px;padding:.75rem;box-shadow:0 22px 70px rgba(31,41,51,.09)}.exactToolStrip a{display:flex;gap:.55rem;align-items:center;border-radius:16px;padding:.7rem;text-decoration:none;color:#172536}.exactToolStrip a:hover{background:#fff9f0}.exactToolStrip svg{color:#b8862e;flex:none}.exactToolStrip b{display:block;font-size:.76rem}.exactToolStrip small{display:block;color:#6b7280;font-size:.62rem}.homeCards{display:grid;grid-template-columns:1.05fr 1.05fr .8fr;gap:1rem;margin-top:1rem}.homeCard{border:1px solid #e7d8be;background:rgba(255,255,255,.8);border-radius:24px;padding:1rem;box-shadow:0 18px 55px rgba(31,41,51,.08)}.homeCard>div:first-child{display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:.85rem}.homeCard h2{margin:0;font-family:var(--font-cinzel),Georgia,serif;font-size:1.05rem}.homeCard a{color:#b8862e;text-decoration:none;font-size:.72rem;font-weight:900}.panchangGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:.65rem}.panchangGrid span,.whyList p{border-radius:14px;background:#fff9f0;padding:.7rem}.panchangGrid small{display:block;color:#b8862e;font-size:.56rem;font-weight:900;text-transform:uppercase;letter-spacing:.12em}.panchangGrid b{font-size:.72rem}.reportGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:.65rem}.reportGrid a{border:1px solid #e7d8be;background:#fff9f0;border-radius:16px;padding:.8rem;text-align:center;color:#172536;text-decoration:none}.reportGrid svg{color:#b8862e}.reportGrid b{display:block;font-size:.72rem}.reportGrid small{display:block;color:#6b7280;font-size:.58rem}.whyList p{display:flex;gap:.45rem;align-items:center;margin:.55rem 0 0;font-size:.75rem;font-weight:900}.whyList svg{color:#0d9b74}.trustRow{display:grid;grid-template-columns:repeat(6,1fr);gap:.65rem;margin-top:1rem;border:1px solid #e7d8be;background:rgba(255,255,255,.75);border-radius:22px;padding:.8rem}.trustRow span{display:flex;align-items:center;justify-content:center;gap:.45rem;font-size:.72rem;font-weight:900}.trustRow svg{color:#b8862e}@keyframes spin{to{transform:rotate(360deg)}}@keyframes sun{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.025)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@media(max-width:1320px){.phonePreview{display:none}.cosmicStage{width:100%}.exactTitle{font-size:clamp(3rem,4.4vw,4.8rem)}}@media(max-width:1023px){.exactHeroGrid{display:block;min-height:auto}.exactArt{display:none}.exactTitle{font-size:clamp(2.85rem,13vw,4.7rem)}.exactMiniTrust{grid-template-columns:1fr}.exactToolStrip{grid-template-columns:repeat(2,1fr)}.homeCards{grid-template-columns:1fr}.panchangGrid,.reportGrid{grid-template-columns:repeat(2,1fr)}.trustRow{grid-template-columns:repeat(2,1fr)}}@media(prefers-reduced-motion:reduce){.wheelDisc,.omSun,.planet{animation:none!important}}
  `}</style>;
}

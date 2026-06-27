import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, Grid3X3, HeartHandshake, MoonStar, ShieldCheck, Sparkles, SunMedium } from "lucide-react";

const tools = [
  { label: "Kundli", copy: "Birth Chart", href: "/kundli", icon: MoonStar },
  { label: "Panchang", copy: "Daily Guide", href: "/panchang", icon: CalendarDays },
  { label: "Horoscope", copy: "Predictions", href: "/daily-horoscope", icon: SunMedium },
  { label: "Numerology", copy: "Numbers", href: "/numerology", icon: Grid3X3 },
  { label: "Match Making", copy: "Compatibility", href: "/matchmaking", icon: HeartHandshake },
  { label: "Tarot", copy: "Insights", href: "/tarot", icon: Sparkles },
  { label: "More Tools", copy: "All Tools", href: "/free-calculators", icon: Grid3X3 }
];
const reports = ["Birth Chart", "Life Report", "Year Ahead"];
const signs = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

export function Theme10ProductionHome() {
  return (
    <main className="t10flat">
      <Theme10Styles />
      <section className="t10wrap">
        <div className="heroCard">
          <div className="copy">
            <div className="eyebrow"><Sparkles size={16} /> Your Cosmic Blueprint</div>
            <h1><span>Master the</span><span>Cosmos.</span><span>Live Your Destiny.</span></h1>
            <p>Premium astrology tools, daily Panchang, Kundli insights and personalized reports crafted for your unique journey.</p>
            <div className="buttons"><Link href="/kundli">Get My Kundli <ArrowRight size={16} /></Link><Link href="/free-calculators">Explore Tools</Link></div>
          </div>
          <Cosmic2D />
        </div>
        <ToolStrip />
        <InfoGrid />
      </section>
    </main>
  );
}

function Cosmic2D() {
  return (
    <div className="cosmos" aria-hidden="true">
      <div className="cloud" />
      <div className="wheel">
        <div className="rings" />
        <div className="spokes" />
        {signs.map((sign, index) => <span key={sign} style={{ transform: `translate(-50%,-50%) rotate(${index * 30}deg) translateY(-150px) rotate(-${index * 30}deg)` }}>{sign}</span>)}
        <b>ॐ</b>
      </div>
      <i className="planet p1" /><i className="planet p2" /><i className="planet p3" /><i className="planet p4" />
    </div>
  );
}

function ToolStrip() {
  return <div className="toolStrip">{tools.map(({ label, copy, href, icon: Icon }) => <Link href={href} key={label}><Icon size={20} /><b>{label}</b><small>{copy}</small></Link>)}</div>;
}

function InfoGrid() {
  return <div className="infoGrid"><section><h2>Today&apos;s Panchang</h2><div className="miniGrid">{["Tithi", "Nakshatra", "Yoga", "Karana", "Sunrise", "Sunset"].map((item) => <p key={item}><small>{item}</small><b>Provider calculated</b></p>)}</div></section><section><h2>Premium Reports</h2><div className="reports">{reports.map((item) => <Link href="/reports" key={item}><FileText size={24} /><b>{item}</b><small>Detailed insights</small></Link>)}</div></section><section><h2>Why Naksharix?</h2>{["Secure workflow", "Provider calculated", "Review-based reports"].map((item) => <p className="why" key={item}><ShieldCheck size={16} />{item}</p>)}</section></div>;
}

function Theme10Styles() {
  return <style>{`
body:has(.t10flat){background:#07111f!important}.t10flat{background:#07111f;padding:16px;min-height:100vh;color:#172536}.t10wrap{max-width:1500px;margin:0 auto;border-radius:30px;overflow:hidden;background:linear-gradient(135deg,#fffaf1 0%,#fff1df 45%,#eaf5fb 100%);border:1px solid #e3c27f;box-shadow:0 28px 90px rgba(0,0,0,.35)}.heroCard{position:relative;display:grid;grid-template-columns:42% 58%;min-height:520px}.heroCard:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 67% 36%,rgba(10,33,71,.78),transparent 390px),radial-gradient(circle at 62% 44%,rgba(255,132,43,.34),transparent 340px);pointer-events:none}.copy{position:relative;z-index:2;padding:62px 36px 32px}.eyebrow{display:inline-flex;align-items:center;gap:8px;border:1px solid #dfbd7b;background:#fff8ee;border-radius:999px;padding:9px 16px;color:#b86612;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.22em}.copy h1{font-family:var(--font-cinzel-decorative),var(--font-cinzel),Georgia,serif;font-size:clamp(54px,5vw,86px);line-height:.92;margin:22px 0 0;text-transform:uppercase;letter-spacing:-.04em}.copy h1 span{display:block}.copy h1 span:nth-child(2){color:#c77912}.copy p{max-width:470px;color:#42556b;font-size:16px;line-height:1.7;font-weight:600}.buttons{display:flex;gap:16px;flex-wrap:wrap;margin-top:26px}.buttons a{display:inline-flex;align-items:center;gap:10px;border-radius:15px;padding:14px 22px;font-weight:900;text-decoration:none}.buttons a:first-child{background:#c87914;color:white}.buttons a:last-child{border:1px solid #e2bf82;color:#172536;background:white}.cosmos{position:relative;min-height:520px;overflow:hidden}.cloud{position:absolute;left:0;right:0;bottom:0;height:170px;background:radial-gradient(ellipse at center,rgba(255,255,255,.96),rgba(255,234,195,.75) 45%,transparent 76%);filter:blur(10px);z-index:4}.wheel{position:absolute;left:50%;top:49%;width:420px;height:420px;transform:translate(-50%,-50%);border-radius:50%;background:#082646;box-shadow:0 0 0 2px #d9a447,0 0 90px rgba(255,132,43,.7);z-index:3}.rings:before,.rings:after{content:"";position:absolute;border-radius:50%;border:1px solid rgba(245,206,119,.8)}.rings:before{inset:8%}.rings:after{inset:22%}.spokes{position:absolute;inset:5%;border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(217,164,71,.55) 0deg,rgba(217,164,71,.55) 1deg,transparent 1deg,transparent 10deg)}.wheel span{position:absolute;left:50%;top:50%;display:grid;place-items:center;width:32px;height:32px;border-radius:50%;color:#ffd879;background:#102e56;font-family:Georgia,serif;font-weight:900}.wheel b{position:absolute;left:50%;top:50%;display:grid;place-items:center;width:118px;height:118px;transform:translate(-50%,-50%);border-radius:50%;font-size:64px;color:#9a5208;background:radial-gradient(circle,#fff7c8,#ffca4f 52%,#d37012);box-shadow:0 0 120px rgba(255,133,38,.95)}.planet{position:absolute;border-radius:50%;z-index:5;box-shadow:inset -10px -12px 18px rgba(0,0,0,.22),0 16px 34px rgba(10,28,46,.25)}.p1{left:20%;top:10%;width:64px;height:64px;background:linear-gradient(135deg,#50bbff,#104a77)}.p2{right:8%;top:7%;width:94px;height:94px;background:linear-gradient(135deg,#ffe1a2,#bf6d23)}.p3{left:20%;bottom:20%;width:82px;height:82px;background:linear-gradient(135deg,#ffe2aa,#c8872a)}.p4{right:18%;bottom:18%;width:112px;height:112px;background:linear-gradient(135deg,#70c3ff,#0a3d68)}.toolStrip{position:relative;z-index:6;margin:-34px 34px 0;display:grid;grid-template-columns:repeat(7,1fr);gap:10px;background:rgba(255,255,255,.92);border:1px solid #ead9bd;border-radius:22px;padding:12px}.toolStrip a{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px;border-radius:16px;color:#172536;text-decoration:none}.toolStrip svg{color:#c87914}.toolStrip b{font-size:13px}.toolStrip small{font-size:10px;color:#6b7280}.infoGrid{display:grid;grid-template-columns:1.1fr 1fr .75fr;gap:16px;padding:24px 34px 34px}.infoGrid section{background:rgba(255,255,255,.88);border:1px solid #ead9bd;border-radius:22px;padding:18px}.infoGrid h2{margin:0 0 14px;color:#8f3f0d;font-family:var(--font-cinzel),Georgia,serif}.miniGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.miniGrid p,.why{background:#fff7ea;border-radius:14px;padding:10px;margin:0}.miniGrid small{display:block;color:#c87914;font-weight:900}.miniGrid b{font-size:12px}.reports{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.reports a{display:block;text-align:center;border:1px solid #ead9bd;border-radius:14px;padding:12px;color:#172536;text-decoration:none}.reports svg{color:#c87914}.reports b{display:block;font-size:12px}.reports small{font-size:10px;color:#6b7280}.why{display:flex;align-items:center;gap:8px;margin-top:9px;font-weight:800}.why svg{color:#c87914}@media(max-width:1024px){.heroCard{display:block}.cosmos{display:none}.copy{padding:34px 22px}.toolStrip{margin:0 18px;grid-template-columns:repeat(2,1fr)}.infoGrid{grid-template-columns:1fr;padding:18px}.copy h1{font-size:clamp(42px,13vw,66px)}}`}</style>;
}

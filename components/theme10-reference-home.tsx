import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, Grid3X3, HeartHandshake, Home, Menu, MoonStar, ShieldCheck, Sparkles, Star, SunMedium, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import styles from "./theme10-reference-home.module.css";

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

export function Theme10ReferenceHome() {
  return (
    <main className={`referenceShell ${styles.page}`}>
      <style>{`body:has(.referenceShell){background:#07111f!important}body:has(.referenceShell) header.sticky{display:none!important}`}</style>
      <section className={styles.frame}>
        <div className={styles.board}>
          <ReferenceNav />
          <div className={styles.heroRow}>
            <div className={styles.copy}>
              <div className={styles.eyebrow}><Sparkles size={16} /> Your Cosmic Blueprint</div>
              <h1 className={styles.title}><span>Master the</span><span>Cosmos.</span><span>Live Your Destiny.</span></h1>
              <p className={styles.subtitle}>Premium astrology tools, daily Panchang, Kundli insights and personalized reports crafted for your mindful spiritual journey.</p>
              <div className={styles.ctaRow}><Link className={styles.primary} href="/kundli">Get My Kundli <ArrowRight size={16} /></Link><Link className={styles.secondary} href="/free-calculators">Explore Tools <ArrowRight size={16} /></Link></div>
              <div className={styles.proof}><span><i>A</i><i>N</i><i>S</i></span><b>Trusted workflow</b><em>★★★★★</em><b>Review based</b></div>
            </div>
            <CosmicArt />
          </div>
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
  return <div className={styles.navbar}><BrandLogo className={styles.logo} /><nav>{navLinks.map(([label, href], index) => <Link key={label} href={href} className={index === 0 ? styles.active : undefined}>{label}</Link>)}</nav><div className={styles.topIcons}><span>EN</span><Sparkles size={17} /><UserRound size={18} /></div></div>;
}

function CosmicArt() {
  return (
    <div className={styles.art} aria-hidden="true">
      <div className={styles.nebula} /><div className={styles.starfield} /><div className={`${styles.cloud} ${styles.cloudA}`} /><div className={`${styles.cloud} ${styles.cloudB}`} />
      <div className={styles.wheel}>
        <div className={`${styles.ring} ${styles.ringA}`} /><div className={`${styles.ring} ${styles.ringB}`} /><div className={`${styles.ring} ${styles.ringC}`} /><div className={styles.spokes} />
        {zodiac.map((sign, index) => <span key={sign} className={styles.zodiac} style={{ transform: `translate(-50%,-50%) rotate(${index * 30}deg) translateY(-168px) rotate(-${index * 30}deg)` }}>{sign}</span>)}
        <div className={styles.sun}><i /><b>ॐ</b></div>
      </div>
      <Planet className={styles.planetOne} /><Planet className={styles.planetTwo} /><Planet className={styles.planetThree} ringed /><Planet className={styles.planetFour} /><Planet className={styles.planetFive} /><Planet className={styles.planetSix} />
    </div>
  );
}

function Planet({ className, ringed = false }: { className: string; ringed?: boolean }) {
  return <span className={`${styles.planet} ${className} ${ringed ? styles.ringed : ""}`}><i /></span>;
}

function ToolStrip() {
  return <div className={styles.tools}>{tools.map(({ label, copy, href, icon: Icon }) => <Link href={href} key={label}><Icon size={18} /><span><b>{label}</b><small>{copy}</small></span></Link>)}</div>;
}

function InfoGrid() {
  return <div className={styles.infoGrid}><section className={styles.panel}><PanelHead title="Today's Panchang" href="/panchang" link="View Full Panchang →" /><div className={styles.panchangGrid}>{panchang.map(([a, b]) => <span key={a}><small>{a}</small><b>{b}</b></span>)}</div></section><section className={styles.panel}><PanelHead title="Premium Reports" href="/reports" link="View All →" /><div className={styles.reportGrid}>{reports.map(([a, b]) => <Link href="/reports" key={a}><FileText size={21} /><b>{a}</b><small>{b}</small></Link>)}</div></section><section className={`${styles.panel} ${styles.why}`}><h2>Why Naksharix?</h2>{["Secure workflow", "Provider calculated", "Review-based reports", "Spiritual guidance"].map((item) => <p key={item}><ShieldCheck size={15} />{item}</p>)}</section></div>;
}

function PanelHead({ title, href, link }: { title: string; href: string; link: string }) {
  return <div className={styles.panelHead}><h2>{title}</h2><Link href={href}>{link}</Link></div>;
}

function TrustRow() {
  return <div className={styles.trust}>{["Trusted workflow", "Secure", "Provider calculated", "Review based", "Privacy aware", "Web + app ready"].map((item) => <span key={item}><ShieldCheck size={15} />{item}</span>)}</div>;
}

function PhonePreview() {
  return <aside className={styles.phone}><div className={styles.phoneStatus}><span>9:41</span><i /></div><div className={styles.phoneHead}><Menu size={16} /><b>NAKSHARIX</b><em>●</em></div><p className={styles.greet}>Namaste, Arjun 👋<small>May the stars guide you today.</small></p><div className={styles.phoneHero}><div><small>Your Cosmic Blueprint</small><strong>Understand.<br />Align. Elevate.</strong><p>Explore premium astrology tools.</p></div><div>ॐ</div></div><div className={styles.phoneTools}>{tools.map(({ label, icon: Icon }) => <span key={label}><Icon size={14} />{label.split(" ")[0]}</span>)}</div><div className={styles.phoneCard}><b>Today's Panchang</b><p>Tithi · Nakshatra · Yoga · Karana</p></div><div className={styles.phoneReports}>{reports.map(([a]) => <span key={a}><FileText size={14} />{a}</span>)}</div><div className={styles.phoneNav}><Home size={16} /><MoonStar size={16} /><strong>ॐ</strong><CalendarDays size={16} /><UserRound size={16} /></div></aside>;
}

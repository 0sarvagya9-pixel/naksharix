import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, HeartHandshake, Hash, MoonStar, Sparkles, SunMedium } from "lucide-react";
import { pujaEditorialImage } from "@/lib/puja/editorial-photos";
import { referencePhotoForProduct } from "@/lib/shop/real-photo-seeds";

/**
 * Owner-approved 6 November 2026 gallery: editorial light homepage.
 * Every button is a real existing destination, not a decorative mock control.
 * Keep checkout prices, reviews and provider status in their existing data flows.
 */
const tools = [
  { title: "Kundli", subtitle: "Birth chart", href: "/kundli", icon: MoonStar },
  { title: "Matching", subtitle: "Compatibility", href: "/matchmaking", icon: HeartHandshake },
  { title: "Panchang", subtitle: "Dates & Tithi", href: "/panchang", icon: CalendarDays },
  { title: "Horoscope", subtitle: "Daily insights", href: "/horoscope", icon: SunMedium },
  { title: "Numerology", subtitle: "Life numbers", href: "/numerology", icon: Hash },
  { title: "Tarot", subtitle: "Reflection", href: "/tarot", icon: Sparkles },
];

const cards = [
  {
    title: "Puja & Traditions",
    copy: "Explore cultural rituals and ceremony options",
    image: pujaEditorialImage("rudrabhishek", "/naksharix/ganesh-hero-light-saffron.jpg", "shiva"),
    alt: "Representative traditional puja ritual photograph",
    href: "/pujas",
    action: "Explore puja",
  },
  {
    title: "Spiritual Catalogue",
    copy: "View Rudraksha, malas and yantra collections",
    image: referencePhotoForProduct("rudraksha-mala")?.url || "/shop/rudraksha-mala-illustration.svg",
    alt: "Rudraksha mala reference product photograph or illustration",
    href: "/shop",
    action: "Browse catalogue",
  },
  {
    title: "Personal Reports",
    copy: "Find clear, structured report formats",
    image: "/naksharix/zodiac-wheel-gold.jpg",
    alt: "Golden zodiac wheel illustrating astrology reports",
    href: "/reports",
    action: "Browse reports",
  },
  {
    title: "Astrologer Consultations",
    copy: "Compare profiles, session types and availability",
    image: "/naksharix/editorial-consultation.svg",
    alt: "Consultation illustration",
    href: "/consultation",
    action: "Find guidance",
  },
];

export function ApprovedGalleryHome() {
  return (
    <div className="nx-approved-home" data-visual-source="NAKSHARIX_DESIGN_APPROVAL_20261106">
      <section className="nx-a-hero" aria-labelledby="nx-a-heading">
        <div className="nx-a-hero-copy">
          <span className="nx-a-eyebrow">Ancient wisdom for modern life</span>
          <h1 id="nx-a-heading">Discover your <span>cosmic journey.</span></h1>
          <p>Explore traditional Kundli, Panchang, horoscope, spiritual traditions and personal guidance in one beautifully designed place.</p>
          <div className="nx-a-actions">
            <Link href="/kundli" className="nx-a-button nx-a-primary">
              <MoonStar size={17} aria-hidden="true"/> Create Free Kundli <ArrowRight size={16} aria-hidden="true"/>
            </Link>
            <Link href="/free-calculators" className="nx-a-button">
              Explore Services <ArrowRight size={16} aria-hidden="true"/>
            </Link>
          </div>
        </div>
        <div className="nx-a-hero-art" role="img" aria-label="Golden Vedic zodiac artwork, symbolizing traditional astrology" />
      </section>
      <div className="nx-a-container">
        <nav className="nx-a-tools" aria-label="Popular astrology tools">
          {tools.map(({ title, subtitle, href, icon: Icon }) => (
            <Link href={href} key={href} className="nx-a-tool">
              <Icon size={30} strokeWidth={1.45} aria-hidden="true"/>
              <strong>{title}</strong>
              <small>{subtitle}</small>
            </Link>
          ))}
        </nav>
        <section className="nx-a-section" aria-labelledby="nx-a-services">
          <div className="nx-a-section-heading">
            <span>Curated experiences</span>
            <h2 id="nx-a-services">Our key services</h2>
            <p>Clear navigation, thoughtful imagery and genuinely useful features.</p>
          </div>
          <div className="nx-a-services">
            {cards.map(card => (
              <article className="nx-a-card" key={card.href}>
                <Link href={card.href} aria-label={card.action} className="nx-a-image-link">
                  <Image src={card.image} alt={card.alt} width={680} height={360}
                    unoptimized className="nx-a-card-image"/>
                </Link>
                <div className="nx-a-card-copy">
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                  <Link href={card.href}>{card.action} <ArrowRight size={14} aria-hidden="true"/></Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
      <div className="nx-a-bridge" aria-hidden="true" />
    </div>
  );
}

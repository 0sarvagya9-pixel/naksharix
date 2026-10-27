"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, CalendarDays, ChevronRight, CircleHelp,
  Compass, Heart, MoonStar, Pause, Play, ShieldCheck, Sparkles, Sun, Users
} from "lucide-react";

const STARRY_SKY = "/naksharix/ganesh-hero-light-saffron.jpg";
const GOLDEN_HORIZON = "/naksharix/zodiac-wheel-gold.jpg";

const heroSlides = [
  {
    eyebrow: "NAKSHARIX  /  VEDIC DISCOVERY",
    heading: "Your universe,",
    accent: "your way forward.",
    body: "Explore Vedic astrology with beautiful digital tools, clear explanations and thoughtful ways to seek guidance.",
    image: STARRY_SKY,
    alt: "Devotional Ganesha editorial artwork with traditional temple motifs",
    main: { label: "Generate free Kundli", href: "/kundli" },
    secondary: { label: "Explore astrology tools", href: "/free-calculators" }
  },
  {
    eyebrow: "TODAY  /  PANCHANG & HOROSCOPE",
    heading: "A little clarity",
    accent: "for each new day.",
    body: "Read the Panchang for your location, understand the day’s traditional context and discover the zodiac.",
    image: GOLDEN_HORIZON,
    alt: "Zodiac wheel editorial artwork",
    main: { label: "View today’s Panchang", href: "/panchang" },
    secondary: { label: "Today’s horoscope", href: "/daily-horoscope" }
  },
  {
    eyebrow: "GUIDANCE  /  A PERSONAL JOURNEY",
    heading: "Ask deeper",
    accent: "questions.",
    body: "Browse approved astrologer profiles, request a consultation or send a private written enquiry for staff review.",
    image: "/naksharix/ganesh-hero-light-saffron.jpg",
    alt: "Warm saffron-toned traditional devotional artwork",
    main: { label: "Find a consultation", href: "/consultation" },
    secondary: { label: "Ask a written question", href: "/ask-astrologer" }
  }
] as const;

const quickLinks = [
  { label: "Free Kundli", desc: "Birth-chart calculations", href: "/kundli", icon: MoonStar },
  { label: "Daily Horoscope", desc: "Discover your sign", href: "/daily-horoscope", icon: Sun },
  { label: "Kundli Matching", desc: "Traditional compatibility", href: "/matchmaking", icon: Heart },
  { label: "Panchang", desc: "Date and place based", href: "/panchang", icon: CalendarDays },
  { label: "Numerology", desc: "Explore the numbers", href: "/numerology", icon: Sparkles },
  { label: "Ask a Question", desc: "Private written enquiry", href: "/ask-astrologer", icon: CircleHelp }
] as const;

const services = [
  {
    number:"01",label:"Personal Kundli",copy:"Explore the traditional birth chart with time- and location-based inputs.",
    href:"/kundli",cta:"Create free Kundli",image:"/naksharix/editorial-kundli.svg",alt:"Original illustrated Vedic birth-chart grid"
  },
  {
    number:"02",label:"Expert Consultations",copy:"Read approved astrologer profiles and available session formats.",
    href:"/consultation",cta:"Explore consultations",image:"/naksharix/editorial-consultation.svg",alt:"Original artwork illustrating a person in consultation"
  },
  {
    number:"03",label:"Personal Reports",copy:"Browse available personalized Kundli, match-making and numerology topics.",
    href:"/reports",cta:"View astrology reports",image:"/naksharix/editorial-reports.svg",alt:"Original illustrated report and zodiac diagram"
  },
  {
    number:"04",label:"Traditional Puja",copy:"Browse 94 Puja topics and request written availability confirmation.",
    href:"/pujas",cta:"Explore Puja directory",image:"/naksharix/editorial-puja.svg",alt:"Original illustration of a traditional puja thali"
  },
  {
    number:"05",label:"Kundli Matching",copy:"Compare traditional chart inputs and learn about Guna Milan.",
    href:"/matchmaking",cta:"Check compatibility",image:"/naksharix/editorial-kundli.svg",alt:"Vedic birth chart geometry illustration"
  },
  {
    number:"06",label:"Your Daily Panchang",copy:"Understand the five traditional Panchang elements for a chosen place.",
    href:"/panchang",cta:"Explore Panchang",image:"/naksharix/editorial-panchang.svg",alt:"Original calendar illustration with ritual dates"
  },
  {
    number:"07",label:"Spiritual Catalogue",copy:"Discover Rudraksha, malas and yantras with clear item enquiries.",
    href:"/shop",cta:"Explore the collection",image:"/shop/rudraksha-mala-illustration.svg",alt:"Original Rudraksha mala product illustration"
  },
  {
    number:"08",label:"Free Learning",copy:"Start with original introductory lessons on charts, planets and Panchang.",
    href:"/learn",cta:"Start learning",image:"/naksharix/editorial-learning.svg",alt:"Illustration of an open traditional learning book"
  }
] as const;

const zodiac = [
  ["Aries", "♈"], ["Taurus", "♉"], ["Gemini", "♊"], ["Cancer", "♋"],
  ["Leo", "♌"], ["Virgo", "♍"], ["Libra", "♎"], ["Scorpio", "♏"],
  ["Sagittarius", "♐"], ["Capricorn", "♑"], ["Aquarius", "♒"], ["Pisces", "♓"]
] as const;

const journeys = [
  {
    label: "Puja & traditions", eyebrow: "TRADITIONS",
    desc: "Explore customary practices and submit an enquiry. Ceremony services and partner availability require confirmation.",
    href: "/pujas", cta: "Explore Puja directory",
    image: "/naksharix/ganesh-hero-light-saffron.jpg",
    alt: "Traditional Ganesh devotional art"
  },
  {
    label: "Learn the foundations", eyebrow: "FREE LEARNING",
    desc: "Go from birth charts to the Panchang through four introductory lessons with linked calculators.",
    href: "/learn", cta: "Start learning",
    image: "/naksharix/editorial-learning.svg",
    alt: "Illustrated open Vedic learning book"
  },
  {
    label: "Spiritual catalogue", eyebrow: "CURATED DISCOVERY",
    desc: "Browse spiritual products and make an enquiry. Online checkout and delivery are not active.",
    href: "/shop", cta: "View catalogue",
    image: "/shop/rudraksha-mala-illustration.svg",
    alt: "Illustrative Rudraksha mala artwork"
  }
] as const;

function SectionTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <div className="nx-ed-section-title">
      <span className="nx-ed-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {copy ? <p>{copy}</p> : null}
    </div>
  );
}

export function EditorialHome() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || manuallyPaused || reducedMotion) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % heroSlides.length), 7500);
    return () => window.clearInterval(timer);
  }, [paused, manuallyPaused, reducedMotion]);

  const slide = heroSlides[active];
  function advance(direction: number) {
    setActive((index) => (index + direction + heroSlides.length) % heroSlides.length);
  }

  return (
    <div className="nx-editorial">
      <section className="nx-ed-hero" aria-label="Naksharix featured destinations"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
        }}>
        <div className="nx-ed-hero-imagery" aria-hidden="true">
          {heroSlides.map((item, index) => (
            <div className={"nx-ed-hero-photo " + (index === active ? "is-active" : "")} key={item.eyebrow}>
              <Image src={item.image} alt="" fill priority={index === 0}
                sizes="100vw" quality={75} className="nx-ed-photo" />
            </div>
          ))}
        </div>
        <div className="nx-ed-hero-wash" aria-hidden="true" />
        <div className="nx-ed-container nx-ed-hero-inner">
          <div className="nx-ed-hero-copy" key={slide.eyebrow}>
            <span className="nx-ed-eyebrow nx-ed-eyebrow-on-dark"><Sparkles size={14} aria-hidden="true" /> {slide.eyebrow}</span>
            <h1>{slide.heading} <em>{slide.accent}</em></h1>
            <p>{slide.body}</p>
            <div className="nx-ed-actions">
              <Link className="nx-ed-button nx-ed-button-gold" href={slide.main.href}>
                {slide.main.label}<ArrowRight aria-hidden="true" size={17}/>
              </Link>
              <Link className="nx-ed-button nx-ed-button-outline" href={slide.secondary.href}>
                {slide.secondary.label}
              </Link>
            </div>
            <div className="nx-ed-hero-note"><ShieldCheck size={16} aria-hidden="true" /> Transparent tools · Private account features · No guaranteed predictions</div>
          </div>
          <div className="nx-ed-hero-aside" aria-hidden="true">
            <div className="nx-ed-floating-wheel">
              <Image src="/naksharix/zodiac-wheel-gold.jpg" alt="" fill sizes="(max-width: 1000px) 0px, 320px" quality={68} />
            </div>
            <div className="nx-ed-floating-caption"><span>ANCIENT FRAMEWORKS</span><strong>Modern exploration</strong></div>
          </div>
          <div className="nx-ed-slider-controls" aria-label="Featured destinations">
            <button type="button" onClick={() => advance(-1)} aria-label="Previous featured destination"><ArrowLeft size={18}/></button>
            <div className="nx-ed-slider-dots">
              {heroSlides.map((item, index) => (
                <button type="button" aria-label={"Show slide " + (index + 1)} aria-current={index === active ? "true" : undefined}
                  className={index === active ? "is-active" : ""} onClick={() => setActive(index)} key={item.eyebrow}/>
              ))}
            </div>
            <button type="button" onClick={() => advance(1)} aria-label="Next featured destination"><ArrowRight size={18}/></button>
            <button type="button" onClick={() => setManuallyPaused((value) => !value)}
              aria-label={reducedMotion ? "Automatic slideshow disabled by reduced motion" : manuallyPaused ? "Play featured slideshow" : "Pause featured slideshow"}
              aria-pressed={manuallyPaused} disabled={reducedMotion}>
              {manuallyPaused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </section>

      <section className="nx-ed-quick-section" aria-label="Popular astrology tools">
        <div className="nx-ed-container">
          <div className="nx-ed-quick-heading"><span>DISCOVER IN A CLICK</span><strong>Your cosmic toolkit</strong></div>
          <div className="nx-ed-quick-grid">
            {quickLinks.map(({ label, desc, href, icon: Icon }) => (
              <Link href={href} key={href} className="nx-ed-quick-link">
                <span className="nx-ed-quick-icon"><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></span>
                <span className="nx-ed-quick-text"><strong>{label}</strong><small>{desc}</small></span>
                <ChevronRight size={15} className="nx-ed-arrow" aria-hidden="true"/>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="nx-ed-section nx-ed-services" aria-label="Featured Naksharix services">
        <div className="nx-ed-container">
          <SectionTitle eyebrow="EXPLORE NAKSHARIX" title="Astrology, made personal." copy="Discover real features—beautifully presented, with straightforward explanations and responsible expectations." />
          <div className="nx-ed-service-grid">
            {services.map((item) => (
              <article className="nx-ed-service-card" key={item.href}>
                <Link href={item.href} className="nx-ed-card-image" aria-label={item.cta}>
                  <Image src={item.image} alt={item.alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1080px) 50vw, 33vw"
                    quality={75} />
                  <span className="nx-ed-card-number">{item.number}</span>
                </Link>
                <div className="nx-ed-card-body">
                  <h3>{item.label}</h3>
                  <p>{item.copy}</p>
                  <Link href={item.href} className="nx-ed-text-link">{item.cta}<ArrowRight size={17} aria-hidden="true"/></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="nx-ed-cosmos-split" aria-labelledby="nx-ed-horoscope-title">
        <div className="nx-ed-container nx-ed-cosmos-inner">
          <div className="nx-ed-cosmos-photo">
            <Image src={GOLDEN_HORIZON} alt="Illustrated Hindu calendar and Panchang" fill sizes="(max-width: 850px) 100vw, 45vw" quality={75}/>
            <div className="nx-ed-cosmos-photo-label"><Sun size={18} aria-hidden="true"/> A moment for reflection, every day</div>
          </div>
          <div className="nx-ed-cosmos-copy">
            <span className="nx-ed-eyebrow">TODAY & THE ZODIAC</span>
            <h2 id="nx-ed-horoscope-title">Discover what the sky <em>symbolizes.</em></h2>
            <p>Read your sign’s traditional horoscope or explore the Panchang based on the place and date you choose.</p>
            <div className="nx-ed-zodiac-grid" aria-label="Choose your zodiac sign">
              {zodiac.map(([sign, glyph]) => (
                <Link href={"/horoscope/" + sign.toLowerCase()} key={sign} aria-label={sign + " horoscope"}>
                  <span aria-hidden="true">{glyph}</span><small>{sign}</small>
                </Link>
              ))}
            </div>
            <Link className="nx-ed-text-link" href="/panchang">Explore the Panchang <ArrowRight size={17} aria-hidden="true"/></Link>
          </div>
        </div>
      </section>

      <section className="nx-ed-section nx-ed-journey">
        <div className="nx-ed-container">
          <SectionTitle eyebrow="MORE TO DISCOVER" title="An entire world to explore." copy="Go beyond the calculator with traditional learning, thoughtful conversations and clearly described services." />
          <div className="nx-ed-journey-grid">
            {journeys.map((item) => (
              <Link href={item.href} className="nx-ed-journey-card" key={item.href}>
                <Image src={item.image} alt={item.alt} fill sizes="(max-width: 720px) 100vw, 33vw" quality={72}/>
                <span className="nx-ed-journey-shade" aria-hidden="true"/>
                <span className="nx-ed-journey-body">
                  <small>{item.eyebrow}</small>
                  <strong>{item.label}</strong>
                  <span>{item.desc}</span>
                  <b>{item.cta}<ArrowRight size={16} aria-hidden="true"/></b>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>


      <section className="nx-ed-section" aria-label="Featured spiritual products">
        <div className="nx-ed-container">
          <SectionTitle eyebrow="SACRED ESSENTIALS" title="Explore the spiritual catalogue."
            copy="Beautifully illustrated traditional items. Authenticity, exact product specification and a quote are confirmed separately." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { id:"5-mukhi-rudraksha", name:"5 Mukhi Rudraksha" },
              { id:"dhan-yog-bracelet", name:"Dhan Yog Bracelet" },
              { id:"shri-yantra", name:"Shri Yantra" },
              { id:"rudraksha-mala", name:"Rudraksha Mala" }
            ].map(item=>(
              <article key={item.id} className="overflow-hidden rounded-2xl border border-[#d2aa6a]/35 bg-[#1d1328] text-white shadow-xl">
                <Link href={"/commerce-enquiry?kind=SHOP&item="+item.id} className="block overflow-hidden" aria-label={"Enquire about "+item.name}>
                  <Image src={"/shop/"+item.id+"-illustration.svg"} alt={item.name+" original illustrative artwork"}
                    width={540} height={390} unoptimized className="aspect-[4/3] w-full object-cover transition duration-300 hover:scale-105"/>
                </Link>
                <div className="p-5">
                  <h3 className="font-cinzel text-lg font-bold">{item.name}</h3>
                  <p className="mt-2 text-xs text-[#d8c7d9]">Illustrative art • Item details on request</p>
                  <Link href={"/commerce-enquiry?kind=SHOP&item="+item.id}
                    className="mt-4 inline-flex items-center gap-2 font-bold text-[#f5cc82]">
                    Enquire <ArrowRight size={16}/>
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 text-right">
            <Link href="/shop" className="inline-flex items-center gap-2 font-bold text-[#724012]">
              Explore all spiritual products <ArrowRight size={17}/>
            </Link>
          </div>
        </div>
      </section>

      <section className="nx-ed-section" aria-label="Featured Puja topics">
        <div className="nx-ed-container">
          <SectionTitle eyebrow="PUJA TRADITIONS" title="Ceremonies for every occasion."
            copy="Explore traditional Puja topics and upcoming festival dates. Availability and local muhurat require confirmation." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { id:"rudrabhishek", name:"Rudrabhishek", category:"shiva" },
              { id:"maha-lakshmi-puja", name:"Maha Lakshmi Puja", category:"devi" },
              { id:"navagraha-shanti-puja", name:"Navagraha Shanti", category:"graha" },
              { id:"griha-pravesh-puja", name:"Griha Pravesh Puja", category:"family" }
            ].map(item=>(
              <article key={item.id} className="overflow-hidden rounded-2xl border border-[#d2aa6a]/35 bg-[#1c1427] text-white">
                <Link href={"/commerce-enquiry?kind=PUJA&item="+encodeURIComponent("ritual:"+item.id)}
                  aria-label={"Enquire about "+item.name}>
                  <Image src={"/pujas/"+item.category+"-illustration.svg"} alt={item.name+" category decorative artwork"}
                    width={540} height={335} unoptimized className="aspect-[16/10] w-full object-cover transition duration-300 hover:scale-105" />
                </Link>
                <div className="p-5">
                  <h3 className="font-cinzel text-lg font-bold">{item.name}</h3>
                  <p className="mt-2 text-xs text-[#d8c7d9]">Traditional practice • Information only</p>
                  <Link href={"/commerce-enquiry?kind=PUJA&item="+encodeURIComponent("ritual:"+item.id)}
                    className="mt-4 inline-flex items-center gap-2 font-bold text-[#f5cc82]">
                    Enquire <ArrowRight size={16}/>
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-5">
            <Link href="/puja-calendar" className="inline-flex items-center gap-2 font-bold text-[#724012]">
              Upcoming festivals <CalendarDays size={17}/>
            </Link>
            <Link href="/pujas" className="inline-flex items-center gap-2 font-bold text-[#724012]">
              Explore Puja directory <ArrowRight size={17}/>
            </Link>
          </div>
        </div>
      </section>

      <section className="nx-ed-section nx-ed-why">
        <div className="nx-ed-container nx-ed-why-inner">
          <div>
            <span className="nx-ed-eyebrow">GUIDANCE WITH CLARITY</span>
            <h2>Tradition, thoughtfully <em>translated.</em></h2>
            <p>NAKSHARIX brings together traditional calculation frameworks, account-linked access and clear explanations. We distinguish a published tool from a real human-delivered service.</p>
            <div className="nx-ed-why-points">
              <span><Compass size={18}/> Calculation-aware tools</span>
              <span><Users size={18}/> Approved consultation profiles</span>
              <span><ShieldCheck size={18}/> Clear limitations and privacy</span>
            </div>
            <div className="nx-ed-actions">
              <Link href="/about" className="nx-ed-button nx-ed-button-gold">Our approach <ArrowRight size={17}/></Link>
              <Link href="/disclaimer" className="nx-ed-text-link">How to use results responsibly <ChevronRight size={16}/></Link>
            </div>
          </div>
          <div className="nx-ed-why-art">
            <Image src="/naksharix/ganesh-hero-light-saffron.jpg"
              alt="Saffron-toned Ganesh artwork illustrating spiritual traditions"
              fill sizes="(max-width: 920px) 100vw, 44vw" quality={76}/>
          </div>
        </div>
      </section>

      <section className="nx-ed-end-cta">
        <div className="nx-ed-container nx-ed-end-inner">
          <span><MoonStar size={25} aria-hidden="true"/></span>
          <div>
            <h2>Every journey begins with a question.</h2>
            <p>Explore your birth chart, ask a written question or learn the foundations at your own pace.</p>
          </div>
          <Link className="nx-ed-button nx-ed-button-gold" href="/kundli">
            Begin with Kundli <ArrowRight size={18} aria-hidden="true"/>
          </Link>
        </div>
      </section>
      <p className="nx-ed-footnote">Astrology is a cultural and reflective practice; outcomes are not guaranteed. Some consultation, puja and product services are enquiries only and depend on real provider availability.</p>
    </div>
  );
}

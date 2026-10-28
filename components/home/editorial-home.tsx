"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { referencePhotoForProduct } from "@/lib/shop/real-photo-seeds";
import { pujaEditorialPhoto, pujaEditorialImage } from "@/lib/puja/editorial-photos";
import {
  ArrowLeft, ArrowRight, CalendarDays, ChevronRight, CircleHelp,
  Compass, Heart, MoonStar, Pause, Play, ShieldCheck, Sparkles, Sun, Users
} from "lucide-react";

const STARRY_SKY="/naksharix/ganesh-hero-light-saffron.jpg";
const GOLDEN_HORIZON="/naksharix/zodiac-wheel-gold.jpg";
const CONSULTATION_PHOTO="https://upload.wikimedia.org/wikipedia/commons/0/04/Astrologer.jpg";
const KUNDLI_PHOTO="https://upload.wikimedia.org/wikipedia/commons/2/2d/Kundali_02.png";
const REPORT_PHOTO="https://upload.wikimedia.org/wikipedia/commons/5/57/Kundali_01.png";
const heroSlides=[
{eyebrow:"NAKSHARIX / VEDIC DISCOVERY",heading:"Your universe,",accent:"your way forward.",body:"Explore free Kundli, astrology reports and guidance designed for thoughtful discovery.",image:STARRY_SKY,main:{label:"Generate free Kundli",href:"/kundli"},secondary:{label:"Explore astrology tools",href:"/free-calculators"}},
{eyebrow:"SACRED TRADITIONS / PUJA",heading:"Celebrate",accent:"sacred traditions.",body:"Explore 94 Puja traditions and preferred dates; ceremony availability is confirmed separately.",image:pujaEditorialImage("griha-pravesh-puja",STARRY_SKY,"family"),main:{label:"Explore Puja services",href:"/pujas"},secondary:{label:"Festival calendar",href:"/puja-calendar"}},
{eyebrow:"BIRTH CHART / REPORTS",heading:"Discover more",accent:"in your chart.",body:"Explore Kundli, compatibility, numerology and personalized report options.",image:REPORT_PHOTO,main:{label:"Explore reports",href:"/reports"},secondary:{label:"Create free Kundli",href:"/kundli"}},
{eyebrow:"PERSONAL GUIDANCE / CONSULTATION",heading:"Real questions,",accent:"thoughtful guidance.",body:"Browse approved astrologer profiles, session formats and written guidance options.",image:CONSULTATION_PHOTO,main:{label:"View consultations",href:"/consultation"},secondary:{label:"Ask a question",href:"/ask-astrologer"}},
{eyebrow:"SPIRITUAL SHOP / DISCOVER",heading:"Curated finds",accent:"for your practice.",body:"Discover Rudraksha malas, yantras and spiritual accessories with clear product details.",image:referencePhotoForProduct("rudraksha-mala")?.url||STARRY_SKY,main:{label:"Explore the Shop",href:"/shop"},secondary:{label:"My Orders",href:"/shop/orders"}},
{eyebrow:"PANCHANG / DAILY WISDOM",heading:"A little clarity",accent:"for every day.",body:"Understand Panchang, horoscopes and the traditional calendar for your location.",image:GOLDEN_HORIZON,main:{label:"Today's Panchang",href:"/panchang"},secondary:{label:"Daily Horoscope",href:"/daily-horoscope"}}
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
    href:"/kundli",cta:"Create free Kundli",image:KUNDLI_PHOTO,alt:"Traditional Kundli chart reference, CC0"
  },
  {
    number:"02",label:"Expert Consultations",copy:"Read approved astrologer profiles and available session formats.",
    href:"/consultation",cta:"Explore consultations",image:CONSULTATION_PHOTO,alt:"Representative astrology consultation exhibition photograph"
  },
  {
    number:"03",label:"Personal Reports",copy:"Browse available personalized Kundli, match-making and numerology topics.",
    href:"/reports",cta:"View astrology reports",image:REPORT_PHOTO,alt:"Traditional Kundli chart reference, CC0"
  },
  {
    number:"04",label:"Traditional Puja",copy:"Browse 94 Puja topics and request written availability confirmation.",
    href:"/pujas",cta:"Explore Puja directory",image:pujaEditorialImage("rudrabhishek","/naksharix/editorial-puja.svg","shiva"),alt:"Licensed representative photograph of Shiva Puja ritual context"
  },
  {
    number:"05",label:"Kundli Matching",copy:"Compare traditional chart inputs and learn about Guna Milan.",
    href:"/matchmaking",cta:"Check compatibility",image:"https://upload.wikimedia.org/wikipedia/commons/1/1a/Kundali_02a.png",alt:"Traditional North Indian Kundli chart, CC0"
  },
  {
    number:"06",label:"Your Daily Panchang",copy:"Understand the five traditional Panchang elements for a chosen place.",
    href:"/panchang",cta:"Explore Panchang",image:pujaEditorialImage("griha-pravesh-puja",STARRY_SKY,"family"),alt:"Representative ritual photograph"
  },
  {
    number:"07",label:"Spiritual Catalogue",copy:"Discover Rudraksha, malas and yantras with clear item enquiries.",
    href:"/shop",cta:"Explore the collection",image:referencePhotoForProduct("rudraksha-mala")?.url || "/shop/rudraksha-mala-illustration.svg",alt:"Licensed Rudraksha mala material photograph; exact sold item may differ"
  },
  {
    number:"08",label:"Free Learning",copy:"Start with original introductory lessons on charts, planets and Panchang.",
    href:"/learn",cta:"Start learning",image:"https://upload.wikimedia.org/wikipedia/commons/0/05/Kundali_01a.png",alt:"Traditional Kundli diagram, CC0"
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
                sizes="100vw" quality={75} unoptimized className="nx-ed-photo" />
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
            {active===3 ? <p className="mt-2 text-xs text-[#ffe6c3]">Representative consultation exhibition photo: <a className="underline" href="https://commons.wikimedia.org/wiki/File:Astrologer.jpg" target="_blank" rel="noopener noreferrer">Ravikiran · CC BY-SA 4.0</a></p> : null}
            {active===4 ? <p className="mt-2 text-xs text-[#ffe6c3]">Reference item photograph: <a className="underline" href="https://commons.wikimedia.org/wiki/File:Rudraksha_mala.jpg" target="_blank" rel="noopener noreferrer">Janak Bhatta · CC BY-SA 4.0</a></p> : null}
            {active===1 ? <p className="mt-2 text-xs text-[#ffe6c3]">Representative ritual photo: <a className="underline" href="https://commons.wikimedia.org/wiki/File:Griha_Pravesh_Puja_Ceremony.jpg" target="_blank" rel="noopener noreferrer">AditiChintarevula · CC0</a></p> : null}
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
                    quality={75} unoptimized />
                  <span className="nx-ed-card-number">{item.number}</span>
                </Link>
                <div className="nx-ed-card-body">
                  <h3>{item.label}</h3>
                  <p>{item.copy}</p>
                  {item.href === "/consultation" ? <p className="text-xs">Representative exhibition photo · <a href="https://commons.wikimedia.org/wiki/File:Astrologer.jpg" target="_blank" rel="noopener noreferrer" className="underline">Ravikiran · CC BY-SA 4.0</a></p>:null}
                  {item.href === "/pujas" && pujaEditorialPhoto("rudrabhishek","shiva") ? <p className="text-xs">Representative ritual image · <a href={pujaEditorialPhoto("rudrabhishek","shiva")!.source} target="_blank" rel="noopener noreferrer" className="underline">{pujaEditorialPhoto("rudrabhishek","shiva")!.author} · {pujaEditorialPhoto("rudrabhishek","shiva")!.license}</a></p> : null}
                  {item.href === "/shop" && referencePhotoForProduct("rudraksha-mala") ? <p className="text-xs">Reference photo, not exact stock · <a href={referencePhotoForProduct("rudraksha-mala")!.evidenceUrl} target="_blank" rel="noopener noreferrer" className="underline">{referencePhotoForProduct("rudraksha-mala")!.credit} · {referencePhotoForProduct("rudraksha-mala")!.licenseName}</a></p> : null}
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
            <Image src={GOLDEN_HORIZON} alt="Complete golden zodiac wheel" fill sizes="(max-width: 850px) 100vw, 45vw" quality={85} />
            <div className="nx-ed-cosmos-photo-label"><Sun size={18} aria-hidden="true"/> A moment for reflection, every day</div>
          </div>
          <div className="nx-ed-cosmos-copy">
            <span className="nx-ed-eyebrow">TODAY & THE ZODIAC</span>
            <h2 id="nx-ed-horoscope-title">Discover what the sky <em>symbolizes.</em></h2>
            <p>Read your sign’s traditional horoscope or explore the Panchang based on the place and date you choose.</p>
            <div className="nx-ed-zodiac-grid" aria-label="Choose your zodiac sign">
              {zodiac.map(([sign, glyph]) => (
                <Link href={"/horoscope/" + sign.toLowerCase()} key={sign} aria-label={sign + " horoscope"}>
                  <Image src={"/zodiac-signs/"+sign.toLowerCase()+".svg"} alt="" aria-hidden="true" width={50} height={50} unoptimized /><small>{sign}</small>
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
            copy="Browse real reference photographs of devotional items. Exact stock, specifications and final prices are confirmed before dispatch." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { id:"5-mukhi-rudraksha", name:"5 Mukhi Rudraksha" },
              { id:"dhan-yog-bracelet", name:"Dhan Yog Bracelet" },
              { id:"shri-yantra", name:"Shri Yantra" },
              { id:"rudraksha-mala", name:"Rudraksha Mala" }
            ].map(item=>(
              <article key={item.id} className="overflow-hidden rounded-2xl border border-[#d2aa6a]/35 bg-[#1d1328] text-white shadow-xl">
                <Link href={"/commerce-enquiry?kind=SHOP&item="+item.id} className="block overflow-hidden" aria-label={"Enquire about "+item.name}>
                  <Image src={referencePhotoForProduct(item.id)?.url || "/shop/"+item.id+"-illustration.svg"} alt={referencePhotoForProduct(item.id)?.alt || item.name+" illustration"}
                    width={540} height={390} unoptimized className="aspect-[4/3] w-full object-cover transition duration-300 hover:scale-105"/>
                </Link>
                <div className="p-5">
                  <h3 className="font-cinzel text-lg font-bold">{item.name}</h3>
                  <p className="mt-2 text-xs text-[#e2ced8]">Real licensed reference photo • Exact supplied item may differ</p>
                  {referencePhotoForProduct(item.id) ? <a href={referencePhotoForProduct(item.id)!.evidenceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[11px] leading-5 underline text-[#f3dcb9]">
                    {referencePhotoForProduct(item.id)!.credit} · {referencePhotoForProduct(item.id)!.licenseName}
                  </a> : null}
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
                  <Image src={pujaEditorialImage(item.id,"/pujas/"+item.category+"-illustration.svg",item.category)} alt={item.name+" representative ritual photo"}
                    width={540} height={335} unoptimized className="aspect-[16/10] w-full object-cover transition duration-300 hover:scale-105" />
                </Link>
                <div className="p-5">
                  <h3 className="font-cinzel text-lg font-bold">{item.name}</h3>
                  <p className="mt-2 text-xs text-[#d8c7d9]">Traditional practice • Representative image</p>
                  {pujaEditorialPhoto(item.id,item.category) ? <a className="mt-2 inline-block text-[11px] leading-5 text-[#f2dab7] underline" href={pujaEditorialPhoto(item.id,item.category)!.source} target="_blank" rel="noopener noreferrer">
                    {pujaEditorialPhoto(item.id,item.category)!.author} · {pujaEditorialPhoto(item.id,item.category)!.license}
                  </a> : null}
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

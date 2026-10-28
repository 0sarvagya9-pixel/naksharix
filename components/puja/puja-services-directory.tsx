"use client";

import { useEffect,useMemo,useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays,Search,ShieldCheck,ArrowRight } from "lucide-react";
import { pujaTopics,pujaCategories } from "@/lib/puja/service-catalogue";
import { pujaEditorialPhoto, pujaEditorialImage } from "@/lib/puja/editorial-photos";
import { ResilientEditorialImage } from "@/components/puja/resilient-editorial-image";
import type { PublicPujaOffer } from "@/lib/puja/offerings";

export function PujaServicesDirectory({offerings}:{offerings:Record<string,PublicPujaOffer>}) {
  const [query,setQuery]=useState("");
  const [hydrated,setHydrated]=useState(false);
  useEffect(()=>setHydrated(true),[]);
  const [category,setCategory]=useState<(typeof pujaCategories)[number]>("All");
  const [visibleCount,setVisibleCount]=useState(12);
  const results=useMemo(()=>pujaTopics.filter(p=>
    (category==="All"||p.category===category) &&
    [p.name,p.deity,p.category,p.description].join(" ").toLowerCase().includes(query.trim().toLowerCase())
  ),[query,category]);

  return <main className="star-field min-h-screen bg-[#fffaf3] pb-20">
    <section className="relative isolate overflow-hidden border-b border-[#e6be7e]/35 bg-[#301a2c] text-white">
      <Image src="/naksharix/ganesh-hero-light-saffron.jpg" alt="" fill priority sizes="100vw" className="absolute inset-0 -z-20 object-cover object-[76%_42%]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#261323]/95 via-[#33172a]/88 to-[#31182b]/25" aria-hidden="true" />
      <div className="mx-auto flex min-h-[540px] max-w-7xl items-center px-5 py-14 md:min-h-[580px] md:py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#f8d389]">Naksharix • Sacred traditions</p>
          <h1 className="mt-4 font-cinzel text-4xl font-black leading-tight md:text-6xl">Explore Puja <span className="text-[#ffcf80]">Traditions</span></h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#f1e3e2]">
            Browse {pujaTopics.length} traditional Puja topics across deities, ceremonies and festivals.
            Select a Puja and request your preferred ceremony date. Pandit assignment and muhurat are confirmed before payment.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#puja-directory" className="rounded-xl bg-[#f6c776] px-6 py-3 font-bold text-[#351b20]">Explore Puja Topics</a>
            <Link href="/puja-calendar" className="inline-flex items-center gap-2 rounded-xl border border-[#f6c776]/55 px-5 py-3 font-semibold text-white">
              <CalendarDays size={17}/> Festival calendar
            </Link>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-[#f7dcac]"><ShieldCheck size={17}/> ₹1,100 listed fee • Confirmation before payment</p>
        </div>
      </div>
    </section>
    <section id="puja-directory" aria-labelledby="puja-catalogue-heading" className="mx-auto max-w-7xl px-5 pt-12 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#8e3641]">Traditional practices</p>
          <h2 id="puja-catalogue-heading" className="mt-2 font-cinzel text-3xl font-bold text-[#412831]">Puja Directory</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#755b60]">The topics listed below do not imply temple assignments or priest availability.</p>
        </div>
        <span role="status" className="rounded-full border border-[#e2b575]/35 px-4 py-2 text-sm text-[#84303d]">Showing {Math.min(visibleCount,results.length)} of {results.length} topics</span>
      </div>
      <label className="relative mt-7 block max-w-xl">
        <span className="sr-only">Search Puja types or deities</span>
        <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#e8bd7c]"/>
        <input type="search" disabled={!hydrated} value={query} onChange={e=>{setQuery(e.target.value);setVisibleCount(12)}}
          placeholder="Search Puja, deity, tradition..." className="h-12 w-full rounded-xl border border-[#cba66a]/45 bg-white pl-12 pr-4 text-[#412831] placeholder:text-[#826b6d] focus-visible:outline-[#f5d490]"/>
      </label>
      <div role="group" aria-label="Filter Puja categories" className="mt-5 flex flex-wrap gap-2">
        {pujaCategories.map(key=><button key={key} type="button" disabled={!hydrated} aria-pressed={category===key} onClick={()=>{setCategory(key);setVisibleCount(12)}}
          className={"rounded-full border px-4 py-2 text-sm font-semibold transition "+(category===key
            ?"border-[#ffdf9f] bg-[#f5c979] text-[#351b1e]":"border-[#d5b17d]/40 bg-white text-[#5e424b] hover:border-[#f5d59c]")}>{key}</button>)}
      </div>
      {results.length?<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.slice(0,visibleCount).map(topic=><article key={topic.id} className="group flex flex-col overflow-hidden rounded-2xl border border-[#d0a766]/35 bg-white transition hover:-translate-y-1 hover:border-[#f4ca7f]">
          <div className="relative aspect-[16/10] overflow-hidden bg-[#fff1de]">
            <ResilientEditorialImage src={pujaEditorialImage(topic.id,topic.graphic,topic.category)}
              fallbackSrc={topic.graphic}
              alt={pujaEditorialPhoto(topic.id,topic.category) ? "Representative ritual, deity artwork or shrine photo for "+topic.name : topic.category+" category illustration"}
              width={640} height={400}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"/>
            <span className="absolute left-3 top-3 rounded-full bg-[#271325]/90 px-3 py-1 text-xs font-bold text-[#f9da9e]">{topic.category}</span>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h3 className="font-cinzel text-lg font-bold text-[#412831]"><Link href={"/pujas/"+topic.id} className="hover:text-[#f4c87d]">{topic.name}</Link></h3>
            <p className="mt-2 text-xs font-semibold text-[#983844]">{topic.deity}</p>
            {pujaEditorialPhoto(topic.id,topic.category) ? <p className="mt-2 text-xs leading-5 text-[#5d4b50]">Representative image (not delivered ceremony): <a href={pujaEditorialPhoto(topic.id,topic.category)!.source} target="_blank" rel="noopener noreferrer" className="underline">{pujaEditorialPhoto(topic.id,topic.category)!.author}</a>{" · "}<a href={pujaEditorialPhoto(topic.id,topic.category)!.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">{pujaEditorialPhoto(topic.id,topic.category)!.license}</a></p>:null}
            <p className="mt-3 flex-1 text-sm leading-6 text-[#6c5459]">{topic.description}.</p>
            {offerings[topic.id] ? <p className="mt-3 text-lg font-extrabold text-[#842c3e]">
              {new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(offerings[topic.id].pricePaise/100)}
              <span className="ml-2 text-xs font-normal text-[#67515a]">listed service fee · subject to booking confirmation</span>
            </p> : <p className="mt-3 text-sm font-semibold text-[#75535c]">Price not published</p>}
            <Link href={offerings[topic.id] ? "/puja-booking?item="+encodeURIComponent(topic.id) : "/commerce-enquiry?kind=PUJA&item="+encodeURIComponent("ritual:"+topic.id)}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#f2c87d] px-4 py-2 font-bold text-[#331c25] hover:bg-[#ffe0ae]">
              {offerings[topic.id] ? "Book Now" : "Enquire"} <ArrowRight size={16}/>
            </Link>
          </div>
        </article>)}
      </div>:<div className="mt-8 rounded-2xl border border-[#deb373]/35 p-8 text-center text-[#665056]">
        No matching Puja topic. <button type="button" className="ml-2 underline" onClick={()=>{setQuery("");setCategory("All")}}>Clear filters</button>
      </div>}
      {results.length > visibleCount && (
        <div className="mt-9 flex justify-center">
          <button type="button" onClick={()=>setVisibleCount(n=>Math.min(results.length,n+12))}
            className="min-h-12 rounded-xl border border-[#ab6470]/45 bg-white px-7 py-3 text-sm font-bold text-[#842d3c] shadow-sm transition hover:bg-[#fce9dd]">
            Load more Puja topics ({results.length-visibleCount} remaining)
          </button>
        </div>
      )}
      <div className="mt-12 grid gap-5 rounded-2xl border border-[#d0a36c]/30 bg-[#fff4e6] p-7 md:grid-cols-3">
        {[
          ["01","Explore","Choose a traditional Puja, festival date, or ceremony topic."],
          ["02","Book Now","Enter Sankalp details and your preferred date securely."],
          ["03","Confirm","A verified Pandit and ceremony time must be assigned before payment."]
        ].map(([step,title,copy])=><div key={step} className="flex gap-4">
          <b className="font-cinzel text-2xl text-[#8e3641]">{step}</b>
          <div><h3 className="font-bold text-[#412831]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#665056]">{copy}</p></div>
        </div>)}
      </div>
    </section>
  </main>;
}

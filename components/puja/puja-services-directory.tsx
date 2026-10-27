"use client";

import { useMemo,useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays,Search,ShieldCheck,ArrowRight } from "lucide-react";
import { pujaTopics,pujaCategories } from "@/lib/puja/service-catalogue";

export function PujaServicesDirectory() {
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState<(typeof pujaCategories)[number]>("All");
  const results=useMemo(()=>pujaTopics.filter(p=>
    (category==="All"||p.category===category) &&
    [p.name,p.deity,p.category,p.description].join(" ").toLowerCase().includes(query.trim().toLowerCase())
  ),[query,category]);

  return <main className="star-field min-h-screen pb-20">
    <section className="relative overflow-hidden border-b border-[#e6be7e]/35 bg-[linear-gradient(120deg,#1e132a,#51252b_60%,#2e172d)] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 md:grid-cols-[1.15fr_.85fr] md:items-center md:py-20 lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#f8d389]">Naksharix • Sacred traditions</p>
          <h1 className="mt-4 font-cinzel text-4xl font-black leading-tight md:text-6xl">Explore Puja <span className="text-[#ffcf80]">Traditions</span></h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#f1e3e2]">
            Browse {pujaTopics.length} traditional Puja topics across deities, ceremonies and festivals.
            Send a private enquiry to discuss local practice and arrangements.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#puja-directory" className="rounded-xl bg-[#f6c776] px-6 py-3 font-bold text-[#351b20]">Explore Puja Topics</a>
            <Link href="/puja-calendar" className="inline-flex items-center gap-2 rounded-xl border border-[#f6c776]/55 px-5 py-3 font-semibold text-white">
              <CalendarDays size={17}/> Festival calendar
            </Link>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-[#f7dcac]"><ShieldCheck size={17}/> Information only • No unverified paid bookings</p>
        </div>
        <div className="overflow-hidden rounded-[28px] border border-[#f6c776]/35 shadow-2xl">
          <Image src="/naksharix/ganesh-hero-light-saffron.jpg" alt="Illustrative Ganesh-themed devotional artwork" width={850} height={650}
            priority className="aspect-[4/3] w-full object-cover"/>
        </div>
      </div>
    </section>
    <section id="puja-directory" aria-labelledby="puja-catalogue-heading" className="mx-auto max-w-7xl px-5 pt-12 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#f3c875]">Traditional practices</p>
          <h2 id="puja-catalogue-heading" className="mt-2 font-cinzel text-3xl font-bold text-white">Puja Directory</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d6ccd9]">The topics listed below do not imply temple assignments or priest availability.</p>
        </div>
        <span role="status" className="rounded-full border border-[#e2b575]/35 px-4 py-2 text-sm text-[#f3cd8c]">{results.length} topics</span>
      </div>
      <label className="relative mt-7 block max-w-xl">
        <span className="sr-only">Search Puja types or deities</span>
        <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#e8bd7c]"/>
        <input type="search" value={query} onChange={e=>setQuery(e.target.value)}
          placeholder="Search Puja, deity, tradition..." className="h-12 w-full rounded-xl border border-[#cba66a]/45 bg-[#170f28] pl-12 pr-4 text-white placeholder:text-[#bfb5c9] focus-visible:outline-[#f5d490]"/>
      </label>
      <div role="group" aria-label="Filter Puja categories" className="mt-5 flex flex-wrap gap-2">
        {pujaCategories.map(key=><button key={key} type="button" aria-pressed={category===key} onClick={()=>setCategory(key)}
          className={"rounded-full border px-4 py-2 text-sm font-semibold transition "+(category===key
            ?"border-[#ffdf9f] bg-[#f5c979] text-[#351b1e]":"border-[#d5b17d]/40 bg-[#21172c] text-[#f3d8b4] hover:border-[#f5d59c]")}>{key}</button>)}
      </div>
      {results.length?<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.map(topic=><article key={topic.id} className="group flex flex-col overflow-hidden rounded-2xl border border-[#d0a766]/35 bg-[#171025]/90 transition hover:-translate-y-1 hover:border-[#f4ca7f]">
          <div className="relative aspect-[16/10] overflow-hidden bg-[#352031]">
            <Image src={topic.graphic} alt={topic.category+" category decorative illustration"} width={640} height={400} unoptimized
              className="h-full w-full object-cover transition-transform group-hover:scale-105"/>
            <span className="absolute left-3 top-3 rounded-full bg-[#271325]/90 px-3 py-1 text-xs font-bold text-[#f9da9e]">{topic.category}</span>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h3 className="font-cinzel text-lg font-bold text-white">{topic.name}</h3>
            <p className="mt-2 text-xs font-semibold text-[#f4c67c]">{topic.deity}</p>
            <p className="mt-3 flex-1 text-sm leading-6 text-[#dbd2de]">{topic.description}.</p>
            <Link href={"/commerce-enquiry?kind=PUJA&item="+encodeURIComponent("ritual:"+topic.id)}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#f2c87d] px-4 py-2 font-bold text-[#331c25] hover:bg-[#ffe0ae]">
              Enquire <ArrowRight size={16}/>
            </Link>
          </div>
        </article>)}
      </div>:<div className="mt-8 rounded-2xl border border-[#deb373]/35 p-8 text-center text-[#f1e6e1]">
        No matching Puja topic. <button type="button" className="ml-2 underline" onClick={()=>{setQuery("");setCategory("All")}}>Clear filters</button>
      </div>}
      <div className="mt-12 grid gap-5 rounded-2xl border border-[#d0a36c]/30 bg-[#241829]/85 p-7 md:grid-cols-3">
        {[
          ["01","Explore","Choose a traditional Puja, festival date, or ceremony topic."],
          ["02","Enquire","Describe your city and needs through a private support ticket."],
          ["03","Confirm","A staff member reviews custom, time, operator and pricing separately."]
        ].map(([step,title,copy])=><div key={step} className="flex gap-4">
          <b className="font-cinzel text-2xl text-[#f1c17b]">{step}</b>
          <div><h3 className="font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-[#e3d4dc]">{copy}</p></div>
        </div>)}
      </div>
    </section>
  </main>;
}

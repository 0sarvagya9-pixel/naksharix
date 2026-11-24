import type {Metadata} from "next";
import Link from "next/link";
import {Section} from "@/components/section";
import {seo} from "@/lib/seo";
import {calendarYearInIndia} from "@/lib/horoscope/annual-rules";
import {getAnnualSnapshots} from "@/lib/horoscope/annual";
import {AnnualGuideView} from "@/components/horoscope/annual-guide-view";
export const dynamic="force-dynamic";
export const metadata:Metadata=seo({title:"Yearly Horoscope & Rashi Guides",description:"Explore annual sign-based traditional reference guides, monthly planetary positions and optional personalized rolling twelve-month reports.",path:"/yearly-horoscope"});
export default function YearlyHoroscopePage(){
 const year=calendarYearInIndia();
 if(year!==2027)return <><AnnualGuideView year={year} snapshots={getAnnualSnapshots(year)} locale="en"/><Section><Link className="font-semibold underline" href="/yearly-horoscope-2027">Explore the dedicated 2027 yearly rashi guide</Link></Section></>;
 return <main className="bg-[#fff8ee] text-[#35242b]"><Section first><h1 className="font-cinzel text-4xl font-black text-[#70283d]">Yearly Horoscope & Rashi Guides</h1><p className="mt-5 max-w-3xl leading-8">Choose the calendar-year reference or a personalized rolling twelve-month report. General traditional reflections do not guarantee future outcomes.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/yearly-horoscope-2027" className="rounded-xl bg-[#70283d] px-5 py-3 font-semibold text-white">2027 monthly rashi guide</Link><Link href="/hi/yearly-horoscope-2027" className="rounded-xl border border-[#70283d] px-5 py-3">2027 हिंदी</Link><Link href="/reports/yearly-horoscope-report" className="rounded-xl border border-[#70283d] px-5 py-3">Personalized annual report</Link></div></Section></main>;
}

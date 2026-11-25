"use client";
import {useState} from "react";
import Link from "next/link";
import {manualReports} from "@/lib/manual-catalogue";
import {getManualReportCheckout} from "@/lib/reports/checkout-catalogue";
import {automaticReportPublicPreview} from "@/lib/reports/public-preview";
import {useLanguage} from "@/components/language-provider";
import {Button} from "@/components/ui/button";
const reports=manualReports.filter(r=>Boolean(getManualReportCheckout(r.slug)));
export function ReportComparison(){
 const {locale}=useLanguage();
 const copy=locale==="hi"?{title:"रिपोर्ट की तुलना करें",intro:"अधिकतम तीन रिपोर्ट चुनें। कीमतें मौजूदा कैटलॉग से हैं।",select:"रिपोर्ट चुनें",details:"विवरण देखें",empty:"तुलना करने के लिए रिपोर्ट चुनें।"}:locale==="hinglish"?{title:"Personalized reports compare karein",intro:"Teen reports tak select karein. Prices current catalogue se hain.",select:"Compare karne ke liye reports select karein",details:"Details dekhein",empty:"Comparison ke liye ek report select karein."}:{title:"Compare personalized reports",intro:"Select up to three reports. Prices come from the current catalogue.",select:"Select reports to compare",details:"View details",empty:"Select a report to start comparing."};
 const [selected,setSelected]=useState<string[]>(["premium-kundli","couple-kundli","numerology-lo-shu-report"]);
 const list=reports.filter(r=>selected.includes(r.slug));
 function toggle(slug:string){setSelected(prev=>prev.includes(slug)?prev.filter(x=>x!==slug):prev.length<3?[...prev,slug]:prev);}
 return <section className="mt-8 rounded-2xl border border-[#e7d8be] bg-white p-5 sm:p-8" aria-labelledby="compare-reports-heading">
 <h2 id="compare-reports-heading" className="font-cinzel text-2xl font-bold text-[#372630]">{copy.title}</h2>
 <p className="mt-2 text-sm text-[#566575]">{copy.intro}</p>
 <fieldset className="mt-4 flex flex-wrap gap-2"><legend className="sr-only">{copy.select}</legend>{reports.map(r=><label key={r.slug} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#e7d8be] px-3 py-2 text-sm"><input type="checkbox" checked={selected.includes(r.slug)} disabled={!selected.includes(r.slug)&&selected.length>=3} onChange={()=>toggle(r.slug)}/>{r.name[locale]}</label>)}</fieldset>
 <p className="mt-3 text-sm" role="status">{selected.length}/3</p>
 <div className="mt-4 grid gap-4 md:grid-cols-3">{list.map(r=>{const checkout=getManualReportCheckout(r.slug)!;const preview=automaticReportPublicPreview(r.slug,locale);return <article key={r.slug} className="flex flex-col gap-3 rounded-xl border border-[#e7d8be] p-4"><h3 className="text-lg font-bold">{r.name[locale]}</h3><p className="font-semibold text-[#8b3244]">{checkout.price}</p><p className="text-sm">{preview?.summary??r.description[locale]}</p><ul className="list-disc space-y-1 pl-5 text-sm">{(preview?.features??r.includes[locale]).map(x=><li key={x}>{x}</li>)}</ul><Button asChild variant="outline" className="mt-auto"><Link href={`/reports/${r.slug}`}>{copy.details}</Link></Button></article>})}</div>
 {!selected.length?<p className="mt-3 text-sm">{copy.empty}</p>:null}
 </section>;
}

"use client";
import {useState} from "react";
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
 return <section className="mt-4 min-w-0 rounded-2xl border border-[#e7d8be] bg-white p-3 sm:mt-8 sm:p-8" aria-labelledby="compare-reports-heading">
 <h2 id="compare-reports-heading" className="font-cinzel text-2xl font-bold text-[#372630]">{copy.title}</h2>
 <p id="compare-reports-instructions" className="mt-2 text-sm text-[#566575]">{copy.intro}</p>
 <fieldset aria-describedby="compare-reports-instructions compare-reports-count" className="mt-4 flex min-w-0 flex-wrap gap-2"><legend className="sr-only">{copy.select}</legend>{reports.map(r=><label key={r.slug} className="flex min-h-11 min-w-0 max-w-full cursor-pointer items-center gap-2 rounded-lg border border-[#e7d8be] px-3 py-2 text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[#70283d]"><input className="h-4 w-4 shrink-0" type="checkbox" checked={selected.includes(r.slug)} disabled={!selected.includes(r.slug)&&selected.length>=3} onChange={()=>toggle(r.slug)}/><span className="min-w-0 break-words">{r.name[locale]}</span></label>)}</fieldset>
 <p id="compare-reports-count" className="mt-3 text-sm" role="status" aria-atomic="true">{selected.length}/3</p>
 <div className="mt-4 grid gap-4 md:grid-cols-3">{list.map(r=>{const checkout=getManualReportCheckout(r.slug)!;const preview=automaticReportPublicPreview(r.slug,locale);return <article key={r.slug} className="flex min-w-0 flex-col gap-3 rounded-xl border border-[#e7d8be] p-4"><h3 id={`comparison-title-${r.slug}`} className="break-words text-lg font-bold">{r.name[locale]}</h3><p className="font-semibold text-[#8b3244]">{checkout.price}</p><p className="text-sm">{preview?.summary??r.description[locale]}</p><ul className="list-disc space-y-1 pl-5 text-sm">{(preview?.features??r.includes[locale]).map(x=><li key={x}>{x}</li>)}</ul><Button asChild variant="outline" className="mt-auto"><a href={`/reports/${r.slug}`} aria-describedby={`comparison-title-${r.slug}`}>{copy.details}</a></Button></article>})}</div>
 {!selected.length?<p className="mt-3 text-sm">{copy.empty}</p>:null}
 </section>;
}

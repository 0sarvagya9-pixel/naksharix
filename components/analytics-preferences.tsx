"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { analyticsConsentKey, publicAnalyticsRoute } from "@/lib/analytics/public-routes";
import { trackNaksharixEvent } from "@/lib/analytics/events";
export function AnalyticsPreferences() {
  const path=usePathname();const [choice,setChoice]=useState('unknown');const [expanded,setExpanded]=useState(false);
  useEffect(()=>{try{setChoice(localStorage.getItem(analyticsConsentKey)||'unknown');}catch{setChoice('denied');}},[]);
  useEffect(()=>{if(choice==='granted'&&publicAnalyticsRoute(path))trackNaksharixEvent('page_view');},[path,choice]);
  useEffect(()=>{
    if(choice!=='granted')return;
    const click=(event:MouseEvent)=>{const link=(event.target as Element|null)?.closest?.('a[href]');
      if(!link)return;try{const url=new URL(link.getAttribute('href')||'',location.origin);
        if(url.origin===location.origin&&publicAnalyticsRoute(url.pathname))trackNaksharixEvent('cta_link');}catch{}};
    document.addEventListener('click',click);return()=>document.removeEventListener('click',click);
  },[choice]);
  function choose(value:'granted'|'denied'){try{localStorage.setItem(analyticsConsentKey,value);}catch{}setChoice(value);setExpanded(false);}
  if(!publicAnalyticsRoute(path))return null;
  return <section className="mx-auto max-w-7xl px-5 pb-5 text-sm text-[#573540]" aria-label="Privacy preferences">
    <button type="button" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded} className="min-h-11 underline underline-offset-4">Analytics privacy preferences</button>
    {expanded?<div className="max-w-2xl rounded-xl border border-[#dcc1a8] bg-[#fffaf3] p-4">
      <p>Optional analytics stores daily counts of public pages and interactions. It does not store your name, account, birth details, private questions, page query strings or visitor identifiers. It is off unless you allow it; Do Not Track and Global Privacy Control are respected.</p>
      <p className="mt-2">Current choice: {choice==='granted'?'allowed':choice==='denied'?'declined':'not enabled'}. Counts are retained for 90 days.</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" className="min-h-11 rounded-lg border border-[#87525c] bg-white px-4 text-[#572735]" onClick={()=>choose('denied')}>Decline analytics</button>
        <button type="button" className="min-h-11 rounded-lg bg-[#76263b] px-4 text-white" onClick={()=>choose('granted')}>Allow aggregate analytics</button>
      </div>
    </div>:null}
  </section>;
}

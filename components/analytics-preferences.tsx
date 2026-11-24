"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { analyticsConsentKey, publicAnalyticsRoute } from "@/lib/analytics/public-routes";
import { googleConsentKey, googleSessionKey } from "@/lib/analytics/google-contract";
import { trackGooglePublicEvent } from "@/lib/analytics/google-client";
import { trackNaksharixEvent, trackFirstPartyEvent } from "@/lib/analytics/events";
type Choice = "unknown" | "granted" | "denied";
export function AnalyticsPreferences({googleEnabled=false}:{googleEnabled?:boolean}) {
  const path=usePathname();
  const [choice,setChoice]=useState<Choice>("unknown");
  const [google,setGoogle]=useState<Choice>("unknown");
  const [expanded,setExpanded]=useState(false);
  const lastFirst=useRef("");
  const lastGoogle=useRef("");
  useEffect(()=>{try{
    const first=localStorage.getItem(analyticsConsentKey);
    const other=localStorage.getItem(googleConsentKey);
    setChoice(first==="granted"||first==="denied"?first:"unknown");
    setGoogle(other==="granted"||other==="denied"?other:"unknown");
  }catch{setChoice("denied");setGoogle("denied");}},[]);
  useEffect(()=>{if(choice!=="granted"||!publicAnalyticsRoute(path)){lastFirst.current="";return;}
    if(lastFirst.current!==path){lastFirst.current=path;trackFirstPartyEvent("page_view");}},[path,choice]);
  useEffect(()=>{if(!googleEnabled||google!=="granted"||!publicAnalyticsRoute(path)){lastGoogle.current="";return;}
    if(lastGoogle.current!==path){lastGoogle.current=path;trackGooglePublicEvent("page_view");}},[path,google,googleEnabled]);
  useEffect(()=>{
    if(choice!=="granted"&&(!googleEnabled||google!=="granted"))return;
    const click=(event:MouseEvent)=>{const link=(event.target as Element|null)?.closest?.("a[href]");
      if(!link)return;try{const url=new URL(link.getAttribute("href")||"",location.origin);
        if(url.origin===location.origin&&publicAnalyticsRoute(url.pathname)){
          const reportLink=/^\/reports(?:\/[a-z0-9-]+)?$/.test(url.pathname)&&!url.search&&!url.hash;
          trackNaksharixEvent(reportLink?"report_cta_clicked":"cta_link");
        }}catch{}};
    document.addEventListener("click",click);return()=>document.removeEventListener("click",click);
  },[choice,google,googleEnabled]);
  function choose(value:"granted"|"denied"){try{localStorage.setItem(analyticsConsentKey,value);}catch{return;}setChoice(value);}
  function chooseGoogle(value:"granted"|"denied"){try{localStorage.setItem(googleConsentKey,value);
    if(value==="denied")sessionStorage.removeItem(googleSessionKey);
  }catch{return;}setGoogle(value);}
  return <section className="mx-auto max-w-7xl px-5 pb-5 text-sm text-[#573540]" aria-label="Privacy preferences">
    <button type="button" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded} className="min-h-11 underline underline-offset-4">Analytics privacy preferences</button>
    {expanded?<div className="max-w-2xl rounded-xl border border-[#dcc1a8] bg-[#fffaf3] p-4">
      <p>Optional first-party analytics stores daily counts of public pages and interactions. It does not store your name, account, birth details, private questions, page query strings or visitor identifiers. It is off unless you allow it; Do Not Track and Global Privacy Control are respected.</p>
      <p className="mt-2">Current choice: {choice==="granted"?"allowed":choice==="denied"?"declined":"not enabled"}. Counts are retained for 90 days.</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" className="min-h-11 rounded-lg border border-[#87525c] bg-white px-4 text-[#572735]" onClick={()=>choose("denied")}>Decline aggregate analytics</button>
        <button type="button" className="min-h-11 rounded-lg bg-[#76263b] px-4 text-white" onClick={()=>choose("granted")}>Allow aggregate analytics</button>
      </div>
      {googleEnabled?<div className="mt-4 border-t border-[#dcc1a8] pt-4">
        <p>Separately, optional Google Analytics receives a random session identifier, public page categories, general acquisition channel and verified report purchase totals. No name, contact details, birth details, private URLs, payment instrument details or report contents are sent. Advertising personalization is disabled. You can withdraw permission here.</p>
        <p className="mt-2">Google Analytics: {google==="granted"?"allowed":google==="denied"?"declined":"not enabled"}.</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" className="min-h-11 rounded-lg border border-[#87525c] bg-white px-4 text-[#572735]" onClick={()=>chooseGoogle("denied")}>Decline Google Analytics</button>
          <button type="button" className="min-h-11 rounded-lg bg-[#76263b] px-4 text-white" onClick={()=>chooseGoogle("granted")}>Allow Google Analytics</button>
        </div>
      </div>:null}
    </div>:null}
  </section>;
}

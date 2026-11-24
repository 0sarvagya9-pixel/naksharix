"use client";
import {useState} from "react";
import {createReferenceCalendar,type CalendarReference} from "@/lib/calendar/ical";
import {Button} from "@/components/ui/button";
export function ReferenceCalendarExport({events,locale,kind}:{events:CalendarReference[];locale:"en"|"hi";kind:"kumbh"|"festivals"|"eclipses"}){
 const [alarm,setAlarm]=useState<0|1|7>(0);
 const [error,setError]=useState(false);
 const hi=locale==="hi";
 function download(){
   setError(false);
   try{const content=createReferenceCalendar(events,alarm);const url=URL.createObjectURL(new Blob([content],{type:"text/calendar;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="naksharix-"+kind+".ics";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{setError(true);}
 }
 return <section className="rounded-2xl border border-[#e4cbaa] bg-white p-5" aria-labelledby={"calendar-export-"+kind}><h2 id={"calendar-export-"+kind} className="text-lg font-bold text-[#70283d]">{hi?"अपने कैलेंडर में जोड़ें":"Add dates to your calendar"}</h2><p className="mt-2 text-sm leading-6">{hi?"इन संदर्भ तिथियों की कैलेंडर फ़ाइल डाउनलोड करें और अपने कैलेंडर ऐप में स्वयं आयात करें। रिमाइंडर आपके कैलेंडर ऐप की सेटिंग पर निर्भर हैं। कोई ऑनलाइन बुकिंग या ईमेल सदस्यता नहीं।":"Download these reference dates and import them into your calendar app. Optional reminders depend on that app's settings; this does not reserve a ceremony, subscribe you to email, or enable push notifications."}</p><div className="mt-4 flex flex-wrap items-end gap-3"><div><label className="block text-sm font-medium" htmlFor={"calendar-alarm-"+kind}>{hi?"वैकल्पिक रिमाइंडर":"Optional reminder"}</label><select id={"calendar-alarm-"+kind} className="mt-1 min-h-11 rounded-lg border border-[#b29c83] bg-white px-3" value={alarm} onChange={e=>setAlarm(Number(e.target.value) as 0|1|7)}><option value={0}>{hi?"कोई रिमाइंडर नहीं":"No reminder"}</option><option value={1}>{hi?"एक दिन पहले":"1 day before"}</option><option value={7}>{hi?"सात दिन पहले":"7 days before"}</option></select></div><Button disabled={!events.length} onClick={download}>{hi?"कैलेंडर डाउनलोड":"Download calendar (.ics)"} · {events.length}</Button></div>{error?<p role="alert" className="mt-3 text-sm text-red-700">{hi?"फ़ाइल नहीं बनी। फिर प्रयास करें।":"Could not create the calendar file. Try again."}</p>:null}</section>
}

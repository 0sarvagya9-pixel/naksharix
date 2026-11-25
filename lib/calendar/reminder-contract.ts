import {pujaObservances} from "@/lib/puja/observances";
import {kumbhGuideDates,indiaEclipseDates,seasonalSources} from "@/lib/seo-seasonal";
export const REMINDER_PRODUCT_KEY="reference-reminders-2027";
// Match the bounded existing daily worker until a larger capacity is qualified.
export const REMINDER_DAILY_CAPACITY=5;
export const REMINDER_CONSENT_VERSION="reference-email-reminder-v1";
export const REMINDER_END=new Date("2028-01-01T00:00:00Z");
export type ReferenceEvent={id:string;date:string;name:string;sourceUrl:string};
export function referenceReminderEvents():ReferenceEvent[]{
 const rows:ReferenceEvent[]=[
 ...pujaObservances.filter(e=>e.date.startsWith("2027-")).map(e=>({id:e.id,date:e.date,name:e.name,sourceUrl:e.sourceUrl})),
 ...kumbhGuideDates.filter(e=>e.date.startsWith("2027-")).map(e=>({id:"kumbh-"+e.date,date:e.date,name:e.en,sourceUrl:seasonalSources.kumbhCalendar})),
 ...indiaEclipseDates.map(e=>({id:"eclipse-"+e.date,date:e.date,name:e.en,sourceUrl:e.source}))
 ];
 if(new Set(rows.map(r=>r.id)).size!==rows.length||rows.length>100)throw Error("REFERENCE_CALENDAR_INVALID");
 return rows.sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
}
export function reminderDueAt(event:ReferenceEvent,leadDays:1|7){
 if(![1,7].includes(leadDays)||!event.date.startsWith("2027-"))throw Error("REMINDER_DATE_INVALID");
 const due=new Date(event.date+"T02:00:00Z");
 if(!Number.isFinite(due.getTime())||due.toISOString().slice(0,10)!==event.date)throw Error("REMINDER_DATE_INVALID");
 due.setUTCDate(due.getUTCDate()-leadDays);
 return due;
}
export function reminderWindowOpen(due:Date,now:Date){return Number.isFinite(due.getTime())&&Number.isFinite(now.getTime())&&now>=due&&now.getTime()<due.getTime()+86400000;}

export type CalendarReference={id:string;date:string;name:string;sourceUrl:string};
const escapeText=(s:string)=>s.replaceAll("\\","\\\\").replace(/\r\n|\r|\n/g,"\\n").replaceAll(";","\\;").replaceAll(",","\\,");
function fold(line:string){
 const encoder=new TextEncoder();const rows:string[]=[];let current="",size=0;
 for(const ch of line){const n=encoder.encode(ch).length;if(size+n>75){rows.push(current);current=" ";size=1;}current+=ch;size+=n;}rows.push(current);return rows.join("\r\n");
}
function validDate(date:string){return /^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(Date.parse(date+"T00:00:00Z"))&&new Date(date+"T00:00:00Z").toISOString().slice(0,10)===date;}
export function createReferenceCalendar(events:readonly CalendarReference[],alarmDays:0|1|7,createdAt:Date=new Date()){
 if(events.length>250||![0,1,7].includes(alarmDays)||!Number.isFinite(createdAt.getTime()))throw new Error("CALENDAR_INPUT_INVALID");
 const stamp=createdAt.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
 const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Naksharix//Reviewed Calendar References//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH"];
 const ids=new Set<string>();
 for(const e of events){
   if(!/^[a-z0-9-]{1,160}$/.test(e.id)||ids.has(e.id)||!validDate(e.date)||!e.name.trim()||e.name.length>200)throw new Error("CALENDAR_EVENT_INVALID");
   const url=new URL(e.sourceUrl);if(url.protocol!=="https:"||url.username||url.password||/[\r\n]/.test(e.sourceUrl))throw new Error("CALENDAR_SOURCE_INVALID");
   ids.add(e.id);const end=new Date(e.date+"T00:00:00Z");end.setUTCDate(end.getUTCDate()+1);
   lines.push("BEGIN:VEVENT","UID:"+e.id+"@naksharix.com","DTSTAMP:"+stamp,"DTSTART;VALUE=DATE:"+e.date.replaceAll("-",""),"DTEND;VALUE=DATE:"+end.toISOString().slice(0,10).replaceAll("-",""),"SUMMARY:"+escapeText(e.name),"DESCRIPTION:"+escapeText("India-reference educational date. Confirm local timing and official notices. Not a confirmed booking. Source: "+url.href),"TRANSP:TRANSPARENT");
   if(alarmDays)lines.push("BEGIN:VALARM","ACTION:DISPLAY","TRIGGER:-P"+alarmDays+"D","DESCRIPTION:"+escapeText("Review reference date and confirm local timing"),"END:VALARM");
   lines.push("END:VEVENT");
 }
 return [...lines,"END:VCALENDAR"].map(fold).join("\r\n")+"\r\n";
}

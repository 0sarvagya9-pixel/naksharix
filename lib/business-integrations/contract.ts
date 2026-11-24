/** Server-to-server only; no browser-embedded secret, no anonymous quota. */
export const businessScopes=["chart","panchang","matching","panchang-widget"] as const;
export type BusinessScope=typeof businessScopes[number];
export function isBusinessScope(value:unknown):value is BusinessScope{return typeof value==="string"&&(businessScopes as readonly string[]).includes(value);}
export function scopeUnits(scope:BusinessScope){return scope==="matching"?2:1;}
export function scopeSubset(requested:readonly string[],allowed:readonly string[]){
 return requested.length>0&&new Set(requested).size===requested.length&&requested.every(s=>isBusinessScope(s)&&allowed.includes(s));
}
export function parseBusinessAuthorization(value:string|null){
 const m=value?.match(/^Bearer (nxk_([0-9a-f]{32})_[A-Za-z0-9_-]{43})$/);
 return m?{raw:m[1],id:m[2]}:null;
}
export function usagePeriod(now=new Date()){return now.toISOString().slice(0,7);}
export function validUsageLimit(value:number){return Number.isSafeInteger(value)&&value>=1&&value<=1000000;}
export function usageFits(attempted:number,limit:number,units:number){
 return Number.isSafeInteger(attempted)&&attempted>=0&&validUsageLimit(limit)&&(units===1||units===2)&&attempted+units<=limit;
}
export function escapeWidgetText(value:string){return value.replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]??s));}
export function renderPanchangWidget(input:{brand:string;date:string;tithi:string;nakshatra:string;sunrise:string|null;sunset:string|null}){
 const e=escapeWidgetText;
 return '<section class="naksharix-panchang-widget" aria-label="Panchang reference"><h2>'+e(input.brand)+' — Panchang</h2><p>Date: '+e(input.date)+'</p><dl><dt>Tithi (reference instant)</dt><dd>'+e(input.tithi)+'</dd><dt>Nakshatra</dt><dd>'+e(input.nakshatra)+'</dd><dt>Sunrise</dt><dd>'+e(input.sunrise??"Unavailable")+'</dd><dt>Sunset</dt><dd>'+e(input.sunset??"Unavailable")+'</dd></dl><p>Internal traditional calculation; verify local observance timing. <a href="https://www.naksharix.com/panchang" rel="noopener">Powered by Naksharix</a></p></section>';
}

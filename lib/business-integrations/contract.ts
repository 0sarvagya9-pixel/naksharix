/** Server-to-server only; no browser-embedded secret, no anonymous quota. */
export const businessScopes=["chart","panchang","matching","panchang-widget","chart-pdf"] as const;
export type BusinessScope=typeof businessScopes[number];
export function isBusinessScope(value:unknown):value is BusinessScope{return typeof value==="string"&&(businessScopes as readonly string[]).includes(value);}
export function scopeUnits(scope:BusinessScope){return scope==="matching"||scope==="chart-pdf"?2:1;}
/** PDF scope currently supports a reviewed English/printable ASCII display brand. */
export function validPdfBrand(value:unknown):value is string{return typeof value==="string"&&value===value.trim()&&value.length>=2&&value.length<=80&&/^[\x20-\x7e]+$/.test(value);}
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

/** Validate the general provider contract before passing to the stricter matching validator. */
const expectedKootMax:Readonly<Record<string,number>>=Object.freeze({varna:1,vashya:2,tara:3,yoni:4,grahaMaitri:5,gana:6,bhakoot:7,nadi:8});
export function qualifyBusinessMatchingFactors(factors:readonly {koot?:string;name:string;kootKey?:string;available?:boolean;score:number;maxScore:number}[],totalScore:number){
 if(factors.length!==8||!Number.isFinite(totalScore)||totalScore<0||totalScore>36)return null;
 const seen=new Set<string>();
 const verified:{koot:string;score:number;maxScore:number}[]=[];
 for(const factor of factors){
  const key=factor.kootKey;
  if(!key||!Object.prototype.hasOwnProperty.call(expectedKootMax,key)||seen.has(key)||factor.available!==true||typeof factor.koot!=="string"||!factor.koot.trim()||factor.maxScore!==expectedKootMax[key]||!Number.isFinite(factor.score)||factor.score<0||factor.score>factor.maxScore)return null;
  seen.add(key);
  verified.push({koot:factor.koot,score:factor.score,maxScore:factor.maxScore});
 }
 if(Math.abs(verified.reduce((sum,f)=>sum+f.score,0)-totalScore)>1e-8)return null;
 return verified;
}

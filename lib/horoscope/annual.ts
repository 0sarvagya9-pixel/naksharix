import "server-only";
import { calculateInternalTransitSnapshot } from "@/lib/astrology/transit/engine";
import { annualSampleDates, annualInterpretation, type AnnualLocale, type AnnualSnapshot } from "@/lib/horoscope/annual-rules";

/** Monthly noon positions at an explicitly fixed reference location. No ingress or station timestamps. */
const annualCache=new Map<number,AnnualSnapshot[]>();
export function getAnnualSnapshots(year:number):AnnualSnapshot[] {
  const cached=annualCache.get(year);if(cached)return cached.map(row=>({...row}));
  const samples=annualSampleDates(year).map(date=>{
    const snapshot=calculateInternalTransitSnapshot({date,timezone:"+05:30",latitude:28.6139,longitude:77.209,place:"New Delhi, India",ayanamsa:"lahiri"});
    const jupiter=snapshot.positions.find(p=>p.planet==="Jupiter")?.sign;
    const saturn=snapshot.positions.find(p=>p.planet==="Saturn")?.sign;
    if(!jupiter||!saturn)throw new Error("ANNUAL_SNAPSHOT_UNAVAILABLE");
    return {date,jupiter,saturn};
  });
  if(annualCache.size>=4)annualCache.delete(annualCache.keys().next().value!);
  annualCache.set(year,samples);
  return samples.map(row=>({...row}));
}
export function getAnnualGuide(year:number,sign:string,locale:AnnualLocale="en"){
  return annualInterpretation(year,sign,getAnnualSnapshots(year),locale);
}
export function annualApiContent(year:number,sign:string,locale:AnnualLocale="en"){
  const guide=getAnnualGuide(year,sign,locale),hi=locale==="hi",mix=locale==="hinglish";
  const overview=hi?`${guide.label} के लिए ${year} की मासिक संदर्भ स्थितियाँ। ये व्यक्तिगत भविष्यवाणियाँ नहीं हैं।`:mix?`${guide.label} ke liye ${year} ke monthly reference positions. Yeh personal prediction nahi hai.`:`${guide.label} — ${year} sign-relative monthly reference positions for traditional reflection, not a personal prediction.`;
  return {title:`${guide.label} ${year} ${hi?"राशि मार्गदर्शिका":"Rashi guide"}`,subtitle:hi?"आंतरिक गणना, स्वतंत्र प्रमाणन लंबित": "Internal calculation; independent ephemeris certification pending",overview,
    sections:guide.rows.map(row=>({title:row.date,body:hi?`गुरु भाव ${row.growthHouse}: ${row.growthTheme}। शनि भाव ${row.structureHouse}: ${row.structureTheme}।`:mix?`Jupiter house ${row.growthHouse}: ${row.growthTheme}. Saturn house ${row.structureHouse}: ${row.structureTheme}.`:`Jupiter: house ${row.growthHouse} (${row.growthTheme}); Saturn: house ${row.structureHouse} (${row.structureTheme}). Consider these traditional topics as planning prompts.`})),
    luckyColor:"—",luckyNumber:"—",remedy:hi?"व्यावहारिक योजना बनाएं; किसी उपाय की आवश्यकता का दावा नहीं है।":"Use practical planning; no mandatory remedy is claimed.",annualGuide:guide};
}

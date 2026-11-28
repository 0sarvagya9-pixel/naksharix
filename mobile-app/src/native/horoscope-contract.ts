import type {ZodiacSign} from "../data/zodiac";
export type HoroscopePeriod="daily"|"weekly"|"monthly"|"yearly";
export type NativeHoroscopeRequest={sign:ZodiacSign;period:HoroscopePeriod;year:number};
export type NativeHoroscope={zodiac:string;period:HoroscopePeriod;title:string;subtitle:string;overview:string;sections:Array<{title:string;body:string}>;luckyNumber:string|null;luckyColor:string;remedy:string;notice:string};
const signs=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
function object(value:unknown):Record<string,unknown>|null{return value!==null&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:null;}
function text(value:unknown):value is string{return typeof value==="string"&&value.trim().length>0;}
export function indiaCalendarYear(now=new Date()){
 if(!Number.isFinite(now.getTime()))throw Error("Invalid date");
 return new Date(now.getTime()+330*60000).getUTCFullYear();
}
export function nativeAnnualYears(now=new Date()){
 const year=indiaCalendarYear(now);
 return [...new Set([year-1,year,year+1,2027])].filter(n=>n>=1900&&n<=2100).sort((a,b)=>a-b);
}
export function nativeHoroscopePath(request:NativeHoroscopeRequest){
 if(!signs.some(s=>s.toLowerCase()===request.sign)||!["daily","weekly","monthly","yearly"].includes(request.period))throw Error("Invalid guidance selection");
 if(request.period==="yearly"&&(!Number.isSafeInteger(request.year)||request.year<1900||request.year>2100))throw Error("Invalid reference year");
 return "/api/mobile/horoscope?zodiac="+encodeURIComponent(request.sign)+"&period="+request.period+"&locale=en"+(request.period==="yearly"?"&year="+request.year:"");
}
export function validateNativeHoroscope(value:unknown,request:NativeHoroscopeRequest):NativeHoroscope|null{
 const data=object(value);
 if(!data||data.zodiac!==request.sign||data.period!==request.period||data.locale!=="en"||
  !text(data.title)||!text(data.subtitle)||!text(data.overview)||!Array.isArray(data.sections)||!data.sections.length||
  !data.sections.every(s=>{const row=object(s);return Boolean(row&&text(row.title)&&text(row.body));})||
  !text(data.notice)||!text(data.remedy)||!text(data.luckyColor)||
  !(data.luckyNumber===null||typeof data.luckyNumber==="string"))return null;
 if(request.period==="yearly"){
  const guide=object(data.annualGuide),index=signs.findIndex(s=>s.toLowerCase()===request.sign);
  if(!guide||guide.year!==request.year||guide.referenceSign!==signs[index]||guide.personalPrediction!==false||
    guide.verification!=="internal_educational_not_external_certified"||!Array.isArray(guide.rows)||guide.rows.length!==12||
    data.sections.length!==12||!["—",null].includes(data.luckyNumber as string|null)||data.luckyColor!=="—")return null;
  for(let i=0;i<12;i++){
   const row=object(guide.rows[i]),date=String(request.year)+"-"+String(i+1).padStart(2,"0")+"-01";
   if(!row||row.date!==date||data.sections[i].title!==date||!text(row.growthTheme)||!text(row.structureTheme))return null;
   const j=signs.indexOf(String(row.jupiter)),s=signs.indexOf(String(row.saturn));
   if(j<0||s<0||row.growthHouse!==(j-index+12)%12+1||row.structureHouse!==(s-index+12)%12+1)return null;
  }
 }
 return value as NativeHoroscope;
}

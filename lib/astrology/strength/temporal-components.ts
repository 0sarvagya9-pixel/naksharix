import * as Astronomy from "astronomy-engine";
import type {CanonicalPlanet} from "@/lib/astrology/ephemeris/types";
import {STRENGTH_GRAHAS,type StrengthGraha} from "./classical-components";
const DAY=86400000;
const WEEKDAYS:readonly StrengthGraha[]=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];
const HORA_ORDER:readonly StrengthGraha[]=["Sun","Venus","Mercury","Moon","Saturn","Jupiter","Mars"];
type Polarity="benefic"|"malefic";
export type HoraConvention="equal_sunrise_cycle"|"seasonal_day_night";
export type ClassicalSolarContext={
 utc:string;apparentSolarHours:number;declinations:Record<StrengthGraha,number>;
 sunriseUtc:string|null;sunsetUtc:string|null;nextSunriseUtc:string|null;
 solarDayLord:StrengthGraha|null;horaLord:StrengthGraha|null;horaIndex:number|null;horaConvention?:HoraConvention;
 dayNight:"day"|"night"|null;birthPhase:"day"|"night"|"twilight"|null;
 thirdLord:StrengthGraha|null;method:"apparent_solar_geocentric_sunrise_cycle";
};
function graha(g:unknown):g is StrengthGraha{return STRENGTH_GRAHAS.includes(g as StrengthGraha);}
function mod(n:number,m:number){return ((n%m)+m)%m;}
function arc(a:number,b:number){return Math.min(mod(a-b,360),mod(b-a,360));}
function lon(p:CanonicalPlanet|undefined){
 return typeof p?.absoluteLongitude==="number"&&Number.isFinite(p.absoluteLongitude)&&p.absoluteLongitude>=0&&p.absoluteLongitude<360?p.absoluteLongitude:null;
}
function solarEvents(utc:Date,lat:number,longitude:number){
 const observer=new Astronomy.Observer(lat,longitude,0),start=utc.getTime()-2*DAY,end=utc.getTime()+2*DAY;
 function find(direction:1|-1){
  const result:number[]=[];let cursor=start;
  for(let i=0;i<6&&cursor<end;i++){
   const event=Astronomy.SearchRiseSet(Astronomy.Body.Sun,observer,direction,new Date(cursor),(end-cursor)/DAY);
   if(!event)break;
   const ms=event.date.getTime();if(!Number.isFinite(ms)||ms<cursor||ms>=end)break;
   result.push(ms);cursor=ms+1000;
  }
  return result;
 }
 const t=utc.getTime(),rises=find(1),sets=find(-1);
 const previous=rises.filter(x=>x<=t).at(-1),next=rises.find(x=>x>t);
 if(previous===undefined||next===undefined)return null;
 const between=sets.filter(x=>x>previous&&x<next);
 if(between.length!==1||next-previous<20*3600000||next-previous>28*3600000)return null;
 return {previous,sunset:between[0],next};
}
/** Calculate observed solar-cycle components using the existing astronomy
 * engine, never substitute fixed 06:00/18:00 at high latitudes or night.
 * Local mean solar date of the previous sunrise determines weekday lord.
 * Equal-cycle hours divide sunrise to sunrise by 24. Seasonal hours
 * divide sunrise to sunset by 12 and sunset to next sunrise by 12.
 */
export function calculateSolarStrengthContext(utc:Date,latitude:number,longitude:number,horaConvention:HoraConvention="equal_sunrise_cycle"):ClassicalSolarContext{
 if(!Number.isFinite(utc.getTime())||!Number.isFinite(latitude)||Math.abs(latitude)>90||!Number.isFinite(longitude)||Math.abs(longitude)>180)throw Error("INVALID_SOLAR_CONTEXT");
 if(horaConvention!=="equal_sunrise_cycle"&&horaConvention!=="seasonal_day_night")throw Error("INVALID_HORA_CONVENTION");
 const time=Astronomy.MakeTime(utc),rotation=Astronomy.Rotation_EQJ_EQD(time);
 const equatorial=Object.fromEntries(STRENGTH_GRAHAS.map(g=>{
  const vector=Astronomy.GeoVector(Astronomy.Body[g],time,true);
  const eq=Astronomy.EquatorFromVector(Astronomy.RotateVector(rotation,vector));
  if(!Number.isFinite(eq.ra)||!Number.isFinite(eq.dec)||Math.abs(eq.dec)>90)throw Error("INVALID_EQUATORIAL_VECTOR");
  return [g,{ra:eq.ra,dec:eq.dec}];
 })) as Record<StrengthGraha,{ra:number;dec:number}>;
 const apparentSolarHours=mod(Astronomy.SiderealTime(time)+longitude/15-equatorial.Sun.ra+12,24);
 const declinations=Object.fromEntries(STRENGTH_GRAHAS.map(g=>[g,equatorial[g].dec])) as Record<StrengthGraha,number>;
 const events=solarEvents(utc,latitude,longitude);
 const base={utc:utc.toISOString(),apparentSolarHours,declinations,horaConvention,method:"apparent_solar_geocentric_sunrise_cycle" as const};
 if(!events)return {...base,sunriseUtc:null,sunsetUtc:null,nextSunriseUtc:null,solarDayLord:null,horaLord:null,horaIndex:null,dayNight:null,birthPhase:null,thirdLord:null};
 const t=utc.getTime(),{previous,sunset,next}=events,day=t<sunset;
 const portion=Math.min(2,Math.floor((day?(t-previous)/(sunset-previous):(t-sunset)/(next-sunset))*3));
 const thirdLord=(day?["Mercury","Sun","Saturn"]:["Moon","Venus","Mars"])[portion] as StrengthGraha;
 const solarDayLord=WEEKDAYS[new Date(previous+longitude/15*3600000).getUTCDay()];
 const horaIndex=horaDivisionIndex(t,previous,sunset,next,horaConvention);
 const horaLord=HORA_ORDER[(HORA_ORDER.indexOf(solarDayLord)+horaIndex)%7];
 const birthPhase=(!day&&(t-sunset<72*60000||next-t<=72*60000))?"twilight":day?"day":"night";
 return {...base,sunriseUtc:new Date(previous).toISOString(),sunsetUtc:new Date(sunset).toISOString(),nextSunriseUtc:new Date(next).toISOString(),solarDayLord,horaLord,horaIndex,dayNight:day?"day":"night",birthPhase,thirdLord};
}

/** Sunrise belongs to the first day hour; sunset begins the first night
 * hour. All four instants are absolute, including across a DST change. */
export function horaDivisionIndex(birth:number,rise:number,set:number,nextRise:number,convention:HoraConvention){
 if(![birth,rise,set,nextRise].every(Number.isFinite)||!(rise<set&&set<nextRise&&birth>=rise&&birth<nextRise))throw Error("INVALID_HORA_INTERVAL");
 if(convention==="equal_sunrise_cycle")return Math.min(23,Math.floor(24*(birth-rise)/(nextRise-rise)));
 if(convention!=="seasonal_day_night")throw Error("INVALID_HORA_CONVENTION");
 const day=birth<set;
 const elapsed=day?birth-rise:birth-set;
 const interval=day?set-rise:nextRise-set;
 return (day?0:12)+Math.min(11,Math.floor(12*elapsed/interval));
}
export function classicalNatonnata(planet:StrengthGraha,apparentHours:number){
 if(!graha(planet)||!Number.isFinite(apparentHours)||apparentHours<0||apparentHours>=24)throw Error("INVALID_NATONNATA");
 if(planet==="Mercury")return 60;
 const day=60-5*Math.abs(apparentHours-12);
 return ["Sun","Jupiter","Venus"].includes(planet)?day:60-day;
}
export function classicalAyanaBase(planet:StrengthGraha,declination:number){
 if(!graha(planet)||!Number.isFinite(declination)||Math.abs(declination)>90)throw Error("INVALID_AYANA");
 // Explicit Sripati fixed 24-degree reference convention, clamped for
 // planets with ecliptic latitude. Keep luminary doubling separate.
 const favored=planet==="Mercury"?Math.abs(declination):planet==="Moon"||planet==="Saturn"?-declination:declination;
 return Math.max(0,Math.min(60,(24+favored)*60/48));
}
export function classicalPaksha(planet:StrengthGraha,sun:number,moon:number,polarity:Polarity){
 if(!graha(planet)||![sun,moon].every(n=>Number.isFinite(n)&&n>=0&&n<360)||!["benefic","malefic"].includes(polarity))throw Error("INVALID_PAKSHA");
 const bright=arc(sun,moon)/3;
 const undoubled=polarity==="benefic"?bright:60-bright;
 return {undoubledVirupas:undoubled,virupas:planet==="Moon"?2*undoubled:undoubled};
}
/** Explicit same-sign conjunction reading of BPHS ch.3. The nodes are
 * not strength participants, but are included in the Mercury association
 * check. Angular-orb and other polarity conventions require separate review.
 */
export function calculateTraditionalPolarity(planets:CanonicalPlanet[]){
 const map=new Map(planets.map(p=>[p.planet,p]));
 if(map.size!==planets.length||!STRENGTH_GRAHAS.every(g=>lon(map.get(g))!==null))return null;
 const sun=lon(map.get("Sun"))!,moon=lon(map.get("Moon"))!,mercury=lon(map.get("Mercury"))!;
 const waxing=mod(moon-sun,360)<180;
 const malefics=["Sun","Mars","Saturn","Rahu","Ketu",...(!waxing?["Moon"]:[])];
 const mercuryMalefic=planets.some(p=>malefics.includes(p.planet)&&lon(p)!==null&&Math.floor(lon(p)!/30)===Math.floor(mercury/30));
 return {Sun:"malefic",Moon:waxing?"benefic":"malefic",Mars:"malefic",Mercury:mercuryMalefic?"malefic":"benefic",Jupiter:"benefic",Venus:"benefic",Saturn:"malefic"} as Record<StrengthGraha,Polarity>;
}
export type MotionClass="vakra"|"anuvakra"|"vikala"|"manda"|"mandatara"|"sama"|"chara"|"atichara";
const CLASS_STRENGTH:Record<MotionClass,number>={vakra:60,anuvakra:30,vikala:15,manda:30,mandatara:15,sama:7.5,chara:45,atichara:30};
export function classicalMotionClassVirupas(motion:MotionClass){
 if(!Object.prototype.hasOwnProperty.call(CLASS_STRENGTH,motion))throw Error("UNQUALIFIED_MOTION_CLASS");
 return CLASS_STRENGTH[motion];
}
/** Continuous method: the mean and true longitudes, and the classical
 * seeghrocha must be supplied in one named, independently matched system.
 * This function evaluates the arithmetic only; do not infer those inputs
 * from the sign of the apparent derivative. */
export function classicalCheshtaFromMeanTrue(meanLongitude:number,trueLongitude:number,seeghrocha:number){
 if(![meanLongitude,trueLongitude,seeghrocha].every(n=>Number.isFinite(n)&&n>=0&&n<360))throw Error("INVALID_CHESHTA_INPUT");
 const difference=mod(trueLongitude-meanLongitude+180,360)-180;
 if(Math.abs(difference)===180)throw Error("AMBIGUOUS_MEAN_TRUE_LONGITUDE");
 const midpoint=mod(meanLongitude+difference/2,360);
 const kendra=arc(seeghrocha,midpoint);
 return {midpoint,kendraDegrees:kendra,virupas:kendra/3,method:"mean_true_short_arc_kendra" as const};
}
export type CalendarLords={yearLord:StrengthGraha;monthLord:StrengthGraha};
export function calculateTemporalStrengthEvidence(planets:CanonicalPlanet[],solar:ClassicalSolarContext,calendar?:CalendarLords){
 const map=new Map(planets.map(p=>[p.planet,p])),polarity=calculateTraditionalPolarity(planets);
 const complete=polarity!==null&&map.size===planets.length;
 const sun=lon(map.get("Sun")),moon=lon(map.get("Moon"));
 const starPlanets=["Mars","Mercury","Jupiter","Venus","Saturn"] as const;
 const warPairs=complete?starPlanets.flatMap((a,i)=>starPlanets.slice(i+1).filter(b=>arc(lon(map.get(a))!,lon(map.get(b))!)<=1).map(b=>[a,b] as const)):null;
 const calendarReady=!!calendar&&graha(calendar.yearLord)&&graha(calendar.monthLord);
 const rows=STRENGTH_GRAHAS.map(planet=>{
  const natonnata=classicalNatonnata(planet,solar.apparentSolarHours);
  const paksha=sun!==null&&moon!==null&&polarity?classicalPaksha(planet,sun,moon,polarity[planet]):null;
  const ayana=classicalAyanaBase(planet,solar.declinations[planet]);
  const tribhaga=solar.thirdLord?(planet===solar.thirdLord||planet==="Jupiter"?60:0):planet==="Jupiter"?60:null;
  const year=calendarReady?(planet===calendar!.yearLord?15:0):null,month=calendarReady?(planet===calendar!.monthLord?30:0):null;
  const day=solar.solarDayLord?(planet===solar.solarDayLord?45:0):null,hora=solar.horaLord?(planet===solar.horaLord?60:0):null;
  const yuddha=warPairs&&!warPairs.some(pair=>pair.some(p=>p===planet))?0:null;
  const components={natonnata,paksha:paksha?.virupas??null,tribhaga,year,month,day,hora,ayana,yuddha};
  const values=Object.values(components);
  const conditionalKalaVirupas=values.every(n=>typeof n==="number"&&Number.isFinite(n))?values.reduce<number>((s,n)=>s+Number(n),0):null;
  return {planet,components,conditionalKalaVirupas,pakshaUndoubled:paksha?.undoubledVirupas??null,luminaryCheshtaBasis:planet==="Sun"?ayana:planet==="Moon"?paksha?.undoubledVirupas??null:null};
 });
 return {method:"bphs_solar_time_sripati_24_degree_ayana" as const,polarity,warPairs,rows,publicEnabled:false as const,verified:false as const,
 missingDependencies:[...(!calendarReady?["reviewed year and month lords for a declared calendar epoch"]:[]),...(!solar.solarDayLord?["complete sunrise and sunset cycle"]:[]),...(!polarity?["valid unique planetary positions"]:[]),...(warPairs===null||warPairs.length?["reviewed planetary war victory/strength transfer"]:[]),"independently established classical mean longitudes and seeghrocha for the five star planets","independent full component parity and agreed luminary accounting convention"],
 limitations:["True geocentric declination, fixed 24-degree Ayana reference, apparent solar hour, sunrise-cycle Hora convention; no invented missing calendar or war contribution. Sun and Moon motional bases are listed separately to prevent accidental double counting. These are named arithmetic components, not certified Shadbala."]};
}

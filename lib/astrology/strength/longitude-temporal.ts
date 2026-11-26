import type {CanonicalPlanet} from "@/lib/astrology/ephemeris/types";
import {STRENGTH_GRAHAS,type StrengthGraha,calculateRamanPolarityCandidate} from "./classical-components";
import {calculateTemporalStrengthEvidence,classicalPaksha,type ClassicalSolarContext,type CalendarLords} from "./temporal-components";
const norm=(x:number)=>((x%360)+360)%360;
const validAngle=(x:unknown):x is number=>typeof x==="number"&&Number.isFinite(x)&&x>=0&&x<360;
const shortArc=(x:number)=>Math.min(norm(x),360-norm(x));
/** Project the longitude onto the equator with zero ecliptic latitude.
 * This is a named approximation, not the actual declination of a planet.
 * Actual declination remains separate for planetary war. */
export function projectLongitudeDeclination(tropicalLongitude:number,obliquity:number){
 if(!validAngle(tropicalLongitude)||!Number.isFinite(obliquity)||obliquity<=0||obliquity>=90)throw Error("INVALID_LONGITUDE_PROJECTION");
 const r=Math.PI/180;
 return Math.asin(Math.sin(obliquity*r)*Math.sin(tropicalLongitude*r))/r;
}
export type AyanaConvention = "longitude_projection" | "raman_15_degree_table";

/** Raman, Graha and Bhava Balas §§73–75. Each 15-degree step adds
 * the tabulated arcminutes. Interpolate the final partial step. */
function ramanTableDeclination(longitude:number){
 if(!validAngle(longitude))throw Error("INVALID_TROPICAL_LONGITUDE");
 const halfCircle=longitude%180;
 const distance=Math.min(halfCircle,180-halfCircle);
 const increments=[362,341,299,236,150,52];
 let arcminutes=0;
 for(const [i,increment] of increments.entries()){
  const fraction=Math.max(0,Math.min(1,distance/15-i));
  arcminutes+=increment*fraction;
 }
 return (longitude<180?1:-1)*arcminutes/60;
}

export function longitudeAyanaCandidate(planet:StrengthGraha,tropicalLongitude:number,obliquity:number,convention:AyanaConvention="longitude_projection"){
 if(!STRENGTH_GRAHAS.includes(planet))throw Error("INVALID_AYANA_PLANET");
 if(convention!=="longitude_projection"&&convention!=="raman_15_degree_table")throw Error("UNKNOWN_AYANA_CONVENTION");
 const useTable=convention==="raman_15_degree_table";
 const declination=useTable?ramanTableDeclination(tropicalLongitude):projectLongitudeDeclination(tropicalLongitude,obliquity);
 const favored=planet==="Mercury"?Math.abs(declination):planet==="Moon"||planet==="Saturn"?-declination:declination;
 const maximum=useTable?24:obliquity;
 const undoubledVirupas=Math.min(60,Math.max(0,30+30*favored/maximum));
 return {declination,undoubledVirupas,virupas:planet==="Sun"?2*undoubledVirupas:undoubledVirupas};
}
/** Raman, ch. X arts. 136–137: these angular measures are used for
 * Ishta/Kashta calculations, not automatically the same as ch. V totals. */
export function luminaryKendraCandidate(sunTropical:number,moonTropical:number){
 if(!validAngle(sunTropical)||!validAngle(moonTropical))throw Error("INVALID_LUMINARY_KENDRA");
 return {Sun:shortArc(sunTropical+90)/3,Moon:shortArc(moonTropical-sunTropical)/3};
}
export type LuminaryAccounting="doubled_in_kala"|"separate_kendra";
/** Preserve two explicitly labeled accounting options. The separate-kendra
 * option corresponds to the published comparison's single Moon Paksha row
 * and separate luminary motional rows, not a claim that all texts agree.
 * The doubled option retains the historical doubled Moon in Kala and no
 * extra luminary motional amount. All inputs must be from the same chart. */
export function calculateLongitudeTemporalCandidate(planets:CanonicalPlanet[],solar:ClassicalSolarContext,calendar:CalendarLords|undefined,ayanamsa:number,obliquity:number,accounting:LuminaryAccounting,convention:AyanaConvention="longitude_projection"){
 if(accounting!=="doubled_in_kala"&&accounting!=="separate_kendra")throw Error("INVALID_LUMINARY_ACCOUNTING");
 if(!validAngle(ayanamsa)||!Number.isFinite(obliquity)||obliquity<=0||obliquity>=90)return null;
 const polarity=calculateRamanPolarityCandidate(planets);if(!polarity)return null;
 const map=new Map(planets.filter(p=>STRENGTH_GRAHAS.includes(p.planet as StrengthGraha)).map(p=>[p.planet,p.absoluteLongitude]));
 if(map.size!==7||!STRENGTH_GRAHAS.every(g=>validAngle(map.get(g))))return null;
 const sun=map.get("Sun")!,moon=map.get("Moon")!;
 const tropical=(g:StrengthGraha)=>norm(map.get(g)!+ayanamsa);
 const kendra=luminaryKendraCandidate(tropical("Sun"),tropical("Moon"));
 const base=calculateTemporalStrengthEvidence(planets,solar,calendar);
 const rows=base.rows.map(r=>{
  const planet=r.planet,aya=longitudeAyanaCandidate(planet,tropical(planet),obliquity,convention);
  const paksha=classicalPaksha(planet,sun,moon,polarity.polarity[planet]);
  const components={...r.components,ayana:aya.virupas,paksha:accounting==="doubled_in_kala"?paksha.virupas:paksha.undoubledVirupas};
  const beforeWar=Object.entries(components).filter(([k])=>k!=="yuddha").map(([,v])=>v);
  const kalaBeforeWar=beforeWar.every(v=>typeof v==="number"&&Number.isFinite(v))?beforeWar.reduce<number>((n,v)=>n+Number(v),0):null;
  const luminaryCheshta=planet==="Sun"||planet==="Moon"?(accounting==="separate_kendra"?kendra[planet]:0):null;
  return {planet,components,kalaBeforeWar,luminaryCheshta,projectedDeclination:aya.declination};
 });
 const method=convention==="raman_15_degree_table"?"raman_kranti_table_named_luminary_accounting" as const:"longitude_projection_raman_polarity_named_luminary_accounting" as const;
 return {method,accounting,rows,warPairs:base.warPairs,publicEnabled:false as const,verified:false as const};
}

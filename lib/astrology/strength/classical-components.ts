import type {CanonicalPlanet} from "@/lib/astrology/ephemeris/types";
import {classicalVargaCoordinates,divisionCoordinates,type ClassicalVargaKey} from "@/lib/astrology/varga/partition";

export const STRENGTH_GRAHAS=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"] as const;
export type StrengthGraha=(typeof STRENGTH_GRAHAS)[number];
const SIGNS=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"] as const;
const LORDS:readonly StrengthGraha[]=["Mars","Venus","Mercury","Moon","Sun","Mercury","Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"];
const FRIENDS:Record<StrengthGraha,readonly StrengthGraha[]>={Sun:["Moon","Mars","Jupiter"],Moon:["Sun","Mercury"],Mars:["Sun","Moon","Jupiter"],Mercury:["Sun","Venus"],Jupiter:["Sun","Moon","Mars"],Venus:["Mercury","Saturn"],Saturn:["Mercury","Venus"]};
const ENEMIES:Record<StrengthGraha,readonly StrengthGraha[]>={Sun:["Venus","Saturn"],Moon:[],Mars:["Mercury"],Mercury:["Moon"],Jupiter:["Mercury","Venus"],Venus:["Sun","Moon"],Saturn:["Sun","Moon","Mars"]};
const MOOLA:Record<StrengthGraha,readonly [number,number,number]>={Sun:[4,0,20],Moon:[1,3,30],Mars:[0,0,12],Mercury:[5,15,20],Jupiter:[8,0,10],Venus:[6,0,15],Saturn:[10,0,20]};
const VARGAS:ClassicalVargaKey[]=["D1","D2","D3","D7","D9","D12","D30"];
const WEAK_HOUSE:Record<StrengthGraha,number>={Sun:4,Mars:4,Jupiter:7,Mercury:7,Saturn:1,Moon:10,Venus:10};
const COMPOUND_LABELS=["great_enemy","enemy","neutral","friend","great_friend"] as const;
const COMPOUND_VALUES=[2,4,10,15,20] as const;
export type AspectReading="additional_full_mercury_jupiter"|"full_instead_of_quarter";
type Polarity="benefic"|"malefic";
type BirthPhase="day"|"night"|"twilight";

function isGraha(value:unknown):value is StrengthGraha{return STRENGTH_GRAHAS.includes(value as StrengthGraha);}
function norm(n:number){if(!Number.isFinite(n))throw Error("NONFINITE_STRENGTH_LONGITUDE");const r=n%360;return r<0?r+360:r;}
function distance(a:number,b:number){const d=Math.abs(norm(a)-norm(b));return Math.min(d,360-d);}
function angle(n:number){return Number.isFinite(n)&&n>=0&&n<360;}
function zodiac(n:number){return divisionCoordinates(n,1).signIndex;}
function validPosition(p:CanonicalPlanet){
 if(p.absoluteLongitude!=null){
  if(!angle(p.absoluteLongitude))return null;
  if(p.sign!=null&&p.sign!==SIGNS[zodiac(p.absoluteLongitude)])return null;
  return p.absoluteLongitude;
 }
 const i=SIGNS.findIndex(s=>s===p.sign);
 return i>=0&&typeof p.degree==="number"&&Number.isFinite(p.degree)&&p.degree>=0&&p.degree<30?i*30+p.degree:null;
}
function completePositions(planets:CanonicalPlanet[]){
 const map=new Map<StrengthGraha,number>();
 for(const p of planets){
  if(!isGraha(p.planet))continue;
  const lon=validPosition(p);if(lon===null||map.has(p.planet))return null;
  map.set(p.planet,lon);
 }
 return map.size===7?map:null;
}

// BPHS 3.55–58: natural friendship is directed; temporary friendship
// is reciprocal and evaluated from the natal signs, not each varga.
export function classicalRelationship(from:StrengthGraha,to:StrengthGraha,fromSign:number,toSign:number){
 if(!isGraha(from)||!isGraha(to)||from===to||![fromSign,toSign].every(n=>Number.isInteger(n)&&n>=0&&n<12))throw Error("INVALID_CLASSICAL_RELATIONSHIP");
 const natural=FRIENDS[from].includes(to)?1:ENEMIES[from].includes(to)?-1:0;
 const relativeHouse=(toSign-fromSign+12)%12+1;
 const temporary=[2,3,4,10,11,12].includes(relativeHouse)?1:-1;
 const compound=natural+temporary;
 return {from,to,natural,temporary,relativeHouse,compound,relationship:COMPOUND_LABELS[compound+2],virupas:COMPOUND_VALUES[compound+2]};
}
export function calculateFivefoldFriendship(planets:CanonicalPlanet[]){
 const positions=completePositions(planets);
 if(!positions)return {available:false as const,method:"bphs_natal_fivefold" as const,relationships:[],missing:"Seven unique, finite, consistent classical placements required"};
 const relationships=STRENGTH_GRAHAS.flatMap(from=>STRENGTH_GRAHAS.filter(to=>to!==from).map(to=>classicalRelationship(from,to,zodiac(positions.get(from)!),zodiac(positions.get(to)!))));
 return {available:true as const,method:"bphs_natal_fivefold" as const,relationships,missing:null};
}

// Named convention: moolatrikona is a degree-qualified D1 occupation.
// Other divisions use own sign / natal compound friendship grades.
// This explicitly chooses one variant; external software parity is pending.
export function calculateSaptavargajaEvidence(planets:CanonicalPlanet[],planet:StrengthGraha){
 const positions=completePositions(planets);
 if(!positions||!isGraha(planet))return null;
 const longitude=positions.get(planet)!,moola=MOOLA[planet],natal=zodiac(longitude);
 const degree=longitude-natal*30;
 const rows=VARGAS.map(chart=>{
  const target=classicalVargaCoordinates(chart,longitude).signIndex,lord=LORDS[target];
  const isMoola=chart==="D1"&&target===moola[0]&&degree>=moola[1]&&degree<moola[2];
  const relationship=lord===planet?null:classicalRelationship(planet,lord,natal,zodiac(positions.get(lord)!));
  const dignity=isMoola?"moolatrikona":lord===planet?"own":relationship!.relationship;
  const virupas=isMoola?45:lord===planet?30:relationship!.virupas;
  return {chart,sign:SIGNS[target],lord,dignity,virupas,relationship};
 });
 return {planet,method:"bphs_45_30_20_15_10_4_2_d1_degree_moolatrikona" as const,rows,totalVirupas:rows.reduce((n,r)=>n+r.virupas,0),verified:false as const};
}

// Separate geometry for evidence only. Ascendant/MC must come from the same
// physical chart and sidereal system. Do not overwrite D1 whole-sign houses.
export function buildQuadrantBhavaMidpoints(ascendant:number,midheaven:number){
 if(!angle(ascendant)||!angle(midheaven))throw Error("INVALID_BHAVA_ANGLES");
 const angles=[ascendant,norm(midheaven+180),norm(ascendant+180),midheaven],points:number[]=[];
 for(let i=0;i<4;i++){
  const span=norm(angles[(i+1)%4]-angles[i]);
  if(span<=0||span>=180)throw Error("DEGENERATE_BHAVA_QUADRANT");
  for(let k=0;k<3;k++)points.push(norm(angles[i]+span*k/3));
 }
 return {method:"equal_ecliptic_quadrant_midpoints" as const,midpoints:points,publicEnabled:false as const};
}
function validateMidpoints(midpoints:readonly number[]){
 if(midpoints.length!==12||!midpoints.every(angle))throw Error("INVALID_BHAVA_MIDPOINTS");
 const gaps=midpoints.map((m,i)=>norm(midpoints[(i+1)%12]-m));
 if(gaps.some(g=>g<=0||g>=180)||Math.abs(gaps.reduce((s,g)=>s+g,0)-360)>1e-7)throw Error("UNORDERED_BHAVA_MIDPOINTS");
 for(let i=0;i<6;i++)if(Math.abs(distance(midpoints[i],midpoints[i+6])-180)>1e-6)throw Error("NONOPPOSITE_BHAVA_MIDPOINTS");
 return gaps;
}
export function calculateExactDirectionalBala(planet:StrengthGraha,longitude:number,midpoints:readonly number[]){
 validateMidpoints(midpoints);if(!isGraha(planet)||!angle(longitude))throw Error("INVALID_DIRECTIONAL_INPUT");
 return {planet,weakHouse:WEAK_HOUSE[planet],weakPoint:midpoints[WEAK_HOUSE[planet]-1],virupas:distance(longitude,midpoints[WEAK_HOUSE[planet]-1])/3};
}
export function assignMidpointBhava(longitude:number,midpoints:readonly number[]){
 const gaps=validateMidpoints(midpoints);if(!angle(longitude))throw Error("INVALID_BHAVA_LONGITUDE");
 for(let i=0;i<12;i++){
  const prior=gaps[(i+11)%12],start=norm(midpoints[i]-prior/2);
  if(norm(longitude-start)<(prior+gaps[i])/2)return i+1;
 }
 throw Error("BHAva_ASSIGNMENT_FAILED");
}
export function classifyBhavaDirection(longitude:number){
 if(!angle(longitude))throw Error("INVALID_BHAVA_LONGITUDE");
 const s=zodiac(longitude),d=longitude%30;
 // BPHS 27.26–29 (Cancer with Scorpio, not Raman's alternative).
 if([2,5,6,10].includes(s)||(s===8&&d<15))return {group:"human",weakHouse:7} as const;
 if([0,1,4].includes(s)||(s===8&&d>=15)||(s===9&&d<15))return {group:"quadruped",weakHouse:4} as const;
 if([3,7].includes(s))return {group:"reptile",weakHouse:1} as const;
 return {group:"water",weakHouse:10} as const;
}

// BPHS 26.6–12 literal piecewise reading, with explicitly half-open
// segments. This is not the alternative constant-bonus speculum.
export function classicalAspectVirupas(planet:StrengthGraha,source:number,target:number){
 if(!isGraha(planet)||!angle(source)||!angle(target))throw Error("INVALID_ASPECT_INPUT");
 const d=norm(target-source),sector=Math.floor(d/30),r=d-sector*30;
 let v=d<30||d>=300?0:d<60?(d-30)/2:d<90?d-45:d<120?(120-d)/2+30:d<150?150-d:d<180?2*(d-150):(300-d)/2;
 if(planet==="Saturn"){
  if(sector===1)v=2*r;
  else if(sector===2)v=60-r/2;
  else if(sector===8)v=30+r;
  else if(sector===9)v=2*(30-r);
 }else if(planet==="Mars"){
  if(sector===2)v=15+1.5*r;
  else if(sector===3||sector===7)v=60-r;
  else if(sector===6)v=60;
 }else if(planet==="Jupiter"){
  if(sector===3||sector===7)v=45+r/2;
  else if(sector===4||sector===8)v=60-2*r;
 }
 return {planet,angle:d,virupas:v,method:"bphs_26_literal_half_open" as const};
}
function fullPolarities(polarity:Partial<Record<StrengthGraha,Polarity>>|undefined):polarity is Record<StrengthGraha,Polarity>{
 return !!polarity&&STRENGTH_GRAHAS.every(g=>polarity[g]==="benefic"||polarity[g]==="malefic");
}
function validReading(reading:unknown):reading is AspectReading{
 return reading==="additional_full_mercury_jupiter"||reading==="full_instead_of_quarter";
}
export function calculateAspectStrengthEvidence(planets:CanonicalPlanet[],target:number,polarity:Partial<Record<StrengthGraha,Polarity>>,reading:AspectReading,excluded?:StrengthGraha){
 const positions=completePositions(planets);
 if(!positions||!fullPolarities(polarity)||!validReading(reading)||!angle(target))return null;
 const rows=STRENGTH_GRAHAS.filter(g=>g!==excluded).map(g=>{
  const aspect=classicalAspectVirupas(g,positions.get(g)!,target);
  const quarter=(polarity[g]==="benefic"?1:-1)*aspect.virupas/4;
  const extra=(g==="Mercury"||g==="Jupiter")?aspect.virupas:0;
  const contribution=reading==="full_instead_of_quarter"&&(g==="Mercury"||g==="Jupiter")?extra:quarter+extra;
  return {...aspect,polarity:polarity[g],quarterVirupas:quarter,extraVirupas:extra,contribution};
 });
 return {method:reading,rows,virupas:rows.reduce((s,r)=>s+r.contribution,0),verified:false as const};
}
const HEAD_FIRST=[2,4,5,6,7,10],REAR_FIRST=[0,1,3,8,9];
// Full sum is conditional on explicit polarity, birth phase and an
// independently established set of lord strengths. The return value is
// not public/external certification even if all numbers are supplied.
export function calculateBhavaBalaEvidence(planets:CanonicalPlanet[],midpoints:readonly number[],context?:{
 polarity?:Partial<Record<StrengthGraha,Polarity>>;aspectReading?:AspectReading;birthPhase?:BirthPhase;lordStrengthVirupas?:Partial<Record<StrengthGraha,number>>;
}){
 validateMidpoints(midpoints);const positions=completePositions(planets);
 const phase=context?.birthPhase,validPhase=phase==="day"||phase==="night"||phase==="twilight";
 const lordMap=context?.lordStrengthVirupas;
 const allLords=!!lordMap&&STRENGTH_GRAHAS.every(g=>typeof lordMap[g]==="number"&&Number.isFinite(lordMap[g])&&lordMap[g]!>=0);
 const houses=midpoints.map((m,i)=>{
  const s=zodiac(m),lord=LORDS[s],classification=classifyBhavaDirection(m),directionalVirupas=distance(m,midpoints[classification.weakHouse-1])/3;
  const occupants=positions?STRENGTH_GRAHAS.filter(g=>assignMidpointBhava(positions.get(g)!,midpoints)===i+1):null;
  const occupantVirupas=occupants?occupants.reduce((sum,g)=>sum+(g==="Mercury"||g==="Jupiter"?60:g==="Sun"||g==="Mars"||g==="Saturn"?-60:0),0):null;
  const aspect=fullPolarities(context?.polarity)&&validReading(context?.aspectReading)?calculateAspectStrengthEvidence(planets,m,context!.polarity!,context!.aspectReading!):null;
  const birthPhaseVirupas=validPhase?((phase==="day"&&HEAD_FIRST.includes(s))||(phase==="night"&&REAR_FIRST.includes(s))||(phase==="twilight"&&s===11)?15:0):null;
  const lordStrength=allLords?lordMap![lord]!:null;
  const conditionalTotal=aspect&&occupantVirupas!==null&&birthPhaseVirupas!==null&&lordStrength!==null?directionalVirupas+aspect.virupas+occupantVirupas+birthPhaseVirupas+lordStrength:null;
  return {house:i+1,midpoint:m,sign:SIGNS[s],lord,...classification,directionalVirupas,occupants,occupantVirupas,aspect,birthPhaseVirupas,lordStrengthVirupas:lordStrength,arithmeticTotalVirupas:conditionalTotal};
 });
 return {method:"bphs_27_midpoint_component_evidence" as const,publicEnabled:false as const,verified:false as const,houses,
  missingDependencies:[...(!positions?["complete classical positions"]:[]),...(!fullPolarities(context?.polarity)||!validReading(context?.aspectReading)?["reviewed aspect polarity and reading"]:[]),...(!validPhase?["observed birth phase"]:[]),...(!allLords?["independently established lord Shadbala"]:[])],
  limitations:["Named BPHS house-sign convention; other editions differ. Midpoints are supplied, never inferred from whole-sign houses. Conditional totals are arithmetic only; no strength or prediction certification."]};
}

/** Separate Raman-style whole-house distance candidate. Cancer is watery,
 * not the BPHS translation's Cancer/Scorpio group. No public activation. */
export function calculateRamanBhavaDirectionalCandidate(house:number,midpoint:number){
 if(!Number.isInteger(house)||house<1||house>12||!angle(midpoint))throw Error("INVALID_RAMAN_BHAVA_DIRECTION_INPUT");
 const s=zodiac(midpoint),d=midpoint%30;
 const weakHouse=[2,5,6,10].includes(s)||(s===8&&d<15)?7:
  [0,1,4].includes(s)||(s===8&&d>=15)||(s===9&&d<15)?4:s===7?1:10;
 const delta=Math.abs(house-weakHouse);
 return {house,weakHouse,virupas:10*Math.min(delta,12-delta),method:"raman_whole_bhava_distance" as const,publicEnabled:false as const,verified:false as const};
}

/** B.V. Raman, Graha and Bhava Balas arts. 114–120, 132–133.
 * The Sripati ordinary aspect is augmented by the stated constant special
 * aspect within its sign sector. This is not the BPHS literal piecewise
 * reading above; do not silently interchange the two methods. */
export function calculateRamanAspectVirupas(planet:StrengthGraha,source:number,target:number){
 if(!isGraha(planet)||!angle(source)||!angle(target))throw Error("INVALID_RAMAN_ASPECT_INPUT");
 const d=norm(target-source);
 const ordinary=d<30||d>=300?0:d<60?(d-30)/2:d<90?d-45:d<120?(120-d)/2+30:d<150?150-d:d<180?2*(d-150):(300-d)/2;
 const special=planet==="Mars"&&((d>=90&&d<120)||(d>=210&&d<240))?15:
  planet==="Jupiter"&&((d>=120&&d<150)||(d>=240&&d<270))?30:
  planet==="Saturn"&&((d>=60&&d<90)||(d>=270&&d<300))?45:0;
 return {planet,angle:d,ordinary,special,virupas:ordinary+special,method:"raman_sripati_constant_special" as const};
}
/** Explicit tithi-boundary interpretation of Raman art. 53: from beginning
 * of bright eighth tithi to beginning of dark eighth. Same-sign classical
 * malefic association for Mercury is a named operational convention. */
export function calculateRamanPolarityCandidate(planets:CanonicalPlanet[]){
 const positions=completePositions(planets);if(!positions)return null;
 const elongation=norm(positions.get("Moon")!-positions.get("Sun")!);
 const moonBenefic=elongation>=84&&elongation<264;
 const malefics:StrengthGraha[]=["Sun","Mars","Saturn",...(!moonBenefic?["Moon" as const]:[])];
 const mercuryMalefic=malefics.some(g=>zodiac(positions.get(g)!)===zodiac(positions.get("Mercury")!));
 const polarity:Record<StrengthGraha,Polarity>={Sun:"malefic",Moon:moonBenefic?"benefic":"malefic",Mars:"malefic",Mercury:mercuryMalefic?"malefic":"benefic",Jupiter:"benefic",Venus:"benefic",Saturn:"malefic"};
 return {elongation,polarity,method:"raman_bright_eighth_to_dark_eighth_same_sign_candidate" as const,verified:false as const};
}
/** Article 120: planetary Drik = signed quarter of every OTHER graha.
 * Article 132: for houses only, Mercury and Jupiter contribute fully and
 * positively. Keep the two operations distinct. */
export function calculateRamanDrikCandidate(planets:CanonicalPlanet[],planet:StrengthGraha){
 const positions=completePositions(planets),context=calculateRamanPolarityCandidate(planets);
 if(!positions||!context||!isGraha(planet))return null;
 const target=positions.get(planet)!;
 const rows=STRENGTH_GRAHAS.filter(g=>g!==planet).map(g=>{
  const a=calculateRamanAspectVirupas(g,positions.get(g)!,target);
  return {...a,polarity:context.polarity[g],contribution:(context.polarity[g]==="benefic"?1:-1)*a.virupas/4};
 });
 return {planet,rows,virupas:rows.reduce((n,r)=>n+r.contribution,0),method:"raman_planet_signed_quarter" as const,publicEnabled:false as const,verified:false as const};
}
export function calculateRamanHouseAspectCandidate(planets:CanonicalPlanet[],target:number){
 const positions=completePositions(planets),context=calculateRamanPolarityCandidate(planets);
 if(!positions||!context||!angle(target))return null;
 const rows=STRENGTH_GRAHAS.map(g=>{
  const a=calculateRamanAspectVirupas(g,positions.get(g)!,target),full=g==="Mercury"||g==="Jupiter";
  return {...a,polarity:full?"benefic" as const:context.polarity[g],contribution:full?a.virupas:(context.polarity[g]==="benefic"?1:-1)*a.virupas/4};
 });
 return {rows,virupas:rows.reduce((n,r)=>n+r.contribution,0),method:"raman_house_full_mercury_jupiter" as const,publicEnabled:false as const,verified:false as const};
}
/** Raman art. 125 uses the midpoint sign's lord. The separately labeled
 * whole-sign lord option reproduces an observed vendor convention; it is
 * not attributed to Raman. No occupant/time additions in this three-part sum.
 * Totals require all seven independently supplied strengths. */
export function calculateRamanBhavaCandidate(planets:CanonicalPlanet[],midpoints:readonly number[],context?:{lordConvention?:"midpoint_sign"|"whole_sign_lagna";lordStrengthVirupas?:Partial<Record<StrengthGraha,number>>}){
 validateMidpoints(midpoints);
 const convention=context?.lordConvention??"midpoint_sign";
 if(convention!=="midpoint_sign"&&convention!=="whole_sign_lagna")throw Error("INVALID_RAMAN_LORD_CONVENTION");
 const strength=context?.lordStrengthVirupas;
 const allLords=!!strength&&STRENGTH_GRAHAS.every(g=>typeof strength[g]==="number"&&Number.isFinite(strength[g])&&strength[g]!>=0);
 const houses=midpoints.map((midpoint,i)=>{
  const s=convention==="whole_sign_lagna"?(zodiac(midpoints[0])+i)%12:zodiac(midpoint);
  const lord=LORDS[s],lordStrengthVirupas=allLords?strength![lord]!:null;
  const direction=calculateRamanBhavaDirectionalCandidate(i+1,midpoint);
  const aspect=calculateRamanHouseAspectCandidate(planets,midpoint);
  return {house:i+1,midpoint,midpointSign:SIGNS[zodiac(midpoint)],lordSign:SIGNS[s],lord,lordStrengthVirupas,directionalVirupas:direction.virupas,aspect,arithmeticTotalVirupas:lordStrengthVirupas!==null&&aspect?lordStrengthVirupas+direction.virupas+aspect.virupas:null};
 });
 return {method:"raman_three_part_bhava_candidate" as const,lordConvention:convention,houses,publicEnabled:false as const,verified:false as const,missingDependencies:[...(!allLords?["complete lord strengths"]:[]),...(!completePositions(planets)?["unique complete classical positions"]:[]),"independent whole-chart strength certification"]};
}

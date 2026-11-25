import type {PlanetPosition} from "@/lib/astrology/types";
export const CLASSICAL_PATTERN_GRAHAS=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"] as const;
const STARS=["Mars","Mercury","Jupiter","Venus","Saturn"] as const;
const SIGNS=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"] as const;
const DIGNITY:Record<(typeof STARS)[number],readonly string[]>={Mars:["Aries","Scorpio","Capricorn"],Mercury:["Gemini","Virgo"],Jupiter:["Sagittarius","Pisces","Cancer"],Venus:["Taurus","Libra","Pisces"],Saturn:["Capricorn","Aquarius","Libra"]};
const NAMES={Mars:"Ruchaka",Mercury:"Bhadra",Jupiter:"Hamsa",Venus:"Malavya",Saturn:"Shasha"} as const;
const KENDRA=new Set([1,4,7,10]);
const norm=(x:number)=>((x%360)+360)%360;
const signIndex=(s:string)=>SIGNS.findIndex(x=>x===s);
const angle=(x:unknown):x is number=>typeof x==="number"&&Number.isFinite(x)&&x>=0&&x<360;
function position(p:PlanetPosition){
 const sign=signIndex(p.sign);if(sign<0)return null;
 if(p.absoluteLongitude!==undefined){
  if(!angle(p.absoluteLongitude)||Math.floor(p.absoluteLongitude/30)!==sign)return null;
  if(p.degree!==undefined&&(!Number.isFinite(p.degree)||p.degree<0||p.degree>=30||Math.abs(p.absoluteLongitude%30-p.degree)>.01))return null;
  return {sign,longitude:p.absoluteLongitude};
 }
 if(typeof p.degree!=="number"||!Number.isFinite(p.degree)||p.degree<0||p.degree>=30)return null;
 return {sign,longitude:sign*30+p.degree};
}
function mapPositions(planets:readonly PlanetPosition[],required:readonly string[]){
 const map=new Map<string,{sign:number;longitude:number}>();
 for(const p of planets){if(!required.includes(p.planet))continue;const row=position(p);if(!row||map.has(p.planet))return null;map.set(p.planet,row);}
 return required.every(g=>map.has(g))?map:null;
}
const house=(a:number,b:number)=>(a-b+12)%12+1;
/** Modern closed semicircle geometry only; not a claim that Kaal Sarp
 * is a canonical ancient rule or a predictor. An on-node boundary is
 * recorded explicitly and remains convention dependent. */
export function evaluateNodalContainment(planets:readonly PlanetPosition[]){
 const p=mapPositions(planets,[...CLASSICAL_PATTERN_GRAHAS,"Rahu","Ketu"]);
 if(!p)return null;
 const rahu=p.get("Rahu")!.longitude,ketu=p.get("Ketu")!.longitude;
 if(Math.abs(norm(ketu-rahu)-180)>.01)return null;
 const offsets=CLASSICAL_PATTERN_GRAHAS.map(planet=>({planet,fromRahu:norm(p.get(planet)!.longitude-rahu),fromKetu:norm(p.get(planet)!.longitude-ketu)}));
 const forward=offsets.every(x=>x.fromRahu<=norm(ketu-rahu)),reverse=offsets.every(x=>x.fromKetu<=norm(rahu-ketu));
 return {contained:forward||reverse,forward,reverse,boundary:offsets.some(x=>Math.min(x.fromRahu,360-x.fromRahu,x.fromKetu,360-x.fromKetu)<.0001),offsets,method:"seven_graha_closed_node_arc" as const,verified:false as const};
}
/** Phaladeepika 6.1–5 and BPHS 36.3–6. Named internal rule evidence:
 * separate observable geometry from the full traditional judgment.
 * No predictions, no public feature activation, no expert certification. */
export function evaluateTraditionalPatterns(planets:readonly PlanetPosition[],ascendantSign:string){
 const map=mapPositions(planets,CLASSICAL_PATTERN_GRAHAS),asc=signIndex(ascendantSign);
 if(!map||asc<0)return null;
 const moon=map.get("Moon")!.sign;
 const moonHouse=(g:string)=>house(map.get(g)!.sign,moon),lagnaHouse=(g:string)=>house(map.get(g)!.sign,asc);
 const mahapurusha=STARS.map(planet=>{
  const sign=SIGNS[map.get(planet)!.sign],lagna=lagnaHouse(planet),lunar=moonHouse(planet),dignity=DIGNITY[planet].includes(sign);
  return {name:NAMES[planet],planet,sign,lagnaHouse:lagna,moonHouse:lunar,dignity,fromLagna:dignity&&KENDRA.has(lagna),fromMoon:dignity&&KENDRA.has(lunar)};
 });
 const second=STARS.filter(g=>moonHouse(g)===2),twelfth=STARS.filter(g=>moonHouse(g)===12),joined=STARS.filter(g=>moonHouse(g)===1),angular=STARS.filter(g=>KENDRA.has(moonHouse(g)));
 const lunar={second,twelfth,joined,angular,moonAngularFromLagna:KENDRA.has(lagnaHouse("Moon")),sunapha:second.length>0&&twelfth.length===0,anapha:twelfth.length>0&&second.length===0,durudhara:second.length>0&&twelfth.length>0,kemadrumaBase:second.length===0&&twelfth.length===0};
 const kemadrumaCancellation=lunar.moonAngularFromLagna||joined.length>0||angular.length>0;
 const jupiter=map.get("Jupiter")!,jupiterSign=SIGNS[jupiter.sign],solarDistance=norm(jupiter.longitude-map.get("Sun")!.longitude);
 const gajakesari={lagnaHouse:lagnaHouse("Jupiter"),moonHouse:moonHouse("Jupiter"),angular:KENDRA.has(lagnaHouse("Jupiter"))||KENDRA.has(moonHouse("Jupiter")),debilitated:jupiterSign==="Capricorn",naturalEnemySign:["Gemini","Virgo","Taurus","Libra"].includes(jupiterSign),sunSeparationDegrees:Math.min(solarDistance,360-solarDistance),fullTraditionalVerdict:null};
 // Explicit sign/house placement evidence. A full Gajakesari determination
 // additionally needs reviewed benefic association/aspect and combustion rules.
 const manglikHouses=new Set([1,2,4,7,8,12]);
 const marsReferences=[{reference:"Lagna",house:lagnaHouse("Mars")},{reference:"Moon",house:moonHouse("Mars")},{reference:"Venus",house:house(map.get("Mars")!.sign,map.get("Venus")!.sign)}].map(r=>({...r,hit:manglikHouses.has(r.house)}));
 return {mahapurusha,lunar:{...lunar,kemadrumaCancellation,kemadrumaUnderNamedCancellation:lunar.kemadrumaBase&&!kemadrumaCancellation},gajakesari,manglik:{references:marsReferences,rawHits:marsReferences.filter(r=>r.hit).length,exceptionsApplied:false as const},nodal:evaluateNodalContainment(planets),method:"phaladeepika_6_bphs_36_placement_evidence" as const,publicEnabled:false as const,verified:false as const};
}

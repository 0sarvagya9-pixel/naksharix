// Internal BPHS 27.20 arithmetic, explicitly not traditional certification.
export const GRAHAS=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"] as const;
export type Graha=(typeof GRAHAS)[number];
export type WarPair=readonly [Graha,Graha];
export type SixComponents={sthana:number|null;dig:number|null;kalaBeforeWar:number|null;cheshta:number|null;naisargika:number|null;drik:number|null};
export type StrengthRow={planet:Graha;components:SixComponents};
const STARS=new Set<Graha>(["Mars","Mercury","Jupiter","Venus","Saturn"]);
function finite(x:unknown):x is number{return typeof x==="number"&&Number.isFinite(x);}
function key(p:WarPair){return [...p].sort().join(":");}
/** BPHS 27.20 difference transfer under a separately named north-only
 * comparator. Surya Siddhanta 7.19–23 also mentions brightness, size and
 * other factors; this comparator is not a certified traditional victor. */
export function assembleClassicalStrengthCandidate(input:readonly StrengthRow[],pairs:readonly WarPair[]|null,declinations:Partial<Record<Graha,number>>){
 const map=new Map(input.map(r=>[r.planet,r]));
 const keys=["sthana","dig","kalaBeforeWar","cheshta","naisargika","drik"] as const;
 const rows=GRAHAS.map(planet=>{
  const c=map.get(planet)?.components;
  const valid=!!c&&keys.every(k=>finite(c[k])&&(k==="drik"||c[k]!>=0));
  const prewar=valid?keys.reduce((n,k)=>n+c![k]!,0):null;
  return {planet,components:c??null,prewar,warVirupas:null as number|null,total:null as number|null};
 });
 const issues:string[]=[];
 if(map.size!==7||input.length!==7||rows.some(r=>r.prewar===null||!finite(r.prewar)))issues.push("incomplete or invalid six-component inputs");
 const winners:{pair:WarPair;winner:Graha;loser:Graha;transfer:number}[]=[];
 const used=new Set<Graha>(),seen=new Set<string>();
 if(!pairs)issues.push("encounter detection unavailable");
 else for(const p of pairs){
  const [a,b]=p;
  if(a===b||!STARS.has(a)||!STARS.has(b)||seen.has(key(p))||used.has(a)||used.has(b)){issues.push("duplicate or overlapping encounter; no multi-party transfer convention");continue;}
  seen.add(key(p));used.add(a);used.add(b);
  const x=declinations[a],y=declinations[b];
  if(!finite(x)||!finite(y)||Math.abs(x)>90||Math.abs(y)>90||Math.abs(x-y)<.01){issues.push("north comparator unresolved within 0.01 degree or invalid coordinates");continue;}
  const aTotal=rows.find(r=>r.planet===a)?.prewar,bTotal=rows.find(r=>r.planet===b)?.prewar;
  if(!finite(aTotal)||!finite(bTotal)){issues.push("missing pre-war strengths");continue;}
  winners.push({pair:p,winner:x>y?a:b,loser:x>y?b:a,transfer:Math.abs(aTotal-bTotal)});
 }
 if(!issues.length){
  for(const row of rows){row.warVirupas=winners.reduce((n,w)=>n+(w.winner===row.planet?w.transfer:w.loser===row.planet?-w.transfer:0),0);row.total=row.prewar!+row.warVirupas;}
 }
 return {method:"bphs_difference_north_only_candidate" as const,rows,winners,issues,completeArithmetic:issues.length===0,publicEnabled:false as const,verified:false as const};
}

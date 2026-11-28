// Internal historical calculation candidate, not a modern ephemeris.
// Source: B.V. Raman, Graha and Bhava Balas, articles 88–104 and Tables IV–IX.
// Daily rates computed independently from the public-domain Surya Siddhanta I.29–37.
export const STAR_GRAHAS=["Mars","Mercury","Jupiter","Venus","Saturn"] as const;
export type StarGraha=(typeof STAR_GRAHAS)[number];
const DAY=86_400_000, MERIDIAN=76*240_000, CYCLE=1_577_917_828;
const EPOCH=Date.UTC(1900,0,1)-MERIDIAN;
function norm(value:number){return ((value%360)+360)%360;}
function validAngle(value:unknown):value is number{return typeof value==="number"&&Number.isFinite(value)&&value>=0&&value<360;}
function advance(epoch:number,revolutions:number,days:number,correction=0){return norm(epoch+360*revolutions*days/CYCLE+correction);}
export function calculateRamanEpochMeanCandidate(utc:Date){
 const ms=utc.getTime();if(!Number.isFinite(ms))return null;
 const year=new Date(ms+MERIDIAN).getUTCFullYear();
 // Deliberately bounded research window, not a promise of accuracy throughout it.
 if(year<1900||year>2050)return null;
 const days=(ms-EPOCH)/DAY,t=year-1900;
 const sun=advance(257.4568,4_320_000,days);
 const mean={Mars:advance(270.22,2_296_832,days),Mercury:sun,Jupiter:advance(220.04,364_220,days,-3.33-.0067*t),Venus:sun,Saturn:advance(236.74,146_568,days,5+.001*t)};
 const seeghrocha={Mars:sun,Mercury:advance(164,17_937_060,days,6.67-.00133*t),Jupiter:sun,Venus:advance(328.51,7_022_376,days,-5-.0001*t),Saturn:sun};
 return {utc:utc.toISOString(),days,meanSun:sun,mean,seeghrocha,method:"raman_1900_epoch_continuous_rates_table_ix_candidate" as const,publicEnabled:false as const,verified:false as const};
}
/** A historical mean / modern sidereal true longitude comparison is explicitly
 * a candidate; the common zodiac zero and historical correction model need review. */
export function calculateMotionalEpochCandidate(utc:Date,trueLongitudes:Partial<Record<StarGraha,number>>){
 const epoch=calculateRamanEpochMeanCandidate(utc);
 if(!epoch||!STAR_GRAHAS.every(g=>validAngle(trueLongitudes[g])))return null;
 const rows=STAR_GRAHAS.map(planet=>{
  const mean=epoch.mean[planet],trueLongitude=trueLongitudes[planet]!,seeghrocha=epoch.seeghrocha[planet];
  const delta=norm(trueLongitude-mean+180)-180;
  if(Math.abs(delta)===180)return null;
  const midpoint=norm(mean+delta/2),arc=norm(seeghrocha-midpoint),kendraDegrees=Math.min(arc,360-arc);
  return {planet,mean,trueLongitude,seeghrocha,midpoint,kendraDegrees,virupas:kendraDegrees/3};
 });
 if(rows.some(r=>r===null))return null;
 return {epoch,rows:rows.filter(r=>r!==null),method:"historical_mean_modern_true_candidate" as const,publicEnabled:false as const,verified:false as const};
}

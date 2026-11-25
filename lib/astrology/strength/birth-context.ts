import {calculateInternalChart,type InternalChartInput} from "@/lib/astrology/premium-engine/chart";
import {normalizeBirthDate,normalizeBirthTime,parseBirthDateTime,parseTimezoneOffsetToHours,localBirthToUtcDate,julianDayFromUtc,localSiderealTimeDegrees,normalizeDegrees} from "@/lib/astrology/own-engine/time";
import {lahiriAyanamsa} from "@/lib/astrology/own-engine/zodiac";
import {buildQuadrantBhavaMidpoints,assignMidpointBhava,calculateBhavaBalaEvidence,calculateSaptavargajaEvidence,calculateFivefoldFriendship} from "./classical-components";
import {calculateInternalShadbala,calculateClassicalStrengthBasis,calculateRamanPositionalCandidate} from "./shadbala";
import {calculateSolarStrengthContext,calculateTemporalStrengthEvidence} from "./temporal-components";
import {calculateClassicalCalendarCandidate} from "./calendar-lords";
import {evaluateTraditionalPatterns} from "./traditional-patterns";
import {STAR_GRAHAS,type StarGraha,calculateMotionalEpochCandidate} from "./motional-epoch";
import {GRAHAS,assembleClassicalStrengthCandidate} from "./strength-total";
import {calculateAspectStrengthEvidence,calculateExactDirectionalBala,calculateRamanDrikCandidate,calculateRamanBhavaCandidate} from "./classical-components";

/** Internal named quadrant geometry. Not a change to the approved D1
 * whole-sign chart; do not present these as independently accepted
 * Bhava Bala totals. High-polar geometry is separately gated.
 */
export function calculateBirthBhavaGeometry(input:InternalChartInput){
 const latitude=input.latitude,longitude=input.longitude;
 if(typeof latitude!=="number"||!Number.isFinite(latitude)||Math.abs(latitude)>65)throw Error("BHAVA_LATITUDE_UNQUALIFIED");
 if(typeof longitude!=="number"||!Number.isFinite(longitude)||Math.abs(longitude)>180)throw Error("BHAVA_LONGITUDE_INVALID");
 if(input.ayanamsa!==undefined&&input.ayanamsa!=="lahiri")throw Error("BHAVA_AYANAMSA_UNQUALIFIED");
 if(input.houseSystem!==undefined&&!["whole_sign","Vedic Whole Sign"].includes(input.houseSystem))throw Error("BHAVA_NATAL_HOUSE_SYSTEM_UNQUALIFIED");
 if(input.house_system!==undefined&&!["whole_sign","Vedic Whole Sign"].includes(input.house_system))throw Error("BHAVA_NATAL_HOUSE_SYSTEM_UNQUALIFIED");
 const chart=calculateInternalChart({...input,ayanamsa:"lahiri",houseSystem:"whole_sign"});
 const date=normalizeBirthDate(chart.normalizedInput.dateOfBirth),time=normalizeBirthTime(chart.normalizedInput.timeOfBirth);
 const parts=parseBirthDateTime(date,time),offset=parseTimezoneOffsetToHours(chart.normalizedInput.timezone,date,time);
 const utc=localBirthToUtcDate(parts,offset),jd=julianDayFromUtc(utc);
 const theta=localSiderealTimeDegrees(jd,longitude)*Math.PI/180;
 const eps=(23.439291-0.00000036*(jd-2451545))*Math.PI/180;
 const midheaven=normalizeDegrees(Math.atan2(Math.sin(theta),Math.cos(theta)*Math.cos(eps))*180/Math.PI-lahiriAyanamsa(jd));
 const asc=chart.ascendant.absoluteLongitude;
 if(asc===null||asc===undefined||!Number.isFinite(asc))throw Error("BHAVA_ASCENDANT_UNAVAILABLE");
 const {midpoints}=buildQuadrantBhavaMidpoints(asc,midheaven);
 return {chart,utc:utc.toISOString(),midheaven,ascendant:asc,midpoints,method:"lahiri_equal_ecliptic_quadrant" as const,publicEnabled:false as const,verified:false as const};
}

/** Uses real natal angles and placements, not fake completed planetary
 * strengths. New internal evidence remains separate from paid reports.
 */
export function calculateBirthStrengthEvidence(input:InternalChartInput){
 const geometry=calculateBirthBhavaGeometry(input);
 const planets=geometry.chart.planets.map(p=>({...p,house:typeof p.absoluteLongitude==="number"?assignMidpointBhava(p.absoluteLongitude,geometry.midpoints):null}));
 const friendship=calculateFivefoldFriendship(planets);
 const traditionalPatterns=evaluateTraditionalPatterns(planets.map(p=>({planet:p.planet,sign:p.sign??"",degree:p.degree??undefined,absoluteLongitude:p.absoluteLongitude??undefined,house:p.house??undefined})),geometry.chart.ascendant.sign??"");
 const positional=planets.map(p=>{
  const basis=calculateClassicalStrengthBasis(p);
  if(!basis)return null;
  const dignity=calculateSaptavargajaEvidence(planets,basis.planet);
  return {basis,dignity};
 }).filter(p=>p!==null);
 const engineering=calculateInternalShadbala(planets,{ascendantLongitude:geometry.ascendant,bhavaMidpoints:geometry.midpoints,date:normalizeBirthDate(geometry.chart.normalizedInput.dateOfBirth),localTime:normalizeBirthTime(geometry.chart.normalizedInput.timeOfBirth)});
 const solar=calculateSolarStrengthContext(new Date(geometry.utc),geometry.chart.normalizedInput.latitude,geometry.chart.normalizedInput.longitude);
 const temporal=calculateTemporalStrengthEvidence(planets,solar);
 const calendarCandidate=calculateClassicalCalendarCandidate(solar.sunriseUtc,geometry.chart.normalizedInput.longitude,solar.solarDayLord);
 // Preserve the original unqualified path. Evaluate the named calendar convention separately.
 const temporalWithCalendarCandidate=calendarCandidate?calculateTemporalStrengthEvidence(planets,solar,calendarCandidate):null;
 const bhava=calculateBhavaBalaEvidence(planets,geometry.midpoints,{polarity:temporal.polarity??undefined,aspectReading:"additional_full_mercury_jupiter",birthPhase:solar.birthPhase??undefined});
 const trueLongitudes:Partial<Record<StarGraha,number>>={};
 for(const g of STAR_GRAHAS){const p=planets.find(p=>p.planet===g);if(typeof p?.absoluteLongitude==="number")trueLongitudes[g]=p.absoluteLongitude;}
 const motionalCandidate=calculateMotionalEpochCandidate(new Date(geometry.utc),trueLongitudes);
 const sixComponents=GRAHAS.map(planet=>{
  const p=planets.find(p=>p.planet===planet),pos=positional.find(r=>r.basis.planet===planet),t=temporalWithCalendarCandidate?.rows.find(r=>r.planet===planet);
  const vals=t?Object.entries(t.components).filter(([k])=>k!=="yuddha").map(([,v])=>v):null;
  let kalaBeforeWar=vals&&vals.every(v=>typeof v==="number"&&Number.isFinite(v))?vals.reduce<number>((n,v)=>n+Number(v),0):null;
  const cheshta=planet==="Sun"||planet==="Moon"?t?.luminaryCheshtaBasis??null:motionalCandidate?.rows.find(r=>r.planet===planet)?.virupas??null;
  // Separate the doubled Moon Paksha into two equal terms; Sun Ayana appears in both Kala and Cheshta. Named BPHS 27.18 interpretation only.
  if(planet==="Moon"&&kalaBeforeWar!==null&&cheshta!==null)kalaBeforeWar-=cheshta;
  const sthana=pos?.dignity&&pos.basis.kendradiVirupas!==null?pos.basis.uchchaVirupas+pos.basis.ojayugmaVirupas+pos.basis.kendradiVirupas+pos.basis.drekkanaVirupas+pos.dignity.totalVirupas:null;
  const dig=typeof p?.absoluteLongitude==="number"?calculateExactDirectionalBala(planet,p.absoluteLongitude,geometry.midpoints).virupas:null;
  const drik=typeof p?.absoluteLongitude==="number"&&temporalWithCalendarCandidate?.polarity?calculateAspectStrengthEvidence(planets,p.absoluteLongitude,temporalWithCalendarCandidate.polarity,"additional_full_mercury_jupiter",planet)?.virupas??null:null;
  return {planet,components:{sthana,dig,kalaBeforeWar,cheshta,naisargika:pos?.basis.naisargikaVirupas??null,drik}};
 });
 const classicalStrengthCandidate=assembleClassicalStrengthCandidate(sixComponents,temporalWithCalendarCandidate?.warPairs??null,solar.declinations);
 const candidateLords=classicalStrengthCandidate.completeArithmetic&&classicalStrengthCandidate.rows.every(r=>typeof r.total==="number"&&r.total>=0)?Object.fromEntries(classicalStrengthCandidate.rows.map(r=>[r.planet,r.total!])):undefined;
 const bhavaCandidate=calculateBhavaBalaEvidence(planets,geometry.midpoints,{polarity:temporal.polarity??undefined,aspectReading:"additional_full_mercury_jupiter",birthPhase:solar.birthPhase??undefined,lordStrengthVirupas:candidateLords});
 // A controlled one-variable substitution; other components remain the
 // original named candidates, so this is NOT a full Raman Shadbala implementation.
 const ramanDrik=GRAHAS.map(planet=>calculateRamanDrikCandidate(planets,planet));
 const aspectVariantStrength=assembleClassicalStrengthCandidate(sixComponents.map(r=>({...r,components:{...r.components,drik:ramanDrik.find(x=>x?.planet===r.planet)?.virupas??null}})),temporalWithCalendarCandidate?.warPairs??null,solar.declinations);
 const variantLords=aspectVariantStrength.completeArithmetic&&aspectVariantStrength.rows.every(r=>typeof r.total==="number"&&r.total>=0)?Object.fromEntries(aspectVariantStrength.rows.map(r=>[r.planet,r.total!])):undefined;
 const ramanBhavaCandidate=calculateRamanBhavaCandidate(planets,geometry.midpoints,{lordStrengthVirupas:variantLords});
 const wholeSignLordBhavaCandidate=calculateRamanBhavaCandidate(planets,geometry.midpoints,{lordConvention:"whole_sign_lagna",lordStrengthVirupas:variantLords});
 const ramanPositional=GRAHAS.map(planet=>calculateRamanPositionalCandidate(planets,planet,geometry.ascendant));
 const positionalVariantStrength=assembleClassicalStrengthCandidate(aspectVariantStrength.rows.map(r=>({planet:r.planet,components:{...sixComponents.find(x=>x.planet===r.planet)!.components,sthana:ramanPositional.find(x=>x?.planet===r.planet)?.virupas??null,drik:ramanDrik.find(x=>x?.planet===r.planet)?.virupas??null}})),temporalWithCalendarCandidate?.warPairs??null,solar.declinations);
 const positionalLords=positionalVariantStrength.completeArithmetic&&positionalVariantStrength.rows.every(r=>typeof r.total==="number"&&r.total>=0)?Object.fromEntries(positionalVariantStrength.rows.map(r=>[r.planet,r.total!])):undefined;
 const positionalVariantBhava=calculateRamanBhavaCandidate(planets,geometry.midpoints,{lordConvention:"whole_sign_lagna",lordStrengthVirupas:positionalLords});
 return {geometry,friendship,traditionalPatterns,positional,engineering,solar,temporal,calendarCandidate,temporalWithCalendarCandidate,bhava,motionalCandidate,classicalStrengthCandidate,bhavaCandidate,ramanDrik,aspectVariantStrength,ramanBhavaCandidate,wholeSignLordBhavaCandidate,ramanPositional,positionalVariantStrength,positionalVariantBhava,publicEnabled:false as const,verified:false as const,fullShadbalaVerified:false as const,fullBhavaBalaVerified:false as const};
}

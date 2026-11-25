import {calculateInternalChart,type InternalChartInput} from "@/lib/astrology/premium-engine/chart";
import {normalizeBirthDate,normalizeBirthTime,parseBirthDateTime,parseTimezoneOffsetToHours,localBirthToUtcDate,julianDayFromUtc,localSiderealTimeDegrees,normalizeDegrees} from "@/lib/astrology/own-engine/time";
import {lahiriAyanamsa} from "@/lib/astrology/own-engine/zodiac";
import {buildQuadrantBhavaMidpoints,assignMidpointBhava,calculateBhavaBalaEvidence,calculateSaptavargajaEvidence,calculateFivefoldFriendship} from "./classical-components";
import {calculateInternalShadbala,calculateClassicalStrengthBasis} from "./shadbala";

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
 const positional=planets.map(p=>{
  const basis=calculateClassicalStrengthBasis(p);
  if(!basis)return null;
  const dignity=calculateSaptavargajaEvidence(planets,basis.planet);
  return {basis,dignity};
 }).filter(p=>p!==null);
 const engineering=calculateInternalShadbala(planets,{ascendantLongitude:geometry.ascendant,bhavaMidpoints:geometry.midpoints,date:normalizeBirthDate(geometry.chart.normalizedInput.dateOfBirth),localTime:normalizeBirthTime(geometry.chart.normalizedInput.timeOfBirth)});
 return {geometry,friendship,positional,engineering,bhava:calculateBhavaBalaEvidence(planets,geometry.midpoints),publicEnabled:false as const,verified:false as const,fullShadbalaVerified:false as const,fullBhavaBalaVerified:false as const};
}

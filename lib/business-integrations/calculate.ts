import "server-only";
import {calculateInternalChart} from "@/lib/astrology/premium-engine/chart";
import {calculatePremiumPanchang} from "@/lib/astrology/premium-engine/panchang";
import {getAstrologyProvider,getActiveAstrologyProviderName} from "@/lib/astrology/provider";
import {buildPremiumCompatibilityReport,validateAshtakootFactors} from "@/lib/matching/kundli-matching";
import {renderPanchangWidget} from "@/lib/business-integrations/contract";
import type {BusinessCalculation} from "@/lib/business-integrations/input";
import type {AstrologyBirthInput,BirthChartData} from "@/lib/astrology/types";
const disclaimer="Internally computed traditional framework; not externally certified, not a prediction, and not a substitute for personal consent or professional advice.";
function asBirth(b:{date:string;time:string;latitude:number;longitude:number;offsetMinutes:number},label:string):AstrologyBirthInput{
 return {name:label,dateOfBirth:b.date,timeOfBirth:b.time,birthPlace:"Supplied coordinates",latitude:b.latitude,longitude:b.longitude,timezone:String(b.offsetMinutes/60),language:"en"};
}
export async function calculateBusinessResult(input:BusinessCalculation,brand:string){
 if(input.scope==="chart"){
 const chart=calculateInternalChart({...asBirth(input.birth,"Subject"),ayanamsa:"lahiri",houseSystem:"whole_sign"});
 if(chart.planets.length!==9||chart.planets.some(p=>typeof p.absoluteLongitude!=="number"||!Number.isFinite(p.absoluteLongitude)))throw Error("CHART_UNAVAILABLE");
 return {ascendant:chart.ascendant,moon:chart.moon,nakshatra:chart.nakshatra,planets:chart.planets,houses:chart.houses,ayanamsa:chart.ayanamsa,calculation:chart.metadata,disclaimer};
 }
 if(input.scope==="matching"){
 if(getActiveAstrologyProviderName()!=="own_engine")throw Error("MATCHING_PROVIDER_UNAVAILABLE");
 const first=asBirth(input.first,"Person A"),second=asBirth(input.second,"Person B");
 const provider=getAstrologyProvider();
 const [a,b]=await Promise.all([provider.getBirthChart(first) as Promise<BirthChartData>,provider.getBirthChart(second) as Promise<BirthChartData>]);
 if(a.calculationMeta?.provider!=="own_engine"||b.calculationMeta?.provider!=="own_engine")throw Error("MATCHING_PROVIDER_INVALID");
 const report=buildPremiumCompatibilityReport(first,second,a,b,"en",input.requestId);
 const factors=report.gunaMilan.ashtakoot;
 if(factors.length!==8||factors.some(f=>f.available===false)||!validateAshtakootFactors(factors).ok)throw Error("MATCHING_INCOMPLETE");
 return {score:report.gunaMilan.totalScore,maximum:36,factors:factors.map(f=>({name:f.koot,score:f.score,maximum:f.maxScore})),method:report.matchingMode,disclaimer:disclaimer+" A traditional score must not determine whether two people should marry."};
 }
 const p=calculatePremiumPanchang({date:input.location.date,latitude:input.location.latitude,longitude:input.location.longitude,timezone:input.location.offsetMinutes/60,place:"Supplied coordinates"});
 const result={date:p.date,timezone:p.timezone,tithi:p.tithi,paksha:p.paksha,nakshatra:p.nakshatra,nakshatraPada:p.nakshatraPada,sunrise:p.sunrise,sunset:p.sunset,moonrise:p.moonrise,moonset:p.moonset,yoga:p.yoga,karana:p.karana,rahuKaal:p.rahuKaal,abhijitMuhurat:p.abhijitMuhurat,calculation:p.metadata,disclaimer};
 return input.scope==="panchang-widget"?{...result,html:renderPanchangWidget({brand,date:p.date,tithi:p.tithi,nakshatra:p.nakshatra,sunrise:p.sunrise,sunset:p.sunset})}:result;
}

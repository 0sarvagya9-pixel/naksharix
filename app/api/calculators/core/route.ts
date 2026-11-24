import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok, handleApiError, validateJson } from "@/lib/api";
import { getAstrologyProvider, AstrologyProviderUnavailableError } from "@/lib/astrology/provider";
import { normalizeBirthDate, normalizeBirthTime, parseTimezoneOffsetToHours } from "@/lib/astrology/own-engine/time";
import { calculateNumerology } from "@/lib/astrology/engine";
import type { BirthChartData } from "@/lib/astrology/types";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/),
  birthPlace: z.string().trim().min(2).max(160),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().trim().min(1).max(100),
  locale: z.enum(["en","hi","hinglish"]).default("en")
});
export async function POST(request: NextRequest) {
  try {
    const body=await validateJson(request,schema);
    let dateOfBirth:string,timeOfBirth:string;
    try {
      dateOfBirth=normalizeBirthDate(body.birthDate);
      timeOfBirth=normalizeBirthTime(body.birthTime);
      parseTimezoneOffsetToHours(body.timezone,dateOfBirth,timeOfBirth);
    } catch {return fail("Select a valid birth date, local time and timezone. Ambiguous clock changes require the actual birth-time UTC offset.",422);}
    const chart=await getAstrologyProvider().getBirthChart({
      name:body.name,dateOfBirth,timeOfBirth,birthPlace:body.birthPlace,
      latitude:body.latitude,longitude:body.longitude,timezone:body.timezone,language:body.locale
    }) as BirthChartData;
    const a=chart.avakhada,m=chart.calculationMeta;
    if(!m || m.provider==="mock" || !a?.moonSign || !a.sunSign || !a.ascendant || !a.nakshatra || !Number.isFinite(m.ayanamsaDegree))
      return fail("Calculated birth-chart data is unavailable. No estimated values are substituted.",503);
    const guidance=body.locale==="hi"?"चंद्र राशि, सूर्य राशि, लग्न और नक्षत्र चुनी गई जन्म जानकारी से निकाले गए हैं। ये स्वतंत्र खगोलीय सत्यापन का दावा नहीं हैं। संबंधों के लिए दो व्यक्तियों की वास्तविक जन्म जानकारी आवश्यक है।":body.locale==="hinglish"?"Moon sign, Sun sign, lagna aur nakshatra aapki birth details se calculate hue hain. Independent verification ka claim nahi hai. Relationship matching ke liye dono logon ki birth details chahiye.":"Signs and Nakshatra are calculated from the birth details using the selected astrology engine. Independent external certification is not claimed. Use two actual birth profiles for traditional compatibility; no single-person love or friendship percentage is calculated.";
    return ok({calculators:{moonSign:a.moonSign,sunSign:a.sunSign,ascendant:a.ascendant,nakshatra:a.nakshatra,ayanamsa:m.ayanamsaDegree.toFixed(4)+"° "+m.ayanamsaName,calculationMeta:m,loveScore:null,friendshipScore:null,numerology:calculateNumerology(body.name,new Date(dateOfBirth+"T12:00:00Z")),guidance}});
  } catch(error){
    if(error instanceof AstrologyProviderUnavailableError)return fail("Birth-chart calculation is temporarily unavailable.",503);
    return handleApiError(error);
  }
}

import { NextRequest } from "next/server";
import { fail, ok, handleApiError, validateJson } from "@/lib/api";
import { matchMakingSchema } from "@/lib/validations/astrology";
import { getAstrologyProvider, AstrologyProviderUnavailableError } from "@/lib/astrology/provider";
import { normalizeBirthInput } from "@/lib/astrology/normalize";
import { normalizeBirthDate, normalizeBirthTime } from "@/lib/astrology/own-engine/time";
import { buildPremiumCompatibilityReport } from "@/lib/matching/kundli-matching";
import { createBirthHash, matchCacheKey } from "@/lib/report-hash";
import type { BirthChartData } from "@/lib/astrology/types";

/** Backward-compatible response using the actual chart-based Ashtakoot engine.
 * No seeded values, no third-party AI request containing birth information.
 */
export async function POST(request:NextRequest){
  try {
    const body=await validateJson(request,matchMakingSchema);
    const language=body.locale;
    const toInput=(person:typeof body.bride)=>normalizeBirthInput({
      name:person.name,gender:person.gender,dateOfBirth:normalizeBirthDate(person.birthDate.toISOString().slice(0,10)),timeOfBirth:normalizeBirthTime(person.birthTime),birthPlace:person.birthPlace,latitude:person.latitude,longitude:person.longitude,timezone:person.timezone,language
    });
    const bride=toInput(body.bride),groom=toInput(body.groom);
    const provider=getAstrologyProvider();
    const [a,b]=await Promise.all([provider.getBirthChart(bride) as Promise<BirthChartData>,provider.getBirthChart(groom) as Promise<BirthChartData>]);
    if(!a.calculationMeta||!b.calculationMeta||a.calculationMeta.provider==="mock"||b.calculationMeta.provider==="mock")return fail("Actual matching charts are unavailable.",503);
    const report=buildPremiumCompatibilityReport(bride,groom,a,b,language,matchCacheKey(createBirthHash(bride),createBirthHash(groom),language));
    const g=report.gunaMilan;
    if(g.ashtakoot.length!==8||g.ashtakoot.some(f=>!f.available)||g.maxScore!==36)return fail("Insufficient chart data for a complete traditional Guna Milan result.",422);
    return ok({match:{guna:g.totalScore,maxGuna:g.maxScore,matchPercentage:g.percentage,compatibilityScore:g.percentage,compatibilityScoreMeaning:"Traditional Guna Milan proportion only; not a probability of marriage success.",factors:g.ashtakoot.map(f=>({name:f.name,score:f.score,max:f.maxScore,meaning:f.meaning})),manglikCompatible:report.manglikComparison?.compatible??null,marriagePrediction:g.verdict,relationshipAnalysis:report.disclaimer,emotionalCompatibility:report.moonCompatibility,careerFinanceCompatibility:report.disclaimer,marriageRecommendation:report.disclaimer,remedies:report.practicalGuidance?.join(" ")??report.disclaimer,interpretation:report.aiSummary,matchingMode:report.matchingMode,limitations:report.limitationNotes}});
  }catch(error){if(error instanceof AstrologyProviderUnavailableError)return fail("Matching is temporarily unavailable.",503);return handleApiError(error);}
}

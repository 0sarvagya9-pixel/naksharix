import type { CanonicalPlanet } from "@/lib/astrology/ephemeris/types";
import {divisionCoordinates} from "@/lib/astrology/varga/partition";
import type { AshtakvargaScore, PartialAshtakvargaResult, StrengthFoundationStatus } from "@/lib/astrology/strength/types";

const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"] as const;
type ClassicalPlanet = "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn";
type Reference = ClassicalPlanet | "Ascendant";
type RuleTable = Record<ClassicalPlanet, Record<Reference, readonly number[]>>;

// Raw Bhinna contribution houses matching the named Brihat Jataka IX.1–7
// (N. Chidambaram Aiyar translation) convention. Other textual/software
// traditions differ in some cells. Never silently substitute them.
const rules: RuleTable = {
  Sun: {
    Sun: [1, 2, 4, 7, 8, 9, 10, 11], Moon: [3, 6, 10, 11], Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12], Jupiter: [5, 6, 9, 11], Venus: [6, 7, 12],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11], Ascendant: [3, 4, 6, 10, 11, 12]
  },
  Moon: {
    Sun: [3, 6, 7, 8, 10, 11], Moon: [1, 3, 6, 7, 10, 11], Mars: [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11], Jupiter: [1, 4, 7, 8, 10, 11, 12], Venus: [3, 4, 5, 7, 9, 10, 11],
    Saturn: [3, 5, 6, 11], Ascendant: [3, 6, 10, 11]
  },
  Mars: {
    Sun: [3, 5, 6, 10, 11], Moon: [3, 6, 11], Mars: [1, 2, 4, 7, 8, 10, 11], Mercury: [3, 5, 6, 11],
    Jupiter: [6, 10, 11, 12], Venus: [6, 8, 11, 12], Saturn: [1, 4, 7, 8, 9, 10, 11], Ascendant: [1, 3, 6, 10, 11]
  },
  Mercury: {
    Sun: [5, 6, 9, 11, 12], Moon: [2, 4, 6, 8, 10, 11], Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12], Jupiter: [6, 8, 11, 12], Venus: [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11], Ascendant: [1, 2, 4, 6, 8, 10, 11]
  },
  Jupiter: {
    Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11], Moon: [2, 5, 7, 9, 11], Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11], Jupiter: [1, 2, 3, 4, 7, 8, 10, 11], Venus: [2, 5, 6, 9, 10, 11],
    Saturn: [3, 5, 6, 12], Ascendant: [1, 2, 4, 5, 6, 7, 9, 10, 11]
  },
  Venus: {
    Sun: [8, 11, 12], Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12], Mars: [3, 5, 6, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11], Jupiter: [5, 8, 9, 10, 11], Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn: [3, 4, 5, 8, 9, 10, 11], Ascendant: [1, 2, 3, 4, 5, 8, 9, 11]
  },
  Saturn: {
    Sun: [1, 2, 4, 7, 8, 10, 11], Moon: [3, 6, 11], Mars: [3, 5, 6, 10, 11, 12],
    Mercury: [6, 8, 9, 10, 11, 12], Jupiter: [5, 6, 11, 12], Venus: [6, 11, 12],
    Saturn: [3, 5, 6, 11], Ascendant: [1, 3, 4, 6, 10, 11]
  }
};

const expectedTotals: Record<ClassicalPlanet, number> = {
  Sun: 48,
  Moon: 49,
  Mars: 39,
  Mercury: 54,
  Jupiter: 56,
  Venus: 52,
  Saturn: 39
};

export function getAshtakvargaFoundationStatus(): StrengthFoundationStatus {
  return {
    module: "ashtakvarga",
    verificationLevel: "needs_external_validation",
    publicEnabled: false,
    verified: false,
    requiredBeforeActivation: [
      "Independent reference fixtures for all seven Bhinna Ashtakavarga tables.",
      "Sarva Ashtakavarga sign-by-sign comparison against trusted software.",
      "Reviewed Trikona/Ekadhipatya reduction rules before reduced-score features.",
      "Transit interpretation rules only after base bindu scores are externally verified."
    ]
  };
}

function isClassicalPlanet(planet: CanonicalPlanet["planet"]): planet is ClassicalPlanet {
  return ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"].includes(planet);
}

function signIndex(sign: string | null | undefined) {
  return signs.findIndex((value) => value === sign);
}

function buildReferenceSigns(planets: CanonicalPlanet[], ascendantSign: string) {
  const result = new Map<Reference, number>();
  const seen=new Set<Reference>(),invalid:string[]=[];
  for (const planet of planets) {
    if (!isClassicalPlanet(planet.planet)) continue;
    if(seen.has(planet.planet)){invalid.push("Duplicate classical reference: "+planet.planet);continue;}
    seen.add(planet.planet);
    const index = signIndex(planet.sign);
    if(index<0){invalid.push("Unknown sign: "+planet.planet);continue;}
    if(planet.absoluteLongitude!=null&&(!Number.isFinite(planet.absoluteLongitude)||divisionCoordinates(planet.absoluteLongitude,1).signIndex!==index)){invalid.push("Inconsistent longitude/sign: "+planet.planet);continue;}
    if(planet.degree!=null&&(!Number.isFinite(planet.degree)||planet.degree<0||planet.degree>=30)){invalid.push("Invalid within-sign degree: "+planet.planet);continue;}
    result.set(planet.planet,index);
  }
  const ascendantIndex = signIndex(ascendantSign);
  if (ascendantIndex >= 0) result.set("Ascendant", ascendantIndex);
  return {references:result,invalid};
}

function targetSign(referenceSign: number, relativeHouse: number) {
  return (referenceSign + relativeHouse - 1) % 12;
}

export function calculateInternalAshtakvarga(planets: CanonicalPlanet[], ascendantSign: string): PartialAshtakvargaResult {
  const {references,invalid} = buildReferenceSigns(planets, ascendantSign);
  const requiredReferences: Reference[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Ascendant"];
  const missing = requiredReferences.filter((reference) => !references.has(reference));
  if(invalid.length||missing.length)return createAshtakvargaDependencyResult(planets,[...invalid,...(missing.length?[`Missing sign placement for: ${missing.join(", ")}`]:[])].join("; "));

  const scores: AshtakvargaScore[] = (Object.keys(rules) as ClassicalPlanet[]).map((planet) => {
    const bhinna = Array.from({ length: 12 }, () => 0);
    const contributions=requiredReferences.map(reference=>{
      const referenceSign=references.get(reference)!;
      const bindus=Array.from({length:12},()=>0);
      for(const house of rules[planet][reference])bindus[targetSign(referenceSign,house)]=1;
      bindus.forEach((value,i)=>bhinna[i]+=value);
      return {reference,sign:signs[referenceSign],bindus};
    });
    return {planet,bhinna,contributions,verified:false};
  });

  const sarva = Array.from({ length: 12 }, (_, sign) => scores.reduce<number>((sum, score) => sum + Number(score.bhinna[sign] ?? 0), 0));
  for (const score of scores) score.sarva = sarva;

  const checksums: Record<string, number> = Object.fromEntries(
    scores.map((score) => [score.planet, score.bhinna.reduce<number>((sum, value) => sum + Number(value ?? 0), 0)])
  );
  checksums.Sarva = sarva.reduce((sum, value) => sum + value, 0);
  const checksumFailures = (Object.keys(expectedTotals) as ClassicalPlanet[]).filter((planet) => checksums[planet] !== expectedTotals[planet]);
  if (checksums.Sarva !== 337) checksumFailures.push("Sun");
  if (checksumFailures.length) throw new Error(`Ashtakavarga rule checksum failed: ${[...new Set(checksumFailures)].join(", ")}`);

  return {
    scores,
    sarva,
    checksums,
    method:"brihat_jataka_aiyar_raw",
    verificationLevel: "needs_external_validation",
    publicEnabled: false,
    missingDependencies: ["Independent reference-software fixtures for sign-by-sign validation."],
    limitations: [
      "Bhinna and Sarva bindu distributions are calculated from the internal classical rule table.",
      "Fixed Bhinna totals and the 337-point Sarva checksum are enforced at runtime.",
      "Results remain non-public until independent chart fixtures agree sign by sign.",
      "Raw BAV/SAV are unreduced and preserve the 337 checksum. The separate named Aiyar reduction function must not be added to raw SAV."
    ]
  };
}

export function createAshtakvargaDependencyResult(planets: CanonicalPlanet[], reason = "Ascendant and seven classical planet sign placements are required."): PartialAshtakvargaResult {
  return {
    scores: planets.filter((planet) => isClassicalPlanet(planet.planet)).map((planet) => ({
      planet: planet.planet,
      bhinna: Array.from({ length: 12 }, () => null),
      sarva: undefined,
      verified: false
    })),
    verificationLevel: "blocked_until_verified_formula",
    publicEnabled: false,
    missingDependencies: [reason, "Trusted external planet-wise bindu fixtures."],
    limitations: [
      "No placeholder bindu values are emitted when required chart references are missing.",
      "Public Ashtakavarga remains disabled until formula output is fixture-verified."
    ]
  };
}

export const ASHTAKVARGA_FIXED_TOTALS = { ...expectedTotals, Sarva: 337 } as const;


/** Separate non-predictive reduction method: Brihat Jataka IX, Aiyar
 * translation, notes on Trikona and Ekadhipatya. Occupancy is explicit
 * and uses seven classical grahas, not a hidden node/ascendant convention.
 * The returned reduced row is never substituted for raw BAV or SAV.
 */
export function reduceAiyarAshtakvarga(raw:readonly number[],occupiedSigns:readonly string[]){
 if(raw.length!==12||raw.some(n=>!Number.isInteger(n)||n<0||n>8))throw Error("INVALID_BAV_ROW");
 if(occupiedSigns.some(s=>signIndex(s)<0))throw Error("INVALID_OCCUPIED_SIGN");
 const occupied=new Set(occupiedSigns.map(signIndex));
 const trikona=[...raw];
 for(let start=0;start<4;start++){
  const ix=[start,start+4,start+8],values=ix.map(i=>trikona[i]),nonzero=values.filter(v=>v>0);
  if(nonzero.length<=1){for(const i of ix)trikona[i]=0;}
  else if(nonzero.length===3){const minimum=Math.min(...values);for(const i of ix)trikona[i]-=minimum;}
 }
 const reduced=[...trikona];
 for(const [a,b] of [[0,7],[1,6],[2,5],[8,11],[9,10]]){
  if(!reduced[a]||!reduced[b]||(occupied.has(a)&&occupied.has(b)))continue;
  if(!occupied.has(a)&&!occupied.has(b)){
   if(reduced[a]===reduced[b]){reduced[a]=0;reduced[b]=0;}
   else if(reduced[a]>reduced[b])reduced[a]=reduced[b];else reduced[b]=reduced[a];
  }else{
   const present=occupied.has(a)?a:b,empty=present===a?b:a;
   reduced[empty]=reduced[empty]>reduced[present]?reduced[present]:0;
  }
 }
 return {method:"brihat_jataka_aiyar_reductions" as const,raw:[...raw],trikona,ekadhipatya:reduced,
  total:reduced.reduce((sum,n)=>sum+n,0),publicEnabled:false as const,verified:false as const};
}

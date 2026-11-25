import type { CanonicalPlanet } from "@/lib/astrology/ephemeris/types";
import {classicalVargaCoordinates,type ClassicalVargaKey} from "@/lib/astrology/varga/partition";
import {calculateSaptavargajaEvidence,calculateExactDirectionalBala} from "@/lib/astrology/strength/classical-components";
import type { PartialShadbalaResult, ShadbalaComponent, ShadbalaPlanetScore, StrengthFoundationStatus } from "@/lib/astrology/strength/types";

const classicalPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;
type ClassicalPlanet = (typeof classicalPlanets)[number];
const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"] as const;

const naisargika: Record<ClassicalPlanet, number> = { Sun: 60, Moon: 51.43, Venus: 42.86, Jupiter: 34.29, Mercury: 25.71, Mars: 17.14, Saturn: 8.57 };
const exaltationLongitude: Record<ClassicalPlanet, number> = { Sun: 10, Moon: 33, Mars: 298, Mercury: 165, Jupiter: 95, Venus: 357, Saturn: 200 };
const strongestHouse: Record<ClassicalPlanet, number> = { Sun: 10, Mars: 10, Jupiter: 1, Mercury: 1, Saturn: 7, Moon: 4, Venus: 4 };

export type InternalShadbalaContext = { ascendantLongitude: number; localTime?: string; date?: string; bhavaMidpoints?: readonly number[] };

export function getShadbalaFoundationStatus(): StrengthFoundationStatus {
  return {
    module: "shadbala",
    verificationLevel: "needs_external_validation",
    publicEnabled: false,
    verified: false,
    requiredBeforeActivation: [
      "Independent full-component Shadbala fixtures from trusted reference software.",
      "Planet motion-speed fixtures to calibrate the conservative direct-motion Cheshta fallback.",
      "Sun declination fixtures for Ayana Bala calibration.",
      "Planetary-war fixtures for Yuddha Bala edge cases.",
      "Accepted tolerance per component before public strength interpretation."
    ]
  };
}

function isClassicalPlanet(planet: CanonicalPlanet["planet"]): planet is ClassicalPlanet {
  return classicalPlanets.includes(planet as ClassicalPlanet);
}

function normalize(value: number) {
  return ((value % 360) + 360) % 360;
}

function angularDistance(a: number, b: number) {
  const difference = Math.abs(normalize(a) - normalize(b));
  return Math.min(difference, 360 - difference);
}

function absoluteLongitude(planet: CanonicalPlanet) {
  if (typeof planet.absoluteLongitude === "number") return Number.isFinite(planet.absoluteLongitude)?normalize(planet.absoluteLongitude):null;
  const index = signs.indexOf(planet.sign as (typeof signs)[number]);
  return index >= 0 && typeof planet.degree === "number" && Number.isFinite(planet.degree) && planet.degree>=0 && planet.degree<30 ? normalize(index * 30 + planet.degree) : null;
}

export function shadbalaSaptavargaSigns(longitude:number){
 const keys:ClassicalVargaKey[]=["D1","D2","D3","D7","D9","D12","D30"];
 return keys.map(key=>signs[classicalVargaCoordinates(key,longitude).signIndex]);
}

function uchchaBala(planet: ClassicalPlanet, longitude: number) {
  return round((angularDistance(longitude, normalize(exaltationLongitude[planet] + 180)) / 180) * 60);
}

function kendradiBala(house: number | null | undefined) {
  if (!house) return 0;
  if ([1, 4, 7, 10].includes(house)) return 60;
  return [2, 5, 8, 11].includes(house) ? 30 : 15;
}

function drekkanaBala(planet: ClassicalPlanet, longitude: number) {
  const third = Math.min(2, Math.floor((normalize(longitude) % 30) / 10));
  const preferred = ["Sun", "Mars", "Jupiter"].includes(planet) ? 0 : ["Moon", "Venus"].includes(planet) ? 1 : 2;
  return third === preferred ? 15 : 0;
}

function ojayugmaBala(planet: ClassicalPlanet, longitude: number) {
  const rashiOdd = Math.floor(normalize(longitude) / 30) % 2 === 0;
  const d9 = shadbalaSaptavargaSigns(longitude)[4];
  const d9Odd = signs.indexOf(d9 as (typeof signs)[number]) % 2 === 0;
  const preferredOdd = planet!=="Moon"&&planet!=="Venus";
  return (rashiOdd === preferredOdd ? 15 : 0) + (d9Odd === preferredOdd ? 15 : 0);
}

// Individually traceable BPHS 27.1–6 subcomponents, not a complete strength.
export function calculateClassicalStrengthBasis(planet:CanonicalPlanet){
 if(!isClassicalPlanet(planet.planet))return null;
 const longitude=absoluteLongitude(planet);
 if(longitude===null)return null;
 const validHouse=Number.isInteger(planet.house)&&Number(planet.house)>=1&&Number(planet.house)<=12;
 return {planet:planet.planet,uchchaVirupas:uchchaBala(planet.planet,longitude),
  naisargikaVirupas:60*(["Saturn","Mars","Mercury","Jupiter","Venus","Moon","Sun"].indexOf(planet.planet)+1)/7,
  ojayugmaVirupas:ojayugmaBala(planet.planet,longitude),
  kendradiVirupas:validHouse?kendradiBala(planet.house):null,
  drekkanaVirupas:drekkanaBala(planet.planet,longitude),
  saptavargaSigns:shadbalaSaptavargaSigns(longitude),
  method:"classical_component_basis_only" as const,fullShadbalaVerified:false as const};
}
function sthanaBala(planet: ClassicalPlanet, value: CanonicalPlanet, longitude: number,planets:CanonicalPlanet[]) {
  const evidence=calculateSaptavargajaEvidence(planets,planet);
  if(!evidence)return null;
  const saptavargaja=evidence.totalVirupas;
  return round(uchchaBala(planet, longitude) + saptavargaja + ojayugmaBala(planet, longitude) + kendradiBala(value.house) + drekkanaBala(planet, longitude));
}

function digBala(planet: ClassicalPlanet, longitude: number, ascendantLongitude: number) {
  const strongCusp = normalize(ascendantLongitude + (strongestHouse[planet] - 1) * 30);
  const weakCusp = normalize(strongCusp + 180);
  return round((angularDistance(longitude, weakCusp) / 180) * 60);
}

function parseLocalHour(localTime?: string) {
  const match = localTime?.match(/^(\d{1,2}):(\d{2})/);
  return match ? Math.min(24, Math.max(0, Number(match[1]) + Number(match[2]) / 60)) : 12;
}

function natonnataBala(planet: ClassicalPlanet, hour: number) {
  if (planet === "Mercury") return 60;
  const day = 60 * (1 - Math.min(12, Math.abs(hour - 12)) / 12);
  return round(["Sun", "Jupiter", "Venus"].includes(planet) ? day : 60 - day);
}

function pakshaValues(planets: CanonicalPlanet[]) {
  const sun = planets.find((planet) => planet.planet === "Sun");
  const moon = planets.find((planet) => planet.planet === "Moon");
  const sunLong = sun ? absoluteLongitude(sun) : null;
  const moonLong = moon ? absoluteLongitude(moon) : null;
  if (sunLong === null || moonLong === null) return { benefic: 30, malefic: 30, moon: 30 };
  const elongation = normalize(moonLong - sunLong);
  const arc = elongation <= 180 ? elongation : 360 - elongation;
  const benefic = round((arc / 180) * 60);
  return { benefic, malefic: round(60 - benefic), moon: benefic };
}

function tribhagaBala(planet: ClassicalPlanet, hour: number) {
  const day = hour >= 6 && hour < 18;
  const segment = Math.min(2, Math.floor(((day ? hour - 6 : (hour + 6) % 24) / 12) * 3));
  if (planet === "Jupiter") return 60;
  return (day ? ["Mercury", "Sun", "Saturn"] : ["Moon", "Venus", "Mars"])[segment] === planet ? 60 : 0;
}

function weekdayBala(planet: ClassicalPlanet, date?: string) {
  if (!date) return 0;
  const value = new Date(`${date.slice(0, 10)}T12:00:00.000Z`);
  if (Number.isNaN(value.getTime())) return 0;
  return ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"][value.getUTCDay()] === planet ? 45 : 0;
}

function horaBala(planet: ClassicalPlanet, hour: number, date?: string) {
  if (!date) return 0;
  const value = new Date(`${date.slice(0, 10)}T12:00:00.000Z`);
  if (Number.isNaN(value.getTime())) return 0;
  const weekday = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as ClassicalPlanet[];
  const order = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"] as ClassicalPlanet[];
  const start = order.indexOf(weekday[value.getUTCDay()]);
  const index = Math.floor((hour + 18) % 24);
  return order[(start + index) % 7] === planet ? 60 : 0;
}

function kalaBala(planet: ClassicalPlanet, planets: CanonicalPlanet[], context: InternalShadbalaContext) {
  const hour = parseLocalHour(context.localTime);
  const paksha = pakshaValues(planets);
  const benefic = ["Jupiter", "Venus", "Mercury"].includes(planet) ? paksha.benefic : paksha.malefic;
  const pakshaBala = planet === "Moon" ? paksha.moon : benefic;
  return round(natonnataBala(planet, hour) + pakshaBala + tribhagaBala(planet, hour) + weekdayBala(planet, context.date) + horaBala(planet, hour, context.date));
}

function cheshtaBala(planet: ClassicalPlanet, value: CanonicalPlanet, planets: CanonicalPlanet[], context: InternalShadbalaContext) {
  if (planet === "Moon") return pakshaValues(planets).moon;
  if (planet === "Sun") return natonnataBala("Sun", parseLocalHour(context.localTime));
  return value.retrograde === true ? 60 : value.retrograde === false ? 15 : 7.5;
}

function relativeHouse(fromSign: string | null | undefined, toSign: string | null | undefined) {
  const from = signs.findIndex((sign) => sign === fromSign);
  const to = signs.findIndex((sign) => sign === toSign);
  return from < 0 || to < 0 ? null : ((to - from + 12) % 12) + 1;
}

function aspectTargets(source: CanonicalPlanet) {
  return [7, ...(source.planet === "Mars" ? [4, 8] : source.planet === "Jupiter" ? [5, 9] : source.planet === "Saturn" ? [3, 10] : [])];
}

function drikBala(target: CanonicalPlanet, planets: CanonicalPlanet[]) {
  let score = 0;
  for (const source of planets) {
    if (source.planet === target.planet || !isClassicalPlanet(source.planet)) continue;
    const house = relativeHouse(source.sign, target.sign);
    if (!house || !aspectTargets(source).includes(house)) continue;
    const weight = house === 7 ? 15 : 30;
    score += ["Jupiter", "Venus", "Mercury", "Moon"].includes(source.planet) ? weight : -weight;
  }
  return round(score);
}

function scorePlanet(value: CanonicalPlanet, planets: CanonicalPlanet[], context: InternalShadbalaContext): ShadbalaPlanetScore | null {
  if (!isClassicalPlanet(value.planet)) return null;
  const longitude = absoluteLongitude(value);
  if (longitude === null) return null;
  const components: Record<ShadbalaComponent, number | null> = {
    sthanaBala: sthanaBala(value.planet, value, longitude,planets),
    digBala: context.bhavaMidpoints?round(calculateExactDirectionalBala(value.planet,longitude,context.bhavaMidpoints).virupas):digBala(value.planet, longitude, context.ascendantLongitude),
    kalaBala: kalaBala(value.planet, planets, context),
    cheshtaBala: cheshtaBala(value.planet, value, planets, context),
    naisargikaBala: naisargika[value.planet],
    drikBala: drikBala(value, planets)
  };
  const componentStatus = Object.fromEntries((Object.keys(components) as ShadbalaComponent[]).map((component) => [component, {
    status: components[component]===null?"unavailable" as const:"calculated" as const,
    reason: components[component]===null?"Required unique, consistent natal positions unavailable.":component === "cheshtaBala"
      ? "Available motion-state calculation; exact speed-state parity remains fixture-gated."
      : component === "kalaBala"
        ? "Available temporal subcomponents calculated; Ayana/Yuddha calibration remains fixture-gated."
        : "Internal calculation awaiting independent reference validation."
  }])) as ShadbalaPlanetScore["componentStatus"];
  return {
    planet: value.planet,
    components,
    componentStatus,
    total: Object.values(components).every(v=>typeof v==="number"&&Number.isFinite(v))?round(Object.values(components).reduce<number>((sum, component) => sum + Number(component), 0)):null,
    verified: false
  };
}

export function calculateInternalShadbala(planets: CanonicalPlanet[], context: InternalShadbalaContext): PartialShadbalaResult {
  const classical=planets.filter(p=>isClassicalPlanet(p.planet));
  const complete=classical.length===7&&new Set(classical.map(p=>p.planet)).size===7&&Number.isFinite(context.ascendantLongitude)&&classical.every(p=>absoluteLongitude(p)!==null&&Number.isInteger(p.house)&&Number(p.house)>=1&&Number(p.house)<=12);
  if(!complete){
    const result=calculatePartialShadbala(classical.filter((p,i)=>classical.findIndex(v=>v.planet===p.planet)===i));
    return {...result,verificationLevel:"needs_external_validation",missingDependencies:["Unique complete finite classical positions, valid houses and ascendant are required.",...result.missingDependencies]};
  }
  const scores = classical.map((planet) => scorePlanet(planet, classical, context)).filter((score): score is ShadbalaPlanetScore => Boolean(score));
  const missing = classicalPlanets.filter((planet) => !scores.some((score) => score.planet === planet));
  return {
    scores,
    verificationLevel: "needs_external_validation",
    publicEnabled: false,
    missingDependencies: [
      ...(missing.length ? [`Missing classical planet positions: ${missing.join(", ")}`] : []),
      "Independent full-component Shadbala reference fixtures and accepted tolerances."
    ],
    limitations: [
      "All six top-level components are approximate internal engineering indicators, not complete classical Shadbala. Corrected D30 and parity calculations do not qualify the remaining approximations.",
      "Saptavargaja now uses a named compound friendship and degree-qualified D1 moolatrikona convention; external parity is pending. Dig uses supplied midpoints when available, otherwise the legacy approximate equal-spaced cusps.",
      "Kala Bala includes Natonnata, Paksha, Tribhaga, weekday and Hora contributions; Ayana/Yuddha calibration remains external-validation work.",
      "Cheshta uses exact retrograde state where available and a conservative direct-motion fallback until mean/true speed-state fixtures are imported.",
      "Drik uses deterministic classical full/special aspect geometry; exact reference-software parity remains fixture-gated.",
      "Numeric totals are internal engineering results, not externally verified public Shadbala claims."
    ]
  };
}

export function calculatePartialShadbala(planets: CanonicalPlanet[], context?: Partial<InternalShadbalaContext>): PartialShadbalaResult {
  if (typeof context?.ascendantLongitude === "number") {
    return calculateInternalShadbala(planets, {
      ascendantLongitude: context.ascendantLongitude,
      localTime: context.localTime,
      date: context.date,
      bhavaMidpoints:context.bhavaMidpoints
    });
  }
  const scores: ShadbalaPlanetScore[] = planets.filter((planet) => isClassicalPlanet(planet.planet)).map((planet) => ({
    planet: planet.planet as ClassicalPlanet,
    components: {
      sthanaBala: null,
      digBala: null,
      kalaBala: null,
      cheshtaBala: null,
      naisargikaBala: naisargika[planet.planet as ClassicalPlanet],
      drikBala: null
    },
    componentStatus: {
      sthanaBala: { status: "unavailable", reason: "Ascendant/context required." },
      digBala: { status: "unavailable", reason: "Ascendant longitude required." },
      kalaBala: { status: "unavailable", reason: "Birth date/time context required." },
      cheshtaBala: { status: "unavailable", reason: "Integrated context required." },
      naisargikaBala: { status: "calculated", reason: "Traditional natural-strength constant." },
      drikBala: { status: "unavailable", reason: "Use integrated calculation." }
    },
    total: null,
    verified: false
  }));
  return {
    scores,
    verificationLevel: "provider_verified",
    publicEnabled: false,
    missingDependencies: ["Ascendant longitude and birth-time context", "Independent Shadbala fixtures"],
    limitations: ["Use calculateInternalShadbala with full context for numeric six-component output."]
  };
}

function round(value: number) {
  return Number(value.toFixed(4));
}

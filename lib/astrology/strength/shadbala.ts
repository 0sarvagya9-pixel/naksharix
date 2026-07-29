import type { CanonicalPlanet } from "@/lib/astrology/ephemeris/types";
import type { PartialShadbalaResult, ShadbalaComponent, ShadbalaPlanetScore, StrengthFoundationStatus } from "@/lib/astrology/strength/types";

const classicalPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;
type ClassicalPlanet = (typeof classicalPlanets)[number];
const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"] as const;

const naisargika: Record<ClassicalPlanet, number> = { Sun: 60, Moon: 51.43, Venus: 42.86, Jupiter: 34.29, Mercury: 25.71, Mars: 17.14, Saturn: 8.57 };
const exaltationLongitude: Record<ClassicalPlanet, number> = { Sun: 10, Moon: 33, Mars: 298, Mercury: 165, Jupiter: 95, Venus: 357, Saturn: 200 };
const ownSigns: Record<ClassicalPlanet, readonly string[]> = {
  Sun: ["Leo"], Moon: ["Cancer"], Mars: ["Aries", "Scorpio"], Mercury: ["Gemini", "Virgo"],
  Jupiter: ["Sagittarius", "Pisces"], Venus: ["Taurus", "Libra"], Saturn: ["Capricorn", "Aquarius"]
};
const friends: Record<ClassicalPlanet, readonly ClassicalPlanet[]> = {
  Sun: ["Moon", "Mars", "Jupiter"], Moon: ["Sun", "Mercury"], Mars: ["Sun", "Moon", "Jupiter"],
  Mercury: ["Sun", "Venus"], Jupiter: ["Sun", "Moon", "Mars"], Venus: ["Mercury", "Saturn"], Saturn: ["Mercury", "Venus"]
};
const enemies: Record<ClassicalPlanet, readonly ClassicalPlanet[]> = {
  Sun: ["Venus", "Saturn"], Moon: [], Mars: ["Mercury"], Mercury: ["Moon"], Jupiter: ["Mercury", "Venus"],
  Venus: ["Sun", "Moon"], Saturn: ["Sun", "Moon", "Mars"]
};
const signLords: Record<string, ClassicalPlanet> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury",
  Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter"
};
const strongestHouse: Record<ClassicalPlanet, number> = { Sun: 10, Mars: 10, Jupiter: 1, Mercury: 1, Saturn: 7, Moon: 4, Venus: 4 };

export type InternalShadbalaContext = { ascendantLongitude: number; localTime?: string; date?: string };

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
  if (typeof planet.absoluteLongitude === "number") return normalize(planet.absoluteLongitude);
  const index = signs.indexOf(planet.sign as (typeof signs)[number]);
  return index >= 0 && typeof planet.degree === "number" ? normalize(index * 30 + planet.degree) : null;
}

function dignityScore(planet: ClassicalPlanet, sign: string) {
  if (ownSigns[planet].includes(sign)) return 30;
  const lord = signLords[sign];
  if (!lord) return 7.5;
  if (friends[planet].includes(lord)) return 22.5;
  if (enemies[planet].includes(lord)) return 3.75;
  return 15;
}

function vargaSigns(longitude: number) {
  const value = normalize(longitude);
  const signIndex = Math.floor(value / 30);
  const degree = value % 30;
  const odd = signIndex % 2 === 0;
  const d2 = odd ? (degree < 15 ? "Leo" : "Cancer") : (degree < 15 ? "Cancer" : "Leo");
  const d3Part = Math.min(2, Math.floor(degree / 10));
  const d3 = signs[[signIndex, (signIndex + 4) % 12, (signIndex + 8) % 12][d3Part]];
  const d7Part = Math.min(6, Math.floor(degree / (30 / 7)));
  const d7 = signs[((odd ? signIndex : (signIndex + 6) % 12) + d7Part) % 12];
  const d9Part = Math.min(8, Math.floor(degree / (30 / 9)));
  const d9Start = [0, 3, 6, 9].includes(signIndex) ? signIndex : [1, 4, 7, 10].includes(signIndex) ? (signIndex + 8) % 12 : (signIndex + 4) % 12;
  const d9 = signs[(d9Start + d9Part) % 12];
  const d12 = signs[(signIndex + Math.min(11, Math.floor(degree / 2.5))) % 12];
  const d30 = signs[(signIndex + Math.min(29, Math.floor(degree))) % 12];
  return [signs[signIndex], d2, d3, d7, d9, d12, d30];
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
  if (planet === "Mercury") return 30;
  const rashiOdd = Math.floor(normalize(longitude) / 30) % 2 === 0;
  const d9 = vargaSigns(longitude)[4];
  const d9Odd = signs.indexOf(d9 as (typeof signs)[number]) % 2 === 0;
  const preferredOdd = ["Sun", "Mars", "Jupiter"].includes(planet);
  return (rashiOdd === preferredOdd ? 15 : 0) + (d9Odd === preferredOdd ? 15 : 0);
}

function sthanaBala(planet: ClassicalPlanet, value: CanonicalPlanet, longitude: number) {
  const saptavargaja = vargaSigns(longitude).reduce((sum, sign) => sum + dignityScore(planet, sign), 0);
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
    sthanaBala: sthanaBala(value.planet, value, longitude),
    digBala: digBala(value.planet, longitude, context.ascendantLongitude),
    kalaBala: kalaBala(value.planet, planets, context),
    cheshtaBala: cheshtaBala(value.planet, value, planets, context),
    naisargikaBala: naisargika[value.planet],
    drikBala: drikBala(value, planets)
  };
  const componentStatus = Object.fromEntries((Object.keys(components) as ShadbalaComponent[]).map((component) => [component, {
    status: "calculated" as const,
    reason: component === "cheshtaBala"
      ? "Available motion-state calculation; exact speed-state parity remains fixture-gated."
      : component === "kalaBala"
        ? "Available temporal subcomponents calculated; Ayana/Yuddha calibration remains fixture-gated."
        : "Internal calculation awaiting independent reference validation."
  }])) as ShadbalaPlanetScore["componentStatus"];
  return {
    planet: value.planet,
    components,
    componentStatus,
    total: round(Object.values(components).reduce<number>((sum, component) => sum + Number(component ?? 0), 0)),
    verified: false
  };
}

export function calculateInternalShadbala(planets: CanonicalPlanet[], context: InternalShadbalaContext): PartialShadbalaResult {
  const scores = planets.map((planet) => scorePlanet(planet, planets, context)).filter((score): score is ShadbalaPlanetScore => Boolean(score));
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
      "All six top-level components are numerically calculated from available internal chart data.",
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
      date: context.date
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

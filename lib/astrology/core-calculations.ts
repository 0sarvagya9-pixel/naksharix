import type {
  AstrologyBirthInput,
  BirthChartData,
  ChalitChartCalculation,
  ChalitPlacement,
  DashaPeriod,
  DoshaAnalysis,
  DoshaStatus,
  HousePosition,
  PlanetPosition,
  VimshottariDashaCalculation,
  YogaAnalysis,
  YogaDetection
} from "@/lib/astrology/types";

import {calculateVimshottariDasha as calculateExactDasha, type DashaPeriod as ExactDashaPeriod} from "@/lib/astrology/premium-engine/dasha";
import {localBirthToUtcDate,normalizeBirthDate,normalizeBirthTime,parseBirthDateTime,parseTimezoneOffsetToHours} from "@/lib/astrology/own-engine/time";

type Locale = "en" | "hi" | "hinglish";

const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"] as const;
const manglikHouses = new Set([1, 2, 4, 7, 8, 12]);
const classicalPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

export function enrichBirthChartWithCoreCalculations(chart: BirthChartData, input: AstrologyBirthInput): BirthChartData {
  const locale = input.language ?? input.locale ?? "en";
  const ascendantLongitude = getAscendantLongitude(chart);
  const dasha = calculateVimshottariDasha(chart.planetPositions, resolveDashaBirthInstant(input), locale);
  const chalit = calculateChalitChart(chart.planetPositions, ascendantLongitude, locale);
  const dosha = calculateDoshaAnalysis(chart.planetPositions, chart.avakhada.ascendant, chart.avakhada.moonSign, locale);
  const yoga = detectBasicYogas(chart.planetPositions, chart.avakhada.ascendant, locale);

  return {
    ...chart,
    vimshottariDasha: dasha.available ? dasha.mahadashas : chart.vimshottariDasha,
    calculatedDasha: dasha,
    chalitChart: chalit,
    doshaAnalysis: dosha,
    yogaAnalysis: yoga,
    manglikDosha: dosha.manglik,
    kaalSarpDosha: dosha.kaalSarp
  };
}

export function resolveDashaBirthInstant(input:Pick<AstrologyBirthInput,"dateOfBirth"|"timeOfBirth"|"timezone">):Date {
  const date=normalizeBirthDate(input.dateOfBirth),time=normalizeBirthTime(input.timeOfBirth);
  return localBirthToUtcDate(parseBirthDateTime(date,time),parseTimezoneOffsetToHours(input.timezone,date,time));
}

export function calculateVimshottariDasha(
  planets: PlanetPosition[],
  birthDate: string | Date,
  locale: Locale = "en",
  currentDate = new Date()
): VimshottariDashaCalculation {
  const moonLongitude=absoluteLongitudeFor(planets.find(p=>samePlanet(p.planet,"Moon")));
  const birth=birthDate instanceof Date?birthDate:new Date(String(birthDate).slice(0,10)+"T00:00:00.000Z");
  if(moonLongitude===undefined||!Number.isFinite(birth.getTime())||!Number.isFinite(currentDate.getTime()))return {
    available:false,method:"Moon nakshatra birth balance",note:dashaMissingNote(locale),mahadashas:[],currentAntardashas:[]
  };
  const exact=calculateExactDasha({moonLongitude,birthDateTime:birth,currentDate});
  // The customer-facing timeline historically begins at birth. Clip elapsed
  // portions but never restart the first remaining major period's sub-cycle.
  const at=birth.getTime(),yearMs=365.2425*86400000;
  const convert=(period:ExactDashaPeriod,level:"mahadasha"|"antardasha",parentPlanet?:string):DashaPeriod=>{
    const from=new Date(Math.max(at,Date.parse(period.startsAt))),to=new Date(period.endsAt);
    const startsAt=from.toISOString().slice(0,10),endsAt=to.toISOString().slice(0,10);
    return {planet:period.lord,startsAt,endsAt,startsAtUtc:from.toISOString(),endsAtUtc:to.toISOString(),period:startsAt+" to "+endsAt,level,parentPlanet,durationYears:round((to.getTime()-from.getTime())/yearMs,6)};
  };
  const mahadashas=exact.mahadashas.filter(p=>Date.parse(p.endsAt)>at).map(p=>{
    const result=convert(p,"mahadasha");
    result.antardashas=exact.antardashas.filter(a=>a.mahadashaLord===p.lord&&a.startsAt>=p.startsAt&&a.endsAt<=p.endsAt&&Date.parse(a.endsAt)>at).map(a=>convert(a,"antardasha",p.lord));
    return result;
  });
  const contains=(p:DashaPeriod)=>Date.parse(p.startsAtUtc!)<=currentDate.getTime()&&currentDate.getTime()<Date.parse(p.endsAtUtc!);
  const currentMahadasha=mahadashas.find(contains);
  const currentAntardashas=currentMahadasha?.antardashas??[];
  return {
    available:true,method:"Vimshottari dasha from Moon sidereal nakshatra position (365.2425-day year)",
    birthMahadasha:exact.startingMahadashaLord,birthBalanceYears:exact.balanceAtBirthYears,
    currentMahadasha,currentAntardasha:currentAntardashas.find(contains),mahadashas,currentAntardashas
  };
}

export function calculateChalitChart(planets: PlanetPosition[], ascendantLongitude: number | undefined, locale: Locale = "en"): ChalitChartCalculation {
  if (!Number.isFinite(ascendantLongitude)) {
    return {
      available: false,
      method: "Equal-house Chalit from ascendant longitude",
      note: chalitMissingNote(locale),
      placements: [],
      houses: []
    };
  }

  const placements: ChalitPlacement[] = planets.map((planet) => {
    const absolute = absoluteLongitudeFor(planet);
    const chalitHouse = absolute === undefined ? undefined : Math.floor(normalizeDegrees(absolute - ascendantLongitude!) / 30) + 1;
    const changed = typeof planet.house === "number" && typeof chalitHouse === "number" && planet.house !== chalitHouse;
    return {
      planet: planet.planet,
      sign: planet.sign,
      d1House: planet.house,
      chalitHouse,
      degree: planet.degree,
      changed,
      note: changed ? chalitMovementNote(locale, planet.house, chalitHouse) : chalitStableNote(locale)
    };
  });

  return {
    available: true,
    method: "Equal-house Chalit from available ascendant and planetary longitude data",
    placements,
    houses: placementsToHouses(placements, planets)
  };
}

export function calculateDoshaAnalysis(planets: PlanetPosition[], ascendantSign: string, moonSign: string, locale: Locale = "en"): DoshaAnalysis {
  const mars = planets.find((planet) => samePlanet(planet.planet, "Mars"));
  const venus = planets.find((planet) => samePlanet(planet.planet, "Venus"));
  const marsHouseFromLagna = mars?.house;
  const marsHouseFromMoon = mars ? relativeHouse(mars.sign, moonSign) : undefined;
  const marsHouseFromVenus = mars && venus ? relativeHouse(mars.sign, venus.sign) : undefined;
  const lagnaHit = typeof marsHouseFromLagna === "number" && manglikHouses.has(marsHouseFromLagna);
  const moonHit = typeof marsHouseFromMoon === "number" && manglikHouses.has(marsHouseFromMoon);
  const venusHit = typeof marsHouseFromVenus === "number" && manglikHouses.has(marsHouseFromVenus);
  const hitCount = [lagnaHit, moonHit, venusHit].filter(Boolean).length;
  const severity = manglikSeverity(hitCount, locale);
  const manglik: DoshaAnalysis["manglik"] = {
    present: hitCount > 0,
    severity,
    marsHouseFromLagna,
    marsHouseFromMoon,
    marsHouseFromVenus,
    summary: manglikSummary(locale, hitCount, marsHouseFromLagna, marsHouseFromMoon, marsHouseFromVenus),
    remedies: manglikRemedies(locale)
  };

  const kaalSarp = calculateKaalSarp(planets, locale);
  return {
    manglik,
    kaalSarp,
    notes: [doshaCaveat(locale)]
  };
}

export function detectBasicYogas(planets: PlanetPosition[], ascendantSign: string, locale: Locale = "en"): YogaAnalysis {
  const sun = findPlanet(planets, "Sun");
  const moon = findPlanet(planets, "Moon");
  const mars = findPlanet(planets, "Mars");
  const mercury = findPlanet(planets, "Mercury");
  const jupiter = findPlanet(planets, "Jupiter");
  const venus = findPlanet(planets, "Venus");
  const saturn = findPlanet(planets, "Saturn");
  const checks: YogaDetection[] = [
    yoga("Budh Aditya Yoga", Boolean(sun && mercury && sameSignOrHouse(sun, mercury)), basisSame(locale, "Sun", "Mercury"), yogaText(locale, "budhAditya")),
    yoga("Gaja Kesari Yoga", Boolean(moon && jupiter && isKendra(relativeHouse(jupiter.sign, moon.sign))), basisKendra(locale, "Jupiter", "Moon"), yogaText(locale, "gajaKesari")),
    yoga("Chandra Mangal Yoga", Boolean(moon && mars && (sameSignOrHouse(moon, mars) || isKendra(relativeHouse(mars.sign, moon.sign)))), basisKendra(locale, "Mars", "Moon"), yogaText(locale, "chandraMangal")),
    yoga("Ruchaka Yoga", Boolean(mars && isKendra(mars.house) && ["Aries", "Scorpio", "Capricorn"].includes(mars.sign)), basisMahapurusha(locale, "Mars"), yogaText(locale, "ruchaka")),
    yoga("Bhadra Yoga", Boolean(mercury && isKendra(mercury.house) && ["Gemini", "Virgo"].includes(mercury.sign)), basisMahapurusha(locale, "Mercury"), yogaText(locale, "bhadra")),
    yoga("Hamsa Yoga", Boolean(jupiter && isKendra(jupiter.house) && ["Sagittarius", "Pisces", "Cancer"].includes(jupiter.sign)), basisMahapurusha(locale, "Jupiter"), yogaText(locale, "hamsa")),
    yoga("Malavya Yoga", Boolean(venus && isKendra(venus.house) && ["Taurus", "Libra", "Pisces"].includes(venus.sign)), basisMahapurusha(locale, "Venus"), yogaText(locale, "malavya")),
    yoga("Shasha Yoga", Boolean(saturn && isKendra(saturn.house) && ["Capricorn", "Aquarius", "Libra"].includes(saturn.sign)), basisMahapurusha(locale, "Saturn"), yogaText(locale, "shasha"))
  ];
  const detected = checks.filter((check) => check.detected);
  return {
    detected,
    evaluated: checks,
    note: detected.length ? yogaCaveat(locale) : noYogaNote(locale)
  };
}

function calculateKaalSarp(planets: PlanetPosition[], locale: Locale): DoshaStatus {
  const rahu = findPlanet(planets, "Rahu");
  const ketu = findPlanet(planets, "Ketu");
  const rahuLong = absoluteLongitudeFor(rahu);
  const ketuLong = absoluteLongitudeFor(ketu);
  const bodies = planets.filter((planet) => classicalPlanets.some((name) => samePlanet(planet.planet, name)));
  if (rahuLong === undefined || ketuLong === undefined || bodies.some((planet) => absoluteLongitudeFor(planet) === undefined)) {
    return { present: false, severity: notEnoughData(locale), summary: kaalSarpMissing(locale), remedies: [doshaCaveat(locale)] };
  }
  const inRahuKetuArc = bodies.every((planet) => inClockwiseArc(absoluteLongitudeFor(planet)!, rahuLong, ketuLong));
  const inKetuRahuArc = bodies.every((planet) => inClockwiseArc(absoluteLongitudeFor(planet)!, ketuLong, rahuLong));
  const present = inRahuKetuArc || inKetuRahuArc;
  return {
    present,
    severity: present ? kaalSarpSeverity(locale) : noneSeverity(locale),
    summary: present ? kaalSarpPresent(locale) : kaalSarpAbsent(locale),
    remedies: present ? kaalSarpRemedies(locale) : [doshaCaveat(locale)]
  };
}

function placementsToHouses(placements: ChalitPlacement[], planets: PlanetPosition[]): HousePosition[] {
  const firstSign = planets.find((planet) => typeof planet.house === "number")?.sign ?? "Aries";
  return Array.from({ length: 12 }, (_, index) => {
    const house = index + 1;
    return {
      house,
      sign: signs[(signIndex(firstSign) + house - 1) % 12],
      planets: placements.filter((placement) => placement.chalitHouse === house).map((placement) => placement.planet)
    };
  });
}

function getAscendantLongitude(chart: BirthChartData) {
  const meta = chart.calculationMeta as (BirthChartData["calculationMeta"] & { ascendantLongitude?: number }) | undefined;
  return typeof meta?.ascendantLongitude === "number" ? meta.ascendantLongitude : undefined;
}

function absoluteLongitudeFor(planet: PlanetPosition | undefined) {
  if (!planet) return undefined;
  if (typeof planet.absoluteLongitude === "number" && Number.isFinite(planet.absoluteLongitude)) return normalizeDegrees(planet.absoluteLongitude);
  if (typeof planet.degree !== "number") return undefined;
  const index = signIndex(planet.sign);
  if (index < 0) return undefined;
  return normalizeDegrees(index * 30 + planet.degree);
}

function findPlanet(planets: PlanetPosition[], planetName: string) {
  return planets.find((planet) => samePlanet(planet.planet, planetName));
}

function samePlanet(first: string | undefined, second: string) {
  return String(first ?? "").trim().toLowerCase() === second.toLowerCase();
}

function sameSignOrHouse(first: PlanetPosition, second: PlanetPosition) {
  return first.sign === second.sign || (typeof first.house === "number" && first.house === second.house);
}

function relativeHouse(planetSign: string | undefined, referenceSign: string | undefined) {
  const planetIndex = signIndex(planetSign);
  const referenceIndex = signIndex(referenceSign);
  if (planetIndex < 0 || referenceIndex < 0) return undefined;
  return ((planetIndex - referenceIndex + 12) % 12) + 1;
}

function signIndex(sign: string | undefined) {
  return signs.findIndex((item) => item.toLowerCase() === String(sign ?? "").toLowerCase());
}

function isKendra(house: number | undefined) {
  return house === 1 || house === 4 || house === 7 || house === 10;
}

function inClockwiseArc(value: number, start: number, end: number) {
  return normalizeDegrees(value - start) <= normalizeDegrees(end - start);
}

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function yoga(name: string, detected: boolean, basis: string, interpretation: string): YogaDetection {
  return { name, detected, basis, interpretation, caveat: "Needs full chart, strength, aspects, and dasha review before final judgment." };
}

function dashaMissingNote(locale: Locale) {
  if (locale === "hi") return "दशा गणना के लिए चंद्र नक्षत्र और डिग्री डेटा आवश्यक है।";
  if (locale === "hinglish") return "Dasha calculation ke liye Moon nakshatra aur degree data zaroori hai.";
  return "Dasha calculation needs Moon nakshatra degree data.";
}

function chalitMissingNote(locale: Locale) {
  if (locale === "hi") return "चलित गणना के लिए लग्न डिग्री और ग्रह दीर्घांश डेटा आवश्यक है।";
  if (locale === "hinglish") return "Chalit calculation ke liye lagna degree aur planet longitude data zaroori hai.";
  return "Chalit calculation needs ascendant degree and planetary longitude data.";
}

function chalitMovementNote(locale: Locale, d1?: number, chalit?: number) {
  if (locale === "hi") return `D1 भाव ${d1 ?? "-"} से चलित भाव ${chalit ?? "-"} में स्थान बदला।`;
  if (locale === "hinglish") return `D1 bhav ${d1 ?? "-"} se Chalit bhav ${chalit ?? "-"} me placement shift hua.`;
  return `Moved from D1 house ${d1 ?? "-"} to Chalit house ${chalit ?? "-"}.`;
}

function chalitStableNote(locale: Locale) {
  if (locale === "hi") return "D1 और चलित भाव समान हैं।";
  if (locale === "hinglish") return "D1 aur Chalit bhav same hain.";
  return "D1 and Chalit house are the same.";
}

function manglikSeverity(count: number, locale: Locale) {
  if (count <= 0) return noneSeverity(locale);
  if (locale === "hi") return count >= 3 ? "प्रबल" : count === 2 ? "मध्यम" : "हल्का";
  if (locale === "hinglish") return count >= 3 ? "Strong" : count === 2 ? "Moderate" : "Mild";
  return count >= 3 ? "Strong" : count === 2 ? "Moderate" : "Mild";
}

function noneSeverity(locale: Locale) {
  if (locale === "hi") return "नहीं";
  if (locale === "hinglish") return "None";
  return "None";
}

function notEnoughData(locale: Locale) {
  if (locale === "hi") return "डेटा अपर्याप्त";
  if (locale === "hinglish") return "Not enough data";
  return "Not enough data";
}

function manglikSummary(locale: Locale, hits: number, lagna?: number, moon?: number, venus?: number) {
  if (locale === "hi") {
    if (!hits) return "मंगल पारंपरिक मांगलिक भावों में प्रमुख रूप से नहीं दिखता। अंतिम विवाह निर्णय के लिए पूरी कुंडली, दशा और अनुकूलता को साथ में देखें।";
    return `मंगल संवेदनशील भावों में संकेत देता है: लग्न से ${lagna ?? "-"}, चंद्र से ${moon ?? "-"}, शुक्र से ${venus ?? "-"}. अंतिम विवाह निर्णय के लिए पूरी कुंडली, दशा और अनुकूलता को साथ में देखना चाहिए।`;
  }
  if (locale === "hinglish") {
    if (!hits) return "Mars traditional Manglik-sensitive houses me strongly nahi dikh raha. Final marriage decision ke liye full kundli, dasha aur compatibility saath me dekhein.";
    return `Mars sensitive houses indicate karta hai: Lagna se ${lagna ?? "-"}, Moon se ${moon ?? "-"}, Venus se ${venus ?? "-"}. Final marriage decision ke liye full kundli, dasha aur compatibility review zaroori hai.`;
  }
  if (!hits) return "Mars is not strongly placed in traditional Manglik-sensitive houses. Review the full chart, dasha, and compatibility before marriage decisions.";
  return `Mars touches Manglik-sensitive houses: from Lagna ${lagna ?? "-"}, from Moon ${moon ?? "-"}, from Venus ${venus ?? "-"}. Review the full chart, dasha, and compatibility before marriage decisions.`;
}

function manglikRemedies(locale: Locale) {
  if (locale === "hi") return ["भय आधारित निर्णय न लें।", "विवाह निर्णय से पहले पूरी कुंडली और अनुकूलता की समीक्षा करें।"];
  if (locale === "hinglish") return ["Fear-based decision na lein.", "Marriage decision se pehle full kundli aur compatibility review karein."];
  return ["Avoid fear-based decisions.", "Review the full chart and compatibility before marriage decisions."];
}

function doshaCaveat(locale: Locale) {
  if (locale === "hi") return "दोष संकेतों को भय नहीं, संदर्भ के साथ समझना चाहिए।";
  if (locale === "hinglish") return "Dosha signals ko fear nahi, context ke saath samjhein.";
  return "Dosha indicators should be read with context, not fear.";
}

function kaalSarpMissing(locale: Locale) {
  if (locale === "hi") return "काल सर्प जांच के लिए राहु, केतु और ग्रह दीर्घांश डेटा आवश्यक है।";
  if (locale === "hinglish") return "Kaal Sarp check ke liye Rahu, Ketu aur planet longitude data zaroori hai.";
  return "Kaal Sarp check needs Rahu, Ketu, and planetary longitude data.";
}

function kaalSarpSeverity(locale: Locale) {
  if (locale === "hi") return "संदर्भ समीक्षा आवश्यक";
  if (locale === "hinglish") return "Needs context review";
  return "Needs context review";
}

function kaalSarpPresent(locale: Locale) {
  if (locale === "hi") return "उपलब्ध दीर्घांश डेटा में ग्रह राहु-केतु अक्ष के एक ओर आते दिखते हैं। इसे पूर्ण चार्ट संदर्भ में ही पढ़ें।";
  if (locale === "hinglish") return "Available longitude data me planets Rahu-Ketu axis ke ek side me dikh rahe hain. Isse full chart context me hi read karein.";
  return "Available longitude data places the planets on one side of the Rahu-Ketu axis. Read this only with full chart context.";
}

function kaalSarpAbsent(locale: Locale) {
  if (locale === "hi") return "उपलब्ध डेटा से काल सर्प योग स्पष्ट रूप से नहीं दिखता।";
  if (locale === "hinglish") return "Available data se Kaal Sarp clearly detect nahi hua.";
  return "Kaal Sarp is not clearly detected from the available data.";
}

function kaalSarpRemedies(locale: Locale) {
  if (locale === "hi") return ["शांत जप, अनुशासन और सेवा जैसे संतुलित उपाय रखें।", "भय आधारित उपायों से बचें।"];
  if (locale === "hinglish") return ["Calm japa, discipline aur seva jaise balanced upay rakhein.", "Fear-based remedies se bachein."];
  return ["Use balanced practices such as calm prayer, discipline, and service.", "Avoid fear-based remedies."];
}

function noYogaNote(locale: Locale) {
  if (locale === "hi") return "उपलब्ध डेटा से कोई प्रमुख योग स्पष्ट रूप से नहीं मिला।";
  if (locale === "hinglish") return "Available data se koi major yoga clearly detect nahi hua.";
  return "No major yoga was detected from the currently available data.";
}

function yogaCaveat(locale: Locale) {
  if (locale === "hi") return "योग संकेतों को ग्रह बल, दृष्टि, दशा और पूरे चार्ट के साथ सत्यापित करें।";
  if (locale === "hinglish") return "Yoga signals ko grah bal, aspects, dasha aur full chart ke saath verify karein.";
  return "Yoga indicators should be verified with strength, aspects, dasha, and the full chart.";
}

function basisSame(locale: Locale, first: string, second: string) {
  if (locale === "hi") return `${first} और ${second} एक ही राशि/भाव में हैं।`;
  if (locale === "hinglish") return `${first} aur ${second} same sign/house me hain.`;
  return `${first} and ${second} are in the same sign/house.`;
}

function basisKendra(locale: Locale, first: string, second: string) {
  if (locale === "hi") return `${first} ${second} से केंद्र संबंध में है।`;
  if (locale === "hinglish") return `${first}, ${second} se kendra relation me hai.`;
  return `${first} is in a kendra relationship from ${second}.`;
}

function basisMahapurusha(locale: Locale, planet: string) {
  if (locale === "hi") return `${planet} केंद्र भाव में अपनी/उच्च राशि संदर्भ में है।`;
  if (locale === "hinglish") return `${planet} kendra house me own/exaltation sign context me hai.`;
  return `${planet} is in a kendra house with own/exaltation sign context.`;
}

function yogaText(locale: Locale, key: string) {
  const en: Record<string, string> = {
    budhAditya: "Supports intellect, communication, learning, and administrative clarity.",
    gajaKesari: "Supports wise counsel, protection, reputation, and emotional steadiness.",
    chandraMangal: "Adds initiative and practical drive, but emotional reactions need balance.",
    ruchaka: "Gives action, courage, initiative, and competitive strength when well supported.",
    bhadra: "Supports analytical skill, communication, business sense, and learning.",
    hamsa: "Supports wisdom, teaching, ethics, and guidance-oriented growth.",
    malavya: "Supports harmony, beauty, comfort, relationships, and refined values.",
    shasha: "Supports discipline, structure, patience, and long-term responsibility."
  };
  const hi: Record<string, string> = {
    budhAditya: "बुद्धि, संवाद, सीखने और प्रशासनिक स्पष्टता को सहारा देता है।",
    gajaKesari: "सद्बुद्धि, संरक्षण, प्रतिष्ठा और भावनात्मक स्थिरता को सहारा देता है।",
    chandraMangal: "पहल और व्यावहारिक ऊर्जा देता है, पर भावनात्मक प्रतिक्रिया में संतुलन जरूरी है।",
    ruchaka: "सहयोग मिलने पर साहस, पहल और प्रतिस्पर्धी शक्ति बढ़ाता है।",
    bhadra: "विश्लेषण, संवाद, व्यापारिक समझ और सीखने की क्षमता को सहारा देता है।",
    hamsa: "ज्ञान, शिक्षण, नैतिकता और मार्गदर्शन की प्रवृत्ति को सहारा देता है।",
    malavya: "सामंजस्य, सौंदर्य, सुख, संबंध और refined values को सहारा देता है।",
    shasha: "अनुशासन, संरचना, धैर्य और दीर्घकालीन जिम्मेदारी को सहारा देता है।"
  };
  const hinglish: Record<string, string> = {
    budhAditya: "Intellect, communication, learning aur administrative clarity ko support karta hai.",
    gajaKesari: "Wise counsel, protection, reputation aur emotional steadiness ko support karta hai.",
    chandraMangal: "Initiative aur practical drive deta hai, par emotional reactions me balance zaroori hai.",
    ruchaka: "Support milne par courage, initiative aur competitive strength badhata hai.",
    bhadra: "Analysis, communication, business sense aur learning ko support karta hai.",
    hamsa: "Wisdom, teaching, ethics aur guidance-oriented growth ko support karta hai.",
    malavya: "Harmony, beauty, comfort, relationships aur refined values ko support karta hai.",
    shasha: "Discipline, structure, patience aur long-term responsibility ko support karta hai."
  };
  return (locale === "hi" ? hi : locale === "hinglish" ? hinglish : en)[key] ?? en[key];
}

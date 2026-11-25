import { nakshatras } from "@/lib/astrology/own-engine/nakshatra";
import { normalizeDegrees } from "@/lib/astrology/own-engine/time";

export type DashaVerificationLevel = "limited_internal" | "provider_verified" | "verified_external" | "needs_external_validation";

export type VimshottariLord = "Ketu" | "Venus" | "Sun" | "Moon" | "Mars" | "Rahu" | "Jupiter" | "Saturn" | "Mercury";

export type DashaPeriod = {
  lord: VimshottariLord;
  startsAt: string;
  endsAt: string;
  durationYears: number;
};

export type AntardashaPeriod = DashaPeriod & {
  mahadashaLord: VimshottariLord;
};

export type PratyantarDashaPeriod = DashaPeriod & {
  mahadashaLord: VimshottariLord;
  antardashaLord: VimshottariLord;
};

export type CurrentDasha = {
  mahadasha: DashaPeriod | null;
  antardasha: AntardashaPeriod | null;
  pratyantar: PratyantarDashaPeriod | null;
};

export type VimshottariDashaResult = {
  birthMoonLongitude: number;
  birthNakshatra: string;
  birthNakshatraIndex: number;
  startingMahadashaLord: VimshottariLord;
  balanceAtBirthYears: number;
  elapsedAtBirthYears: number;
  mahadashas: DashaPeriod[];
  antardashas: AntardashaPeriod[];
  pratyantarDashas: PratyantarDashaPeriod[];
  current: CurrentDasha;
  metadata: {
    verificationLevel: DashaVerificationLevel;
    verified: boolean;
    limitations: string[];
  };
};

export const VIMSHOTTARI_SEQUENCE: Array<{ lord: VimshottariLord; years: number }> = [
  { lord: "Ketu", years: 7 },
  { lord: "Venus", years: 20 },
  { lord: "Sun", years: 6 },
  { lord: "Moon", years: 10 },
  { lord: "Mars", years: 7 },
  { lord: "Rahu", years: 18 },
  { lord: "Jupiter", years: 16 },
  { lord: "Saturn", years: 19 },
  { lord: "Mercury", years: 17 }
];

const NAKSHATRA_SPAN = 360 / 27;
const MS_PER_YEAR = 365.2425 * 24 * 60 * 60 * 1000;

export function calculateVimshottariDasha(input: {
  moonLongitude: number;
  birthDateTime: Date;
  currentDate?: Date;
  includePratyantar?: boolean;
}): VimshottariDashaResult {
  if (!Number.isFinite(input.moonLongitude)) {
    throw new Error("Moon longitude is required for Vimshottari Dasha calculation.");
  }

  if (!(input.birthDateTime instanceof Date) || Number.isNaN(input.birthDateTime.getTime())) {
    throw new Error("Valid birth datetime is required for Vimshottari Dasha calculation.");
  }

  const normalizedMoon = normalizeDegrees(input.moonLongitude);
  const nakshatraIndex = Math.min(26, Math.floor(normalizedMoon / NAKSHATRA_SPAN));
  const nakshatraOffset = normalizedMoon - nakshatraIndex * NAKSHATRA_SPAN;
  const startingLord = lordForNakshatraIndex(nakshatraIndex);
  const startingDuration = yearsForLord(startingLord);
  const elapsedExact = (nakshatraOffset / NAKSHATRA_SPAN) * startingDuration;
  const elapsedAtBirthYears = round(elapsedExact);
  const balanceAtBirthYears = round(startingDuration - elapsedExact);
  // Rounded display years must never become the source of transition dates.
  const startDate = addYears(input.birthDateTime, -elapsedExact);
  const mahadashas = buildMahadashas(startingLord, startDate, 12);
  const antardashas = mahadashas.flatMap((mahadasha) => buildAntardashas(mahadasha));
  const currentDate = input.currentDate ?? new Date();
  if (!(currentDate instanceof Date) || !Number.isFinite(currentDate.getTime())) {
    throw new Error("Valid evaluation datetime is required.");
  }
  const currentMahadasha = currentDate < input.birthDateTime ? null : findPeriod(mahadashas, currentDate);
  const currentAntardasha = currentMahadasha
    ? findPeriod(antardashas.filter((period) => period.mahadashaLord === currentMahadasha.lord &&
        period.startsAt >= currentMahadasha.startsAt && period.endsAt <= currentMahadasha.endsAt), currentDate)
    : null;
  const pratyantarDashas = input.includePratyantar && currentAntardasha
    ? buildPratyantarDashas(currentAntardasha)
    : [];

  return {
    birthMoonLongitude: round(normalizedMoon),
    birthNakshatra: nakshatras[nakshatraIndex],
    birthNakshatraIndex: nakshatraIndex + 1,
    startingMahadashaLord: startingLord,
    balanceAtBirthYears,
    elapsedAtBirthYears,
    mahadashas,
    antardashas,
    pratyantarDashas,
    current: {
      mahadasha: currentMahadasha,
      antardasha: currentAntardasha,
      pratyantar: findPeriod(pratyantarDashas, currentDate)
    },
    metadata: {
      verificationLevel: "provider_verified",
      verified: false,
      limitations: [
        "Dasha sequence and duration math are deterministic.",
        "Birth balance is regression-tested against provider-generated Moon longitude fixtures.",
        "Timing uses a fixed 365.2425-day year; other traditional year conventions differ. Independent professional certification is not claimed."
      ]
    }
  };
}

export function lordForNakshatraIndex(indexZeroBased: number): VimshottariLord {
  return VIMSHOTTARI_SEQUENCE[((indexZeroBased % 9) + 9) % 9].lord;
}

export function yearsForLord(lord: VimshottariLord) {
  const found = VIMSHOTTARI_SEQUENCE.find((entry) => entry.lord === lord);
  if (!found) throw new Error(`Unknown Vimshottari lord: ${lord}`);
  return found.years;
}

function buildMahadashas(startingLord: VimshottariLord, startsAt: Date, count: number): DashaPeriod[] {
  const periods: DashaPeriod[] = [];
  let cursor = new Date(startsAt);
  let sequenceIndex = VIMSHOTTARI_SEQUENCE.findIndex((entry) => entry.lord === startingLord);

  for (let i = 0; i < count; i += 1) {
    const entry = VIMSHOTTARI_SEQUENCE[sequenceIndex % VIMSHOTTARI_SEQUENCE.length];
    const next = addYears(cursor, entry.years);
    periods.push(period(entry.lord, cursor, next, entry.years));
    cursor = next;
    sequenceIndex += 1;
  }

  return periods;
}

// Partition the parent's actual integer millisecond span, not rounded
// durationYears or a succession of truncated floating timestamps. Every
// child begins exactly at its preceding end; the final child ends at the parent.
function partition(parent: DashaPeriod) {
  const start=Date.parse(parent.startsAt),end=Date.parse(parent.endsAt);
  const index=VIMSHOTTARI_SEQUENCE.findIndex(x=>x.lord===parent.lord);
  let cursor=start,cumulative=0;
  return Array.from({length:9},(_,i)=>{
    const entry=VIMSHOTTARI_SEQUENCE[(index+i)%9];
    cumulative+=entry.years;
    const next=i===8?end:start+Math.round((end-start)*cumulative/120);
    const value=period(entry.lord,new Date(cursor),new Date(next),(next-cursor)/MS_PER_YEAR);
    cursor=next;
    return value;
  });
}

function buildAntardashas(mahadasha: DashaPeriod): AntardashaPeriod[] {
  return partition(mahadasha).map(p=>({...p,mahadashaLord:mahadasha.lord}));
}

function buildPratyantarDashas(antardasha: AntardashaPeriod): PratyantarDashaPeriod[] {
  return partition(antardasha).map(p=>({...p,mahadashaLord:antardasha.mahadashaLord,antardashaLord:antardasha.lord}));
}

function period(lord: VimshottariLord, startsAt: Date, endsAt: Date, durationYears: number): DashaPeriod {
  if (endsAt.getTime() <= startsAt.getTime()) throw new Error("Invalid Dasha range: end must be after start.");
  return {
    lord,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    durationYears: round(durationYears)
  };
}

function findPeriod<T extends { startsAt: string; endsAt: string }>(periods: T[], date: Date): T | null {
  const time = date.getTime();
  return periods.find((periodItem) => new Date(periodItem.startsAt).getTime() <= time && time < new Date(periodItem.endsAt).getTime()) ?? null;
}

function addYears(date: Date, years: number) {
  return new Date(date.getTime() + Math.round(years * MS_PER_YEAR));
}

function round(value: number, digits = 6) {
  return Number(value.toFixed(digits));
}

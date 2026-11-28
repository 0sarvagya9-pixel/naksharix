// Internal research convention only. No certified/public Shadbala claims.
// Surya Siddhanta 1.51–52: civil-day count, 30-day month, 360-day year.
// Burgess translation (1860), worked example: 714404108572 days on 1860-01-01.
const LORDS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;
const DAY_MS = 86_400_000;
const ANCHOR_DAY = Date.UTC(1860, 0, 1) / DAY_MS;
const ANCHOR_COUNT = 714_404_108_572;
export function calculateClassicalCalendarCandidate(sunriseUtc: string | null, longitude: number, observedDayLord?: string | null) {
  if (!sunriseUtc || !Number.isFinite(longitude) || Math.abs(longitude) > 180) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(sunriseUtc)) return null;
  const instant = Date.parse(sunriseUtc);
  if (!Number.isFinite(instant) || new Date(instant).toISOString().slice(0,19) !== sunriseUtc.slice(0,19)) return null;
  const localDay = Math.floor((instant + longitude * 240_000) / DAY_MS);
  const elapsedDays = ANCHOR_COUNT + localDay - ANCHOR_DAY;
  if (!Number.isSafeInteger(elapsedDays) || elapsedDays < 0) return null;
  const dayLord = LORDS[elapsedDays % 7];
  if (observedDayLord !== undefined && observedDayLord !== dayLord) return null;
  return {
    method: "surya-siddhanta-30-360-local-mean-sunrise-candidate" as const,
    elapsedDays, dayLord,
    monthLord: LORDS[(Math.floor(elapsedDays / 30) * 2) % 7],
    yearLord: LORDS[(Math.floor(elapsedDays / 360) * 3) % 7],
    localSolarDate: new Date(localDay * DAY_MS).toISOString().slice(0,10),
    verified: false as const,
    publicEnabled: false as const,
  };
}

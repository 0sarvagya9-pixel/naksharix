import { AstroTime, EclipticGeoMoon, e_tilt } from "astronomy-engine";

/**
 * Mean Lahiri at J2000 TT (Indian Astronomical Ephemeris 2019, p. 429).
 * The P03 general precession in longitude is Table 4 of Capitaine et al. (2005).
 * These source constants do not depend on a birth chart or Dasha fixture.
 */
export function meanLahiriForMoon(time: AstroTime): number {
  const t = time.tt / 36525;
  const generalPrecessionArcsec = t * (5028.796195 + t * (1.1054348 + t * (0.00007964 + t * (-0.000023857 - t * 0.0000000383))));
  return 23 + 51 / 60 + (25.5324 + generalPrecessionArcsec) / 3600;
}

// Effective UTC dates of TAI-UTC steps in the JPL NAIF leap-second kernel.
// Bulletin C 72 confirms 37 seconds through the end of 2026. For future
// civil dates the last announced offset is held fixed until a new bulletin.
const leapSteps = [
  "1972-01-01", "1972-07-01", "1973-01-01", "1974-01-01", "1975-01-01",
  "1976-01-01", "1977-01-01", "1978-01-01", "1979-01-01", "1980-01-01",
  "1981-07-01", "1982-07-01", "1983-07-01", "1985-07-01", "1988-01-01",
  "1990-01-01", "1991-01-01", "1992-07-01", "1993-07-01", "1994-07-01",
  "1996-01-01", "1997-07-01", "1999-01-01", "2006-01-01", "2009-01-01",
  "2012-07-01", "2015-07-01", "2017-01-01"
].map(iso => Date.parse(iso + "T00:00:00Z"));

export function terrestrialTimeForCivilMoon(time: AstroTime): AstroTime {
  const millis = time.date.getTime();
  // Pre-1972 civil input retains the historical UT/Delta-T approximation.
  if (millis < leapSteps[0]) return time;
  let step = leapSteps.length - 1;
  while (leapSteps[step] > millis) step--;
  const ttMinusUtcSeconds = 32.184 + 10 + step;
  // The source Date is UTC. Reconstruct TT directly, independently of the
  // library’s UT1-to-TT prediction. Earth-rotation code retains its own time.
  return AstroTime.FromTerrestrialTime(time.ut + ttMinusUtcSeconds / 86400);
}

/** EclipticGeoMoon measures from the true equinox. Remove longitude nutation
 * in addition to mean precession when transforming this apparent ecliptic frame.
 * Mean-node or mean-equinox vectors must not use this conversion. */
export function lahiriMoonLongitude(time: AstroTime): number {
  const terrestrial = terrestrialTimeForCivilMoon(time);
  const trueLongitude = EclipticGeoMoon(terrestrial).lon;
  const nutationDegrees = e_tilt(terrestrial).dpsi / 3600;
  return (trueLongitude - nutationDegrees - meanLahiriForMoon(terrestrial) + 360) % 360;
}

export const LUNAR_FRAME_VERSION = "lahiri-iae2000-p03-true-to-mean-v2";

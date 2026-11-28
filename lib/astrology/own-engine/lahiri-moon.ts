import { EclipticGeoMoon, type AstroTime } from "astronomy-engine";
import { apparentTropicalToMeanLahiri, terrestrialTimeForCivilEphemeris } from "./lahiri-reference";

/** EclipticGeoMoon measures from the true equinox. Remove longitude nutation
 * in addition to mean precession when transforming this apparent ecliptic frame.
 * Mean-node or mean-equinox vectors must not use this conversion. */
export function lahiriMoonLongitude(time: AstroTime): number {
  const terrestrial = terrestrialTimeForCivilEphemeris(time);
  const trueLongitude = EclipticGeoMoon(terrestrial).lon;
  return apparentTropicalToMeanLahiri(trueLongitude, terrestrial);
}

export const LUNAR_FRAME_VERSION = "lahiri-iae2000-p03-true-to-mean-v2";

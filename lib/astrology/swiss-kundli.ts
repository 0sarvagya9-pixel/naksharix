import "server-only";

export type SwissKundliInput = {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  timezoneOffset: string | number;
};

export type SwissKundliPlanetName = "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn" | "Rahu" | "Ketu";

export type SwissKundliPlanet = {
  name: SwissKundliPlanetName;
  longitude: number;
  degreeInSign: number;
  rashi: string;
  rashiNumber: number;
  house: number;
  retrograde: boolean;
};

export type SwissKundliResult = {
  julianDayUtc: number;
  ayanamsa: "Lahiri";
  zodiac: "Sidereal";
  nodeType: "True Node";
  houseSystem: "Vedic Whole Sign";
  ascendant: {
    longitude: number;
    degreeInSign: number;
    rashi: string;
    rashiNumber: number;
    house: 1;
  };
  planets: SwissKundliPlanet[];
};

type SwissEph = {
  SE_SUN: number;
  SE_MOON: number;
  SE_MARS: number;
  SE_MERCURY: number;
  SE_JUPITER: number;
  SE_VENUS: number;
  SE_SATURN: number;
  SE_TRUE_NODE: number;
  SE_GREG_CAL: number;
  SE_SIDM_LAHIRI: number;
  SEFLG_SWIEPH?: number;
  SEFLG_MOSEPH?: number;
  SEFLG_SPEED: number;
  SEFLG_SIDEREAL: number;
  swe_set_ephe_path?: (path: string) => void;
  swe_set_sid_mode: (mode: number, t0: number, ayanT0: number) => void;
  swe_julday: (year: number, month: number, day: number, hour: number, calendar: number) => number;
  swe_calc_ut: (julianDayUtc: number, body: number, flags: number, callback?: (result: SwissCalcResult) => void) => SwissCalcResult | void;
  swe_houses?: (julianDayUtc: number, latitude: number, longitude: number, houseSystem: string | number, callback?: (result: SwissHouseResult) => void) => SwissHouseResult | void;
  swe_get_ayanamsa_ut?: (julianDayUtc: number, callback?: (ayanamsa: number) => void) => number | void;
};

type SwissCalcResult = {
  longitude?: number;
  latitude?: number;
  distance?: number;
  longitudeSpeed?: number;
  longitude_speed?: number;
  speedLong?: number;
  error?: string;
};

type SwissHouseResult = {
  ascendant?: number;
  ascmc?: number[];
  error?: string;
};

const rashis = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces"
] as const;

const planetBodies: Array<{ name: SwissKundliPlanetName; key: keyof SwissEph }> = [
  { name: "Sun", key: "SE_SUN" },
  { name: "Moon", key: "SE_MOON" },
  { name: "Mars", key: "SE_MARS" },
  { name: "Mercury", key: "SE_MERCURY" },
  { name: "Jupiter", key: "SE_JUPITER" },
  { name: "Venus", key: "SE_VENUS" },
  { name: "Saturn", key: "SE_SATURN" },
  { name: "Rahu", key: "SE_TRUE_NODE" }
];

export function calculateKundli(
  date: string,
  time: string,
  latitude: number,
  longitude: number,
  timezoneOffset: string | number
): SwissKundliResult {
  validateKundliInput({ date, time, latitude, longitude, timezoneOffset });
  const swisseph = loadSwissEph();
  configureVedicSwissEph(swisseph);

  const julianDayUtc = localBirthTimeToJulianDayUtc(swisseph, date, time, timezoneOffset);
  const flags = (swisseph.SEFLG_SWIEPH ?? swisseph.SEFLG_MOSEPH ?? 0) | swisseph.SEFLG_SPEED | swisseph.SEFLG_SIDEREAL;
  const ascendantLongitude = calculateAscendantLongitude(swisseph, julianDayUtc, latitude, longitude);
  const ascendantInfo = longitudeToRashi(ascendantLongitude);

  const planets = planetBodies.map(({ name, key }) => {
    const result = calculateBody(swisseph, julianDayUtc, Number(swisseph[key]), flags);
    const info = longitudeToRashi(result.longitude);
    return {
      name,
      longitude: round(result.longitude),
      degreeInSign: round(info.degreeInSign),
      rashi: info.rashi,
      rashiNumber: info.rashiNumber,
      house: wholeSignHouse(info.rashiNumber, ascendantInfo.rashiNumber),
      retrograde: planetSpeed(result) < 0
    };
  });

  const rahu = planets.find((planet) => planet.name === "Rahu");
  if (!rahu) throw new Error("Swiss Ephemeris did not return True Rahu.");

  const ketuLongitude = normalizeDegrees(rahu.longitude + 180);
  const ketuInfo = longitudeToRashi(ketuLongitude);
  planets.push({
    name: "Ketu",
    longitude: round(ketuLongitude),
    degreeInSign: round(ketuInfo.degreeInSign),
    rashi: ketuInfo.rashi,
    rashiNumber: ketuInfo.rashiNumber,
    house: wholeSignHouse(ketuInfo.rashiNumber, ascendantInfo.rashiNumber),
    retrograde: rahu.retrograde
  });

  return {
    julianDayUtc: round(julianDayUtc, 8),
    ayanamsa: "Lahiri",
    zodiac: "Sidereal",
    nodeType: "True Node",
    houseSystem: "Vedic Whole Sign",
    ascendant: {
      longitude: round(ascendantLongitude),
      degreeInSign: round(ascendantInfo.degreeInSign),
      rashi: ascendantInfo.rashi,
      rashiNumber: ascendantInfo.rashiNumber,
      house: 1
    },
    planets
  };
}

export function localBirthTimeToJulianDayUtc(
  swisseph: Pick<SwissEph, "swe_julday" | "SE_GREG_CAL">,
  date: string,
  time: string,
  timezoneOffset: string | number
) {
  const { year, month, day } = parseDate(date);
  const { hour, minute, second } = parseTime(time);
  const offsetHours = parseTimezoneOffsetToHours(timezoneOffset);
  const localUtcMillis = Date.UTC(year, month - 1, day, hour, minute, second);
  const utcDate = new Date(localUtcMillis - offsetHours * 60 * 60 * 1000);
  const utcHour = utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60 + utcDate.getUTCSeconds() / 3600 + utcDate.getUTCMilliseconds() / 3600000;
  return swisseph.swe_julday(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth() + 1,
    utcDate.getUTCDate(),
    utcHour,
    swisseph.SE_GREG_CAL
  );
}

export function parseTimezoneOffsetToHours(offset: string | number) {
  if (typeof offset === "number") {
    if (!Number.isFinite(offset) || Math.abs(offset) > 14) throw new Error("Timezone offset must be between -14 and +14 hours.");
    return offset;
  }

  const normalized = offset.trim();
  const match = normalized.match(/^([+-])?(\d{1,2})(?::?(\d{2})|\.(\d{1,2}))?$/);
  if (!match) throw new Error("Timezone offset must look like +05:30, +5.30, +5.5, or -04:00.");

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minuteToken = match[3] ?? match[4];
  let minutes = 0;

  if (minuteToken) {
    if (normalized.includes(".")) {
      minutes = minuteToken.length === 1 ? Number(`0.${minuteToken}`) * 60 : Number(minuteToken);
    } else {
      minutes = Number(minuteToken);
    }
  }

  if (hours > 14 || minutes >= 60) throw new Error("Timezone offset must be between -14 and +14 hours.");
  return sign * (hours + minutes / 60);
}

export function wholeSignHouse(planetRashiNumber: number, ascendantRashiNumber: number) {
  return ((planetRashiNumber - ascendantRashiNumber + 12) % 12) + 1;
}

function loadSwissEph(): SwissEph {
  try {
    return requireOptionalNative(getSwissEphPackageName()) as SwissEph;
  } catch {
    throw new Error("Swiss Ephemeris native module is not installed. Install optional dependency swisseph and ensure node-gyp build tools are available.");
  }
}

function getSwissEphPackageName() {
  return ["swiss", "eph"].join("");
}

function requireOptionalNative(packageName: string) {
  const runtimeRequire = Function("name", "return require(name)") as (name: string) => unknown;
  return runtimeRequire(packageName);
}

function configureVedicSwissEph(swisseph: SwissEph) {
  swisseph.swe_set_ephe_path?.(process.env.SWISSEPH_EPHE_PATH || ".");
  swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
}

function calculateBody(swisseph: SwissEph, julianDayUtc: number, body: number, flags: number) {
  const result = callSwiss<SwissCalcResult>((callback) => swisseph.swe_calc_ut(julianDayUtc, body, flags, callback));
  if (result.error || typeof result.longitude !== "number") {
    throw new Error(result.error || "Swiss Ephemeris returned an invalid planet position.");
  }
  return result as Required<Pick<SwissCalcResult, "longitude">> & SwissCalcResult;
}

function calculateAscendantLongitude(swisseph: SwissEph, julianDayUtc: number, latitude: number, longitude: number) {
  if (typeof swisseph.swe_houses === "function") {
    const result = callSwiss<SwissHouseResult>((callback) => swisseph.swe_houses?.(julianDayUtc, latitude, longitude, "W", callback));
    const ascendant = result.ascendant ?? result.ascmc?.[0];
    if (result.error || typeof ascendant !== "number") throw new Error(result.error || "Swiss Ephemeris returned an invalid ascendant.");
    return normalizeDegrees(ascendant - getAyanamsa(swisseph, julianDayUtc));
  }
  throw new Error("Installed swisseph binding does not expose swe_houses. Ascendant cannot be calculated accurately.");
}

function getAyanamsa(swisseph: SwissEph, julianDayUtc: number) {
  if (typeof swisseph.swe_get_ayanamsa_ut !== "function") return 0;
  let callbackValue: number | undefined;
  const returnValue = swisseph.swe_get_ayanamsa_ut(julianDayUtc, (value) => {
    callbackValue = value;
  });
  return Number(returnValue ?? callbackValue ?? 0);
}

function callSwiss<T>(invoke: (callback: (result: T) => void) => T | void): T {
  let callbackValue: T | undefined;
  const returnValue = invoke((result) => {
    callbackValue = result;
  });
  const result = returnValue ?? callbackValue;
  if (!result) throw new Error("Swiss Ephemeris returned no result.");
  return result;
}

function longitudeToRashi(longitude: number) {
  const normalized = normalizeDegrees(longitude);
  const signIndex = Math.floor(normalized / 30);
  return {
    rashi: rashis[signIndex],
    rashiNumber: signIndex + 1,
    degreeInSign: normalized % 30
  };
}

function planetSpeed(result: SwissCalcResult) {
  return result.longitudeSpeed ?? result.longitude_speed ?? result.speedLong ?? 0;
}

function parseDate(date: string) {
  const match = date.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error("Date must be in YYYY-MM-DD format.");
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function parseTime(time: string) {
  const match = time.trim().match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) throw new Error("Time must be in HH:MM or HH:MM:SS format.");
  return { hour: Number(match[1]), minute: Number(match[2]), second: Number(match[3] ?? 0) };
}

function validateKundliInput(input: SwissKundliInput) {
  parseDate(input.date);
  parseTime(input.time);
  parseTimezoneOffsetToHours(input.timezoneOffset);
  if (!Number.isFinite(input.latitude) || input.latitude < -90 || input.latitude > 90) throw new Error("Latitude must be between -90 and 90.");
  if (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180) throw new Error("Longitude must be between -180 and 180.");
}

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function round(value: number, digits = 6) {
  return Number(value.toFixed(digits));
}

export type ParsedBirthDateTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

type ParsedDateParts = {
  year: number;
  month: number;
  day: number;
};

type ParsedTimeParts = {
  hour: number;
  minute: number;
  second: number;
};

export function parseBirthDateTime(dateOfBirth: string | Date, timeOfBirth: string) {
  const dateParts = parseDateParts(dateOfBirth);
  const timeParts = parseTimeParts(timeOfBirth);

  return {
    ...dateParts,
    ...timeParts,
  };
}

export function normalizeBirthDate(dateOfBirth: string | Date) {
  const parts = parseDateParts(dateOfBirth);

  return `${parts.year.toString().padStart(4, "0")}-${parts.month
    .toString()
    .padStart(2, "0")}-${parts.day.toString().padStart(2, "0")}`;
}

export function normalizeBirthTime(timeOfBirth: string) {
  const parts = parseTimeParts(timeOfBirth);

  return `${parts.hour.toString().padStart(2, "0")}:${parts.minute
    .toString()
    .padStart(2, "0")}`;
}

function parseDateParts(dateInput: string | Date): ParsedDateParts {
  if (dateInput instanceof Date) {
    if (Number.isNaN(dateInput.getTime())) {
      throw new Error("Invalid date of birth.");
    }

    return validateDateParts(
      dateInput.getFullYear(),
      dateInput.getMonth() + 1,
      dateInput.getDate()
    );
  }

  const raw = String(dateInput ?? "").trim();

  if (!raw) {
    throw new Error("Date of birth is required.");
  }

  /*
    Accept:
    - 1992-10-19
    - 19/10/1992
    - 19-10-1992
    - 19 / 10 / 1992
    - 19.10.1992
    - Date strings with optional time part, e.g. 1992-10-19T00:00:00.000Z
  */
  const cleaned = raw
    .trim()
    .replace(/\s+/g, "")
    .split("T")[0]
    .split(",")[0];

  const isoMatch = cleaned.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    return validateDateParts(
      Number(isoMatch[1]),
      Number(isoMatch[2]),
      Number(isoMatch[3])
    );
  }

  const indianMatch = cleaned.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (indianMatch) {
    return validateDateParts(
      Number(indianMatch[3]),
      Number(indianMatch[2]),
      Number(indianMatch[1])
    );
  }

  throw new Error("Date of birth must use YYYY-MM-DD or DD/MM/YYYY format.");
}

function validateDateParts(year: number, month: number, day: number): ParsedDateParts {
  if (!Number.isInteger(year) || year < 1800 || year > 2200) {
    throw new Error("Invalid birth year.");
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Invalid birth month.");
  }

  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error("Invalid birth day.");
  }

  const testDate = new Date(Date.UTC(year, month - 1, day));

  if (
    testDate.getUTCFullYear() !== year ||
    testDate.getUTCMonth() + 1 !== month ||
    testDate.getUTCDate() !== day
  ) {
    throw new Error("Invalid date of birth.");
  }

  return {
    year,
    month,
    day,
  };
}

function parseTimeParts(timeText: string): ParsedTimeParts {
  const raw = String(timeText ?? "").trim().toLowerCase();

  if (!raw) {
    throw new Error("Time of birth is required.");
  }

  /*
    Accept:
    - 04:20
    - 04:20:00
    - 04:20 am
    - 4:20 am
    - 04.20 am
    - 4 pm
  */
  const cleaned = raw.replace(/\s+/g, " ");
  const timeMatch = cleaned.match(
    /^(\d{1,2})(?:[:.](\d{1,2}))?(?:[:.](\d{1,2}))?\s*(am|pm)?$/
  );

  if (!timeMatch) {
    throw new Error("Time of birth must use HH:MM, HH:MM:SS, or HH:MM AM format.");
  }

  let hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2] ?? 0);
  const second = Number(timeMatch[3] ?? 0);
  const meridiem = timeMatch[4];

  if (!Number.isInteger(hour) || !Number.isInteger(minute) || !Number.isInteger(second)) {
    throw new Error("Invalid time of birth.");
  }

  if (meridiem === "pm" && hour < 12) {
    hour += 12;
  }

  if (meridiem === "am" && hour === 12) {
    hour = 0;
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
    throw new Error("Time of birth is out of range.");
  }

  return {
    hour,
    minute,
    second,
  };
}

export function parseTimezoneOffsetToHours(
  timezone: string | number | undefined,
  date: string,
  time: string
) {
  if (typeof timezone === "number" && Number.isFinite(timezone)) {
    return timezone;
  }

  const value = String(timezone ?? "Asia/Kolkata").trim();

  if (!value) {
    return 5.5;
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return numeric;
  }

  const offsetMatch = value.match(/^([+-])?(\d{1,2})(?::?(\d{2})|\.(\d{1,2}))?$/);
  if (offsetMatch) {
    const sign = offsetMatch[1] === "-" ? -1 : 1;
    const hours = Number(offsetMatch[2]);
    const rawMinutes = offsetMatch[3] ?? offsetMatch[4];

    const minutes = rawMinutes
      ? value.includes(".") && rawMinutes.length === 1
        ? Number(`0.${rawMinutes}`) * 60
        : Number(rawMinutes)
      : 0;

    return sign * (hours + minutes / 60);
  }

  try {
    const normalizedDate = normalizeBirthDate(date);
    const normalizedTime = withSeconds(time);
    const utcGuess = new Date(`${normalizedDate}T${normalizedTime}.000Z`);

    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: value,
      timeZoneName: "shortOffset",
      hour: "2-digit",
    }).formatToParts(utcGuess);

    const token = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT+0";
    const match = token.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);

    if (!match) {
      return 5.5;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2] ?? 0);

    return hours + Math.sign(hours || 1) * (minutes / 60);
  } catch {
    return 5.5;
  }
}

export function localBirthToUtcDate(parts: ParsedBirthDateTime, timezoneOffsetHours: number) {
  const localAsUtcMillis = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return new Date(localAsUtcMillis - timezoneOffsetHours * 60 * 60 * 1000);
}

export function julianDayFromUtc(date: Date) {
  const year = date.getUTCFullYear();
  let month = date.getUTCMonth() + 1;

  const day =
    date.getUTCDate() +
    (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;

  let y = year;

  if (month <= 2) {
    y -= 1;
    month += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
}

export function daysSinceJ2000(julianDay: number) {
  return julianDay - 2451545.0;
}

export function localSiderealTimeDegrees(julianDay: number, longitude: number) {
  const t = (julianDay - 2451545.0) / 36525;

  const gmst =
    280.46061837 +
    360.98564736629 * (julianDay - 2451545.0) +
    0.000387933 * t * t -
    (t * t * t) / 38710000;

  return normalizeDegrees(gmst + longitude);
}

export function withSeconds(time: string) {
  const parts = parseTimeParts(time);

  return `${parts.hour.toString().padStart(2, "0")}:${parts.minute
    .toString()
    .padStart(2, "0")}:${parts.second.toString().padStart(2, "0")}`;
}

export function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}
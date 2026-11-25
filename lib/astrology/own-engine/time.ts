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

  const minuteTime=`${parts.hour.toString().padStart(2,"0")}:${parts.minute.toString().padStart(2,"0")}`;
  // Preserve explicitly supplied birth seconds while retaining legacy HH:MM
  // for minute-only/zero-second inputs. Both engines use this normalization.
  return parts.second===0?minuteTime:`${minuteTime}:${parts.second.toString().padStart(2,"0")}`;
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

/** Resolve a civil birth time, including DST transitions. Unknown IANA zones
 * and ambiguous/nonexistent local clock times never fall back silently to IST.
 */
export function parseTimezoneOffsetToHours(timezone:string|number|undefined,date:string,time:string){
  const local=parseBirthDateTime(date,time);
  const validOffset=(hours:number)=>{
    if(!Number.isFinite(hours)||Math.abs(hours)>14)throw new Error("Invalid timezone offset.");
    return hours;
  };
  if(typeof timezone==="number")return validOffset(timezone);
  const value=String(timezone??"Asia/Kolkata").trim();
  if(!value)throw new Error("Timezone required.");
  if(/^[+-]?\d{1,2}(?:\.\d+)?$/.test(value))return validOffset(Number(value));
  const explicit=value.match(/^([+-])(\d{1,2}):?(\d{2})$/);
  if(explicit){const minutes=Number(explicit[3]);if(minutes>=60)throw new Error("Invalid timezone minutes.");return validOffset((explicit[1]==="-"?-1:1)*(Number(explicit[2])+minutes/60));}
  const fmt=new Intl.DateTimeFormat("en-GB",{timeZone:value,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"});
  const localMillis=Date.UTC(local.year,local.month-1,local.day,local.hour,local.minute,local.second);
  const civilMillis=(utc:number)=>{
    const parts=fmt.formatToParts(new Date(utc));
    const n=(kind:string)=>Number(parts.find(p=>p.type===kind)?.value);
    return Date.UTC(n("year"),n("month")-1,n("day"),n("hour"),n("minute"),n("second"));
  };
  const offsets=new Set<number>();
  for(const delta of [-48,-24,0,24,48]){const candidate=localMillis+delta*3600000;offsets.add((civilMillis(candidate)-candidate)/3600000);}
  const matches=[...offsets].filter(offset=>civilMillis(localMillis-offset*3600000)===localMillis);
  if(matches.length!==1)throw new Error("Local birth time is ambiguous or nonexistent. Supply the recorded UTC offset.");
  return validOffset(matches[0]);
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
  if(value>=0&&value<360)return value;
  const rest=value%360;
  return rest>=0?rest:Math.min(360-Number.EPSILON*256,360+rest);
}
// The calendar-year school uses single digits throughout its dated cycles.
// Core Pythagorean name and life-path calculations retain their own master-number rule.
function root(value: number): number {
  return value === 0 ? 0 : 1 + ((value - 1) % 9);
}

export function calculateCalendarNumbers(birth: Date, reference: Date) {
  if (!Number.isFinite(birth.getTime()) || !Number.isFinite(reference.getTime())) {
    throw new Error("Invalid numerology calendar date");
  }
  const month = root(birth.getUTCMonth() + 1);
  const day = root(birth.getUTCDate());
  const year = root(birth.getUTCFullYear());
  const referenceYear = reference.getUTCFullYear();
  const referenceMonth = reference.getUTCMonth() + 1;
  const referenceDay = reference.getUTCDate();
  const personalYear = root(month + day + root(referenceYear));
  const personalMonth = root(personalYear + referenceMonth);
  const personalDay = root(personalMonth + referenceDay);
  const first = Math.abs(month - day);
  const second = Math.abs(day - year);
  return {
    method: "calendar_january_to_december_single_digit_v1" as const,
    asOf: reference.toISOString().slice(0, 10),
    referenceYear, referenceMonth, referenceDay,
    birthRoots: {month, day, year},
    personalYear, personalMonth, personalDay,
    challenges: [first, second, Math.abs(first - second), Math.abs(month - year)] as const
  };
}

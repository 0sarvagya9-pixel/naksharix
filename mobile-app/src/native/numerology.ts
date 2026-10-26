// Deterministic offline arithmetic, not a claim of astronomical or predictive accuracy.
export function digitalRoot(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const digits = [...value].map((digit) => Number(digit));
  if (!digits.some((digit) => digit !== 0)) return null;
  const sum = digits.reduce((total, digit) => total + digit, 0);
  return ((sum - 1) % 9) + 1;
}

export function computeBirthNumber(input: string): { dayNumber: number; lifePath: number } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  const [year, month, day] = input.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month ||
      date.getUTCDate() !== day || year < 1900 || year > 2100) return null;
  const dayNumber = digitalRoot(String(day));
  const lifePath = digitalRoot(input.replace(/-/g, ""));
  return dayNumber && lifePath ? { dayNumber, lifePath } : null;
}

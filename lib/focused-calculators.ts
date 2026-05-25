import { calculateNumerologyReport } from "@/lib/numerology";
import type { Locale } from "@/lib/i18n";

export type FocusedCalculatorKind =
  | "dasha"
  | "nakshatra"
  | "moon-sign"
  | "lagna"
  | "manglik"
  | "yoga"
  | "vehicle"
  | "mobile"
  | "name-number"
  | "lo-shu"
  | "destiny"
  | "personality"
  | "guna-milan"
  | "nadi-dosha"
  | "bhakoot"
  | "marriage-suitability";
export type NumberVerdict = "supportive" | "neutral" | "needsBalance";

export type FocusedNumerologyInput = {
  name: string;
  dateOfBirth: string;
  targetNumber: string;
  purpose?: string;
  kind: "vehicle" | "mobile";
};

export type FocusedNumerologyResult = {
  kind: "vehicle" | "mobile";
  name: string;
  dateOfBirth: string;
  targetNumber: string;
  purpose?: string;
  rawTotal: number;
  reducedNumber: number;
  verdict: NumberVerdict;
  moolank: number;
  bhagyank: number;
  naamank: number;
  missingNumbers: number[];
  repeatedNumbers: Array<{ number: number; count: number }>;
  supportiveNumbers: number[];
  neutralNumbers: number[];
  carefulNumbers: number[];
  loshuSupport: {
    missingSupported: number[];
    overactiveRepeated: number[];
  };
};

const masterNumbers = new Set([11, 22, 33]);

export const nakshatraNames = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati"
] as const;

export function calculateFocusedNumerology(input: FocusedNumerologyInput): FocusedNumerologyResult {
  const report = calculateNumerologyReport({
    name: input.name,
    dateOfBirth: input.dateOfBirth,
    mobile: input.kind === "mobile" ? input.targetNumber : undefined,
    vehicle: input.kind === "vehicle" ? input.targetNumber : undefined,
    locale: "en"
  });
  const rawTotal = input.kind === "mobile" ? digitTotal(input.targetNumber) : alphaNumericTotal(input.targetNumber);
  const reducedNumber = reduceNumber(rawTotal);
  const targetDigits = digitsFromString(input.targetNumber);
  const missingNumbers = report.missingNumbers.map((item) => item.value);
  const repeatedNumbers = report.repeatedNumbers.map((item) => ({ number: item.value, count: item.count }));
  const missingSupported = unique(missingNumbers.filter((number) => targetDigits.includes(number) || reducedNumber === number));
  const overactiveRepeated = unique(repeatedNumbers.filter((item) => targetDigits.includes(item.number) || reducedNumber === item.number).map((item) => item.number));
  const baseSupport = unique([report.moolank.value, report.lifePath.value, report.nameNumber.value, ...missingNumbers.slice(0, 3)]).filter((number) => number >= 1 && number <= 9);
  const carefulNumbers = unique([...overactiveRepeated, ...repeatedNumbers.filter((item) => item.count >= 3).map((item) => item.number)]);
  const neutralNumbers = Array.from({ length: 9 }, (_, index) => index + 1).filter((number) => !baseSupport.includes(number) && !carefulNumbers.includes(number));
  const directMatches = [report.moolank.value, report.lifePath.value, report.nameNumber.value].filter((number) => number === reducedNumber).length;
  const verdict: NumberVerdict = directMatches > 0 || missingSupported.length >= 2
    ? "supportive"
    : carefulNumbers.includes(reducedNumber) && directMatches === 0
      ? "needsBalance"
      : "neutral";

  return {
    kind: input.kind,
    name: report.name,
    dateOfBirth: report.dateOfBirth,
    targetNumber: input.targetNumber.trim(),
    purpose: input.purpose?.trim() || undefined,
    rawTotal,
    reducedNumber,
    verdict,
    moolank: report.moolank.value,
    bhagyank: report.lifePath.value,
    naamank: report.nameNumber.value,
    missingNumbers,
    repeatedNumbers,
    supportiveNumbers: baseSupport,
    neutralNumbers,
    carefulNumbers,
    loshuSupport: {
      missingSupported,
      overactiveRepeated
    }
  };
}

export function calculateNameNumberValue(name: string) {
  return reduceNumber(nameTotals(name).total || 1);
}

export function calculatePersonalityNumberValue(name: string) {
  return reduceNumber(Math.max(1, nameTotals(name).consonants || nameTotals(name).total || 1));
}

export function reduceNumerologyNumber(value: number) {
  return reduceNumber(value);
}

export function dateDigitCounts(dateOfBirth: string | Date) {
  const date = dateOfBirth instanceof Date ? dateOfBirth : new Date(`${String(dateOfBirth).slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return {};
  const text = `${String(date.getUTCDate()).padStart(2, "0")}${String(date.getUTCMonth() + 1).padStart(2, "0")}${date.getUTCFullYear()}`;
  return text.split("").map(Number).reduce<Record<number, number>>((acc, digit) => {
    if (digit >= 1 && digit <= 9) acc[digit] = (acc[digit] ?? 0) + 1;
    return acc;
  }, {});
}

export function nakshatraIndex(name: string | undefined) {
  if (!name) return undefined;
  const normalized = normalizeName(name);
  const index = nakshatraNames.findIndex((item) => normalizeName(item) === normalized);
  return index >= 0 ? index + 1 : undefined;
}

export function localizedError(locale: Locale) {
  if (locale === "hi") return "यह फ़ील्ड आवश्यक है।";
  if (locale === "hinglish") return "Ye field required hai.";
  return "This field is required.";
}

export function calculationFailed(locale: Locale) {
  if (locale === "hi") return "दिए गए विवरणों से परिणाम निकालना संभव नहीं हुआ। कृपया विवरण जांचकर फिर प्रयास करें।";
  if (locale === "hinglish") return "Diye gaye details se result calculate nahi ho paya. Please details check karke fir try karein.";
  return "We could not calculate this result from the provided details. Please check the details and try again.";
}

function reduceNumber(value: number): number {
  if (masterNumbers.has(value)) return value;
  if (value <= 9) return Math.max(1, value);
  return reduceNumber(String(value).split("").reduce((sum, digit) => sum + Number(digit), 0));
}

function digitTotal(value: string) {
  return digitsFromString(value).reduce((sum, digit) => sum + digit, 0);
}

function digitsFromString(value: string) {
  return value.replace(/\D/g, "").split("").map(Number).filter((digit) => Number.isFinite(digit) && digit > 0);
}

function alphaNumericTotal(value: string) {
  return [...value.toUpperCase().replace(/[^A-Z0-9]/g, "")].reduce((sum, char) => {
    if (/\d/.test(char)) return sum + Number(char);
    return sum + ((char.charCodeAt(0) - 65) % 9) + 1;
  }, 0);
}

function nameTotals(name: string) {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "");
  return [...letters].reduce(
    (acc, letter) => {
      const value = ((letter.charCodeAt(0) - 65) % 9) + 1;
      acc.total += value;
      if (["A", "E", "I", "O", "U"].includes(letter)) acc.vowels += value;
      else acc.consonants += value;
      return acc;
    },
    { total: 0, vowels: 0, consonants: 0 }
  );
}

function unique(values: number[]) {
  return [...new Set(values)].filter((number) => Number.isFinite(number));
}

function normalizeName(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z]/g, "");
}

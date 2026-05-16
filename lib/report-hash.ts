import "server-only";

import { createHash } from "crypto";
import { format } from "date-fns";
import type { AstrologyBirthInput, AstrologyLanguage } from "@/lib/astrology/types";

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function createHashKey(value: unknown) {
  return createHash("sha256").update(stableStringify(value)).digest("hex").slice(0, 24);
}

export function createBirthHash(input: AstrologyBirthInput) {
  return createHashKey({
    name: input.name.trim().toLowerCase(),
    gender: input.gender,
    dateOfBirth: input.dateOfBirth instanceof Date ? format(input.dateOfBirth, "yyyy-MM-dd") : input.dateOfBirth,
    timeOfBirth: input.timeOfBirth,
    birthPlace: input.birthPlace.trim().toLowerCase(),
    latitude: Number(input.latitude).toFixed(5),
    longitude: Number(input.longitude).toFixed(5),
    timezone: input.timezone
  });
}

export function kundliCacheKey(birthHash: string, language: AstrologyLanguage) {
  return `kundli:v2:${birthHash}:${language}`;
}

export function dailyCacheKey(birthHash: string, date: Date, language: AstrologyLanguage) {
  return `daily:${birthHash}:${format(date, "yyyy-MM-dd")}:${language}`;
}

export function weeklyCacheKey(birthHash: string, date: Date, language: AstrologyLanguage) {
  return `weekly:${birthHash}:${format(date, "RRRR-II")}:${language}`;
}

export function monthlyCacheKey(birthHash: string, date: Date, language: AstrologyLanguage) {
  return `monthly:${birthHash}:${format(date, "yyyy-MM")}:${language}`;
}

export function yearlyCacheKey(birthHash: string, date: Date, language: AstrologyLanguage) {
  return `yearly:${birthHash}:${format(date, "yyyy")}:${language}`;
}

export function matchCacheKey(brideHash: string, groomHash: string, language: AstrologyLanguage) {
  return `match:${brideHash}:${groomHash}:${language}`;
}

export function pdfCacheKey(reportHash: string, pdfType: "FREE" | "PREMIUM") {
  return `pdf:${reportHash}:${pdfType}`;
}

export const cacheTtl = {
  daily: 60 * 60 * 24,
  weekly: 60 * 60 * 24 * 7,
  monthly: 60 * 60 * 24 * 30,
  yearly: 60 * 60 * 24 * 365,
  longTerm: 60 * 60 * 24 * 365
};

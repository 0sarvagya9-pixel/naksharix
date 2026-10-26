export const FREE_LESSON_IDS = [
  "birth-chart", "panchang", "nakshatras", "dasha"
] as const;
export type FreeLessonId = (typeof FREE_LESSON_IDS)[number];
export function isFreeLessonId(value: unknown): value is FreeLessonId {
  return typeof value === "string" && FREE_LESSON_IDS.some((id) => id === value);
}

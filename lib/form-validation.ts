import type { Locale } from "@/lib/i18n";
import { requiredMessages } from "@/lib/i18n";

export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

export function requiredMessage(locale: Locale) {
  return requiredMessages[locale];
}

export function isBlank(value: unknown) {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "") || (typeof value === "number" && Number.isNaN(value));
}

export function scrollToFirstError(errors: Record<string, unknown>) {
  const firstKey = Object.keys(errors)[0];
  if (!firstKey) return;
  requestAnimationFrame(() => {
    const target = document.querySelector<HTMLElement>(`[data-field="${CSS.escape(firstKey)}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    target?.focus?.();
  });
}

export function errorClass(hasError: boolean) {
  return hasError ? "border-destructive focus-visible:ring-destructive" : "";
}

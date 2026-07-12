import "server-only";
import { t, type Locale, type TranslationKey } from "@/lib/i18n";
import { safeTranslation } from "@/lib/i18n-safe-overrides";

export function safeServerTranslation(locale: Locale, key: TranslationKey) {
  return safeTranslation(locale, key, t(locale, key));
}

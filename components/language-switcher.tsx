"use client";

import type { Locale } from "@/lib/i18n";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(event) => setLocale(event.target.value as Locale)}
      className={cn("hidden h-9 w-[120px] min-w-[120px] flex-shrink-0 rounded-md border border-[#F5C542]/25 bg-[#12051f] px-2 text-xs naksh-muted-text sm:block", className)}
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
      <option value="hinglish">Hinglish</option>
    </select>
  );
}

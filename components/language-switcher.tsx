"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import { publishedDestinationForLocale } from "@/lib/seo-localization";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function choose(nextLocale: Locale) {
    setOpen(false);
    const path = window.location.pathname;
    const publishedRoute = publishedDestinationForLocale(path, nextLocale);
    const destination = publishedRoute ?? (path.startsWith("/hi/") && nextLocale !== "hi" ? "/" : undefined);
    if (destination && destination !== path) {
      setLocale(nextLocale);
      window.location.assign(destination + window.location.search + window.location.hash);
      return;
    }
    setLocale(nextLocale);
  }

  return (
    <div ref={menuRef} className={cn("relative hidden flex-shrink-0 sm:block", className)}>
      <button
        type="button"
        aria-label="Language"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-full min-w-12 items-center justify-center rounded-md border border-[#d9b99f] bg-[#fff8ee] px-2 text-xs font-bold text-[#6e2837] outline-none transition hover:border-[#9b3342] hover:bg-[#f8eadb] focus:border-[#9b3342] focus:ring-2 focus:ring-[#9b3342]/20"
      >
        {languageCode(locale)}
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label="Language options"
          className="absolute right-0 top-full z-[90] mt-2 w-36 rounded-xl border border-[#e6c6a7] bg-[#fffcf8]/95 p-1.5 shadow-xl ring-1 ring-[#9b3342]/10 backdrop-blur-xl"
        >
          {languageOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={locale === option.value}
              onClick={() => choose(option.value)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold transition",
                locale === option.value
                  ? "bg-[#f8e3d2] text-[#7d2735]"
                  : "text-[#4b3338] hover:bg-[#fae9dc] hover:text-[#7d2735]"
              )}
            >
              <span>{option.label}</span>
              <span className="text-[0.65rem] text-[#8b6862]">{languageCode(option.value)}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const languageOptions: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी" },
  { value: "hinglish", label: "Hinglish" }
];

function languageCode(locale: Locale) {
  if (locale === "hi") return "HI";
  if (locale === "hinglish") return "HIN";
  return "EN";
}

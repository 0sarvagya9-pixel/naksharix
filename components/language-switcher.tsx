"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

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
    setLocale(nextLocale);
    setOpen(false);
  }

  return (
    <div ref={menuRef} className={cn("relative hidden flex-shrink-0 sm:block", className)}>
      <button
        type="button"
        aria-label="Language"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-full min-w-12 items-center justify-center rounded-md border border-[#263957] bg-[#0f1c3a] px-2 text-xs font-bold text-[#ffffff] outline-none transition hover:border-[#dca956]/60 hover:bg-[#142647] focus:border-[#dca956] focus:ring-2 focus:ring-[#dca956]/20"
      >
        {languageCode(locale)}
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label="Language options"
          className="absolute right-0 top-full z-[90] mt-2 w-36 rounded-xl border border-[#dca956]/30 bg-[#050b18]/95 p-1.5 shadow-2xl shadow-black/70 ring-1 ring-white/5 backdrop-blur-xl"
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
                  ? "bg-[#dca956]/14 text-[#f3d382]"
                  : "text-white hover:bg-[#0f1c3a] hover:text-[#f3d382]"
              )}
            >
              <span>{option.label}</span>
              <span className="text-[0.65rem] text-[#94a3b8]">{languageCode(option.value)}</span>
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

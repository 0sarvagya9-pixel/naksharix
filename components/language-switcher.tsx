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
        className="flex h-9 w-full min-w-12 items-center justify-center rounded-md border border-[#E7D8BE] bg-white/85 px-2 text-xs font-bold text-[#1F2933] outline-none transition hover:border-[#D8AF66] hover:bg-[#FFF9F0] focus:border-[#D8AF66] focus:ring-2 focus:ring-[#DCE8F7]"
      >
        {languageCode(locale)}
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label="Language options"
          className="absolute right-0 top-full z-[90] mt-2 w-36 rounded-xl border border-[#E7D8BE] bg-white/95 p-1.5 shadow-2xl shadow-[#b8862e]/15 ring-1 ring-[#E7D8BE]/60 backdrop-blur-xl"
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
                  ? "bg-[#F7EAD3]/75 text-[#B8862E]"
                  : "text-[#1F2933] hover:bg-[#F7EAD3]/70 hover:text-[#B8862E]"
              )}
            >
              <span>{option.label}</span>
              <span className="text-[0.65rem] text-[#6B7280]">{languageCode(option.value)}</span>
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

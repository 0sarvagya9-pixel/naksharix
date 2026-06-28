"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProfileMenu } from "@/components/auth-profile-menu";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home",        href: "/",                active: ["/"] },
  { label: "Kundli",      href: "/kundli",           active: ["/kundli", "/free-kundli"] },
  { label: "Horoscope",   href: "/daily-horoscope",  active: ["/horoscope", "/daily-horoscope", "/weekly-horoscope", "/monthly-horoscope"] },
  { label: "Panchang",    href: "/panchang",         active: ["/panchang"] },
  { label: "Numerology",  href: "/numerology",       active: ["/numerology"] },
  { label: "Tarot",       href: "/tarot",            active: ["/tarot"] },
  { label: "Remedies",    href: "/free-calculators", active: ["/free-calculators", "/calculators"] },
];

const moreLinks = [
  { label: "AI Astrologer", href: "/ai-astrologer" },
  { label: "Shop", href: "/shop" },
  { label: "Consultation", href: "/consultation" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms" },
  { label: "Refund Policy", href: "/refund-policy" }
];

export function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (pathname.startsWith("/astrologer")) return null;

  return (
    <div className="sticky top-3 z-50 mx-4 max-w-[1440px] xl:mx-auto">
      <header className="w-full rounded-2xl border border-[rgba(255,255,255,0.42)] bg-[rgba(255,255,255,0.72)] shadow-[0_12px_40px_rgba(15,18,30,0.12)] backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex h-14 w-full items-center gap-4 px-5 lg:px-8">
          <div className="flex min-w-[14rem] flex-shrink-0 items-center">
            <BrandLogo className="max-w-full" />
          </div>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex" aria-label="Primary navigation">
            {navLinks.map((item) => {
              const active = isActive(pathname, item.href, item.active);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-semibold text-[#5c6170] transition hover:bg-[rgba(255,255,255,0.42)] hover:text-[#1b1c22]",
                    active ? "bg-[rgba(216,154,43,0.08)] text-[#d89a2b] font-bold border border-[rgba(216,154,43,0.18)]" : ""
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="group relative">
              <button
                type="button"
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#5c6170] transition hover:bg-[rgba(255,255,255,0.42)] hover:text-[#1b1c22]"
              >
                More
              </button>
              <div className="invisible absolute right-0 top-[110%] z-[80] w-64 translate-y-2 rounded-xl border border-[rgba(255,255,255,0.42)] bg-[rgba(255,255,255,0.94)] p-3 opacity-0 shadow-[0_12px_40px_rgba(15,18,30,0.12)] backdrop-blur-xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#d89a2b]">Explore</p>
                <div className="grid gap-0.5">
                  {moreLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#5c6170] transition hover:bg-[rgba(255,255,255,0.42)] hover:text-[#1b1c22]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="ml-auto flex flex-shrink-0 items-center gap-2 border-l border-[rgba(20,20,20,0.08)] pl-3">
            <LanguageSwitcher className="w-auto min-w-12" />
            <ThemeToggle />
            <AuthProfileMenu />
            <Link
              href="/kundli"
              className="hidden xl:inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-[#d89a2b] to-[#b97810] px-3.5 py-1.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(216,154,43,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(216,154,43,0.28)]"
              style={{ textDecoration: "none" }}
            >
              Get Started
            </Link>
            <Button
              ref={menuButtonRef}
              variant="outline"
              size="icon"
              className="border-[rgba(20,20,20,0.08)] bg-white/80 text-[#3a3a3c] xl:hidden"
              aria-label="Open navigation menu"
              aria-expanded={open}
              aria-controls="naksharix-mobile-sidebar"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {open ? (
          <div className="fixed inset-0 z-[100] bg-black/10 backdrop-blur-sm xl:hidden" role="dialog" aria-modal="true">
            <aside id="naksharix-mobile-sidebar" className="ml-auto h-full w-[min(88vw,380px)] overflow-y-auto border-l border-[rgba(20,20,20,0.08)] bg-[rgba(255,255,255,0.98)] p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <BrandLogo className="max-w-[12rem]" />
                <Button
                  variant="outline"
                  size="icon"
                  className="border-[rgba(20,20,20,0.08)] bg-white text-[#3a3a3c]"
                  aria-label="Close navigation menu"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-6 grid gap-2">
                {[...navLinks, ...moreLinks].map((item) => (
                  <Link
                    key={`${item.href}-mobile`}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-[rgba(20,20,20,0.08)] bg-white px-4 py-3 text-sm font-semibold text-[#3a3a3c] hover:bg-[rgba(20,20,20,0.03)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        ) : null}
      </header>
    </div>
  );
}


function isActive(pathname: string, href: string, activePaths: readonly string[]) {
  if (href === "/") return pathname === "/";
  return activePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

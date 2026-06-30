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

const zodiacSigns = [
  { label: "Aries", href: "/zodiac/aries" },
  { label: "Taurus", href: "/zodiac/taurus" },
  { label: "Gemini", href: "/zodiac/gemini" },
  { label: "Cancer", href: "/zodiac/cancer" },
  { label: "Leo", href: "/zodiac/leo" },
  { label: "Virgo", href: "/zodiac/virgo" },
  { label: "Libra", href: "/zodiac/libra" },
  { label: "Scorpio", href: "/zodiac/scorpio" },
  { label: "Sagittarius", href: "/zodiac/sagittarius" },
  { label: "Capricorn", href: "/zodiac/capricorn" },
  { label: "Aquarius", href: "/zodiac/aquarius" },
  { label: "Pisces", href: "/zodiac/pisces" }
];

const horoscopeOptions = [
  { label: "Daily Horoscope", href: "/daily-horoscope" },
  { label: "Weekly Horoscope", href: "/weekly-horoscope" },
  { label: "Weekly Love Horoscope", href: "/weekly-love-horoscope" },
  { label: "Yearly Horoscope 2026", href: "/yearly-horoscope-2026" }
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
    <div className="sticky top-0 z-50 w-full">
      <header
        className="w-full transition-all duration-300"
        style={{
          background: "rgba(18, 22, 34, 0.38)",
          backdropFilter: "blur(22px) saturate(145%)",
          WebkitBackdropFilter: "blur(22px) saturate(145%)",
          borderBottom: "1px solid rgba(255,255,255,0.22)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)"
        }}
      >
        <div className="mx-auto flex h-14 w-full items-center gap-4 px-5 lg:px-8">
          <div className="flex min-w-[14rem] flex-shrink-0 items-center">
            <BrandLogo className="max-w-full" />
          </div>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex" aria-label="Primary navigation">
            {navLinks.map((item) => {
              if (item.label === "Horoscope") {
                const isHoroscopeActive = pathname.includes("horoscope") || pathname.includes("zodiac");
                return (
                  <div key={item.href} className="group relative">
                    <Link
                      href={item.href}
                      className={cn(
                        "px-3 py-1 text-sm font-semibold text-[#fffff0]/90 transition hover:text-white flex items-center gap-0.5",
                        isHoroscopeActive ? "text-[#f2c56b] font-bold border-b-2 border-[#f2c56b] rounded-none px-1 py-0.5" : ""
                      )}
                    >
                      {item.label}
                    </Link>
                    <div
                      className="invisible absolute left-1/2 -translate-x-1/2 top-[120%] z-[1000] translate-y-2 rounded-xl p-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 w-[480px]"
                      style={{
                        background: "rgba(10, 14, 26, 0.94)",
                        backdropFilter: "blur(18px) saturate(140%)",
                        WebkitBackdropFilter: "blur(18px) saturate(140%)",
                        border: "1px solid rgba(255, 255, 255, 0.18)",
                        boxShadow: "0 22px 60px rgba(0,0,0,0.45)"
                      }}
                    >
                      <div className="grid grid-cols-[160px_1fr] gap-4 text-left">
                        <div>
                          <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f2c56b]">Horoscopes</p>
                          <div className="grid gap-0.5">
                            {horoscopeOptions.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#fffaf0]/80 transition hover:bg-[rgba(242,197,107,0.10)] hover:text-[#f2c56b]"
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f2c56b]">Zodiac Signs</p>
                          <div className="grid grid-cols-3 gap-1">
                            {zodiacSigns.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className="rounded-lg px-2 py-1 text-xs font-semibold text-[#fffaf0]/80 transition hover:bg-[rgba(242,197,107,0.10)] hover:text-[#f2c56b]"
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              const active = isActive(pathname, item.href, item.active);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "px-3 py-1 text-sm font-semibold text-[#fffff0]/90 transition hover:text-white",
                    active ? "text-[#f2c56b] font-bold border-b-2 border-[#f2c56b] rounded-none px-1 py-0.5" : ""
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="group relative">
              <button
                type="button"
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#fffff0]/90 transition hover:text-white"
              >
                More
              </button>
              <div
                className="invisible absolute right-0 top-[120%] z-[100] w-64 translate-y-2 rounded-xl p-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
                style={{
                  background: "rgba(8, 14, 30, 0.94)",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)"
                }}
              >
                <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f2c56b]">Explore</p>
                <div className="grid gap-0.5">
                  {moreLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#fffaf0]/80 transition hover:bg-white/10 hover:text-[#fffaf0]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="ml-auto flex flex-shrink-0 items-center gap-2 border-l border-[rgba(255,255,255,0.15)] pl-3">
            <LanguageSwitcher className="w-auto min-w-12" />
            <ThemeToggle />
            <AuthProfileMenu />
            <Link
              href="/kundli"
              className="hidden xl:inline-flex items-center justify-center px-4 font-bold text-xs hover:-translate-y-0.5 transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #f7d17a, #c98924)",
                color: "#17181d",
                height: "38px",
                borderRadius: "14px",
                boxShadow: "0 10px 28px rgba(201,137,36,0.28)",
                textDecoration: "none"
              }}
            >
              Get Started
            </Link>
            <Button
              ref={menuButtonRef}
              variant="outline"
              size="icon"
              className="border-[rgba(255,255,255,0.22)] bg-white/10 text-white hover:bg-white/20 xl:hidden"
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

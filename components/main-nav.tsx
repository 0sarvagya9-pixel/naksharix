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
    <header className="sticky top-0 z-50 w-full border-b border-[#e7d8be] bg-[#fffaf1]/90 shadow-[0_18px_55px_rgba(31,41,51,0.08)] backdrop-blur-xl">
      <div className="mx-auto flex h-24 w-full max-w-[1540px] items-center gap-4 px-5 2xl:px-8">
        <div className="flex min-w-[14rem] flex-shrink-0 items-center">
          <BrandLogo className="max-w-full" />
        </div>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex" aria-label="Primary navigation">
          {navLinks.map((item) => {
            const active = isActive(pathname, item.href, item.active);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("rounded-xl px-3 py-2 text-sm font-extrabold text-[#172536] transition hover:bg-[#fff4df] hover:text-[#b8862e]", active ? "bg-[#fff4df] text-[#b8862e] shadow-[0_12px_30px_rgba(184,134,46,0.12)]" : "")}>{item.label}</Link>
            );
          })}
          <div className="group relative">
            <button type="button" className="rounded-xl px-3 py-2 text-sm font-extrabold text-[#172536] transition hover:bg-[#fff4df] hover:text-[#b8862e]">More</button>
            <div className="invisible absolute right-0 top-full z-[80] mt-3 w-72 translate-y-2 rounded-3xl border border-[#e7d8be] bg-[#fffaf1]/98 p-4 opacity-0 shadow-[0_24px_70px_rgba(31,41,51,0.14)] backdrop-blur-xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <p className="px-2 pb-2 text-xs font-black uppercase tracking-[0.22em] text-[#b8862e]">Explore</p>
              <div className="grid gap-1">
                {moreLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-2xl px-3 py-2 text-sm font-extrabold text-[#172536] transition hover:bg-[#fff4df] hover:text-[#b8862e]">{item.label}</Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className="ml-auto flex flex-shrink-0 items-center gap-2 border-l border-[rgba(212,160,55,0.30)] pl-3">
          <LanguageSwitcher className="w-auto min-w-12" />
          <ThemeToggle />
          <AuthProfileMenu />
          <Link
            href="/kundli"
            className="hidden xl:inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold text-white"
            style={{
              background: "linear-gradient(135deg, #D97706 0%, #F59E0B 70%, #D4A037 100%)",
              boxShadow: "0 4px 16px rgba(217,119,6,0.30)",
              textDecoration: "none",
            }}
          >
            Get Started →
          </Link>
          <Button ref={menuButtonRef} variant="outline" size="icon" className="border-[rgba(212,160,55,0.40)] bg-white text-[#172536] xl:hidden" aria-label="Open navigation menu" aria-expanded={open} aria-controls="naksharix-mobile-sidebar" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></Button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[100] bg-[#172536]/35 backdrop-blur-sm xl:hidden" role="dialog" aria-modal="true">
          <aside id="naksharix-mobile-sidebar" className="ml-auto h-full w-[min(88vw,380px)] overflow-y-auto border-l border-[#e7d8be] bg-[#fffaf1] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <BrandLogo className="max-w-[12rem]" />
              <Button variant="outline" size="icon" className="border-[#e7d8be] bg-white text-[#172536]" aria-label="Close navigation menu" onClick={() => setOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
            <div className="mt-6 grid gap-2">
              {[...navLinks, ...moreLinks].map((item) => (
                <Link key={`${item.href}-mobile`} href={item.href} onClick={() => setOpen(false)} className="rounded-2xl border border-[#e7d8be] bg-white px-4 py-3 text-sm font-extrabold text-[#172536]">{item.label}</Link>
              ))}
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}

function isActive(pathname: string, href: string, activePaths: readonly string[]) {
  if (href === "/") return pathname === "/";
  return activePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AuthProfileMenu } from "@/components/auth-profile-menu";
import { BrandLogo } from "@/components/brand-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/", active: ["/"] },
  { label: "Kundli", href: "/kundli", active: ["/kundli", "/free-kundli"] },
  { label: "Horoscope", href: "/daily-horoscope", active: ["/horoscope", "/daily-horoscope", "/weekly-horoscope", "/monthly-horoscope", "/yearly-horoscope"] },
  { label: "Panchang", href: "/panchang", active: ["/panchang"] },
  { label: "Numerology", href: "/numerology", active: ["/numerology"] },
  { label: "Tarot", href: "/tarot", active: ["/tarot"] },
  { label: "Remedies", href: "/free-calculators", active: ["/free-calculators", "/calculators"] }
] as const;

const exploreLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Disclaimer", href: "/disclaimer" }
] as const;

const toolsLinks = [
  { label: "Book Consultation", href: "/consultation" },
  { label: "Premium Reports", href: "/reports" },
  { label: "Free Calculators", href: "/free-calculators" },
  { label: "Saved Reports", href: "/saved-reports" },
  { label: "Yearly Horoscope", href: "/yearly-horoscope" },
  { label: "Daily Horoscope", href: "/horoscope" }
] as const;

const serviceLinks = [
  { label: "AI Astrologer", href: "/ai-astrologer" },
  { label: "Spiritual Catalogue", href: "/shop" }
] as const;

const moreLinks = [...exploreLinks, ...toolsLinks, ...serviceLinks];

const zodiacSigns = [
  { label: "Aries", href: "/horoscope/aries" },
  { label: "Taurus", href: "/horoscope/taurus" },
  { label: "Gemini", href: "/horoscope/gemini" },
  { label: "Cancer", href: "/horoscope/cancer" },
  { label: "Leo", href: "/horoscope/leo" },
  { label: "Virgo", href: "/horoscope/virgo" },
  { label: "Libra", href: "/horoscope/libra" },
  { label: "Scorpio", href: "/horoscope/scorpio" },
  { label: "Sagittarius", href: "/horoscope/sagittarius" },
  { label: "Capricorn", href: "/horoscope/capricorn" },
  { label: "Aquarius", href: "/horoscope/aquarius" },
  { label: "Pisces", href: "/horoscope/pisces" }
] as const;

const horoscopeOptions = [
  { label: "Daily Horoscope", href: "/daily-horoscope" },
  { label: "Weekly Horoscope", href: "/weekly-horoscope" },
  { label: "Weekly Love Horoscope", href: "/weekly-love-horoscope" },
  { label: "Yearly Horoscope", href: "/yearly-horoscope" }
] as const;

const dropdownStyle = {
  background: "rgba(10, 14, 26, 0.95)",
  border: "1px solid rgba(255, 255, 255, 0.20)",
  backdropFilter: "blur(18px) saturate(140%)",
  WebkitBackdropFilter: "blur(18px) saturate(140%)",
  boxShadow: "0 22px 60px rgba(0,0,0,0.45)"
};

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
            {navLinks.map((item) => item.label === "Horoscope" ? (
              <HoroscopeMenu key={item.href} pathname={pathname} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(pathname, item.href, item.active) ? "page" : undefined}
                className={navLinkClass(isActive(pathname, item.href, item.active))}
              >
                {item.label}
              </Link>
            ))}
            <MoreMenu />
          </nav>

          <div className="ml-auto flex flex-shrink-0 items-center gap-2 border-l border-[rgba(255,255,255,0.15)] pl-3">
            <LanguageSwitcher className="w-auto min-w-12" />
            <ThemeToggle />
            <AuthProfileMenu />
            <Link
              href="/kundli"
              className="hidden items-center justify-center px-4 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 xl:inline-flex"
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
                <Button variant="outline" size="icon" className="border-[rgba(20,20,20,0.08)] bg-white text-[#3a3a3c]" aria-label="Close navigation menu" onClick={() => setOpen(false)}>
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

function HoroscopeMenu({ pathname }: { pathname: string }) {
  const active = pathname.includes("horoscope") || pathname.includes("zodiac");
  return (
    <div className="group relative">
      <Link href="/daily-horoscope" className={navLinkClass(active)}>Horoscope</Link>
      <div className="invisible absolute left-1/2 top-[120%] z-[1000] w-[480px] -translate-x-1/2 translate-y-2 rounded-xl p-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100" style={dropdownStyle}>
        <div className="grid grid-cols-[160px_1fr] gap-4 text-left">
          <MenuColumn title="Horoscopes" links={horoscopeOptions} />
          <div>
            <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f2c56b]">Zodiac Signs</p>
            <div className="grid grid-cols-3 gap-1">
              {zodiacSigns.map((item) => <DropdownLink key={item.href} item={item} compact />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoreMenu() {
  return (
    <div className="group relative">
      <button type="button" className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#fffff0]/90 transition hover:text-white">More</button>
      <div className="invisible absolute right-0 top-[120%] z-[1000] w-[460px] translate-y-2 rounded-xl p-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100" style={dropdownStyle}>
        <div className="grid grid-cols-3 gap-4 text-left">
          <MenuColumn title="Explore" links={exploreLinks} />
          <MenuColumn title="Tools" links={toolsLinks} />
          <MenuColumn title="Services" links={serviceLinks} />
        </div>
      </div>
    </div>
  );
}

function MenuColumn({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f2c56b]">{title}</p>
      <div className="grid gap-0.5">
        {links.map((item) => <DropdownLink key={item.href} item={item} />)}
      </div>
    </div>
  );
}

function DropdownLink({ item, compact = false }: { item: { label: string; href: string }; compact?: boolean }) {
  return (
    <Link href={item.href} className={cn("rounded-lg text-xs font-semibold text-[#fffaf0]/80 transition hover:bg-[rgba(242,197,107,0.10)] hover:text-[#f2c56b]", compact ? "px-2 py-1" : "px-2.5 py-1.5")}>
      {item.label}
    </Link>
  );
}

function navLinkClass(active: boolean) {
  return cn(
    "flex items-center gap-0.5 px-3 py-1 text-sm font-semibold text-[#fffff0]/90 transition hover:text-white",
    active ? "rounded-none border-b-2 border-[#f2c56b] px-1 py-0.5 font-bold text-[#f2c56b]" : ""
  );
}

function isActive(pathname: string, href: string, activePaths: readonly string[]) {
  if (href === "/") return pathname === "/";
  return activePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

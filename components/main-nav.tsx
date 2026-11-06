"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu, X, ShoppingCart, UserRound, Search, Heart } from "lucide-react";
import { AuthProfileMenu } from "@/components/auth-profile-menu";
import { BrandLogo } from "@/components/brand-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/components/language-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/", active: ["/"] },
  { label: "Kundli", href: "/kundli", active: ["/kundli", "/free-kundli"] },
  { label: "Horoscope", href: "/daily-horoscope", active: ["/horoscope", "/daily-horoscope", "/weekly-horoscope", "/monthly-horoscope", "/yearly-horoscope"] },
  { label: "Panchang", href: "/panchang", active: ["/panchang"] },
  { label: "Puja", href: "/pujas", active: ["/pujas", "/puja-enquiry", "/puja-calendar"] },
  { label: "Reports", href: "/reports", active: ["/reports"] },
  { label: "Shop", href: "/shop", active: ["/shop"] },
  { label: "Consultation", href: "/consultation", active: ["/consultation", "/astrologers"] }
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
  { label: "Spiritual Catalogue", href: "/shop" },
  { label: "Ask an Astrologer", href: "/ask-astrologer" },
  { label: "All Puja Types", href: "/pujas" },
  { label: "Puja & Traditions", href: "/puja-enquiry" },
  { label: "Two-Year Puja Calendar", href: "/puja-calendar" },
  { label: "Learning Library", href: "/learn" }
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
  background: "rgba(80, 30, 33, 0.98)",
  border: "1px solid rgba(255, 255, 255, 0.20)",
  backdropFilter: "blur(18px) saturate(140%)",
  WebkitBackdropFilter: "blur(18px) saturate(140%)",
  boxShadow: "0 22px 60px rgba(0,0,0,0.45)"
};

export function MainNav() {
  const pathname = usePathname();
  const { locale, tr } = useLanguage();
  const navText = (label: string) => (label === "Kundli" && locale === "en") ? "Free Kundli" : (label === "Consultation" && locale === "en") ? "Consultations" : label === "Puja"
    ? locale === "hi" ? "पूजा" : "Puja"
    : ({
        Home: "navHome", Reports: "navReports", Consultation: "consult",
        Shop: "navShop", Kundli: "navKundli", Horoscope: "horoscope",
        Panchang: "navPanchang", More: "navMore"
      } as Record<string, string>)[label]
      ? tr(({
        Home: "navHome", Reports: "navReports", Consultation: "consult",
        Shop: "navShop", Kundli: "navKundli", Horoscope: "horoscope",
        Panchang: "navPanchang", More: "navMore"
      } as Record<string, string>)[label])
      : label;
  const [open, setOpen] = useState(false);
  const [mobileUser, setMobileUser] = useState<{ effectiveRole?: string | null; role?: string | null } | null>(null);
  const [mobileAuthReady, setMobileAuthReady] = useState(false);
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

  useEffect(() => {
    // Close the mobile dialog after client-side navigation (including back).
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setMobileAuthReady(false);
    fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" })
      .then(async response => response.ok ? (await response.json()).data?.user ?? null : null)
      .then(value => { if (active) setMobileUser(value); })
      .catch(() => { if (active) setMobileUser(null); })
      .finally(() => { if (active) setMobileAuthReady(true); });
    return () => { active = false; };
  }, [open]);

  const mobilePortalRole = mobileUser?.effectiveRole ?? mobileUser?.role;
  const mobileAstrologer = mobilePortalRole === "ASTROLOGER" || mobilePortalRole === "CONSULTANT";

  if (pathname.startsWith("/astrologer")) return null;

  return (
    <div className="sticky top-0 z-50 w-full">
      <div className="nx-reference-promo">
        <span>{locale === "hi" ? "NAKSHARIX • वैदिक ज्योतिष, पारंपरिक ज्ञान और व्यक्तिगत मार्गदर्शन" : "NAKSHARIX  |  Vedic heritage, thoughtfully designed for today"}</span>
        <Link href="/pujas">{locale === "hi" ? "पूजा सेवाएँ देखें" : "Traditional knowledge"} <span aria-hidden="true">→</span></Link>
      </div>
      <header
        className="w-full transition-all duration-300"
        style={{
          background: "rgba(255, 251, 247, 0.97)",
          backdropFilter: "blur(22px) saturate(145%)",
          WebkitBackdropFilter: "blur(22px) saturate(145%)",
          borderBottom: "1px solid rgba(126,39,37,0.16)",
          boxShadow: "0 7px 22px rgba(76,32,27,0.07)"
        }}
      >
        <div className="nx-main-header-row mx-auto flex h-14 w-full min-w-0 items-center gap-2 px-3 sm:gap-4 sm:px-5 lg:px-8">
          <div className="nx-main-brand flex min-w-0 flex-1 items-center xl:min-w-[10rem] xl:flex-none">
            <BrandLogo className="max-w-full" />
          </div>

          <nav className="nx-main-primary-nav hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex" aria-label="Primary navigation">
            {navLinks.map((item) => item.label === "Horoscope" ? (
              <HoroscopeMenu key={item.href} pathname={pathname} label={navText("Horoscope")} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(pathname, item.href, item.active) ? "page" : undefined}
                className={navLinkClass(isActive(pathname, item.href, item.active))}
              >
                {navText(item.label)}
              </Link>
            ))}
            <MoreMenu label={navText("More")} />
          </nav>

          <div className="nx-main-actions ml-auto flex flex-shrink-0 items-center gap-1 border-l border-[rgba(126,39,37,0.15)] pl-2 sm:gap-2 sm:pl-3">
            <div className="nx-header-desktop-actions hidden xl:flex items-center gap-1">
              <LanguageSwitcher className="w-auto min-w-12" />
              <ThemeToggle />
              <Link href="/search" aria-label="Search the website" className="nx-gallery-icon-link"><Search size={18}/></Link>
              <Link href="/saved-reports" aria-label="Saved reports" className="nx-gallery-icon-link"><Heart size={18}/></Link>
            </div>
            <Link href="/cart" aria-label="View shopping cart" className="nx-header-cart hidden xl:inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#702536] hover:bg-[#fff1e7]"><ShoppingCart size={19}/></Link>
            <Link href="/orders" className="nx-header-utility hidden rounded-lg px-3 py-2 text-xs font-bold text-[#702536] hover:bg-[#fff1e7]">{locale === "hi" ? "मेरे ऑर्डर" : "My Orders"}</Link>
            <Link href="/puja-bookings" className="nx-header-utility hidden rounded-lg px-2 py-2 text-xs font-bold text-[#702536] hover:bg-[#fff1e7]">{locale === "hi" ? "मेरी पूजाएँ" : "My Pujas"}</Link>
            <div className="hidden xl:block nx-gallery-account"><AuthProfileMenu showGalleryLabel /></div>
            <Link
              href="/kundli"
              className="hidden items-center justify-center px-4 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #f7d17a, #c98924)",
                color: "#17181d",
                height: "38px",
                borderRadius: "14px",
                boxShadow: "0 10px 28px rgba(201,137,36,0.28)",
                textDecoration: "none"
              }}
            >
              {locale === "hi" ? "कुंडली बनाएँ" : "Get Started"}
            </Link>
            <Button
              ref={menuButtonRef}
              variant="outline"
              size="icon"
              className="border-[rgba(138,43,56,0.28)] bg-[#fff8ee] text-[#852f3c] hover:bg-[#f8e5d4] xl:hidden"
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
          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm xl:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
            <aside id="naksharix-mobile-sidebar" className="ml-auto h-full w-[min(88vw,380px)] overflow-y-auto overscroll-contain border-l border-[rgba(20,20,20,0.08)] bg-[rgba(255,255,255,0.98)] p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <BrandLogo className="max-w-[12rem]" />
                <Button variant="outline" size="icon" className="border-[rgba(20,20,20,0.08)] bg-white text-[#3a3a3c]" aria-label="Close navigation menu" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e5c5a5] bg-[#fff6e9] p-3">
                <p className="text-xs font-semibold text-[#794051]">{locale === "hi" ? "भाषा चुनें" : "Choose language"}</p>
                <LanguageSwitcher className="!block w-20" />
              </div>
              <div className="mt-4 grid gap-2" aria-label="Mobile account navigation">
                {!mobileAuthReady ? (
                  <p className="rounded-xl border border-[#e6c6a9] bg-[#fff8ee] px-4 py-3 text-sm text-[#66454c]" role="status">Checking account…</p>
                ) : mobileAstrologer ? (
                  <>
                    <Link href="/astrologer/dashboard" onClick={() => setOpen(false)} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#76263b] px-4 py-3 text-sm font-bold text-[#fff8ee] hover:bg-[#5c1b30]">
                      <LayoutDashboard className="h-5 w-5" aria-hidden="true" /> Astrologer Dashboard
                    </Link>
                    <Link href="/astrologer/profile" onClick={() => setOpen(false)} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#d8ac8f] bg-[#fff9ef] px-4 py-3 text-sm font-bold text-[#74263b]">
                      <UserRound className="h-5 w-5" aria-hidden="true" /> Professional Profile
                    </Link>
                  </>
                ) : mobileUser ? (
                  <Link href="/profile" onClick={() => setOpen(false)} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#76263b] px-4 py-3 text-sm font-bold text-[#fff8ee]">
                    <UserRound className="h-5 w-5" aria-hidden="true" /> My account
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/login" onClick={() => setOpen(false)} className="flex min-h-12 items-center justify-center rounded-xl bg-[#76263b] px-3 py-3 text-sm font-bold text-[#fff8ee]">Sign in</Link>
                    <Link href="/profile" onClick={() => setOpen(false)} className="flex min-h-12 items-center justify-center rounded-xl border border-[#d8ac8f] bg-[#fff9ef] px-3 py-3 text-sm font-bold text-[#74263b]">My account</Link>
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-3 rounded-lg bg-[#fff5e8] p-3">
                <ThemeToggle />
                <Link href="/cart" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-[#792b3d]"><ShoppingCart size={17}/> Cart</Link>
                <Link href="/orders" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-[#792b3d]">My Orders</Link>
                <Link href="/puja-bookings" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-[#792b3d]">My Pujas</Link>
              </div>
              <div className="mt-3 grid gap-2">
                {[...navLinks, ...moreLinks].map((item) => (
                  <Link
                    key={`${item.href}-mobile`}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-[rgba(148,67,56,0.16)] bg-[#fffcf8] px-4 py-3 text-sm font-semibold text-[#4e3038] hover:bg-[#fff0e4]"
                  >
                    {navText(item.label)}
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

function HoroscopeMenu({ pathname, label }: { pathname: string; label: string }) {
  const active = pathname.includes("horoscope") || pathname.includes("zodiac");
  return (
    <div className="group relative">
      <Link href="/daily-horoscope" className={navLinkClass(active)}>{label}</Link>
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

function MoreMenu({ label }: { label: string }) {
  return (
    <div className="nx-gallery-more group relative">
      <button type="button" className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#492b32] transition hover:text-[#9b2d36]">{label}</button>
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
    "flex items-center gap-0.5 px-2 py-1 text-[13px] font-semibold text-[#492b32] transition hover:text-[#9b2d36]",
    active ? "rounded-none border-b-2 border-[#f2c56b] px-1 py-0.5 font-bold text-[#9b2d36]" : ""
  );
}

function isActive(pathname: string, href: string, activePaths: readonly string[]) {
  if (href === "/") return pathname === "/";
  return activePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

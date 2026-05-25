"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  BookOpen,
  Calculator,
  FileText,
  HeartHandshake,
  Info,
  Menu,
  MoonStar,
  PhoneCall,
  ScrollText,
  Sparkles,
  UserRound,
  Users,
  X,
  type LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProfileMenu } from "@/components/auth-profile-menu";
import { useLanguage } from "@/components/language-provider";
import type { Locale, TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const desktopLinks = [
  { id: "home", labelKey: "navHome", href: "/", activePaths: ["/"] },
  { id: "kundli", labelKey: "navKundli", href: "/kundli", activePaths: ["/kundli", "/free-kundli"] },
  { id: "numerology", labelKey: "navNumerology", href: "/numerology", activePaths: ["/numerology"] },
  { id: "tarot", labelKey: "navTarot", href: "/tarot", activePaths: ["/tarot"] },
  { id: "reports", labelKey: "navReports", href: "/reports", activePaths: ["/reports"] }
] as const;

type NavDropdownItem = { id: string; labelKey: TranslationKey; href: string; activePaths: readonly string[] };
type NavDropdownGroup = { titleKey: TranslationKey; items: NavDropdownItem[] };

const moreGroups: NavDropdownGroup[] = [
  {
    titleKey: "comingSoon",
    items: [
      { id: "ai-astrologer", labelKey: "navAiAstrologerComingSoon", href: "/ai-astrologer", activePaths: ["/ai-astrologer", "/ai-chat", "/talk-to-kundli", "/chatbot"] },
      { id: "shop", labelKey: "navShopComingSoon", href: "/shop", activePaths: ["/shop"] },
      { id: "consultation", labelKey: "navConsultationComingSoon", href: "/consultation", activePaths: ["/consultation", "/consult"] }
    ]
  },
  {
    titleKey: "support",
    items: [
      { id: "about", labelKey: "navAboutUs", href: "/about", activePaths: ["/about"] },
      { id: "contact", labelKey: "navContact", href: "/contact", activePaths: ["/contact"] }
    ]
  },
  {
    titleKey: "legal",
    items: [
      { id: "disclaimer", labelKey: "disclaimer", href: "/disclaimer", activePaths: ["/disclaimer"] },
      { id: "privacy", labelKey: "privacyPolicy", href: "/privacy-policy", activePaths: ["/privacy-policy"] },
      { id: "terms", labelKey: "termsConditions", href: "/terms", activePaths: ["/terms"] },
      { id: "refund", labelKey: "refundPolicy", href: "/refund-policy", activePaths: ["/refund-policy"] }
    ]
  }
] ;
const moreLinks = moreGroups.flatMap((group) => group.items);

type SidebarItem = { labelKey: TranslationKey; href: string; activePaths?: readonly string[]; icon?: LucideIcon };
type SidebarGroup = { titleKey: TranslationKey; icon: LucideIcon; items: SidebarItem[] };

const sidebarGroups: SidebarGroup[] = [
  {
    titleKey: "myProfileReadings",
    icon: UserRound,
    items: [
      { labelKey: "myProfile", href: "/dashboard", activePaths: ["/dashboard"] },
      { labelKey: "myReadings", href: "/dashboard", activePaths: ["/dashboard"] },
      { labelKey: "savedReports", href: "/reports", activePaths: ["/reports"] }
    ]
  },
  {
    titleKey: "birthChartKundli",
    icon: Sparkles,
    items: [
      { labelKey: "kundliGenerator", href: "/kundli", activePaths: ["/kundli", "/free-kundli"] },
      { labelKey: "customReports", href: "/reports", activePaths: ["/reports"] }
    ]
  },
  {
    titleKey: "compatibilityMatch",
    icon: HeartHandshake,
    items: [
      { labelKey: "kundliMatching", href: "/matchmaking", activePaths: ["/match", "/match-making", "/matchmaking", "/kundli-matching"] },
      { labelKey: "compatibilityReport", href: "/matchmaking", activePaths: ["/match", "/matchmaking", "/love-compatibility"] }
    ]
  },
  {
    titleKey: "connectWithExperts",
    icon: Users,
    items: [
      { labelKey: "navConsultationComingSoon", href: "/consultation", activePaths: ["/consult", "/consultation"] },
      { labelKey: "astrologers", href: "/astrologers", activePaths: ["/astrologers"] },
      { labelKey: "callAstrologers", href: "/consultation", activePaths: ["/consult", "/consultation"] }
    ]
  },
  {
    titleKey: "trustSafety",
    icon: Bot,
    items: [
      { labelKey: "navAiAstrologerComingSoon", href: "/ai-astrologer", activePaths: ["/ai-astrologer", "/ai-chat", "/talk-to-kundli", "/chatbot"] },
      { labelKey: "navReports", href: "/reports", activePaths: ["/reports"] },
      { labelKey: "disclaimer", href: "/disclaimer", activePaths: ["/disclaimer"] },
      { labelKey: "privacyPolicy", href: "/privacy-policy", activePaths: ["/privacy-policy"] },
      { labelKey: "termsConditions", href: "/terms", activePaths: ["/terms"] },
      { labelKey: "refundPolicy", href: "/refund-policy", activePaths: ["/refund-policy"] }
    ]
  },
  {
    titleKey: "tarotReadings",
    icon: BookOpen,
    items: [{ labelKey: "tarot", href: "/tarot", activePaths: ["/tarot"] }]
  },
  {
    titleKey: "dataTools",
    icon: Calculator,
    items: [
      { labelKey: "navFreeCalculators", href: "/free-calculators", activePaths: ["/free-calculators", "/calculators"] },
      { labelKey: "navShopComingSoon", href: "/shop", activePaths: ["/shop"] },
      { labelKey: "reports", href: "/reports", activePaths: ["/reports"] }
    ]
  },
  {
    titleKey: "moreInfo",
    icon: Info,
    items: [
      { labelKey: "subscriptionPricing", href: "/pricing", activePaths: ["/pricing"] },
      { labelKey: "knowledgeBlog", href: "/blog", activePaths: ["/blog"] },
      { labelKey: "about", href: "/about", activePaths: ["/about"] },
      { labelKey: "contact", href: "/contact", activePaths: ["/contact"] }
    ]
  }
];

export function MainNav() {
  const { tr, locale } = useLanguage();
  const pathname = usePathname();
  const isAstrologerPortal = pathname.startsWith("/astrologer");
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const moreActive = moreLinks.some((item) => isActiveRoute(pathname, item.href, item.activePaths));
  const calculatorsActive = isActiveRoute(pathname, "/free-calculators", ["/free-calculators", "/calculators"]);
  const horoscopeActive = isActiveRoute(pathname, "/horoscope", ["/horoscope", "/daily-horoscope", "/weekly-horoscope", "/monthly-horoscope", "/weekly-love-horoscope", "/yearly-horoscope-2026", "/chinese-horoscope-2026", "/numerology-monthly-horoscope", "/panchang"]);

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

  if (isAstrologerPortal) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.04] bg-[#020612]/72 shadow-[0_14px_48px_rgba(0,0,0,0.42)] backdrop-blur-md">
      <div className="mx-auto flex h-24 w-full max-w-[1440px] items-center gap-2 px-4 lg:gap-2 xl:h-24 xl:px-4 2xl:gap-4 2xl:px-8">
        <div className="flex min-w-[10rem] flex-shrink-0 items-center md:min-w-[11rem] xl:basis-[11.25rem] 2xl:basis-[13rem]">
          <BrandLogo className="max-w-full" />
        </div>
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex 2xl:gap-1.5" aria-label="Primary navigation">
          {desktopLinks.map((item) => {
            const active = isActiveRoute(pathname, item.href, item.activePaths);
            return (
            <div key={`${item.id}-nav-slot`} className="contents">
            {item.id === "tarot" ? (
              <>
                <CalculatorMegaDropdown key="free-calculators-mega" locale={locale} tr={tr} active={calculatorsActive} />
                <HoroscopeMegaDropdown key="horoscope-mega" locale={locale} active={horoscopeActive} />
              </>
            ) : null}
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex-shrink-0 whitespace-nowrap rounded-md px-1.5 py-2 text-[0.67rem] font-semibold leading-none transition duration-200 after:absolute after:inset-x-2.5 after:bottom-0 after:h-px after:origin-center after:scale-x-0 after:bg-[#dca956] after:shadow-[0_0_12px_rgba(220,169,86,0.68)] after:transition-transform hover:bg-[#dca956]/10 hover:text-[#f3d382] hover:drop-shadow-[0_0_10px_rgba(0,155,114,0.38)] 2xl:px-2.5 2xl:text-[0.8rem]",
                active
                  ? "bg-[linear-gradient(135deg,rgba(220,169,86,0.14),rgba(0,155,114,0.12))] text-[#f3d382] shadow-[0_0_24px_rgba(0,155,114,0.16)] after:scale-x-100"
                  : "text-[#ffffff]"
              )}
            >
              {tr(item.labelKey)}
            </Link>
            </div>
            );
          })}
          <div className="group relative flex-shrink-0">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={moreActive}
              className={cn(
                "relative flex-shrink-0 whitespace-nowrap rounded-md px-2 py-2 text-[0.67rem] font-semibold leading-none transition duration-200 after:absolute after:inset-x-3 after:bottom-0 after:h-px after:origin-center after:scale-x-0 after:bg-[#dca956] after:shadow-[0_0_12px_rgba(220,169,86,0.68)] after:transition-transform hover:bg-[#dca956]/10 hover:text-[#f3d382] 2xl:px-3 2xl:text-[0.8rem]",
                moreActive
                  ? "bg-[linear-gradient(135deg,rgba(220,169,86,0.14),rgba(0,155,114,0.12))] text-[#f3d382] shadow-[0_0_24px_rgba(0,155,114,0.16)] after:scale-x-100"
                  : "text-[#ffffff]"
              )}
            >
              {tr("navMore")}
            </button>
            <div className="invisible absolute right-0 top-full z-[80] mt-3 w-72 translate-y-2 rounded-xl border border-[#dca956]/30 bg-[#050b18]/95 p-3 opacity-0 shadow-2xl shadow-black/70 ring-1 ring-white/5 backdrop-blur-xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              {moreGroups.map((group) => (
                <div key={group.titleKey} className="border-b border-[#263957]/70 py-2 first:pt-0 last:border-b-0 last:pb-0">
                  <p className="px-3 pb-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#dca956]">{tr(group.titleKey)}</p>
                  {group.items.map((item, index) => {
                    const active = isActiveRoute(pathname, item.href, item.activePaths);
                    return (
                      <Link
                        key={`${item.id}-${item.href}-${index}`}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm font-semibold text-[#ffffff] outline-none transition hover:bg-[#0f1c3a] hover:text-[#f3d382] focus:bg-[#0f1c3a] focus:text-[#f3d382]",
                          active ? "bg-[#dca956]/10 text-[#f3d382] shadow-[inset_3px_0_0_rgba(220,169,86,0.8)]" : "text-[#ffffff]"
                        )}
                      >
                        {tr(item.labelKey)}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </nav>
        <div className="ml-auto flex flex-shrink-0 items-center gap-1.5 border-l border-white/[0.08] pl-2 lg:gap-2 2xl:gap-2.5 2xl:pl-4">
          <LanguageSwitcher className="w-auto min-w-12" />
          <ThemeToggle />
          <AuthProfileMenu />
          <Button
            ref={menuButtonRef}
            variant="outline"
            size="icon"
            className="xl:hidden"
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="naksharix-mobile-sidebar"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <MobileSidebar open={open} onClose={() => setOpen(false)} pathname={pathname} />
    </header>
  );
}

function CalculatorMegaDropdown({ locale, tr, active }: { locale: Locale; tr: (key: TranslationKey) => string; active: boolean }) {
  const labels = calculatorDropdownLabels(locale);
  return (
    <div className="group relative flex-shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={active}
        className={cn(
          "relative flex-shrink-0 whitespace-nowrap rounded-md px-2 py-2 text-[0.67rem] font-semibold leading-none transition duration-200 after:absolute after:inset-x-3 after:bottom-0 after:h-px after:origin-center after:scale-x-0 after:bg-[#dca956] after:shadow-[0_0_12px_rgba(220,169,86,0.68)] after:transition-transform hover:bg-[#dca956]/10 hover:text-[#f3d382] 2xl:px-2.5 2xl:text-[0.8rem]",
          active
            ? "bg-[linear-gradient(135deg,rgba(220,169,86,0.14),rgba(0,155,114,0.12))] text-[#f3d382] shadow-[0_0_24px_rgba(0,155,114,0.16)] after:scale-x-100"
            : "text-[#ffffff]"
        )}
      >
        {tr("navFreeCalculators")}
      </button>
      <div className="invisible absolute left-1/2 top-full z-[80] mt-3 w-[min(94vw,1100px)] -translate-x-1/2 translate-y-2 rounded-2xl border border-[#dca956]/30 bg-[#050b18]/95 p-4 opacity-0 shadow-2xl shadow-black/70 ring-1 ring-white/5 backdrop-blur-xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {labels.groups.map((group) => (
            <div key={group.title} className="rounded-xl border border-[#263957]/70 bg-[#0a1224]/95 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="font-cinzel text-sm font-bold text-[#f3d382]">{group.title}</p>
              <div className="mt-3 grid gap-1.5">
                {group.items.map((item) => item.href ? (
                  <Link key={item.label} href={item.href} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#dca956]/10 hover:text-[#f3d382]">
                    <span>{item.label}</span>
                    <span className="rounded-full border border-[#00f5a0]/35 bg-[#00f5a0]/10 px-2 py-0.5 text-[0.6rem] text-[#00f5a0]">{labels.active}</span>
                  </Link>
                ) : (
                  <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs text-[#a8b3c7]">
                    <span>{item.label}</span>
                    <span className="rounded-full border border-[#dca956]/30 bg-[#dca956]/10 px-2 py-0.5 text-[0.6rem] text-[#f3d382]">{labels.comingSoon}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end border-t border-[#263957] pt-4">
          <Link href="/free-calculators" className="rounded-full bg-[#009b72] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#008766]">
            {labels.viewAll}
          </Link>
        </div>
      </div>
    </div>
  );
}

function HoroscopeMegaDropdown({ locale, active }: { locale: Locale; active: boolean }) {
  const labels = horoscopeDropdownLabels(locale);
  return (
    <div className="group relative flex-shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={active}
        className={cn(
          "relative flex-shrink-0 whitespace-nowrap rounded-md px-2 py-2 text-[0.67rem] font-semibold leading-none transition duration-200 after:absolute after:inset-x-3 after:bottom-0 after:h-px after:origin-center after:scale-x-0 after:bg-[#dca956] after:shadow-[0_0_12px_rgba(220,169,86,0.68)] after:transition-transform hover:bg-[#dca956]/10 hover:text-[#f3d382] 2xl:px-2.5 2xl:text-[0.8rem]",
          active
            ? "bg-[linear-gradient(135deg,rgba(220,169,86,0.14),rgba(0,155,114,0.12))] text-[#f3d382] shadow-[0_0_24px_rgba(0,155,114,0.16)] after:scale-x-100"
            : "text-[#ffffff]"
        )}
      >
        {labels.title}
      </button>
      <div className="invisible absolute left-1/2 top-full z-[80] mt-3 w-[min(94vw,780px)] -translate-x-1/2 translate-y-2 rounded-2xl border border-[#dca956]/30 bg-[#050b18]/95 p-4 opacity-0 shadow-2xl shadow-black/70 ring-1 ring-white/5 backdrop-blur-xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="grid gap-4 md:grid-cols-2">
          {labels.groups.map((group) => (
            <div key={group.title} className="rounded-xl border border-[#263957]/70 bg-[#0a1224]/95 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="font-cinzel text-sm font-bold text-[#f3d382]">{group.title}</p>
              <div className="mt-3 grid gap-1.5">
                {group.items.map((item) => ("href" in item && item.href) ? (
                  <Link key={item.label} href={item.href} className="flex min-h-9 items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs text-[#ffffff] transition hover:bg-[#dca956]/10 hover:text-[#f3d382]">
                    <span>{item.label}</span>
                    <span className="shrink-0 rounded-full border border-[#00f5a0]/30 bg-[#00f5a0]/10 px-2 py-0.5 text-[0.6rem] text-[#00f5a0]">{labels.active}</span>
                  </Link>
                ) : (
                  <div key={item.label} aria-disabled="true" className="flex min-h-9 items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs text-[#d7deec]">
                    <span>{item.label}</span>
                    <span className="shrink-0 rounded-full border border-[#dca956]/30 bg-[#dca956]/10 px-2 py-0.5 text-[0.6rem] text-[#f3d382]">{labels.comingSoon}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileSidebar({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string }) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const { tr, locale } = useLanguage();
  const [calculatorsOpen, setCalculatorsOpen] = useState(false);
  const [horoscopeOpen, setHoroscopeOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => firstLinkRef.current?.focus(), 80);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-40 bg-[radial-gradient(circle_at_20%_20%,rgba(88,28,135,0.28),transparent_28rem),rgba(5,2,14,0.76)] backdrop-blur-sm xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            id="naksharix-mobile-sidebar"
            role="dialog"
            aria-modal="true"
            aria-label="Naksharix navigation menu"
            className="fixed right-0 top-0 z-50 flex h-dvh w-[88vw] max-w-[24rem] flex-col overflow-hidden border-l border-[#dca956]/20 bg-[linear-gradient(180deg,rgba(88,28,135,0.96),rgba(2,6,18,0.99)_58%,rgba(59,7,100,0.96))] shadow-[0_0_80px_rgba(88,28,135,0.22)] xl:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <div className="border-b border-[#dca956]/15 p-4">
              <div className="flex items-center justify-between gap-3">
                <BrandLogo />
                <Button variant="ghost" size="icon" aria-label="Close navigation menu" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-3">
                <LanguageSwitcher className="block h-10 w-full text-sm" />
                <ThemeToggle />
              </div>
            </div>
            <div className="star-field flex-1 overflow-y-auto p-4">
              <div className="grid gap-4 pb-6">
                <MobileCalculatorAccordion locale={locale} tr={tr} open={calculatorsOpen} setOpen={setCalculatorsOpen} onClose={onClose} />
                <MobileHoroscopeAccordion locale={locale} open={horoscopeOpen} setOpen={setHoroscopeOpen} />
                {sidebarGroups.map((group, groupIndex) => (
                  <SidebarMenuGroup
                    key={group.titleKey}
                    group={group}
                    onClose={onClose}
                    pathname={pathname}
                    firstLinkRef={groupIndex === 0 ? firstLinkRef : undefined}
                  />
                ))}
              </div>
            </div>
            <div className="border-t border-[#dca956]/15 bg-[#020612]/80 p-4">
              <Button className="w-full" asChild onClick={onClose}>
                <Link href="/signup"><Sparkles className="h-4 w-4" />{tr("startReading")}</Link>
              </Button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function MobileHoroscopeAccordion({ locale, open, setOpen }: { locale: Locale; open: boolean; setOpen: (value: boolean) => void }) {
  const labels = horoscopeDropdownLabels(locale);
  return (
    <section className="rounded-lg border border-[#dca956]/18 bg-[#0f1c3a]/70 p-3">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left font-cinzel text-sm font-bold text-[#f3d382]">
        <span className="flex items-center gap-2"><MoonStar className="h-4 w-4" />{labels.title}</span>
        <span className="text-xs text-[#dca956]">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="mt-3 grid gap-3">
          {labels.groups.map((group) => (
            <div key={group.title} className="rounded-lg border border-[#263957] bg-[#020612]/70 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#dca956]">{group.title}</p>
              <div className="mt-2 grid gap-1.5">
                {group.items.map((item) => ("href" in item && item.href) ? (
                  <Link key={item.label} href={item.href} className="flex min-h-10 items-center justify-between gap-3 rounded-md px-3 py-2 text-sm text-white hover:bg-[#dca956]/10">
                    <span>{item.label}</span><span className="text-[0.65rem] text-[#00f5a0]">{labels.active}</span>
                  </Link>
                ) : (
                  <div key={item.label} aria-disabled="true" className="flex min-h-10 items-center justify-between gap-3 rounded-md px-3 py-2 text-sm text-[#d7deec]">
                    <span>{item.label}</span><span className="text-[0.65rem] text-[#f3d382]">{labels.comingSoon}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function MobileCalculatorAccordion({ locale, tr, open, setOpen, onClose }: { locale: Locale; tr: (key: TranslationKey) => string; open: boolean; setOpen: (value: boolean) => void; onClose: () => void }) {
  const labels = calculatorDropdownLabels(locale);
  return (
    <section className="rounded-lg border border-[#dca956]/18 bg-[#0f1c3a]/70 p-3">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left font-cinzel text-sm font-bold text-[#f3d382]">
        <span className="flex items-center gap-2"><Calculator className="h-4 w-4" />{tr("navFreeCalculators")}</span>
        <span className="text-xs text-[#dca956]">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="mt-3 grid gap-3">
          {labels.groups.map((group) => (
            <div key={group.title} className="rounded-lg border border-[#263957] bg-[#020612]/42 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#dca956]">{group.title}</p>
              <div className="mt-2 grid gap-1.5">
                {group.items.map((item) => item.href ? (
                  <Link key={item.label} href={item.href} onClick={onClose} className="flex min-h-10 items-center justify-between rounded-md px-3 py-2 text-sm text-white hover:bg-[#dca956]/10">
                    <span>{item.label}</span><span className="text-[0.65rem] text-[#00f5a0]">{labels.active}</span>
                  </Link>
                ) : (
                  <div key={item.label} className="flex min-h-10 items-center justify-between rounded-md px-3 py-2 text-sm text-[#94a3b8]">
                    <span>{item.label}</span><span className="text-[0.65rem] text-[#f3d382]">{labels.comingSoon}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Link href="/free-calculators" onClick={onClose} className="rounded-md bg-[#009b72] px-3 py-2 text-center text-sm font-semibold text-white">{labels.viewAll}</Link>
        </div>
      ) : null}
    </section>
  );
}

function SidebarMenuGroup({ group, onClose, pathname, firstLinkRef }: { group: SidebarGroup; onClose: () => void; pathname: string; firstLinkRef?: React.RefObject<HTMLAnchorElement> }) {
  const GroupIcon = group.icon;
  const { tr } = useLanguage();
  const groupActive = group.items.some((item) => isActiveRoute(pathname, item.href, item.activePaths));
  return (
    <section
      className={cn(
        "rounded-lg border bg-[#0f1c3a]/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition",
        groupActive ? "border-[#dca956]/40 shadow-[inset_3px_0_0_rgba(220,169,86,0.75),0_0_24px_rgba(88,28,135,0.13)]" : "border-[#dca956]/15"
      )}
    >
      <h2 className={cn("flex items-center gap-2 font-cinzel text-sm font-bold", groupActive ? "text-[#f3d382]" : "text-[#f3d382]")}>
        <span className={cn("grid h-8 w-8 place-items-center rounded-md text-[#f3d382]", groupActive ? "bg-[#dca956]/18 shadow-[0_0_16px_rgba(220,169,86,0.22)]" : "bg-[#dca956]/10")}>
          <GroupIcon className="h-4 w-4" />
        </span>
        {tr(group.titleKey)}
      </h2>
      <div className="mt-3 grid gap-1.5">
        {group.items.map((item, index) => {
          const active = isActiveRoute(pathname, item.href, item.activePaths);
          return (
          <Link
            key={`${group.titleKey}-${item.labelKey}`}
            ref={index === 0 ? firstLinkRef : undefined}
            href={item.href}
            onClick={onClose}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center justify-between rounded-md px-3 py-2 text-sm outline-none transition hover:bg-[#dca956]/10 hover:text-foreground focus:bg-[#dca956]/10 focus:text-foreground",
              active
                ? "bg-[linear-gradient(135deg,rgba(220,169,86,0.16),rgba(88,28,135,0.14))] text-[#f3d382] shadow-[inset_3px_0_0_rgba(220,169,86,0.85),0_0_18px_rgba(88,28,135,0.14)]"
                : "text-[#ffffff]"
            )}
          >
            <span className="whitespace-nowrap">{tr(item.labelKey)}</span>
            {item.labelKey === "callAstrologers" ? <PhoneCall className="h-4 w-4 text-[#f3d382]/80" /> : item.labelKey.toLowerCase().includes("report") ? <FileText className="h-4 w-4 text-[#f3d382]/80" /> : <ScrollText className="h-4 w-4 text-[#f3d382]/60" />}
          </Link>
          );
        })}
      </div>
    </section>
  );
}

function isActiveRoute(pathname: string, href: string, activePaths: readonly string[] = [href]) {
  const current = normalizePath(pathname);
  return activePaths.some((path) => {
    const normalized = normalizePath(path);
    return current === normalized || current.startsWith(`${normalized}/`);
  });
}

function normalizePath(path: string) {
  if (!path) return "/";
  const clean = path.split("?")[0]?.replace(/\/+$/, "") || "/";
  return clean === "" ? "/" : clean;
}

function calculatorDropdownLabels(locale: Locale) {
  const active = locale === "hi" ? "सक्रिय" : "Active";
  const comingSoon = locale === "hi" ? "जल्द" : "Soon";
  const viewAll = locale === "hi" ? "सभी मुफ़्त कैलकुलेटर देखें" : locale === "hinglish" ? "View All Free Calculators" : "View All Free Calculators";
  if (locale === "hi") {
    return {
      active,
      comingSoon,
      viewAll,
      groups: [
        {
          title: "कुंडली कैलकुलेटर",
          items: [
            { label: "मुफ़्त कुंडली कैलकुलेटर", href: "/kundli" },
            { label: "दशा कैलकुलेटर", href: "/free-calculators/dasha-calculator" },
            { label: "चंद्र राशि कैलकुलेटर", href: "/free-calculators/moon-sign-calculator" },
            { label: "नक्षत्र कैलकुलेटर", href: "/free-calculators/nakshatra-calculator" },
            { label: "लग्न कैलकुलेटर", href: "/free-calculators/lagna-calculator" },
            { label: "मांगलिक कैलकुलेटर", href: "/free-calculators/manglik-calculator" },
            { label: "योग कैलकुलेटर", href: "/free-calculators/yoga-calculator" }
          ]
        },
        {
          title: "अंक ज्योतिष कैलकुलेटर",
          items: [
            { label: "अंक ज्योतिष कैलकुलेटर", href: "/numerology" },
            { label: "लो शू ग्रिड", href: "/free-calculators/lo-shu-grid-calculator" },
            { label: "नामांक", href: "/free-calculators/name-number-calculator" },
            { label: "मोबाइल नंबर", href: "/free-calculators/mobile-number-calculator" },
            { label: "वाहन नंबर", href: "/free-calculators/vehicle-number-calculator" },
            { label: "भाग्यांक", href: "/free-calculators/destiny-number-calculator" },
            { label: "व्यक्तित्व अंक", href: "/free-calculators/personality-number-calculator" }
          ]
        },
        {
          title: "मिलान कैलकुलेटर",
          items: [
            { label: "कुंडली मिलान", href: "/matchmaking" },
            { label: "गुण मिलान", href: "/free-calculators/guna-milan-calculator" },
            { label: "नाड़ी दोष", href: "/free-calculators/nadi-dosha-calculator" },
            { label: "भकूट", href: "/free-calculators/bhakoot-calculator" },
            { label: "विवाह उपयुक्तता", href: "/free-calculators/marriage-suitability-calculator" }
          ]
        },
        {
          title: "टैरो और समय",
          items: [
            { label: "टैरो रीडिंग", href: "/tarot" },
            { label: "राशिफल" },
            { label: "पंचांग" },
            { label: "मुहूर्त" },
            { label: "साढ़े साती" }
          ]
        }
      ]
    };
  }
  const hinglish = locale === "hinglish";
  return {
    active,
    comingSoon,
    viewAll,
    groups: [
      {
        title: "Kundli Calculators",
        items: [
          { label: "Free Kundli Calculator", href: "/kundli" },
          { label: "Dasha Calculator", href: "/free-calculators/dasha-calculator" },
          { label: "Moon Sign Calculator", href: "/free-calculators/moon-sign-calculator" },
          { label: "Nakshatra Calculator", href: "/free-calculators/nakshatra-calculator" },
          { label: "Lagna Calculator", href: "/free-calculators/lagna-calculator" },
          { label: "Manglik Calculator", href: "/free-calculators/manglik-calculator" },
          { label: "Yoga Calculator", href: "/free-calculators/yoga-calculator" }
        ]
      },
      {
        title: "Numerology Calculators",
        items: [
          { label: "Numerology Calculator", href: "/numerology" },
          { label: "Lo Shu Grid", href: "/free-calculators/lo-shu-grid-calculator" },
          { label: "Name Number", href: "/free-calculators/name-number-calculator" },
          { label: "Mobile Number", href: "/free-calculators/mobile-number-calculator" },
          { label: "Vehicle Number", href: "/free-calculators/vehicle-number-calculator" },
          { label: "Destiny Number", href: "/free-calculators/destiny-number-calculator" },
          { label: "Personality Number", href: "/free-calculators/personality-number-calculator" }
        ]
      },
      {
        title: "Matching Calculators",
        items: [
          { label: hinglish ? "Match Making" : "Match Making", href: "/matchmaking" },
          { label: "Guna Milan", href: "/free-calculators/guna-milan-calculator" },
          { label: "Nadi Dosha", href: "/free-calculators/nadi-dosha-calculator" },
          { label: "Bhakoot", href: "/free-calculators/bhakoot-calculator" },
          { label: "Marriage Suitability", href: "/free-calculators/marriage-suitability-calculator" }
        ]
      },
      {
        title: "Tarot & Timing",
        items: [
          { label: "Tarot Reading", href: "/tarot" },
          { label: "Horoscope" },
          { label: "Panchang", href: "/panchang" },
          { label: "Muhurat" },
          { label: "Sade Sati" }
        ]
      }
    ]
  };
}

function horoscopeDropdownLabels(locale: Locale) {
  if (locale === "hi") {
    return {
      title: "राशिफल",
      active: "सक्रिय",
      comingSoon: "जल्द",
      groups: [
        {
          title: "राशिफल",
          items: [
            { label: "दैनिक राशिफल", href: "/daily-horoscope" },
            { label: "साप्ताहिक राशिफल", href: "/weekly-horoscope" },
            { label: "मासिक राशिफल", href: "/monthly-horoscope" },
            { label: "साप्ताहिक प्रेम राशिफल", href: "/weekly-love-horoscope" },
            { label: "चीनी राशिफल 2026", href: "/chinese-horoscope-2026" },
            { label: "वार्षिक राशिफल 2026", href: "/yearly-horoscope-2026" },
            { label: "अंक ज्योतिष मासिक राशिफल", href: "/numerology-monthly-horoscope" },
            { label: "आज का पंचांग", href: "/panchang" }
          ]
        },
        {
          title: "गोचर 2026",
          items: [
            { label: "सूर्य गोचर" },
            { label: "चंद्र गोचर" },
            { label: "मंगल गोचर" },
            { label: "बुध गोचर" },
            { label: "गुरु गोचर" },
            { label: "शुक्र गोचर" },
            { label: "जन्म कुंडली में शनि" },
            { label: "राहु गोचर" },
            { label: "केतु गोचर" }
          ]
        }
      ]
    };
  }
  if (locale === "hinglish") {
    return {
      title: "Horoscope",
      active: "Active",
      comingSoon: "Soon",
      groups: [
        {
          title: "Horoscope",
          items: [
            { label: "Daily Horoscope", href: "/daily-horoscope" },
            { label: "Weekly Horoscope", href: "/weekly-horoscope" },
            { label: "Monthly Horoscope", href: "/monthly-horoscope" },
            { label: "Weekly Love Horoscope", href: "/weekly-love-horoscope" },
            { label: "Chinese Horoscope 2026", href: "/chinese-horoscope-2026" },
            { label: "Yearly Horoscope 2026", href: "/yearly-horoscope-2026" },
            { label: "Numerology Monthly Horoscope", href: "/numerology-monthly-horoscope" },
            { label: "Today’s Panchang", href: "/panchang" }
          ]
        },
        {
          title: "Transit 2026",
          items: [
            { label: "Sun Transits" },
            { label: "Moon Transits" },
            { label: "Mars Transits" },
            { label: "Mercury Transits" },
            { label: "Jupiter Transits" },
            { label: "Venus Transits" },
            { label: "Saturn in Your Birth Chart" },
            { label: "Rahu Transits" },
            { label: "Ketu Transits" }
          ]
        }
      ]
    };
  }
  return {
    title: "Horoscope",
    active: "Active",
    comingSoon: "Coming Soon",
    groups: [
      {
        title: "Horoscope",
        items: [
          { label: "Daily Horoscope", href: "/daily-horoscope" },
          { label: "Weekly Horoscope", href: "/weekly-horoscope" },
          { label: "Monthly Horoscope", href: "/monthly-horoscope" },
          { label: "Weekly Love Horoscope", href: "/weekly-love-horoscope" },
          { label: "Chinese Horoscope 2026", href: "/chinese-horoscope-2026" },
          { label: "Yearly Horoscope 2026", href: "/yearly-horoscope-2026" },
          { label: "Numerology Monthly Horoscope", href: "/numerology-monthly-horoscope" },
          { label: "Today’s Panchang", href: "/panchang" }
        ]
      },
      {
        title: "Transit 2026",
        items: [
          { label: "Sun Transits" },
          { label: "Moon Transits" },
          { label: "Mars Transits" },
          { label: "Mercury Transits" },
          { label: "Jupiter Transits" },
          { label: "Venus Transits" },
          { label: "Saturn in Your Birth Chart" },
          { label: "Rahu Transits" },
          { label: "Ketu Transits" }
        ]
      }
    ]
  };
}

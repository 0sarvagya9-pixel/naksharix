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
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const desktopLinks = [
  { label: "Home", href: "/", activePaths: ["/"] },
  { label: "Kundli", href: "/kundli", activePaths: ["/kundli", "/free-kundli"] },
  { label: "Match Making", href: "/matchmaking", activePaths: ["/match", "/matchmaking", "/kundli-matching", "/love-compatibility"] },
  { label: "Numerology", href: "/numerology", activePaths: ["/numerology"] },
  { label: "AI Astrologer", href: "/talk-to-kundli", activePaths: ["/ai-chat", "/talk-to-kundli", "/chatbot"] },
  { label: "Tarot", href: "/tarot", activePaths: ["/tarot"] }
] as const;

const moreLinks = [
  { labelKey: "remedies", href: "/reports", activePaths: ["/reports"] },
  { labelKey: "reports", href: "/reports", activePaths: ["/reports"] },
  { labelKey: "calculators", href: "/calculators", activePaths: ["/calculators"] },
  { labelKey: "zodiac", href: "/zodiac", activePaths: ["/zodiac"] },
  { labelKey: "consult", href: "/consultation", activePaths: ["/consult", "/consultation"] },
  { labelKey: "blog", href: "/blog", activePaths: ["/blog"] },
  { labelKey: "about", href: "/about", activePaths: ["/about"] },
  { labelKey: "contact", href: "/contact", activePaths: ["/contact"] }
] as const;

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
    titleKey: "dailyHoroscopeGroup",
    icon: MoonStar,
    items: [
      { labelKey: "horoscope", href: "/horoscope", activePaths: ["/horoscope", "/daily-horoscope", "/weekly-horoscope", "/monthly-horoscope", "/yearly-horoscope-2026"] },
      { labelKey: "zodiac", href: "/zodiac", activePaths: ["/zodiac"] }
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
      { labelKey: "kundliMatching", href: "/matchmaking", activePaths: ["/match", "/matchmaking", "/kundli-matching"] },
      { labelKey: "compatibilityReport", href: "/matchmaking", activePaths: ["/match", "/matchmaking", "/love-compatibility"] }
    ]
  },
  {
    titleKey: "connectWithExperts",
    icon: Users,
    items: [
      { labelKey: "consult", href: "/consultation", activePaths: ["/consult", "/consultation"] },
      { labelKey: "astrologers", href: "/astrologers", activePaths: ["/astrologers"] },
      { labelKey: "callAstrologers", href: "/consultation", activePaths: ["/consult", "/consultation"] }
    ]
  },
  {
    titleKey: "chatWithAi",
    icon: Bot,
    items: [{ labelKey: "aiChat", href: "/talk-to-kundli", activePaths: ["/ai-chat", "/talk-to-kundli", "/chatbot"] }]
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
      { labelKey: "planetaryCalculators", href: "/calculators", activePaths: ["/calculators"] },
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
  const { tr } = useLanguage();
  const pathname = usePathname();
  const isAstrologerPortal = pathname.startsWith("/astrologer");
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const moreActive = moreLinks.some((item) => isActiveRoute(pathname, item.href, item.activePaths));

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
      <div className="mx-auto flex h-24 w-full max-w-[1440px] items-center gap-3 px-4 lg:gap-4 xl:h-24 xl:px-6 2xl:gap-6 2xl:px-12">
        <div className="flex min-w-[11.5rem] flex-shrink-0 items-center md:min-w-[13rem] xl:basis-[13rem] 2xl:basis-[14.5rem]">
          <BrandLogo className="max-w-full" />
        </div>
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1.5 xl:flex 2xl:gap-3" aria-label="Primary navigation">
          {desktopLinks.map((item, index) => {
            const active = isActiveRoute(pathname, item.href, item.activePaths);
            return (
            <Link
              key={`${item.label}-${item.href}-${index}`}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex-shrink-0 whitespace-nowrap rounded-md px-2 py-2 text-[0.72rem] font-semibold leading-none transition duration-200 after:absolute after:inset-x-2.5 after:bottom-0 after:h-px after:origin-center after:scale-x-0 after:bg-[#dca956] after:shadow-[0_0_12px_rgba(220,169,86,0.68)] after:transition-transform hover:bg-[#dca956]/10 hover:text-[#f3d382] hover:drop-shadow-[0_0_10px_rgba(0,155,114,0.38)] 2xl:px-3.5 2xl:text-[0.84rem]",
                active
                  ? "bg-[linear-gradient(135deg,rgba(220,169,86,0.14),rgba(0,155,114,0.12))] text-[#f3d382] shadow-[0_0_24px_rgba(0,155,114,0.16)] after:scale-x-100"
                  : "text-[#ffffff]"
              )}
            >
              {item.label}
            </Link>
            );
          })}
          <div className="group relative flex-shrink-0">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={moreActive}
              className={cn(
                "relative flex-shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-[0.72rem] font-semibold leading-none transition duration-200 after:absolute after:inset-x-3 after:bottom-0 after:h-px after:origin-center after:scale-x-0 after:bg-[#dca956] after:shadow-[0_0_12px_rgba(220,169,86,0.68)] after:transition-transform hover:bg-[#dca956]/10 hover:text-[#f3d382] 2xl:px-4 2xl:text-[0.84rem]",
                moreActive
                  ? "bg-[linear-gradient(135deg,rgba(220,169,86,0.14),rgba(0,155,114,0.12))] text-[#f3d382] shadow-[0_0_24px_rgba(0,155,114,0.16)] after:scale-x-100"
                  : "text-[#ffffff]"
              )}
            >
              {tr("moreShort")}
            </button>
            <div className="invisible absolute right-0 top-full z-50 mt-3 w-56 translate-y-2 rounded-lg border border-[#dca956]/25 bg-[#020612]/95 p-2 opacity-0 shadow-[0_18px_60px_rgba(0,5,16,0.62),0_0_32px_rgba(0,155,114,0.18)] backdrop-blur-xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              {moreLinks.map((item, index) => {
                const active = isActiveRoute(pathname, item.href, item.activePaths);
                return (
                  <Link
                    key={`${item.labelKey}-${item.href}-${index}`}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-3 py-2 font-cinzel text-sm outline-none transition hover:bg-[#dca956]/10 hover:text-[#f3d382] focus:bg-[#dca956]/10 focus:text-[#f3d382]",
                      active ? "bg-[#dca956]/10 text-[#f3d382] shadow-[inset_3px_0_0_rgba(220,169,86,0.8)]" : "text-[#ffffff]"
                    )}
                  >
                    {tr(item.labelKey)}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
        <div className="ml-auto flex flex-shrink-0 items-center gap-2 border-l border-white/[0.08] pl-2 lg:gap-2.5 2xl:gap-4 2xl:pl-4">
          <LanguageSwitcher className="w-[118px] min-w-[118px] 2xl:w-[132px] 2xl:min-w-[132px]" />
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

function MobileSidebar({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string }) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const { tr } = useLanguage();

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




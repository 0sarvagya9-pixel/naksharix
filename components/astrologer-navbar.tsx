"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft, CalendarCheck2, CalendarClock, CheckCircle2, Clock3,
  FileText, Headphones, LayoutDashboard, Menu, MessageSquare,
  Sparkles, Star, UserRound, WalletCards, X
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { AuthProfileMenu } from "@/components/auth-profile-menu";
import { AstrologerLogoutButton } from "@/components/astrologer-logout-button";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "OVERVIEW",
    links: [
      { label: "Dashboard", href: "/astrologer/dashboard", icon: LayoutDashboard }
    ]
  },
  {
    label: "CONSULTATIONS",
    links: [
      { label: "Today’s bookings", href: "/astrologer/bookings/today", icon: CalendarCheck2 },
      { label: "Upcoming bookings", href: "/astrologer/bookings/upcoming", icon: CalendarClock },
      { label: "Pending requests", href: "/astrologer/requests", icon: MessageSquare },
      { label: "Completed sessions", href: "/astrologer/completed", icon: CheckCircle2 }
    ]
  },
  {
    label: "WORKSPACE",
    links: [
      { label: "Availability", href: "/astrologer/availability", icon: Clock3 },
      { label: "Report drafts", href: "/astrologer/report-generator", icon: FileText },
      { label: "Reviews", href: "/astrologer/reviews", icon: Star },
      { label: "My profile", href: "/astrologer/profile", icon: UserRound }
    ]
  },
  {
    label: "EARNINGS",
    links: [
      { label: "Earnings overview", href: "/astrologer/earnings", icon: WalletCards },
      { label: "Payout requests", href: "/astrologer/payout", icon: WalletCards }
    ]
  }
] as const;

export function AstrologerNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-[#d4af37]/20 bg-[#071b36]/95 px-4 py-3 shadow-lg backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d4af37]/35 bg-[#d4af37]/15 text-[#f2ce77]"><Sparkles className="h-5 w-5" /></span>
          <div>
            <p className="text-sm font-bold leading-tight text-white">Astrologer Workspace</p>
            <p className="text-xs text-[#aabbd0]">Naksharix professional portal</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(value => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd777]"
          aria-label={mobileOpen ? "Close astrologer navigation" : "Open astrologer navigation"}
          aria-controls="astrologer-side-navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-[65] bg-[#020918]/75 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <aside
        id="astrologer-side-navigation"
        aria-label="Astrologer portal sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-[70] flex w-[280px] max-w-[85vw] shrink-0 -translate-x-full flex-col border-r border-[#d4af37]/20 bg-[#07162d] text-white shadow-[12px_0_48px_rgba(2,8,24,.55)] transition-transform duration-200",
          "lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:w-[264px] lg:translate-x-0 lg:shadow-none",
          mobileOpen && "translate-x-0"
        )}
      >
        <div className="shrink-0 border-b border-white/10 px-5 pb-5 pt-6">
          <div className="flex items-center gap-3">
            <BrandLogo compact />
            <div className="min-w-0">
              <p className="font-cinzel text-base font-black tracking-[.15em] text-[#ffe0a0]">NAKSHARIX</p>
              <p className="mt-1 text-[11px] font-semibold tracking-[.08em] text-[#bdcde0]">ASTROLOGER PORTAL</p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#d4af37]/25 bg-gradient-to-r from-[#173654] to-[#0d2947] p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#f9d77f]"><Sparkles className="h-5 w-5" /></span>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight text-white">Professional Portal</p>
              <p className="mt-1 text-[11px] text-[#c1d0df]">Your practice at a glance</p>
            </div>
          </div>
        </div>
        <nav aria-label="Astrologer workspace sections" className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-5">
          {groups.map(group => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-bold tracking-[.18em] text-[#91a9c4]">{group.label}</p>
              <div className="space-y-1">
                {group.links.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "group flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd777]",
                        active
                          ? "border-[#d4af37]/45 bg-[#d4af37]/15 text-[#ffe0a0] shadow-[inset_3px_0_0_#d4af37]"
                          : "border-transparent text-[#cbd8e7] hover:border-white/10 hover:bg-white/8 hover:text-white"
                      )}
                    >
                      <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-[#ffd777]" : "text-[#99acc7] group-hover:text-[#ffd777]")} aria-hidden="true" />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="border-t border-white/10 pt-4">
            <Link href="/contact" className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#cbd8e7] hover:bg-white/8 hover:text-white"><Headphones className="h-[18px] w-[18px]" />Support</Link>
            <Link href="/" className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#cbd8e7] hover:bg-white/8 hover:text-white"><ArrowLeft className="h-[18px] w-[18px]" />Back to website</Link>
          </div>
        </nav>
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-white/10 bg-[#061328] px-4 py-3">
          <AuthProfileMenu />
          <AstrologerLogoutButton />
        </div>
      </aside>
    </>
  );
}

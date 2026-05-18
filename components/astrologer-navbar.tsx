"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Clock, Headphones, LayoutDashboard, LogOut, MessageSquareWarning, Star, UserRound, WalletCards } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { AuthProfileMenu } from "@/components/auth-profile-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { label: "Dashboard", href: "/astrologer/dashboard", icon: LayoutDashboard },
  { label: "Today’s Bookings", href: "/astrologer/bookings/today", icon: CalendarCheck },
  { label: "Upcoming", href: "/astrologer/bookings/upcoming", icon: Clock },
  { label: "Pending Requests", href: "/astrologer/requests", icon: MessageSquareWarning },
  { label: "Completed", href: "/astrologer/completed", icon: CalendarCheck },
  { label: "Availability", href: "/astrologer/availability", icon: Clock },
  { label: "Earnings", href: "/astrologer/earnings", icon: WalletCards },
  { label: "Payout", href: "/astrologer/payout", icon: WalletCards },
  { label: "Reviews", href: "/astrologer/reviews", icon: Star },
  { label: "Profile", href: "/astrologer/profile", icon: UserRound },
  { label: "Support", href: "/contact", icon: Headphones }
];

export function AstrologerNavbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-[#F5C542]/20 bg-[#090016]/95 shadow-[0_16px_42px_rgba(3,0,12,0.5)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-screen-2xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <BrandLogo />
          <div className="lg:hidden"><AuthProfileMenu /></div>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:justify-center lg:overflow-visible lg:pb-0" aria-label="Astrologer portal navigation">
          {links.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/astrologer/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition",
                  active ? "border-[#F5C542]/50 bg-[#F5C542]/12 text-[#FFD36A]" : "border-[#F5C542]/15 bg-[#201037]/55 text-[#CDBFE8] hover:border-[#F5C542]/40 hover:text-[#FFD36A]"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="outline" size="sm" asChild><Link href="/api/auth/logout"><LogOut className="h-4 w-4" /> Logout</Link></Button>
          <AuthProfileMenu />
        </div>
      </div>
    </header>
  );
}
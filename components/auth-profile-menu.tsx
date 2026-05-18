"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { BookOpen, ChevronDown, FileText, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { isAdmin as canOpenAdminPanel } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  effectiveRole?: string | null;
  isAdminLogin?: boolean | null;
  canBypassPayment?: boolean | null;
  image?: string | null;
  avatarUrl?: string | null;
};

export function AuthProfileMenu() {
  const { tr } = useLanguage();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        const json = await response.json();
        return json.data?.user ?? null;
      })
      .then((nextUser) => {
        if (mounted) setUser(nextUser);
      })
      .catch(() => {
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

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

  async function handleLogout() {
    setOpen(false);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    await signOut({ callbackUrl: "/" });
  }

  if (loading) {
    return (
      <Button variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label={tr("myProfile")} disabled>
        <UserRound className="h-5 w-5" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
        <Link href="/login" aria-label={tr("login")}>
          <UserRound className="h-5 w-5" />
        </Link>
      </Button>
    );
  }

  const image = user.image ?? user.avatarUrl;
  const initials = getInitials(user.name ?? user.email ?? "N");
  const showAdminPanel = canOpenAdminPanel(user) || Boolean(user.isAdminLogin);

  return (
    <div ref={menuRef} className="relative hidden sm:block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 items-center gap-2 rounded-full border border-[#F5C542]/25 bg-[#201037]/70 px-2 pr-3 text-sm text-foreground transition hover:border-[#F5C542]/55 hover:bg-[#F5C542]/10"
      >
        <span className="grid h-7 w-7 overflow-hidden rounded-full border border-[#F5C542]/35 bg-[#F5C542]/10 place-items-center text-xs font-bold text-[#FFD36A]">
          {image ? <Image src={image} alt="" width={28} height={28} className="h-full w-full object-cover" /> : initials}
        </span>
        <span className="hidden max-w-[7rem] truncate xl:block">{user.name ?? user.email}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open ? "rotate-180" : "")} />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 w-64 rounded-xl border border-[#F5C542]/25 bg-[#12051f]/95 p-2 shadow-[0_18px_60px_rgba(5,2,14,0.62),0_0_32px_rgba(126,72,255,0.18)] backdrop-blur-xl"
        >
          <div className="border-b border-[#F5C542]/20 px-3 py-3">
            <p className="truncate font-cinzel text-sm font-bold text-[#FFD36A]">{user.name ?? "Naksharix"}</p>
            <p className="truncate text-xs naksh-muted-text">{user.email}</p>
          </div>
          <ProfileLink href="/profile" icon={UserRound} label={tr("myProfile")} onClick={() => setOpen(false)} />
          <ProfileLink href="/my-readings" icon={BookOpen} label={tr("myReadings")} onClick={() => setOpen(false)} />
          <ProfileLink href="/saved-reports" icon={FileText} label={tr("savedReports")} onClick={() => setOpen(false)} />
          {showAdminPanel ? <ProfileLink href="/admin" icon={ShieldCheck} label={tr("adminPanel")} onClick={() => setOpen(false)} /> : null}
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm naksh-muted-text transition hover:bg-[#F5C542]/10 hover:text-[#FFD36A]"
          >
            <LogOut className="h-4 w-4" />
            {tr("logout")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ProfileLink({ href, icon: Icon, label, onClick }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return (
    <Link
      role="menuitem"
      href={href}
      onClick={onClick}
      className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm naksh-muted-text transition hover:bg-[#F5C542]/10 hover:text-[#FFD36A]"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "N";
}



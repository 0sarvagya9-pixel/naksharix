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
  const displayName = getDisplayName(user);
  const displayMeta = getDisplayMeta(user);
  const initials = getInitials(displayName);
  const showAdminPanel = canOpenAdminPanel(user) || Boolean(user.isAdminLogin);

  return (
    <div ref={menuRef} className="relative hidden min-w-[2.5rem] flex-shrink-0 sm:block xl:min-w-[8.75rem] xl:max-w-[12rem] 2xl:min-w-[9.5rem] 2xl:max-w-[13.75rem]">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 min-w-10 max-w-[12rem] items-center gap-2 rounded-full border border-[#dca956]/25 bg-[#0a1224]/82 px-2 pr-3 text-sm text-[#ffffff] shadow-[0_10px_28px_rgba(0,5,16,0.28)] transition hover:border-[#dca956]/55 hover:bg-[#dca956]/10 xl:w-full 2xl:max-w-[13.75rem]"
      >
        <span className="grid h-7 w-7 flex-shrink-0 place-items-center overflow-hidden rounded-full border border-[#dca956]/35 bg-[#dca956]/10 text-xs font-bold text-[#fbc02d]">
          {image ? <Image src={image} alt="" width={28} height={28} className="h-full w-full object-cover" /> : initials}
        </span>
        <span className="hidden min-w-0 flex-1 truncate xl:block">{displayName}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open ? "rotate-180" : "")} />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 w-64 rounded-xl border border-[#D4AF37]/25 bg-[#02112C]/95 p-2 shadow-[0_18px_60px_rgba(5,2,14,0.62),0_0_32px_rgba(126,72,255,0.18)] backdrop-blur-xl"
        >
          <div className="border-b border-[#dca956]/20 px-3 py-3">
            <p className="truncate font-cinzel text-sm font-bold text-[#f3d382]">{displayName}</p>
            <p className="truncate text-xs naksh-muted-text">{displayMeta}</p>
          </div>
          <ProfileLink href="/profile" icon={UserRound} label={tr("myProfile")} onClick={() => setOpen(false)} />
          <ProfileLink href="/my-readings" icon={BookOpen} label={tr("myReadings")} onClick={() => setOpen(false)} />
          <ProfileLink href="/saved-reports" icon={FileText} label={tr("savedReports")} onClick={() => setOpen(false)} />
          {showAdminPanel ? <ProfileLink href="/admin" icon={ShieldCheck} label={tr("adminPanel")} onClick={() => setOpen(false)} /> : null}
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm naksh-muted-text transition hover:bg-[#dca956]/10 hover:text-[#f3d382]"
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
      className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm naksh-muted-text transition hover:bg-[#D4AF37]/10 hover:text-[#FFD700]"
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

function getDisplayName(user: SessionUser) {
  const rawName = safeDisplayValue(user.name);
  if (rawName) return rawName;
  const email = safeDisplayValue(user.email);
  if (email) return email.split("@")[0] || "Account";
  return user.isAdminLogin ? "Naksharix Admin" : "Account";
}

function getDisplayMeta(user: SessionUser) {
  if (user.isAdminLogin) return "Admin mode";
  const role = safeDisplayValue(user.effectiveRole ?? user.role);
  if (role) return role.toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
  return safeDisplayValue(user.email) || "Naksharix User";
}

function safeDisplayValue(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}



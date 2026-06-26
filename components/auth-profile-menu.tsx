"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { BookOpen, FileText, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { isAdmin as canOpenAdminPanel } from "@/lib/auth/permissions";

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
    <div ref={menuRef} className="relative hidden min-w-10 flex-shrink-0 sm:block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={displayName}
        onClick={() => setOpen((value) => !value)}
        className="grid h-10 w-10 place-items-center rounded-full border border-[#D8AF66]/35 bg-white/86 p-1 text-sm text-[#1F2933] shadow-[0_10px_28px_rgba(86,64,31,0.12)] transition hover:border-[#B8862E]/55 hover:bg-[#F7EAD3]/70 focus:outline-none focus:ring-2 focus:ring-[#DCE8F7]"
      >
        <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-[#D8AF66]/35 bg-[#F7EAD3]/70 text-xs font-bold text-[#B8862E]">
          {image ? <Image src={image} alt="" width={28} height={28} className="h-full w-full object-cover" /> : initials}
        </span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 w-64 rounded-xl border border-[#E7D8BE] bg-white/95 p-2 shadow-[0_18px_60px_rgba(86,64,31,0.14)] backdrop-blur-xl"
        >
          <div className="border-b border-[#E7D8BE] px-3 py-3">
            <p className="truncate font-cinzel text-sm font-bold text-[#1F2933]">{displayName}</p>
            <p className="truncate text-xs text-[#6B7280]">{displayMeta}</p>
          </div>
          <ProfileLink href="/profile" icon={UserRound} label={tr("myProfile")} onClick={() => setOpen(false)} />
          <ProfileLink href="/my-readings" icon={BookOpen} label={tr("myReadings")} onClick={() => setOpen(false)} />
          <ProfileLink href="/saved-reports" icon={FileText} label={tr("savedReports")} onClick={() => setOpen(false)} />
          {showAdminPanel ? <ProfileLink href="/admin" icon={ShieldCheck} label={tr("adminPanel")} onClick={() => setOpen(false)} /> : null}
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#6B7280] transition hover:bg-[#F7EAD3]/70 hover:text-[#B8862E]"
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
      className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#6B7280] transition hover:bg-[#F7EAD3]/70 hover:text-[#B8862E]"
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



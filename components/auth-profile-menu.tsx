"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BookOpen, FileText, LayoutDashboard, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { isAdmin as canOpenAdminPanel } from "@/lib/auth/permissions";
import { secureFetch } from "@/lib/security/csrf";

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

export function AuthProfileMenu({ showGalleryLabel = false }: { showGalleryLabel?: boolean } = {}) {
  const { tr } = useLanguage();
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    }
  }, [open]);

  function handleMenuKeys(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (!items.length) return;
    event.preventDefault();
    const index = items.findIndex(item => item === document.activeElement);
    const next = event.key === "Home" ? 0 :
      event.key === "End" ? items.length - 1 :
      event.key === "ArrowDown" ? (index + 1) % items.length :
      (index < 0 ? items.length - 1 : index + items.length - 1) % items.length;
    items[next]?.focus();
  }

  async function handleLogout() {
    setOpen(false);
    await secureFetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    await signOut({ callbackUrl: "/" });
  }

  if (loading) {
    return (
      <Button variant="ghost" size={showGalleryLabel ? "md" : "icon"} className={showGalleryLabel ? "nx-gallery-account-button inline-flex gap-2" : "inline-flex"} aria-label={tr("myProfile")} disabled>
        <UserRound className="h-5 w-5" />
        {showGalleryLabel ? <span>My Account</span> : null}
      </Button>
    );
  }

  if (!user) {
    return (
      <Button variant="ghost" size={showGalleryLabel ? "md" : "icon"} asChild className={showGalleryLabel ? "nx-gallery-account-button inline-flex gap-2" : "inline-flex"}>
        <Link href="/login" aria-label={tr("login")}>
          <UserRound className="h-5 w-5" />
          {showGalleryLabel ? <span>My Account</span> : null}
        </Link>
      </Button>
    );
  }

  const image = safeImageUrl(user.image ?? user.avatarUrl);
  const displayName = getDisplayName(user);
  const displayMeta = getDisplayMeta(user);
  const initials = getInitials(displayName);
  const showAdminPanel = canOpenAdminPanel(user) || Boolean(user.isAdminLogin);
  const portalRole = user.effectiveRole ?? user.role ?? "USER";
  // Match the server-side /astrologer/layout.tsx role check; do not present
  // inaccessible workspace links to regular members or admins in user mode.
  const showAstrologerDashboard = portalRole === "ASTROLOGER" || portalRole === "CONSULTANT";
  const portalProfile = showAstrologerDashboard ? "/astrologer/profile" : "/profile";

  return (
    <div className="flex shrink-0 items-center gap-2">
      {showAstrologerDashboard ? (
        <Link
          href="/astrologer/dashboard"
          className="hidden min-h-10 items-center gap-2 rounded-xl border border-[#b98656] bg-[#76263b] px-3 py-2 text-xs font-bold text-[#fff8ee] shadow-sm transition hover:border-[#d49b4c] hover:bg-[#5e1b2e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b98656] 2xl:inline-flex"
          aria-label="Open astrologer dashboard"
        >
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>
      ) : null}
      <div ref={menuRef} onKeyDown={handleMenuKeys} className="relative min-w-10 flex-shrink-0">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="menu"
          aria-controls="naksharix-account-menu"
          aria-expanded={open}
          aria-label={`Account menu for ${displayName}`}
          onClick={() => setOpen((value) => !value)}
          className={showGalleryLabel ? "nx-gallery-auth-trigger flex h-10 items-center gap-2 rounded-full bg-[#7a1526] px-4 text-sm font-bold text-white" : "grid h-11 w-11 place-items-center rounded-full border-2 border-[#b77d55] bg-[#fff6e9] p-1 text-sm text-[#6b2639] shadow-[0_6px_20px_rgba(92,43,35,0.13)] transition hover:border-[#8a3244] hover:bg-[#fce5c9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a3244]"}
        >
          <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-[#b88a67] bg-[#f2d8b0] text-xs font-extrabold text-[#662439]">
            <AvatarImage src={image} initials={initials} />
          </span>
          {showGalleryLabel ? <span className="whitespace-nowrap text-xs">My Account</span> : null}
        </button>
        {open ? (
          <div
            role="menu"
            id="naksharix-account-menu"
            aria-label="Account navigation"
            className={`absolute right-0 z-[100] w-[min(19rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-[#d7b6a0] bg-[#fffaf3] p-2 text-[#45252f] shadow-[0_22px_65px_rgba(49,25,35,.25)] ring-1 ring-white/60 ${pathname.startsWith("/astrologer") ? "bottom-full mb-3" : "top-full mt-3"}`}
          >
            <div className="rounded-xl bg-gradient-to-r from-[#fff0df] to-[#fffaef] px-3 py-3">
              <p className="truncate font-cinzel text-sm font-extrabold text-[#77263b]">{displayName}</p>
              <p className="mt-1 truncate text-xs font-medium text-[#654c51]">{displayMeta}</p>
            </div>
            {showAstrologerDashboard ? (
              <div className="mt-2 rounded-xl border border-[#e4b875] bg-[#fff1d8] p-1">
                <ProfileLink href="/astrologer/dashboard" icon={LayoutDashboard} label="Astrologer Dashboard" onClick={() => setOpen(false)} featured />
                <ProfileLink href="/astrologer/profile" icon={UserRound} label="Professional Profile" onClick={() => setOpen(false)} />
              </div>
            ) : (
              <ProfileLink href={portalProfile} icon={UserRound} label={tr("myProfile")} onClick={() => setOpen(false)} />
            )}
            <div className="mt-2 border-t border-[#e6d1c0] pt-2">
              <ProfileLink href="/my-readings" icon={BookOpen} label={tr("myReadings")} onClick={() => setOpen(false)} />
              <ProfileLink href="/saved-reports" icon={FileText} label={tr("savedReports")} onClick={() => setOpen(false)} />
              {showAdminPanel ? <ProfileLink href="/admin" icon={ShieldCheck} label={tr("adminPanel")} onClick={() => setOpen(false)} /> : null}
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-xl border-t border-[#e6d1c0] px-3 py-2 text-left text-sm font-semibold text-[#693d48] transition hover:bg-[#f4e3d8] hover:text-[#79283b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a04b55]"
            >
              <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
              {tr("logout")}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AvatarImage({ src, initials }: { src: string; initials: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) return <>{initials}</>;

  return (
    <Image
      src={src}
      alt=""
      width={28}
      height={28}
      unoptimized
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}

function ProfileLink({
  href, icon: Icon, label, onClick, featured = false
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  featured?: boolean;
}) {
  return (
    <Link
      role="menuitem"
      href={href}
      onClick={onClick}
      className={featured
        ? "mt-1 flex min-h-11 items-center gap-3 rounded-lg bg-[#74263b] px-3 py-2.5 text-sm font-bold text-white transition hover:bg-[#5d1b2f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b57e44]"
        : "mt-1 flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#573540] transition hover:bg-[#f4e3d8] hover:text-[#79283b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a04b55]"
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span>{label}</span>
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

function safeImageUrl(value: unknown) {
  const raw = safeDisplayValue(value);
  if (!raw) return "";
  if (raw.startsWith("/")) return raw;

  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Public pages use edge-to-edge editorial sections with centered content
 * containers; account/admin tools retain an inset, focused workspace shell.
 */
const workspacePrefixes = [
  "/admin", "/dashboard", "/profile", "/saved-reports", "/my-readings",
  "/astrologer", "/payment", "/login", "/signup", "/report-request"
] as const;

function approvedGalleryFamily(pathname: string) {
  const p = pathname.toLowerCase();
  if (p === "/") return "home";
  if (p.startsWith("/admin")) return "admin";
  if (p.startsWith("/astrologer")) return "astrologer";
  if (p.startsWith("/dashboard") || ["/profile", "/my-readings", "/saved-reports"].includes(p)) return "dashboard";
  if (p.startsWith("/auth") || p === "/login" || p === "/signup") return "auth";
  if (p.startsWith("/consultation") || p.startsWith("/astrologers")) return "consultation";
  if (p.startsWith("/reports") || p.startsWith("/report-request")) return "reports";
  if (p.includes("matching") || p.includes("compatibility") || p.includes("match-making") || p === "/hi/kundli-milan") return "matching";
  if (p.startsWith("/kundli") || p.startsWith("/free-kundli") || p === "/hi/free-kundli") return "kundli";
  if (p.startsWith("/puja") || p.includes("festival")) return "puja";
  if (p.includes("panchang") || p.includes("calendar") || p.includes("muhurat")) return "panchang";
  if (p.startsWith("/free-calculators") || p === "/calculators") return "calculator";
  if (p.includes("horoscope") || p.startsWith("/zodiac") || p.includes("rashifal")) return "horoscope";
  if (p.startsWith("/numerology")) return "numerology";
  if (p.includes("tarot")) return "tarot";
  if (p.startsWith("/blog")) return "blog";
  if (p.startsWith("/shop") || p.startsWith("/cart") || p.includes("orders")) return "shop";
  if (p.startsWith("/payment")) return "payment";
  if (p.startsWith("/ai-astrologer") || p === "/chatbot" || p === "/talk-to-kundli") return "assistant";
  if (p === "/search") return "search";
  if (p === "/offline") return "offline";
  return "information";
}

export function PremiumGlassShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const isWorkspace = workspacePrefixes.some(path =>
    pathname === path || pathname.startsWith(path + "/"));
  const isHome = pathname === "/";
  const isEditorial = !isWorkspace;
  const isAstrologer = pathname === "/astrologer" || pathname.startsWith("/astrologer/");

  return (
    <div
      data-layout={isEditorial ? "editorial" : "workspace"}
      data-page-kind={approvedGalleryFamily(pathname)}
      className={cn(
        "relative z-10 flex min-h-screen w-full flex-col",
        isEditorial
          ? isHome
            ? "naksharix-home-shell mx-0 my-0 max-w-none rounded-none"
            : "naksharix-editorial-shell mx-0 my-0 max-w-none rounded-none"
          : isAstrologer
            ? "mx-auto my-0 max-w-none overflow-visible rounded-none min-h-screen"
            : "mx-auto my-6 max-w-[1420px] overflow-hidden rounded-[30px] sm:min-h-[calc(100vh-80px)] md:my-10",
        className
      )}
      style={isEditorial || isAstrologer
        ? { background: "transparent", border: "none", boxShadow: "none", backdropFilter: "none" }
        : {
            background: "linear-gradient(135deg, rgba(255,251,246,0.96), rgba(255,245,230,0.90))",
            backdropFilter: "blur(4px) saturate(135%)",
            border: "1px solid rgba(170,103,82,0.20)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 24px 70px rgba(100,45,39,0.09)"
          }}>
      {children}
    </div>
  );
}

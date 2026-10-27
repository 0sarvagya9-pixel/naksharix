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

  return (
    <div
      data-layout={isEditorial ? "editorial" : "workspace"}
      className={cn(
        "relative z-10 flex min-h-screen w-full flex-col",
        isEditorial
          ? isHome
            ? "naksharix-home-shell mx-0 my-0 max-w-none rounded-none"
            : "naksharix-editorial-shell mx-0 my-0 max-w-none rounded-none"
          : "mx-auto my-6 max-w-[1420px] overflow-hidden rounded-[30px] sm:min-h-[calc(100vh-80px)] md:my-10",
        className
      )}
      style={isEditorial
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

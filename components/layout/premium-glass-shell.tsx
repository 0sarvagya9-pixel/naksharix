"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function PremiumGlassShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const isHome = usePathname() === "/";

  return (
    <div
      className={cn(
        "relative z-10 w-full overflow-hidden flex flex-col min-h-screen",
        isHome ? "max-w-none mx-0 my-0 rounded-none" : "max-w-[1420px] mx-auto my-6 md:my-10 rounded-[38px] sm:min-h-[calc(100vh-80px)]",
        className
      )}
      style={isHome ? { background: "transparent", border: "none", boxShadow: "none", backdropFilter: "none", WebkitBackdropFilter: "none" } : {
        background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025))",
        backdropFilter: "blur(4px) saturate(135%)",
        WebkitBackdropFilter: "blur(4px) saturate(135%)",
        border: "1px solid rgba(255,255,255,0.32)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 32px 100px rgba(20,12,8,0.22), 0 0 70px rgba(216,154,43,0.12)"
      }}
    >
      {children}
    </div>
  );
}

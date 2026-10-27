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
        isHome ? "naksharix-home-shell max-w-none mx-0 my-0 rounded-none" : "max-w-[1420px] mx-auto my-6 md:my-10 rounded-[38px] sm:min-h-[calc(100vh-80px)]",
        className
      )}
      style={isHome ? { background: "transparent", border: "none", boxShadow: "none", backdropFilter: "none", WebkitBackdropFilter: "none" } : {
        background: "linear-gradient(135deg, rgba(255,251,246,0.96), rgba(255,245,230,0.90))",
        backdropFilter: "blur(4px) saturate(135%)",
        WebkitBackdropFilter: "blur(4px) saturate(135%)",
        border: "1px solid rgba(170,103,82,0.20)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 24px 70px rgba(100,45,39,0.09)"
      }}
    >
      {children}
    </div>
  );
}

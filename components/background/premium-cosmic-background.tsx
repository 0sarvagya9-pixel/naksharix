"use client";

import React from "react";
import Image from "next/image";

export function PremiumCosmicBackground() {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden">
      {/* Fixed full-screen background image */}
      <Image
        src="/images/premium-cosmic-bg-v2.webp"
        alt="Vedic Cosmic Background"
        fill
        priority
        className="object-cover object-top"
      />

      {/* Subtle dark/warm overlay - lighter for transparency and visibility */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(9, 13, 24, 0.10) 0%, rgba(9, 13, 24, 0.25) 55%, rgba(9, 13, 24, 0.50) 100%)",
        }}
      />

      {/* Optional subtle vignette/noise overlay */}
      <div className="absolute inset-0 bg-black/[0.02]" />
    </div>
  );
}

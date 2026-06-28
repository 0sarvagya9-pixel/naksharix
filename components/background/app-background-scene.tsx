"use client";

import React from "react";
import { CosmicOrbitScene } from "./cosmic-orbit-scene";

export function AppBackgroundScene() {
  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-0"
      style={{
        background: "radial-gradient(circle at 50% 35%, #151a2e 0%, #0a0b12 100%)",
      }}
    >
      {/* Concentric subtle background orbits for luxury visual depth */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
        <div className="w-[320px] h-[320px] rounded-full border border-white/5" />
        <div className="absolute w-[640px] h-[640px] rounded-full border border-white/5" />
        <div className="absolute w-[960px] h-[960px] rounded-full border border-white/5" />
        <div className="absolute w-[1280px] h-[1280px] rounded-full border border-white/5 animate-[spin_360s_linear_infinite]" />
      </div>

      {/* Layer 1: Ambient Space Glows */}
      <div 
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-40 blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(216, 154, 43, 0.18) 0%, transparent 70%)"
        }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-45 blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(110, 130, 200, 0.15) 0%, transparent 70%)"
        }}
      />

      {/* Layer 2: 3D Celestial Orbit Scene */}
      <CosmicOrbitScene />

      {/* Layer 3: Faint overlay vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(8,9,14,0.55)_100%)]" />
    </div>
  );
}

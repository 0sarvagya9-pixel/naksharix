"use client";

import React from "react";
import { CosmicOrbitScene } from "./cosmic-orbit-scene";

export function AppBackgroundScene() {
  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-0"
      style={{
        background: "radial-gradient(circle at 50% 35%, #121626 0%, #08090e 100%)",
      }}
    >
      {/* Concentric subtle background orbits for luxury visual depth */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[320px] h-[320px] rounded-full border border-white/5" />
        <div className="absolute w-[640px] h-[640px] rounded-full border border-white/5" />
        <div className="absolute w-[960px] h-[960px] rounded-full border border-white/5" />
        <div className="absolute w-[1280px] h-[1280px] rounded-full border border-white/5 animate-[spin_360s_linear_infinite]" />
      </div>

      {/* Layer 1: Ambient Space Glows - Sunset bronze & violet dusk */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[65%] h-[60%] rounded-full opacity-35 blur-[130px]"
        style={{
          background: "radial-gradient(circle, rgba(216, 154, 43, 0.16) 0%, rgba(185, 120, 16, 0.08) 50%, transparent 100%)"
        }}
      />
      <div
        className="absolute bottom-[-15%] right-[-5%] w-[55%] h-[55%] rounded-full opacity-40 blur-[135px]"
        style={{
          background: "radial-gradient(circle, rgba(110, 130, 200, 0.16) 0%, rgba(216, 154, 43, 0.05) 50%, transparent 100%)"
        }}
      />
      <div
        className="absolute bottom-[20%] left-[-10%] w-[45%] h-[45%] rounded-full opacity-25 blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(185, 120, 16, 0.08) 0%, transparent 70%)"
        }}
      />

      {/* Layer 2: 3D Celestial Orbit Scene */}
      <CosmicOrbitScene />

      {/* Layer 3: Faint overlay vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(6,7,11,0.65)_100%)]" />
    </div>
  );
}
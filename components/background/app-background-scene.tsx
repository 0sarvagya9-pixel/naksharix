"use client";

import React from "react";
import { CosmicOrbitScene } from "./cosmic-orbit-scene";

export function AppBackgroundScene() {
  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-0"
      style={{
        background: "radial-gradient(circle at 50% 30%, #1c2030 0%, #0d0f16 100%)",
      }}
    >
      {/* Layer 1: Ambient Space Glows */}
      <div 
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-30 blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(216, 154, 43, 0.15) 0%, transparent 70%)"
        }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-35 blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(110, 130, 200, 0.12) 0%, transparent 70%)"
        }}
      />

      {/* Layer 2: 3D Celestial Orbit Scene */}
      <CosmicOrbitScene />

      {/* Layer 3: Faint overlay vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(10,12,18,0.45)_100%)]" />
    </div>
  );
}

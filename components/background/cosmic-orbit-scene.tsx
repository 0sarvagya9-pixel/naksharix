"use client";

import React from "react";

export function CosmicOrbitScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Ambient background clouds / nebula haze */}
      <div className="absolute bottom-0 left-[20%] w-[60%] h-[40%] bg-[radial-gradient(ellipse_at_bottom,rgba(110,130,200,0.08)_0%,transparent_70%)] blur-2xl opacity-70" />
      <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(216,154,43,0.05)_0%,transparent_60%)] blur-3xl opacity-60" />

      {/* 3D Celestial Orbit System at Top Right (rotated for perspective) */}
      <div
        className="absolute top-[5%] right-[-10%] w-[650px] h-[650px] md:w-[950px] md:h-[950px] rounded-full border border-dashed border-[#e6941a]/12 flex items-center justify-center animate-[spin_160s_linear_infinite]"
        style={{
          transform: "rotateX(72deg) rotateY(-18deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Concentric Orbit Paths */}
        <div className="absolute w-[80%] h-[80%] rounded-full border border-dotted border-[#e6941a]/8" />
        <div className="absolute w-[60%] h-[60%] rounded-full border border-[#6e82c8]/6" />
        <div className="absolute w-[40%] h-[40%] rounded-full border border-dashed border-[#e6941a]/10" />

        {/* Outer orbital planet 1 */}
        <div
          className="absolute w-5 h-5 rounded-full bg-gradient-to-br from-[#e6941a] to-[#2a1b02] shadow-[0_0_12px_rgba(216,154,43,0.2),inset_-2px_-2px_6px_rgba(0,0,0,0.8)]"
          style={{
            transform: "translate3d(360px, 180px, 0)",
          }}
        />

        {/* Orbit path node lights */}
        <div className="absolute w-1.5 h-1.5 rounded-full bg-white/40" style={{ transform: "translate3d(0, -325px, 0)" }} />
        <div className="absolute w-1 h-1 rounded-full bg-[#d89a2b]/60" style={{ transform: "translate3d(240px, -240px, 0)" }} />
      </div>

      {/* Large Saturn-style Planet with Ring (focal point near top right / hero side) */}
      <div className="absolute top-[18%] right-[8%] md:right-[15%] w-20 h-20 md:w-32 md:h-32 flex items-center justify-center">
        {/* Glow Behind */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(216,154,43,0.22)_0%,transparent_70%)] blur-md scale-125" />
        {/* Planet Sphere */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ebd8b1] via-[#bf923b] to-[#1a150c] shadow-[inset_-8px_-8px_24px_rgba(0,0,0,0.85),0_0_16px_rgba(216,154,43,0.2)]" />
        {/* Planet Ring Shadow & Highlight Layer */}
        <div
          className="absolute w-[170%] h-[35%] rounded-full border border-[#ebd8b1]/35"
          style={{
            transform: "rotateX(75deg) rotateY(-12deg)",
            boxShadow: "0 0 10px rgba(216,154,43,0.12), inset 0 0 10px rgba(216,154,43,0.12)"
          }}
        />
      </div>

      {/* Another Orbit System at Bottom Left */}
      <div
        className="absolute bottom-[-10%] left-[-8%] w-[500px] h-[500px] md:w-[750px] md:h-[750px] rounded-full border border-dashed border-neutral-700/20 flex items-center justify-center animate-[spin_200s_linear_infinite_reverse]"
        style={{
          transform: "rotateX(68deg) rotateY(12deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="absolute w-[70%] h-[70%] rounded-full border border-[#6e82c8]/8" />

        {/* Floating Planet 2 */}
        <div
          className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-[#6e82c8] to-[#0b0e17] shadow-[0_0_24px_rgba(110,130,200,0.2),inset_-4px_-4px_12px_rgba(0,0,0,0.7)]"
          style={{
            transform: "translate3d(-220px, 70px, 0)",
          }}
        />
      </div>

      {/* Tiny floating golden moon near left edge */}
      <div className="absolute top-[28%] left-[10%] w-5 h-5 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f2c56b] to-[#2d1e07] shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.85),0_0_6px_rgba(216,154,43,0.15)]" />
      </div>

      {/* Star Dust Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px] opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1.2px,transparent_1.2px)] bg-[size:72px_72px] opacity-40" />
    </div>
  );
}
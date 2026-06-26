"use client";

/* eslint-disable @next/next/no-img-element */

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

const asset = (name: string) => `/ui/theme10/${name}.svg`;

const planets = [
  { image: "planet-1", size: "h-14 w-14 sm:h-20 sm:w-20", radius: "inset-[0%]", duration: 48, start: 34, reverse: false, glow: "drop-shadow-[0_12px_26px_rgba(216,175,102,0.42)]" },
  { image: "planet-2", size: "h-10 w-10 sm:h-14 sm:w-14", radius: "inset-[7%]", duration: 62, start: 144, reverse: true, glow: "drop-shadow-[0_10px_22px_rgba(72,126,170,0.38)]" },
  { image: "planet-3", size: "h-9 w-9 sm:h-12 sm:w-12", radius: "inset-[14%]", duration: 35, start: 248, reverse: false, glow: "drop-shadow-[0_10px_20px_rgba(234,88,12,0.34)]" },
  { image: "planet-4", size: "h-14 w-20 sm:h-[4.5rem] sm:w-24", radius: "inset-[21%]", duration: 78, start: 314, reverse: true, glow: "drop-shadow-[0_12px_26px_rgba(216,175,102,0.36)]" },
  { image: "planet-5", size: "h-8 w-8 sm:h-11 sm:w-11", radius: "inset-[5%]", duration: 95, start: 204, reverse: false, glow: "drop-shadow-[0_9px_18px_rgba(20,184,166,0.34)]" },
  { image: "planet-6", size: "h-5 w-5 sm:h-7 sm:w-7", radius: "inset-[27%]", duration: 120, start: 76, reverse: true, glow: "drop-shadow-[0_0_18px_rgba(251,192,45,0.54)]" }
];

export function Theme10CosmicWheel({ className, compact = false }: { className?: string; compact?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const outerWheel = useRef<HTMLImageElement>(null);
  const innerWheel = useRef<HTMLImageElement>(null);
  const sunburst = useRef<HTMLImageElement>(null);
  const orbitRefs = useRef<Array<HTMLDivElement | null>>([]);
  const planetRefs = useRef<Array<HTMLImageElement | null>>([]);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set([outerWheel.current, innerWheel.current, sunburst.current, ...orbitRefs.current], { clearProps: "transform" });
        return;
      }

      const ctx = gsap.context(() => {
        gsap.to(outerWheel.current, { rotate: 360, duration: compact ? 130 : 110, repeat: -1, ease: "none" });
        gsap.to(innerWheel.current, { rotate: -360, duration: compact ? 170 : 145, repeat: -1, ease: "none" });
        gsap.to(sunburst.current, { scale: 1.025, opacity: 0.92, duration: 4.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
        orbitRefs.current.forEach((node, index) => {
          if (!node) return;
          const planet = planets[index];
          gsap.fromTo(
            node,
            { rotate: planet.start },
            { rotate: planet.reverse ? planet.start - 360 : planet.start + 360, duration: planet.duration, repeat: -1, ease: "none" }
          );
          const planetNode = planetRefs.current[index];
          if (planetNode) {
            gsap.fromTo(
              planetNode,
              { rotate: -planet.start },
              { rotate: planet.reverse ? -planet.start + 360 : -planet.start - 360, duration: planet.duration, repeat: -1, ease: "none" }
            );
          }
        });
      }, root);
      return () => ctx.revert();
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      className={cn(
        "theme10-wheel-scene relative mx-auto aspect-square w-[clamp(560px,45vw,820px)] max-h-[74vh] max-w-full",
        compact && "w-full max-w-[17rem]",
        className
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-[-7%] rounded-full bg-[radial-gradient(circle_at_50%_48%,rgba(255,249,240,0.82)_0%,rgba(248,226,166,0.44)_20%,rgba(13,36,56,0.30)_45%,rgba(220,232,247,0.22)_64%,transparent_74%)] blur-2xl" />
      <div className="absolute inset-[4%] rounded-full bg-[radial-gradient(circle_at_48%_44%,rgba(255,255,255,0.28),rgba(13,36,56,0.18)_36%,transparent_68%)]" />
      <img src={asset("sparkle-stars")} alt="" className="theme10-stars absolute inset-[-9%] h-[118%] w-[118%] opacity-80 mix-blend-screen" />
      <img src={asset("orbit-rings")} alt="" className="absolute inset-[-10%] h-[120%] w-[120%] opacity-85" />
      <img ref={sunburst} src={asset("sunburst")} alt="" className="absolute inset-[16%] h-[68%] w-[68%] rounded-full drop-shadow-[0_0_64px_rgba(216,175,102,0.62)]" />
      <img ref={outerWheel} src={asset("wheel-main")} alt="" className="absolute inset-[4%] h-[92%] w-[92%] rounded-full drop-shadow-[0_28px_86px_rgba(7,24,39,0.24)]" />
      <img ref={innerWheel} src={asset("wheel-inner")} alt="" className="absolute inset-[20%] h-[60%] w-[60%] opacity-95 drop-shadow-[0_0_34px_rgba(216,175,102,0.26)]" />
      <div className="absolute inset-[31%] rounded-full bg-[radial-gradient(circle,#FFFFFF_0%,#FFF9F0_32%,#F7DFA5_56%,rgba(216,175,102,0.22)_78%,transparent_100%)] blur-lg" />
      <div className="absolute inset-[35%] rounded-full border border-[#F7EAD3]/80 bg-[radial-gradient(circle,#FFFDF7_0%,#F7EAD3_46%,rgba(216,175,102,0.32)_75%,transparent_100%)] shadow-[0_0_58px_rgba(216,175,102,0.52)]" />
      <img src={asset("om-center")} alt="" className="absolute inset-[38%] h-[24%] w-[24%] rounded-full drop-shadow-[0_0_40px_rgba(255,249,240,0.82)]" />

      {planets.map((planet, index) => (
        <div
          key={planet.image}
          ref={(node) => {
            orbitRefs.current[index] = node;
          }}
          className={cn("absolute rounded-full", planet.radius)}
        >
          <img
            src={asset(`${planet.image}`)}
            alt=""
            ref={(node) => {
              planetRefs.current[index] = node;
            }}
            className={cn("absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full", planet.size, planet.glow)}
          />
        </div>
      ))}

      <img src={asset("hero-clouds")} alt="" className="theme10-clouds pointer-events-none absolute -bottom-10 left-[-16%] h-[38%] w-[132%] opacity-95" />
    </div>
  );
}

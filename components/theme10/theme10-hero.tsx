"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Button } from "@/components/ui/button";

export function Theme10Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Raw mouse position (0–1 normalized relative to container) ── */
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);

  /* ── Spring-smoothed values ── */
  const springConfig = { stiffness: 60, damping: 20, mass: 0.8 };
  const smoothX = useSpring(rawX, springConfig);
  const smoothY = useSpring(rawY, springConfig);

  /* ── Map to slight inverse translation for parallax depth ── */
  const bgX = useTransform(smoothX, [0, 1], ["2%", "-2%"]);
  const bgY = useTransform(smoothY, [0, 1], ["2%", "-2%"]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left) / rect.width);
    rawY.set((e.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    rawX.set(0.5);
    rawY.set(0.5);
  }

  return (
    <section
      ref={containerRef}
      className="relative isolate overflow-hidden"
      style={{ minHeight: "calc(100vh - 120px)" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── 3D Parallax Background Image ── */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-[-6%] z-0 bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/1000055753.png')",
          x: bgX,
          y: bgY,
          scale: 1.12,
        }}
      />

      {/* ── Color Correction / Dark Overlay ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] bg-[#020612]/55 mix-blend-multiply"
      />

      {/* ── Soft radial vignette for extra depth ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(2,6,18,0.72)_100%)]"
      />

      {/* ── Foreground Content ── */}
      <div className="relative z-10 flex min-h-[calc(100vh-120px)] flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        {/* Glassmorphism card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-3xl rounded-[2rem] border border-[#D8AF66]/40 bg-black/40 px-8 py-12 shadow-[0_32px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:px-12 sm:py-16"
        >
          {/* Badge */}
          <div className="flex justify-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#D8AF66]/50 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#D8AF66] shadow-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Your Cosmic Blueprint
            </p>
          </div>

          {/* Headline */}
          <h1 className="theme10-hero-title mt-8 text-center font-cinzel text-[clamp(2.8rem,5.4vw,5.6rem)] font-black uppercase leading-[0.92] tracking-[-0.03em] text-white [text-wrap:balance]">
            <span className="block">Master the</span>
            <span className="block bg-gradient-to-r from-[#D8AF66] via-[#f3d382] to-[#B8862E] bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(216,175,102,0.55)]">
              Cosmos.
            </span>
            <span className="block">Live Your Destiny.</span>
          </h1>

          {/* Sub-copy */}
          <p className="mx-auto mt-7 max-w-xl text-center text-base leading-8 text-white/75 sm:text-lg">
            Premium astrology tools, daily Panchang, Kundli insights and
            review-based reports for mindful spiritual guidance.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="min-w-[10rem] bg-[#B8862E] text-white shadow-[0_0_28px_rgba(216,175,102,0.35)] hover:bg-[#d8a03a] hover:shadow-[0_0_40px_rgba(216,175,102,0.55)]"
            >
              <Link href="/kundli">
                Get My Kundli
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="min-w-[10rem] border-[#D8AF66]/60 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-[#D8AF66]"
            >
              <Link href="/free-calculators">Explore Tools</Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              "Provider calculated",
              "Secure workflow",
              "Review-based reports",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[#D8AF66]/25 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white/85 backdrop-blur-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

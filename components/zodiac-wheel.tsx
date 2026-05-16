"use client";

import { motion } from "framer-motion";
import { zodiacSigns } from "@/lib/astrology/constants";

export function ZodiacWheel() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-lg">
      <motion.div
        className="absolute inset-0 rounded-full border border-primary/40 bg-card/50"
        animate={{ rotate: 360 }}
        transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
      >
        {zodiacSigns.map((sign, index) => {
          const angle = (index / zodiacSigns.length) * 360;
          return (
            <div
              key={sign}
              className="absolute left-1/2 top-1/2 w-24 -translate-x-1/2 -translate-y-1/2 text-center text-xs font-semibold text-muted-foreground"
              style={{ transform: `rotate(${angle}deg) translateY(-190px) rotate(${-angle}deg)` }}
            >
              {sign}
            </div>
          );
        })}
      </motion.div>
      <div className="absolute inset-16 grid place-items-center rounded-full border bg-background/80 text-center">
        <div>
          <p className="text-sm text-muted-foreground">AI Kundli Engine</p>
          <p className="mt-2 text-4xl font-bold">360°</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { BrandLogo } from "@/components/brand-logo";

export function CosmicLoader({ label = "Aligning your stars" }: { label?: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="text-center">
        <div className="relative mx-auto mb-8 h-32 w-32">
          <motion.div
            className="absolute inset-0 rounded-full border border-[#D4AF37]/45"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-5 rounded-full border border-primary/50"
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 grid place-items-center">
            <BrandLogo compact />
          </div>
        </div>
        <p className="font-cinzel text-xl font-bold text-foreground">{label}</p>
        <p className="mt-2 text-sm naksh-muted-text">Unlock Your Cosmic Destiny</p>
      </div>
    </div>
  );
}

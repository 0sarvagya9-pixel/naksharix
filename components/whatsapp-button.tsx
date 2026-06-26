"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export function ContactSupportButton() {
  const pathname = usePathname();
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^\d]/g, "");
  if (!number || pathname === "/") return null;

  const message = encodeURIComponent("Namaste Naksharix, I would like help with an astrology consultation.");

  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Contact Naksharix support"
      className="fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-gradient-to-br from-emerald-500 to-emerald-700 text-[#FFFFFF] shadow-xl shadow-emerald-950/30 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#F5D76E]"
    >
      <MessageCircle className="h-5 w-5" />
    </a>
  );
}

import { MessageCircle } from "lucide-react";
import { env } from "@/lib/env";

export function WhatsAppButton() {
  const number = env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^\d]/g, "");
  if (!number) return null;

  const message = encodeURIComponent("Namaste Naksharix, I would like help with an astrology consultation.");

  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Contact Naksharix on WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-gradient-to-br from-emerald-500 to-emerald-700 text-[#FFFFFF] shadow-xl shadow-emerald-950/30 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
    >
      <MessageCircle className="h-5 w-5" />
    </a>
  );
}

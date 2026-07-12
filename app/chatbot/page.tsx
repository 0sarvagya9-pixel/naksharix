import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
    title: "AI Astrologer - Upgrading",
    description: "Naksharix AI Astrologer is temporarily unavailable while reliability and safety improvements are completed.",
    path: "/ai-astrologer",
    keywords: ["AI Astrologer Coming Soon", "Kundli Tools", "Astrology Tools"]
  }),
  robots: { index: false, follow: true }
};

export default function ChatbotPage() {
  permanentRedirect("/ai-astrologer");
}

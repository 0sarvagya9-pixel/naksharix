import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
    title: "AI Astrologer - Upgrading",
    description: "AI Astrologer is currently unavailable. Explore Naksharix Kundli, Panchang and consultation services.",
    path: "/ai-astrologer",
    keywords: ["AI Astrologer Coming Soon", "Kundli Tools", "Astrology Tools"]
  }),
  robots: { index: false, follow: true }
};

export default function ChatbotPage() {
  permanentRedirect("/ai-astrologer");
}

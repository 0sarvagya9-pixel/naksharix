import type { Metadata } from "next";
import { env } from "@/lib/env";

type SeoInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
  type?: "website" | "article";
};

function normalizeTitle(title: string) {
  const escapedAppName = env.NEXT_PUBLIC_APP_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return title.replace(new RegExp(`\\s*(?:\\||-|—)\\s*${escapedAppName}\\s*$`, "i"), "").trim();
}

export function seo({ title, description, path = "/", image = "/og.svg", keywords = [], type = "website" }: SeoInput): Metadata {
  const normalizedTitle = normalizeTitle(title);
  const url = new URL(path, env.NEXT_PUBLIC_APP_URL).toString();
  return {
    title: normalizedTitle,
    description,
    keywords: ["Astrology", "Horoscope", "Kundli", "Numerology", "Tarot Reading", "Panchang", "Naksharix", ...keywords],
    alternates: { canonical: url },
    openGraph: {
      title: normalizedTitle,
      description,
      url,
      siteName: env.NEXT_PUBLIC_APP_NAME,
      type,
      images: [{ url: image, width: 1200, height: 630, alt: `${normalizedTitle} - ${env.NEXT_PUBLIC_APP_NAME}` }]
    },
    twitter: {
      card: "summary_large_image",
      title: normalizedTitle,
      description,
      images: [image]
    }
  };
}

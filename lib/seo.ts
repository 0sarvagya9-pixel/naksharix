import type { Metadata } from "next";
import { env } from "@/lib/env";
import { publishedSeoAlternates } from "@/lib/seo-localization";
import { canonicalSeoOrigin } from "@/lib/seo-origin";

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
  const origin = canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL);
  const url = new URL(path, origin).toString();
  const languages = publishedSeoAlternates(path, origin);
  return {
    title: normalizedTitle,
    description,
    keywords: ["Astrology", "Horoscope", "Kundli", "Numerology", "Tarot Reading", "Panchang", "Naksharix", ...keywords],
    alternates: { canonical: url, ...(languages ? { languages } : {}) },
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

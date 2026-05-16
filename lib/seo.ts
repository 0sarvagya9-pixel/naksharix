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

export function seo({ title, description, path = "/", image = "/og.svg", keywords = [], type = "website" }: SeoInput): Metadata {
  const url = new URL(path, env.NEXT_PUBLIC_APP_URL).toString();
  return {
    title,
    description,
    keywords: ["Astrology", "Horoscope", "Kundli", "Numerology", "Tarot Reading", "Panchang", "Naksharix", ...keywords],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: env.NEXT_PUBLIC_APP_NAME,
      type,
      images: [{ url: image, width: 1200, height: 630, alt: `${title} - ${env.NEXT_PUBLIC_APP_NAME}` }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

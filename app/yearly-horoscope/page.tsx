import type { Metadata } from "next";
import { HoroscopePageShell } from "@/components/horoscope/horoscope-page-shell";
import { horoscopePageConfig } from "@/lib/horoscope/constants";
import { seo } from "@/lib/seo";

const page = horoscopePageConfig["yearly-2026"];
export const metadata: Metadata = seo({
  title: page.metadata.title,
  description: page.metadata.description,
  path: "/yearly-horoscope",
  keywords: page.metadata.keywords
});

export default function YearlyHoroscopePage() {
  return <HoroscopePageShell kind="yearly-2026" />;
}

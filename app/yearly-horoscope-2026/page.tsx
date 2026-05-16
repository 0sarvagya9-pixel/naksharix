import type { Metadata } from "next";
import { SeoGrowthPage } from "@/components/seo-growth-page";
import { growthPages } from "@/lib/growth-pages";
import { seo } from "@/lib/seo";

const page = growthPages["yearly-horoscope-2026"];
export const metadata: Metadata = seo({ title: page.title, description: page.description, path: page.path, keywords: ["Yearly Horoscope 2026"] });
export default function YearlyHoroscopeSeoPage() { return <SeoGrowthPage page={page} />; }

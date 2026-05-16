import type { Metadata } from "next";
import { SeoGrowthPage } from "@/components/seo-growth-page";
import { growthPages } from "@/lib/growth-pages";
import { seo } from "@/lib/seo";

const page = growthPages["weekly-horoscope"];
export const metadata: Metadata = seo({ title: page.title, description: page.description, path: page.path, keywords: ["Weekly Horoscope"] });
export default function WeeklyHoroscopeSeoPage() { return <SeoGrowthPage page={page} />; }

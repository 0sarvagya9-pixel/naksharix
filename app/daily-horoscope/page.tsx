import type { Metadata } from "next";
import { SeoGrowthPage } from "@/components/seo-growth-page";
import { growthPages } from "@/lib/growth-pages";
import { seo } from "@/lib/seo";

const page = growthPages["daily-horoscope"];
export const metadata: Metadata = seo({ title: page.title, description: page.description, path: page.path, keywords: ["Daily Horoscope", "Today Horoscope"] });
export default function DailyHoroscopeSeoPage() { return <SeoGrowthPage page={page} />; }

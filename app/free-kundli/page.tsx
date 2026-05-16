import type { Metadata } from "next";
import { SeoGrowthPage } from "@/components/seo-growth-page";
import { growthPages } from "@/lib/growth-pages";
import { seo } from "@/lib/seo";

const page = growthPages["free-kundli"];
export const metadata: Metadata = seo({ title: page.title, description: page.description, path: page.path, keywords: ["Free Kundli", "Kundli Generator"] });
export default function FreeKundliPage() { return <SeoGrowthPage page={page} />; }

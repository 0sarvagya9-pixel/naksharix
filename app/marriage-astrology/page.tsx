import type { Metadata } from "next";
import { SeoGrowthPage } from "@/components/seo-growth-page";
import { growthPages } from "@/lib/growth-pages";
import { seo } from "@/lib/seo";

const page = growthPages["marriage-astrology"];
export const metadata: Metadata = seo({ title: page.title, description: page.description, path: page.path, keywords: ["Marriage Astrology", "Kundli Matching"] });
export default function MarriageAstrologySeoPage() { return <SeoGrowthPage page={page} />; }

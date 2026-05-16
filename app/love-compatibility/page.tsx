import type { Metadata } from "next";
import { SeoGrowthPage } from "@/components/seo-growth-page";
import { growthPages } from "@/lib/growth-pages";
import { seo } from "@/lib/seo";

const page = growthPages["love-compatibility"];
export const metadata: Metadata = seo({ title: page.title, description: page.description, path: page.path, keywords: ["Love Compatibility", "Relationship Astrology"] });
export default function LoveCompatibilitySeoPage() { return <SeoGrowthPage page={page} />; }

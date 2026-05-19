import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { SeoInternalLinks } from "@/components/seo/internal-links";
import { blogCategories, getBlogCategory, getPostsByCategory } from "@/lib/blog-content";
import { seo } from "@/lib/seo";

export function generateStaticParams() {
  return blogCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getBlogCategory(slug);
  if (!category) return {};
  return seo({
    title: `${category.name} Blog - Naksharix Astrology Guides`,
    description: category.description,
    path: `/blog/category/${category.slug}`,
    keywords: [`${category.name} Blog`, category.name, "Astrology Blog"]
  });
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = getBlogCategory(slug);
  if (!category) notFound();
  const posts = getPostsByCategory(slug);

  return (
    <Section>
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Blog Category</p>
      <h1 className="mt-3 font-cinzel text-4xl font-black">{category.name} Articles</h1>
      <p className="mt-4 max-w-3xl naksh-muted-text">{category.description}</p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {(posts.length ? posts : []).map((post) => (
          <Card key={post.slug}>
            <CardHeader><CardTitle>{post.title}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm naksh-muted-text">{post.description}</p>
              <Link className="mt-4 inline-block text-sm font-semibold text-[#01A361]" href={`/blog/${post.slug}`}>Read article</Link>
            </CardContent>
          </Card>
        ))}
        {!posts.length ? (
          <Card className="md:col-span-3">
            <CardContent className="pt-6 text-sm naksh-muted-text">New {category.name.toLowerCase()} articles are being prepared. Explore related Naksharix tools below.</CardContent>
          </Card>
        ) : null}
      </div>
      <SeoInternalLinks title={`Related ${category.name} tools`} />
    </Section>
  );
}

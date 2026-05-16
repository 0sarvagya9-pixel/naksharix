import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Section } from "@/components/section";
import { JsonLd } from "@/components/seo/json-ld";
import { SeoInternalLinks } from "@/components/seo/internal-links";
import { getBlogPost, blogPosts } from "@/lib/blog-content";
import { seo } from "@/lib/seo";
import { env } from "@/lib/env";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return seo({
    title: post.title,
    description: post.description,
    path: `/blog/${slug}`,
    keywords: [...post.tags],
    type: "article"
  });
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    author: { "@type": "Organization", name: "Naksharix" },
    publisher: {
      "@type": "Organization",
      name: "Naksharix",
      logo: { "@type": "ImageObject", url: `${env.NEXT_PUBLIC_APP_URL}/logo.svg` }
    },
    mainEntityOfPage: `${env.NEXT_PUBLIC_APP_URL}/blog/${slug}`
  };
  return (
    <Section className="max-w-3xl">
      <JsonLd id={`article-schema-${slug}`} data={articleSchema} />
      <article>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">{post.category}</p>
        <h1 className="mt-3 text-balance text-4xl font-black">{post.title}</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">{post.body}</p>
      </article>
      <SeoInternalLinks title="Continue your astrology journey" />
    </Section>
  );
}

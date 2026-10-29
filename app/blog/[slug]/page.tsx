import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Section } from "@/components/section";
import { JsonLd } from "@/components/seo/json-ld";
import { SeoInternalLinks } from "@/components/seo/internal-links";
import { getBlogPost, blogPosts } from "@/lib/blog-content";
import { seo } from "@/lib/seo";
import { env } from "@/lib/env";
import { canonicalSeoOrigin } from "@/lib/seo-origin";

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

  // JSON-LD must use the same www origin as the page canonical and sitemap,
  // not the operational URL used for authentication/payment integrations.
  const origin = canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    inLanguage: "en",
    isAccessibleForFree: true,
    author: { "@type": "Organization", name: "Naksharix" },
    publisher: {
      "@type": "Organization",
      name: "Naksharix",
      logo: { "@type": "ImageObject", url: `${origin}/logo.svg` }
    },
    mainEntityOfPage: `${origin}/blog/${slug}`
  };

  return (
    <Section className="max-w-3xl">
      <JsonLd id={`article-schema-${slug}`} data={articleSchema} />
      <nav aria-label="Breadcrumb" className="text-sm naksh-muted-text">
        <Link href="/">Home</Link><span aria-hidden="true"> / </span>
        <Link href="/blog">Free guides</Link><span aria-hidden="true"> / </span>
        <span aria-current="page">{post.title}</span>
      </nav>
      <article className="mt-8">
        <Link href={`/blog/category/${post.category}`} className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9c5d18] underline">
          {post.category}
        </Link>
        <h1 className="mt-3 text-balance text-4xl font-black">{post.title}</h1>
        <p className="mt-5 text-lg leading-8 naksh-muted-text">{post.body}</p>
        <div className="mt-9 space-y-9">
          {post.sections.map((part) => (
            <section key={part.heading} aria-label={part.heading}>
              <h2 className="font-cinzel text-2xl font-bold">{part.heading}</h2>
              {part.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 leading-8 naksh-muted-text">{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
        <aside className="mt-10 rounded-2xl border border-[#D4AF37]/25 p-6" aria-label="Related free tools">
          <h2 className="font-cinzel text-xl font-bold">Try the related free tools</h2>
          <p className="mt-2 text-sm naksh-muted-text">Continue learning with practical examples. No paid purchase is required.</p>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            {post.related.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="font-semibold underline underline-offset-4">{item.label}</Link>
              </li>
            ))}
          </ul>
        </aside>
        <p className="mt-7 text-sm leading-7 naksh-muted-text">
          These are educational descriptions of traditional practices, not verified predictions.
          For medical, legal or financial decisions, rely on qualified professional advice.
        </p>
      </article>
      <SeoInternalLinks title="Continue your astrology journey" />
    </Section>
  );
}

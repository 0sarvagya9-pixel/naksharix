"use client";

import Link from "next/link";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/language-provider";
import { blogCategories, blogPosts } from "@/lib/blog-content";

export function BlogListContent() {
  const { tr } = useLanguage();

  return (
    <Section>
      <h1 className="font-cinzel text-4xl font-black">{tr("blogTitle")}</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        {blogCategories.map((category) => (
          <Link key={category.slug} href={`/blog/category/${category.slug}`} className="rounded-full border border-amber-200/20 px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground">
            {category.name}
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {blogPosts.map((post) => (
          <Card key={post.slug}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{post.description}</p>
              <Link className="mt-4 inline-block text-sm font-semibold text-primary" href={`/blog/${post.slug}`}>
                {tr("readArticle")}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

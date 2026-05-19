import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSeoLandingPage, seoLandingPages } from "@/lib/seo-pages";
import { seo } from "@/lib/seo";
import { env } from "@/lib/env";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return seoLandingPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoLandingPage(slug);
  if (!page) return {};
  return seo({
    title: page.title,
    description: page.description,
    path: `/astrology/${page.slug}`,
    keywords: [page.keyword, ...page.related]
  });
}

export default async function SeoLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getSeoLandingPage(slug);
  if (!page) notFound();
  const Icon = page.icon;
  const canonical = `${env.NEXT_PUBLIC_APP_URL}/astrology/${page.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `Naksharix ${page.keyword}`,
      provider: {
        "@type": "Organization",
        name: "Naksharix",
        url: env.NEXT_PUBLIC_APP_URL
      },
      areaServed: "Worldwide",
      serviceType: page.keyword,
      url: canonical,
      description: page.description
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer
        }
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: env.NEXT_PUBLIC_APP_URL },
        { "@type": "ListItem", position: 2, name: "Astrology", item: `${env.NEXT_PUBLIC_APP_URL}/astrology` },
        { "@type": "ListItem", position: 3, name: page.keyword, item: canonical }
      ]
    }
  ];

  return (
    <main className="star-field">
      <Script id={`schema-${page.slug}`} type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_0.72fr]">
          <div>
            <p className="inline-flex rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-4 py-2 text-sm font-semibold text-[#FFD700]">
              {page.keyword}
            </p>
            <h1 className="mt-5 font-cinzel text-4xl font-black sm:text-5xl">{page.h1}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 naksh-muted-text">{page.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href={page.path}>
                  Open {page.keyword} Tool <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/pricing">View Premium Plans</Link>
              </Button>
            </div>
          </div>
          <Card className="glass">
            <CardContent className="p-8">
              <Icon className="h-10 w-10 text-[#FFD700]" />
              <h2 className="mt-6 font-cinzel text-2xl font-bold">Why Naksharix?</h2>
              <ul className="mt-5 space-y-4 text-sm naksh-muted-text">
                {["Premium cosmic UI", "AI-assisted interpretation", "Mobile responsive experience", "SEO-ready reports and content"].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FFD700]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {page.related.map((item) => (
            <Card key={item} className="border-[#D4AF37]/20 bg-[#061D3C]/75">
              <CardHeader>
                <CardTitle className="font-cinzel">{item}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 naksh-muted-text">
                  Continue exploring Naksharix {item.toLowerCase()} insights as part of your personalized astrology journey.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-14">
          <h2 className="font-cinzel text-3xl font-black">Frequently Asked Questions</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {page.faqs.map((faq) => (
              <Card key={faq.question} className="border-[#D4AF37]/20 bg-[#061D3C]/75">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 naksh-muted-text">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}

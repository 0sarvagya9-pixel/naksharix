"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HeartHandshake, PackageSearch, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";
import { categoryLabel, shopCategories, type ShopProduct } from "@/lib/manual-catalogue";

export function ShopComingSoonContent({ initialProducts }: { initialProducts: ShopProduct[] }) {
  const { locale } = useLanguage();
  const labels = shopLabels(locale);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const products = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return initialProducts.filter((product) => {
      if (product.status !== "active") return false;
      const categoryMatch = category === "all" || product.category === category;
      const text = `${product.name[locale]} ${product.shortDescription[locale]} ${product.purpose} ${product.tags.join(" ")}`.toLowerCase();
      return categoryMatch && (!needle || text.includes(needle));
    });
  }, [category, initialProducts, locale, query]);

  return (
    <main className="inner-page-shell star-field min-h-screen bg-[#fffaf3]">
      <Section>
        <div className="inner-section overflow-hidden rounded-3xl border border-[#ecd7c3] p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">{labels.eyebrow}</p>
              <h1 className="mt-3 font-cinzel text-4xl font-black text-[#8c2e3b] sm:text-5xl">{labels.title}</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-[#6b565b]">{labels.subtitle}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild className="bg-[#922f40] text-white hover:bg-[#762436]"><a href="#catalogue">{labels.explore}</a></Button>
                <Button variant="outline" asChild><Link href="/contact">{labels.contact}</Link></Button>
              </div>
            </div>
            <div className="rounded-3xl border border-[#ecd7c3] bg-[#fff8ed] p-6">
              <ShieldCheck className="h-10 w-10 text-[#8c2e3b]" />
              <h2 className="mt-5 font-cinzel text-2xl font-bold text-[#8c2e3b]">{labels.safetyTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-[#6b565b]">{labels.safetyCopy}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {labels.safetyItems.map((item) => <span key={item} className="rounded-full border border-[#dca956]/25 bg-[#fbf0de] px-3 py-1 text-xs text-[#8c2e3b]">{item}</span>)}
              </div>
            </div>
          </div>
        </div>

        <div id="catalogue" className="mt-8 rounded-2xl border border-[#ecd7c3] bg-white p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_240px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.searchPlaceholder} className="border-[#ecd7c3] bg-white pl-9 text-[#402831]" />
            </div>
            <select aria-label={labels.categoryLabel} value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-md border border-[#ecd7c3] bg-white px-3 text-sm text-[#402831]">
              <option value="all">{labels.allCategories}</option>
              {shopCategories.map((item) => <option key={item.key} value={item.key}>{item[locale]}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="inner-card flex h-full flex-col transition hover:-translate-y-1 hover:border-[#dca956]/50">
              <CardContent className="flex h-full flex-col p-6">
                <div className="mb-5 overflow-hidden rounded-xl border border-[#D4AF37]/20 bg-[#fff2e2]">
                  <Image
                    src={safeProductVisual(product)}
                    alt={product.imageAlt[locale] || product.name[locale]}
                    width={640} height={420} unoptimized
                    className="h-48 w-full object-contain p-3"
                  />
                  {(safeProductVisual(product).endsWith("-placeholder.svg") || safeProductVisual(product).endsWith("-illustration.svg")) &&
                    <p className="pb-2 text-center text-xs text-[#6b565b]">Illustrative catalogue visual, not an actual stock photograph</p>}
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8c2e3b]">{categoryLabel(product.category, locale)}</p>
                    <h2 className="mt-2 font-cinzel text-2xl font-bold text-[#402831]"><Link href={"/shop/"+encodeURIComponent(product.slug)} className="hover:text-[#f4c87d]">{product.name[locale]}</Link></h2>
                  </div>
                  <PackageSearch className="h-6 w-6 shrink-0 text-[#8c2e3b]" />
                </div>
                <p className="mt-4 text-sm leading-6 text-[#6b565b]">{product.shortDescription[locale]}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#dca956]/25 px-3 py-1 text-xs text-[#8c2e3b]">{product.purpose}</span>
                  {product.tags.slice(0, 2).map((tag) => <span key={tag} className="rounded-full border border-[#ecd7c3] px-3 py-1 text-xs text-[#6b565b]">{tag}</span>)}
                </div>
                <details className="mt-5 rounded-xl border border-[#ecd7c3] bg-[#fff8ee] p-4 text-sm text-[#6b565b]">
                  <summary className="cursor-pointer font-semibold text-[#8c2e3b]">{labels.details}</summary>
                  <p className="mt-3 leading-6">{product.longDescription[locale]}</p>
                  {product.howToUse[locale] ? <p className="mt-3"><strong className="text-[#702d3d]">{labels.howToUse}:</strong> {product.howToUse[locale]}</p> : null}
                  {product.careNote[locale] ? <p className="mt-3"><strong className="text-[#702d3d]">{labels.care}:</strong> {product.careNote[locale]}</p> : null}
                  <p className="mt-3 text-xs leading-5">{product.disclaimer[locale]}</p>
                </details>
                <div className="mt-auto pt-5">
                  <Button asChild className="w-full bg-[#922f40] text-white hover:bg-[#762436]">
                    <Link href={`/commerce-enquiry?kind=SHOP&item=${encodeURIComponent(product.id)}`}><HeartHandshake className="h-4 w-4" />{labels.askAvailability}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!products.length ? (
          <div className="mt-8 rounded-2xl border border-[#ecd7c3] bg-white p-8 text-center">
            <Sparkles className="mx-auto h-7 w-7 text-[#8c2e3b]" />
            <p className="mt-4 text-[#6b565b]">{labels.noResults}</p>
            <Button type="button" variant="outline" className="mt-4" onClick={() => { setQuery(""); setCategory("all"); }}>{labels.reset}</Button>
          </div>
        ) : null}

        <p className="mx-auto mt-10 max-w-4xl text-center text-sm leading-6 text-[#6b565b]">{labels.footerNote}</p>
      </Section>
    </main>
  );
}

function safeProductVisual(product: ShopProduct): string {
  const source = product.imageUrl.trim();
  if (source.startsWith("/") && !source.startsWith("//") && !source.includes("\\")) return source;
  if (/^https:\/\//i.test(source) &&
      product.imageRights && /^https:\/\//i.test(product.imageEvidenceUrl || "")) {
    return source;
  }
  return "/shop/combo-placeholder.svg";
}

function shopLabels(locale: "en" | "hi" | "hinglish") {
  if (locale === "hi") return {
    eyebrow: "Spiritual Catalogue",
    title: "Naksharix आध्यात्मिक कैटलॉग",
    subtitle: "रुद्राक्ष, ब्रेसलेट, यंत्र, माला और symbolic remedy items की जानकारी देखें। अभी कोई public cart या online product checkout नहीं है।",
    explore: "कैटलॉग देखें", contact: "उपलब्धता पूछें", safetyTitle: "जानकारी पहले, बिक्री बाद में", safetyCopy: "यह एक वास्तविक informational catalogue है। खरीद, stock, authenticity और fulfilment की पुष्टि support द्वारा अलग से की जाती है।", safetyItems: ["No automatic checkout", "Availability confirmation", "Faith-based items", "No guaranteed outcomes"],
    searchPlaceholder: "उत्पाद खोजें...", categoryLabel: "श्रेणी", allCategories: "सभी श्रेणियाँ", details: "विवरण और उपयोग", howToUse: "कैसे उपयोग करें", care: "देखभाल", askAvailability: "उपलब्धता पूछें", noResults: "इस filter में कोई catalogue item नहीं मिला।", reset: "Filter reset करें", footerNote: "ये items आस्था और चिंतन के सहायक साधन हैं। चिकित्सा, कानूनी, वित्तीय या पेशेवर सलाह का विकल्प नहीं हैं और किसी परिणाम की गारंटी नहीं देते।"
  };
  if (locale === "hinglish") return {
    eyebrow: "Spiritual Catalogue", title: "Naksharix Spiritual Catalogue", subtitle: "Rudraksha, bracelets, yantras, mala aur symbolic remedy items ki information dekhein. Abhi public cart ya online product checkout active nahi hai.", explore: "Explore Catalogue", contact: "Ask Availability", safetyTitle: "Information first, sale only after confirmation", safetyCopy: "Yeh real informational catalogue hai. Purchase, stock, authenticity aur fulfilment support se separately confirm hota hai.", safetyItems: ["No automatic checkout", "Availability confirmation", "Faith-based items", "No guaranteed outcomes"], searchPlaceholder: "Search products...", categoryLabel: "Category", allCategories: "All categories", details: "Details and use", howToUse: "How to use", care: "Care", askAvailability: "Ask Availability", noResults: "Is filter me koi catalogue item nahi mila.", reset: "Reset Filters", footerNote: "Ye items faith aur reflection support ke liye hain. Medical, legal, financial ya professional advice ka replacement nahi hain aur kisi result ki guarantee nahi dete."
  };
  return {
    eyebrow: "Spiritual Catalogue", title: "Naksharix Spiritual Catalogue", subtitle: "Explore information about rudraksha, bracelets, yantras, malas, and symbolic remedy items. Public cart and online product checkout are not active.", explore: "Explore Catalogue", contact: "Ask Availability", safetyTitle: "Information first, sale only after confirmation", safetyCopy: "This is a real informational catalogue. Purchase, stock, authenticity, and fulfilment are confirmed separately by support.", safetyItems: ["No automatic checkout", "Availability confirmation", "Faith-based items", "No guaranteed outcomes"], searchPlaceholder: "Search products...", categoryLabel: "Category", allCategories: "All categories", details: "Details and use", howToUse: "How to use", care: "Care", askAvailability: "Ask Availability", noResults: "No catalogue items match these filters.", reset: "Reset Filters", footerNote: "These items are faith-based aids for reflection. They do not replace medical, legal, financial, or professional advice and do not guarantee outcomes."
  };
}

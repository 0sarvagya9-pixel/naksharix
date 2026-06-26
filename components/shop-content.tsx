"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Gem, Info, MessageCircle, PackageSearch, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";
import { categoryLabel, normalizeShopProducts, shopCategories, shopProducts, shopProductStorageKey, shopPurposes, type ShopProduct } from "@/lib/manual-catalogue";
import { productRequestCta } from "@/lib/contact-cta";
import type { Locale } from "@/lib/i18n";

export function ShopContent() {
  const { locale } = useLanguage();
  const labels = shopLabels(locale);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [purpose, setPurpose] = useState("all");
  const [selected, setSelected] = useState<ShopProduct | null>(null);
  const [catalogueProducts, setCatalogueProducts] = useState<ShopProduct[]>(shopProducts);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(shopProductStorageKey);
      if (stored) setCatalogueProducts(normalizeShopProducts(JSON.parse(stored)));
    } catch {
      setCatalogueProducts(shopProducts);
    }
  }, []);

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalogueProducts
      .filter((product) => product.status === "active")
      .filter((product) => {
        const text = `${product.name[locale]} ${product.shortDescription[locale]} ${product.purpose} ${product.tags.join(" ")}`.toLowerCase();
        return (!q || text.includes(q)) && (category === "all" || product.category === category) && (purpose === "all" || product.purpose === purpose);
      })
      .sort((a, b) => Number(b.featured) - Number(a.featured) || a.name[locale].localeCompare(b.name[locale]));
  }, [catalogueProducts, category, locale, purpose, query]);

  return (
    <main className="inner-page-shell star-field">
      <Section>
        <div className="inner-section grid gap-8 rounded-3xl border border-[#263957] p-6 md:p-8 lg:grid-cols-[1fr_0.72fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">{labels.eyebrow}</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382] sm:text-5xl">{labels.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#a8b3c7]">{labels.subtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="bg-[#009b72] text-white hover:bg-[#008766]"><a href="#products">{labels.exploreProducts}</a></Button>
              <Button variant="outline" asChild><Link href="/contact">{labels.requestGuidance}</Link></Button>
            </div>
          </div>
          <Card className="inner-card">
            <CardContent className="p-6">
              <ShieldCheck className="h-6 w-6 text-[#00f5a0]" />
              <h2 className="mt-4 font-cinzel text-2xl font-bold text-[#f3d382]">{labels.safeCatalogue}</h2>
              <p className="mt-3 text-sm leading-6 text-[#a8b3c7]">{labels.safeCatalogueCopy}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {shopCategories.map((item) => (
            <Card key={item.key} className="inner-card transition hover:-translate-y-1 hover:border-[#dca956]/50">
              <CardContent className="p-5">
                <Gem className="h-5 w-5 text-[#f3d382]" />
                <h2 className="mt-4 font-cinzel text-lg font-bold text-white">{item[locale]}</h2>
                <p className="mt-2 text-sm leading-6 text-[#a8b3c7]">{labels.categoryCopy}</p>
                <Button className="mt-4 w-full" variant="outline" onClick={() => setCategory(item.key)}>{labels.viewProducts}</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div id="products" className="mt-10 rounded-2xl border border-[#263957] bg-[#0c1830]/86 p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.searchPlaceholder} className="border-[#263957] bg-[#111f3a] pl-9" />
            </div>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-md border border-[#263957] bg-[#111f3a] px-3 text-sm text-white">
              <option value="all">{labels.allCategories}</option>
              {shopCategories.map((item) => <option key={item.key} value={item.key}>{item[locale]}</option>)}
            </select>
            <select value={purpose} onChange={(event) => setPurpose(event.target.value)} className="h-10 rounded-md border border-[#263957] bg-[#111f3a] px-3 text-sm text-white">
              <option value="all">{labels.allPurposes}</option>
              {shopPurposes.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => <ProductCard key={product.id} product={product} locale={locale} labels={labels} onDetails={() => setSelected(product)} />)}
        </div>

        {products.length === 0 ? (
          <Card className="inner-card mt-8"><CardContent className="p-6 text-[#a8b3c7]">{labels.noProducts}</CardContent></Card>
        ) : null}

        {selected ? <ProductDetails product={selected} labels={labels} locale={locale} onClose={() => setSelected(null)} /> : null}
      </Section>
    </main>
  );
}

function ProductCard({ product, locale, labels, onDetails }: { product: ShopProduct; locale: "en" | "hi" | "hinglish"; labels: ReturnType<typeof shopLabels>; onDetails: () => void }) {
  const cta = productRequestCta(product.name[locale], locale);
  return (
    <Card className="inner-card flex flex-col overflow-hidden">
      <ProductVisual product={product} locale={locale} labels={labels} />
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#00f5a0]">{categoryLabel(product.category, locale)}</p>
            <h2 className="mt-2 font-cinzel text-2xl font-bold text-[#f3d382]">{product.name[locale]}</h2>
          </div>
          {product.featured ? <span className="rounded-full border border-[#00f5a0]/35 bg-[#00f5a0]/10 px-3 py-1 text-xs text-[#00f5a0]">{labels.featured}</span> : null}
        </div>
        <p className="mt-4 text-sm leading-6 text-[#a8b3c7]">{product.shortDescription[locale]}</p>
        <p className="mt-4 rounded-lg border border-[#263957] bg-[#142647]/75 px-3 py-2 text-sm font-semibold text-[#fbc02d]">{product.priceLabel[locale] || labels.priceOnRequest}</p>
        <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
          <Button variant="outline" onClick={onDetails}><Info className="h-4 w-4" />{labels.viewDetails}</Button>
          <Button asChild className="bg-[#009b72] text-white hover:bg-[#008766]">
            <a href={cta.href} target={cta.external ? "_blank" : undefined} rel={cta.external ? "noreferrer" : undefined}><MessageCircle className="h-4 w-4" />{labels.request}</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductDetails({ product, labels, locale, onClose }: { product: ShopProduct; labels: ReturnType<typeof shopLabels>; locale: "en" | "hi" | "hinglish"; onClose: () => void }) {
  const cta = productRequestCta(product.name[locale], locale);
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#020612]/78 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <Card className="inner-card max-h-[88vh] w-full max-w-3xl overflow-y-auto">
        <CardContent className="p-6">
          <ProductVisual product={product} locale={locale} labels={labels} large />
          <PackageSearch className="h-6 w-6 text-[#00f5a0]" />
          <h2 className="mt-4 font-cinzel text-3xl font-black text-[#f3d382]">{product.name[locale]}</h2>
          <p className="mt-2 text-sm text-[#a8b3c7]">{categoryLabel(product.category, locale)} · {product.purpose}</p>
          {product.tags.length ? <div className="mt-4 flex flex-wrap gap-2">{product.tags.map((tag) => <span key={tag} className="rounded-full border border-[#263957] bg-[#111f3a] px-3 py-1 text-xs text-[#a8b3c7]">{tag}</span>)}</div> : null}
          <div className="mt-6 grid gap-4">
            <DetailBlock title={labels.description} copy={product.longDescription[locale] || product.shortDescription[locale]} />
            <DetailBlock title={labels.howToUse} copy={product.howToUse[locale]} />
            <DetailBlock title={labels.careNote} copy={product.careNote[locale]} />
            <DetailBlock title={labels.disclaimer} copy={product.disclaimer[locale] || labels.productDisclaimer} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-[#009b72] text-white hover:bg-[#008766]">
              <a href={cta.href} target={cta.external ? "_blank" : undefined} rel={cta.external ? "noreferrer" : undefined}><MessageCircle className="h-4 w-4" />{labels.request}</a>
            </Button>
            <Button variant="outline" onClick={onClose}>{labels.close}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductVisual({ product, locale, labels, large = false }: { product: ShopProduct; locale: Locale; labels: ReturnType<typeof shopLabels>; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = product.imageUrl?.trim();
  const isOptimizableLocal = Boolean(imageUrl?.startsWith("/") && !imageUrl.toLowerCase().endsWith(".svg"));
  const alt = product.imageAlt[locale] || product.name[locale];
  return (
    <div className={`relative overflow-hidden rounded-t-2xl border-b border-[#263957] bg-[#07111f] ${large ? "mb-5 aspect-[16/8] rounded-2xl border" : "aspect-[16/10]"}`}>
      {imageUrl && !failed ? (
        isOptimizableLocal ? (
          <Image src={imageUrl} alt={alt} fill className="object-cover" onError={() => setFailed(true)} sizes={large ? "(max-width: 768px) 100vw, 760px" : "(max-width: 768px) 100vw, 360px"} />
        ) : (
          // External admin-provided image URLs are intentionally not optimized without a configured image domain.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={alt} className="h-full w-full object-cover" onError={() => setFailed(true)} />
        )
      ) : (
        <div className="flex h-full flex-col justify-between bg-[radial-gradient(circle_at_20%_20%,rgba(243,211,130,0.22),transparent_32%),linear-gradient(135deg,#142647,#07111f_58%,#0c1830)] p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full border border-[#dca956]/40 bg-[#dca956]/10 px-3 py-1 text-xs font-semibold text-[#f3d382]">{categoryLabel(product.category, locale)}</span>
            <Gem className="h-6 w-6 text-[#fbc02d]" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#00f5a0]">{labels.catalogueVisual}</p>
            <p className="mt-2 font-cinzel text-xl font-bold text-white">{product.name[locale]}</p>
          </div>
        </div>
      )}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full border border-[#263957] bg-[#020612]/78 px-3 py-1 text-xs font-semibold text-[#f3d382] backdrop-blur">{product.purpose}</span>
        {!imageUrl || failed ? <span className="rounded-full border border-[#263957] bg-[#020612]/78 px-3 py-1 text-xs text-[#a8b3c7] backdrop-blur">{labels.placeholderImage}</span> : null}
      </div>
    </div>
  );
}

function DetailBlock({ title, copy }: { title: string; copy: string }) {
  return <div className="rounded-xl border border-[#263957] bg-[#142647]/70 p-4"><h3 className="font-cinzel text-lg font-bold text-[#f3d382]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#a8b3c7]">{copy}</p></div>;
}

function shopLabels(locale: "en" | "hi" | "hinglish") {
  if (locale === "hi") {
    return {
      eyebrow: "Spiritual Commerce",
      title: "Naksharix आध्यात्मिक शॉप",
      subtitle: "अपनी कॉस्मिक यात्रा के लिए रुद्राक्ष, रत्न, यंत्र, माला, ब्रेसलेट और उपाय-आधारित आध्यात्मिक उत्पाद देखें।",
      exploreProducts: "उत्पाद देखें",
      requestGuidance: "मार्गदर्शन अनुरोध करें",
      safeCatalogue: "सुरक्षित catalogue mode",
      safeCatalogueCopy: "यहाँ cart या checkout active नहीं है। Product request contact support के माध्यम से handled होगी।",
      categoryCopy: "Premium spiritual catalogue category.",
      viewProducts: "Products देखें",
      searchPlaceholder: "Product search करें...",
      allCategories: "सभी categories",
      allPurposes: "सभी purposes",
      noProducts: "इस filter में कोई product नहीं मिला।",
      priceOnRequest: "Price on request",
      featured: "Featured",
      catalogueVisual: "Product visual",
      placeholderImage: "Placeholder",
      viewDetails: "विवरण देखें",
      request: "Contact अनुरोध",
      whoMaySupport: "किसे सहयोग दे सकता है",
      description: "विवरण",
      howToUse: "उपयोग / care note",
      careNote: "Care note",
      disclaimer: "अस्वीकरण",
      productDisclaimer: "आध्यात्मिक उत्पाद आस्था-आधारित और चिंतनात्मक सहयोग के साधन हैं। ये परिणामों की गारंटी नहीं देते और चिकित्सा, कानूनी, वित्तीय या पेशेवर सलाह का विकल्प नहीं हैं।",
      close: "बंद करें"
    };
  }
  if (locale === "hinglish") {
    return {
      eyebrow: "Spiritual Commerce",
      title: "Naksharix Spiritual Shop",
      subtitle: "Apni cosmic journey ke liye rudraksha, gemstones, yantras, malas, bracelets aur remedy-based spiritual products explore karein.",
      exploreProducts: "Explore Products",
      requestGuidance: "Request Guidance",
      safeCatalogue: "Safe catalogue mode",
      safeCatalogueCopy: "Cart ya checkout active nahi hai. Product request contact support ke through handle hogi.",
      categoryCopy: "Premium spiritual catalogue category.",
      viewProducts: "View Products",
      searchPlaceholder: "Search products...",
      allCategories: "All categories",
      allPurposes: "All purposes",
      noProducts: "Is filter me koi product nahi mila.",
      priceOnRequest: "Price on request",
      featured: "Featured",
      catalogueVisual: "Product visual",
      placeholderImage: "Placeholder",
      viewDetails: "View Details",
      request: "Request Support",
      whoMaySupport: "Who it may support",
      description: "Description",
      howToUse: "How to use / care note",
      careNote: "Care note",
      disclaimer: "Disclaimer",
      productDisclaimer: "Spiritual products faith-based aur reflective support tools hain. Ye promised outcomes nahi dete aur medical, legal, financial ya professional advice ka replacement nahi hain.",
      close: "Close"
    };
  }
  return {
    eyebrow: "Spiritual Commerce",
    title: "Naksharix Spiritual Shop",
    subtitle: "Discover curated spiritual products, rudraksha, gemstones, yantras, malas, bracelets, and remedy-based items aligned with your cosmic journey.",
    exploreProducts: "Explore Products",
    requestGuidance: "Request Guidance",
    safeCatalogue: "Safe catalogue mode",
    safeCatalogueCopy: "No cart or checkout is active here. Product requests are handled through contact support.",
    categoryCopy: "Premium spiritual catalogue category.",
    viewProducts: "View Products",
    searchPlaceholder: "Search products...",
    allCategories: "All categories",
    allPurposes: "All purposes",
    noProducts: "No products found for this filter.",
    priceOnRequest: "Price on request",
    featured: "Featured",
    catalogueVisual: "Product visual",
    placeholderImage: "Placeholder",
    viewDetails: "View Details",
    request: "Request Support",
    whoMaySupport: "Who it may support",
    description: "Description",
    howToUse: "How to use / care note",
    careNote: "Care note",
    disclaimer: "Disclaimer",
    productDisclaimer: "Spiritual products are faith-based and reflective support tools. They do not guarantee outcomes and do not replace medical, legal, financial, or professional advice.",
    close: "Close"
  };
}

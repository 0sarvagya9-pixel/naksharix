import type { Metadata } from "next";
import Link from "next/link";
import { ShopComingSoonContent } from "@/components/shop-coming-soon-content";
import { EditorialServiceBanner } from "@/components/home/editorial-service-banner";
import { getShopCatalogue } from "@/lib/shop/catalogue-store";
import { referencePhotoForProduct } from "@/lib/shop/real-photo-seeds";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
    title: "Spiritual Catalogue | Rudraksha, Yantra, Mala and Symbolic Remedy Items",
    description: "Explore Naksharix catalogue information for rudraksha, bracelets, yantras, malas, and symbolic remedy items. Browse prices, add products to your cart and place orders with secure Razorpay checkout.",
    path: "/shop",
    keywords: ["Spiritual Catalogue", "Rudraksha", "Yantra", "Mala", "Astrology Remedy Items"]
  }),
  robots: { index: true, follow: true }
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const catalogue = await getShopCatalogue();
  if (!catalogue.storageReady) return <main role="alert" className="mx-auto min-h-[60vh] max-w-3xl px-5 py-20 text-[#412831]">
    <h1 className="font-cinzel text-3xl font-bold">Shop temporarily unavailable</h1>
    <p className="mt-4 text-base leading-7">We cannot verify current catalogue prices right now. Ordering and checkout are paused for your protection. Your saved cart is not erased.</p>
    <Link href="/shop" className="mt-6 inline-block rounded-lg bg-[#8b3343] px-5 py-3 font-bold text-white">Retry Shop</Link>
  </main>;
  return <><EditorialServiceBanner eyebrow="HOME / SPIRITUAL CATALOGUE"
    headline="Spiritual Shop"
    caption="Shop Rudraksha, Yantras and spiritual essentials. Browse products, add to cart and checkout securely."
    image={referencePhotoForProduct("rudraksha-mala")?.url || "/shop/rudraksha-mala-illustration.svg"} imageAlt="Licensed representative Rudraksha prayer bead photograph"
    link="/cart" linkLabel="View your cart" />
    {referencePhotoForProduct("rudraksha-mala") ? <p className="mx-auto max-w-7xl px-5 py-2 text-xs text-[#674957]">
      Banner shows a licensed reference photograph, not a verified Naksharix SKU. Photo: <a href={referencePhotoForProduct("rudraksha-mala")!.evidenceUrl} target="_blank" rel="noopener noreferrer" className="underline">{referencePhotoForProduct("rudraksha-mala")!.credit} · {referencePhotoForProduct("rudraksha-mala")!.licenseName}</a>.
    </p> : null}
    <div className="mx-auto max-w-7xl px-5 py-3 text-sm text-[#634650]">
      Buying natural beads or accessories? <Link href="/blog/rudraksha-product-buying-checklist" className="font-semibold underline underline-offset-4">Read the free product-identification, evidence and delivery checklist</Link> before choosing.
    </div>
    <ShopComingSoonContent initialProducts={catalogue.products} /></>;
}

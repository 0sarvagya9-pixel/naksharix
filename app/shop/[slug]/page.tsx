import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AddToCartButton } from "@/components/shop/quote-cart-controls";
import { ProductGallery } from "@/components/shop/product-gallery";
import { getShopCatalogue } from "@/lib/shop/catalogue-store";
import type { ShopProduct } from "@/lib/manual-catalogue";
import { seo } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
function imageFor(item: ShopProduct) {
  const image = (item.imageUrl || "").trim();
  if (image.startsWith("/") && !image.startsWith("//") && !image.includes("\\")) return image;
  if (/^https:\/\//.test(image) && item.imageRights &&
      /^https:\/\//.test(item.imageEvidenceUrl || "")) return image;
  return "/shop/combo-placeholder.svg";
}
async function productBySlug(slug:string) {
  const data=await getShopCatalogue();
  return data.products.find(p=>p.slug===slug && p.status==="active");
}
export async function generateMetadata({params}:Props):Promise<Metadata> {
  const {slug}=await params;
  const item=await productBySlug(slug);
  if (!item) return { title:"Product unavailable", robots:{index:false,follow:false} };
  return seo({title:item.name.en+" | Spiritual Catalogue",description:item.shortDescription.en,
    path:"/shop/"+encodeURIComponent(slug),keywords:["Naksharix",item.name.en,item.category,"Spiritual Products"]});
}
export default async function ProductDetails({params}:Props) {
  const {slug}=await params;
  const product=await productBySlug(slug);
  if (!product) notFound();
  const image=imageFor(product);
  const illustrated=!(product.galleryImages?.length) && (image.endsWith("-illustration.svg")||image.endsWith("-placeholder.svg"));
  return <main className="star-field min-h-screen bg-[#fffaf3] pb-20">
    <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-[#8e3442]"><ArrowLeft size={16}/> Back to shop</Link>
      <div className="mt-7 grid gap-8 lg:grid-cols-2">
        <ProductGallery initialSrc={image} initialAlt={product.imageAlt.en||product.name.en} photos={product.galleryImages||[]} mainImageRights={product.imageRights} />
        <div className="rounded-3xl border border-[#d8b372]/35 bg-white p-6 text-[#402a2d] md:p-10">
          <p className="text-sm font-bold uppercase tracking-widest text-[#8e3442]">{product.category} • {product.purpose}</p>
          <h1 className="mt-4 font-cinzel text-3xl font-black md:text-5xl">{product.name.en}</h1>
          <p className="mt-5 text-base leading-8 text-[#634e52]">{product.longDescription.en}</p>
          <div className="mt-7 rounded-xl border border-[#e8c78f]/35 p-4">
            <p className="font-semibold text-[#8e3442]">Product information and quotation</p>
            <p className="mt-2 text-sm leading-7 text-[#67545a]">
              The product&apos;s exact material, specification, authenticity, price, dispatch and delivery terms are confirmed by staff before purchase.
              No automatic online checkout is active.
            </p>
          </div>
          <p className="mt-5 text-2xl font-bold text-[#762536]">{product.unitPricePaise
            ? new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(product.unitPricePaise/100)
            : "Price awaiting verification"}</p>
          <p className="mt-2 text-sm leading-6 text-[#67545a]">Market-compared listing price. Your order is an unpaid request; shipping, taxes, exact item specification and delivery require staff confirmation.</p>
          <div className="mt-5 max-w-xs"><AddToCartButton productId={product.id} /></div>
          {illustrated?<p className="mt-5 text-xs leading-6 text-[#756267]">
            Original illustrative artwork, not a photograph of supplied physical stock.
          </p>:null}
        </div>
      </div>
      <div className="mt-9 grid gap-5 md:grid-cols-3">
        {[
          ["Usage and tradition",product.howToUse.en],
          ["Care instructions",product.careNote.en],
          ["Important note",product.disclaimer.en]
        ].map(([title,body])=><section key={title} className="rounded-2xl border border-[#d4ac72]/35 bg-[#fffbf4] p-6 text-[#402a2d]">
          <h2 className="font-cinzel text-xl font-bold text-[#8e3442]">{title}</h2>
          <p className="mt-3 text-sm leading-7 text-[#67545a]">{body}</p>
        </section>)}
      </div>
      <p className="mt-9 flex items-center gap-3 text-sm text-[#634e52]"><ShieldCheck size={18}/>
        Final item specifications and delivery terms are confirmed before fulfilment.
      </p>
    </div>
  </main>;
}

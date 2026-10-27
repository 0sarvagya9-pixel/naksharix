import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck, HeartHandshake } from "lucide-react";
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
  const illustrated=image.endsWith("-illustration.svg")||image.endsWith("-placeholder.svg");
  return <main className="star-field min-h-screen pb-20">
    <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-[#f1c57c]"><ArrowLeft size={16}/> Back to shop</Link>
      <div className="mt-7 grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-[#d3ab76]/35 bg-[#f3dcaf]">
          <Image src={image} alt={product.imageAlt.en||product.name.en} width={850} height={650} unoptimized
            className="aspect-[4/3] w-full object-contain"/>
        </div>
        <div className="rounded-3xl border border-[#d8b372]/35 bg-[#1b1328]/90 p-6 text-white md:p-10">
          <p className="text-sm font-bold uppercase tracking-widest text-[#f2c87c]">{product.category} • {product.purpose}</p>
          <h1 className="mt-4 font-cinzel text-3xl font-black md:text-5xl">{product.name.en}</h1>
          <p className="mt-5 text-base leading-8 text-[#e1d4df]">{product.longDescription.en}</p>
          <div className="mt-7 rounded-xl border border-[#e8c78f]/35 p-4">
            <p className="font-semibold text-[#f5d39b]">Product information and quotation</p>
            <p className="mt-2 text-sm leading-7 text-[#d9cfdd]">
              The product's exact material, specification, authenticity, price, dispatch and delivery terms are confirmed by staff before purchase.
              No automatic online checkout is active.
            </p>
          </div>
          <Link href={"/commerce-enquiry?kind=SHOP&item="+encodeURIComponent(product.id)}
            className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-xl bg-[#f2c675] px-7 py-3 font-bold text-[#332022] hover:bg-[#ffe0a4]">
            <HeartHandshake size={19}/> Enquire about this item <ArrowRight size={18}/>
          </Link>
          {illustrated?<p className="mt-5 text-xs leading-6 text-[#e5d2c2]">
            Original illustrative artwork, not a photograph of supplied physical stock.
          </p>:null}
        </div>
      </div>
      <div className="mt-9 grid gap-5 md:grid-cols-3">
        {[
          ["Usage and tradition",product.howToUse.en],
          ["Care instructions",product.careNote.en],
          ["Important note",product.disclaimer.en]
        ].map(([title,body])=><section key={title} className="rounded-2xl border border-[#d4ac72]/35 bg-[#211626]/80 p-6 text-white">
          <h2 className="font-cinzel text-xl font-bold text-[#f3ca7c]">{title}</h2>
          <p className="mt-3 text-sm leading-7 text-[#e1d6dd]">{body}</p>
        </section>)}
      </div>
      <p className="mt-9 flex items-center gap-3 text-sm text-[#e3d4d4]"><ShieldCheck size={18}/>
        No stock count or availability guarantee is displayed.
      </p>
    </div>
  </main>;
}

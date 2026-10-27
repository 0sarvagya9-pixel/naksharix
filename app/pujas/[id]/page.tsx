import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, ShieldCheck } from "lucide-react";
import { pujaTopics, findPujaTopic } from "@/lib/puja/service-catalogue";
import { seo } from "@/lib/seo";

type Props={params:Promise<{id:string}>};
export function generateStaticParams() {return pujaTopics.map(p=>({id:p.id}));}
export const dynamicParams=false;
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {id}=await params;const topic=findPujaTopic(id);
  if(!topic)return {title:"Puja topic unavailable",robots:{index:false,follow:false}};
  return seo({title:topic.name+" | Naksharix Puja Traditions",description:topic.description+". Confirm regional custom and available arrangements separately.",path:"/pujas/"+id,keywords:[topic.name,topic.deity,"Hindu Puja"]});
}
export default async function PujaTopicPage({params}:Props) {
  const {id}=await params;const item=findPujaTopic(id);if(!item)notFound();
  const related=pujaTopics.filter(p=>p.category===item.category&&p.id!==item.id).slice(0,5);
  return <main className="star-field min-h-screen pb-20">
    <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
      <Link href="/pujas" className="inline-flex items-center gap-2 text-sm font-bold text-[#f4c67b]"><ArrowLeft size={16}/> Puja directory</Link>
      <div className="mt-7 grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-[#ddba80]/35 bg-[#1e1425]">
          <Image src={item.graphic} alt={item.category+" decorative artwork, not a temple photograph"} width={860} height={610} unoptimized className="aspect-[4/3] w-full object-cover"/>
        </div>
        <div className="rounded-3xl border border-[#ddba80]/35 bg-[#1e1425]/90 p-7 text-white md:p-10">
          <span className="text-sm font-bold uppercase tracking-[.18em] text-[#f6cb82]">{item.category} • {item.deity}</span>
          <h1 className="mt-4 font-cinzel text-3xl font-black md:text-5xl">{item.name}</h1>
          <p className="mt-5 text-base leading-8 text-[#e1d4e1]">{item.description}. Customary details vary according to community, family and temple practice.</p>
          <div className="mt-7 space-y-4 text-sm leading-7 text-[#e5d9e0]">
            <p className="flex gap-3"><CalendarDays size={19} className="mt-1 shrink-0 text-[#f5cb81]"/> Confirm dates and local muhurat from your city&apos;s Panchang.</p>
            <p className="flex gap-3"><ShieldCheck size={19} className="mt-1 shrink-0 text-[#f5cb81]"/> Temple, pandit, materials, price and completion details require separate written confirmation.</p>
          </div>
          <Link href={"/commerce-enquiry?kind=PUJA&item="+encodeURIComponent("ritual:"+item.id)}
            className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-xl bg-[#f1c67c] px-6 py-3 font-bold text-[#311a1f]">
            Enquire about {item.name} <ArrowRight size={18}/>
          </Link>
        </div>
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#d3ab75]/35 bg-[#24182a]/80 p-6 text-white">
        <p className="text-sm leading-7">Traditional observance reference dates are informational. No booking or payment is taken by viewing this page.</p>
        <Link href="/puja-calendar" className="inline-flex items-center gap-2 font-bold text-[#f4cb80]"><CalendarDays size={18}/> Two-year festival calendar</Link>
      </div>
      <section className="mt-12">
        <h2 className="font-cinzel text-2xl font-bold text-white">Related Puja traditions</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {related.map(p=><Link key={p.id} href={"/pujas/"+p.id} className="rounded-xl border border-[#d9b078]/30 bg-[#22152d]/85 p-4 font-semibold text-[#f1d8ba] hover:border-[#f2cb83]">{p.name} <ArrowRight size={15} className="inline"/></Link>)}
        </div>
      </section>
    </div>
  </main>;
}

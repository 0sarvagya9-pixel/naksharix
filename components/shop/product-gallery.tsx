"use client";
import { useState } from "react";
import Image from "next/image";
import type { ProductGalleryImage } from "@/lib/manual-catalogue";
type GalleryProps={initialSrc:string;initialAlt:string;photos:ProductGalleryImage[]};
export function ProductGallery({initialSrc,initialAlt,photos}:GalleryProps){
 const entries=photos.length ? photos.slice(0,8).map(photo=>({src:photo.url,alt:photo.alt})) : [{src:initialSrc,alt:initialAlt}];
 const [active,setActive]=useState(0);
 const chosen=entries[Math.min(active,entries.length-1)];
 return <div className="overflow-hidden rounded-3xl border border-[#d3ab76]/45 bg-[#fbefdf] p-3">
   <div className="overflow-hidden rounded-2xl bg-[#fff8ed]">
     <Image src={chosen.src} alt={chosen.alt} width={960} height={760} unoptimized priority
       className="aspect-[4/3] w-full object-contain"/>
   </div>
   {entries.length>1 ? <div className="mt-3 grid grid-cols-4 gap-2" aria-label="Product image gallery">
     {entries.map((entry,i)=><button type="button" key={i} onClick={()=>setActive(i)}
       aria-label={"Show product image "+(i+1)} aria-pressed={active===i}
       className={"rounded-xl border-2 p-1 focus-visible:outline-2 focus-visible:outline-[#853045] "+(active===i?"border-[#8e3442]":"border-transparent")}>
       <Image src={entry.src} alt={entry.alt} width={200} height={160} unoptimized className="aspect-[4/3] w-full rounded-lg object-cover"/>
     </button>)}
   </div>:null}
   <p className="mt-3 px-1 text-xs leading-5 text-[#65525b]">{photos.length?"Seller-provided product photography. Exact product variant and contents remain subject to the final confirmed offer.":"Illustrative catalogue artwork; not verified stock photography."}</p>
 </div>
}

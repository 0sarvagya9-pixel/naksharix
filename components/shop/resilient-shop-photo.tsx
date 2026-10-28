"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { wikimediaOriginalForThumbnail } from "@/lib/media/wikimedia-original";

const fallback="/shop/combo-placeholder.svg";

/** Displays the same exact Commons photograph from its original file if the CDN
 * thumbnail fails. Never silently substitutes another vendor's product image.
 */
export function ResilientShopPhoto({
  src,alt,width,height,className,priority=false,showFallbackLabel=false
}: {
  src:string;alt:string;width:number;height:number;className?:string;
  priority?:boolean;showFallbackLabel?:boolean;
}) {
  const [currentSrc,setCurrentSrc]=useState(src);
  useEffect(()=>setCurrentSrc(src),[src]);
  const original=wikimediaOriginalForThumbnail(src);
  const missing=currentSrc===fallback&&src!==fallback;
  return <div className="relative w-full">
    <Image src={currentSrc} alt={missing?"Illustrative fallback: "+alt:alt}
      width={width} height={height} priority={priority} unoptimized
      className={className} onError={()=>{
        if(original && currentSrc===src)setCurrentSrc(original);
        else if(currentSrc!==fallback)setCurrentSrc(fallback);
      }}/>
    {missing&&showFallbackLabel?<span className="absolute bottom-0 left-0 right-0 bg-[#34212a]/90 px-2 py-1 text-xs font-semibold text-white">
      Reference photo unavailable · illustration
    </span>:null}
  </div>;
}

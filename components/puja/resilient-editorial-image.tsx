"use client";

import Image from "next/image";
import { wikimediaOriginalForThumbnail } from "@/lib/media/wikimedia-original";
import { useEffect, useState } from "react";

/** Images from Commons are external references, never proof of Naksharix fulfilment.
 * Retry the *same* file on the alternate official Wikimedia host; never silently
 * substitute an unrelated ceremony photo. A local illustration is a last resort.
 */
export function ResilientEditorialImage({
  src, fallbackSrc, alt, width, height, className
}: {
  src: string;
  fallbackSrc: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  useEffect(() => { setCurrentSrc(src); }, [src]);
  const mirror = wikimediaOriginalForThumbnail(src);
  const isIllustration = currentSrc === fallbackSrc && src !== fallbackSrc;
  return (
    <div className="relative h-full w-full">
      <Image
        src={currentSrc}
        alt={isIllustration ? "Illustrative "+alt : alt}
        width={width}
        height={height}
        unoptimized
        className={className}
        onError={() => {
          if (mirror && currentSrc === src) setCurrentSrc(mirror);
          else if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
        }}
      />
      {isIllustration ? (
        <span className="absolute bottom-0 left-0 right-0 bg-[#351e2d]/90 px-3 py-1.5 text-xs font-semibold text-[#fff4dd]">
          Representative photo unavailable · illustration
        </span>
      ) : null}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { editorialPujaPhotos, categoryPujaPhotos } from "@/lib/puja/editorial-photos";
import { referenceProductPhotos } from "@/lib/shop/real-photo-seeds";

export const metadata: Metadata = {
  title: "Image Credits | Naksharix",
  description: "Source and licence acknowledgements for photographs used on the Naksharix website.",
  robots: { index: false, follow: true }
};

type Credit = { label: string; author: string; source: string; licence: string; licenceUrl: string };
const sources: Credit[] = [
  ...Object.entries(editorialPujaPhotos).map(([name,p]) => ({
    label: name.replaceAll("-", " "), author:p.author, source:p.source, licence:p.license, licenceUrl:p.licenseUrl
  })),
  ...Object.entries(categoryPujaPhotos).map(([name,p]) => ({
    label: name + " ceremonies", author:p.author, source:p.source, licence:p.license, licenceUrl:p.licenseUrl
  })),
  ...Object.entries(referenceProductPhotos).filter(([,p]) => p.evidenceUrl && p.licenseUrl).map(([name,p]) => ({
    label: name.replaceAll("-", " "), author:p.credit || "Image contributor",
    source:p.evidenceUrl!, licence:p.licenseName || "Licence information", licenceUrl:p.licenseUrl!
  })),
  {
    label: "Consultation visual", author: "Ravikiran", source: "https://commons.wikimedia.org/wiki/File:Astrologer.jpg",
    licence: "CC BY-SA 4.0", licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
  }
];
const credits = [...new Map<string,Credit>(sources.map(p => [p.source, p] as const)).values()]
  .sort((a,b) => a.label.localeCompare(b.label));

export default function ImageCreditsPage() {
  return (
    <main className="min-h-[60vh] bg-[#fbf6ef] px-5 py-12 text-[#243044]">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-semibold text-[#7a1526]">← Back to Naksharix</Link>
        <h1 className="mt-5 font-serif text-4xl font-bold">Image credits</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#525866]">
          Thanks to the photographers and contributors whose images appear in our
          astrology, Puja and product collections. The photographs illustrate
          subjects or materials; they are not necessarily photographs of a specific
          item offered for delivery or a ceremony arranged by Naksharix.
        </p>
        <div className="mt-8 divide-y divide-[#e4d8c7] overflow-hidden rounded-xl border border-[#e4d8c7] bg-white">
          {credits.map(p => (
            <div key={p.source} className="flex flex-wrap items-start justify-between gap-3 p-4 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-semibold capitalize">{p.label}</p>
                <p className="mt-1 text-[#5e6470]">{p.author}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <a className="font-semibold text-[#7a1526] underline underline-offset-2" href={p.source} target="_blank" rel="noopener noreferrer">Photo source</a>
                <a className="font-semibold text-[#7a1526] underline underline-offset-2" href={p.licenceUrl} target="_blank" rel="noopener noreferrer">{p.licence}</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

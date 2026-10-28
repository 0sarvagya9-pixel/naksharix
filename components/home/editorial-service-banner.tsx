import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  eyebrow: string;
  headline: string;
  caption: string;
  image: string;
  imageAlt: string;
  link: string;
  linkLabel: string;
  imageCredit?: { label: string; source: string; license?: string };
};

/** Editorial imagery never substitutes for a verified provider, person or offering. */
export function EditorialServiceBanner({ eyebrow, headline, caption, image, imageAlt, link, linkLabel, imageCredit }: Props) {
  return (
    <section className="nx-ed-inner-banner" aria-label={eyebrow}>
      <div className="nx-ed-inner-banner-photo" aria-hidden="true">
        <Image src={image} alt="" fill sizes="100vw" unoptimized/>
      </div>
      <div className="nx-ed-inner-banner-shade" aria-hidden="true" />
      <div className="nx-ed-container nx-ed-inner-banner-body">
        <div className="nx-ed-inner-banner-copy">
          <span>{eyebrow}</span>
          <h2>{headline}</h2>
          <p>{caption}</p>
          <Link href={link}>{linkLabel}<ArrowRight size={16} aria-hidden="true"/></Link>
          {imageCredit ? <p className="mt-3 text-xs text-[#f9dfba]">Representative image · <a href={imageCredit.source} target="_blank" rel="noopener noreferrer" className="underline">{imageCredit.label}{imageCredit.license ? " · "+imageCredit.license : ""}</a></p> : null}
        </div>
        <span className="sr-only">{imageAlt}</span>
      </div>
    </section>
  );
}

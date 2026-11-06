import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/* Owner-approved visual format cards. They are service-discovery links,
   never fabricated doctors, verified profiles, appointment slots or prices. */
const formats = [
  { title: "Consultation Profile", subtitle: "Video, voice and chat options", src: "/approved-gallery/consult-photo.jpg", href: "/astrologers", cta: "Explore astrologers" },
  { title: "Astrologer Profile", subtitle: "Browse available consultation formats", src: "/approved-gallery/puja-hero.jpg", href: "/astrologers", cta: "Explore astrologers" },
  { title: "Astrology Specialist", subtitle: "Traditional Kundli and report guidance", src: "/approved-gallery/kundli-report.jpg", href: "/reports", cta: "Explore reports" },
  { title: "Traditional Guidance", subtitle: "Puja traditions and dates", src: "/approved-gallery/puja-ritual.jpg", href: "/pujas", cta: "View puja services" },
];

export function ConsultationGallery() {
  return (
    <section className="nx-consultation-gallery" aria-labelledby="nx-consultation-gallery-heading">
      <div className="nx-a-container">
        <div className="nx-consultation-gallery-heading">
          <div>
            <p>Personal guidance</p>
            <h2 id="nx-consultation-gallery-heading">Find the right consultation format</h2>
            <span>Explore consultation options, spiritual guidance and traditional astrology services.</span>
          </div>
          <Link href="/astrologers">View available profiles <ArrowRight size={15} aria-hidden="true"/></Link>
        </div>
        <div className="nx-consultation-gallery-cards">
          {formats.map(({title,subtitle,src,href,cta}) => (
            <article key={title} className="nx-consultation-gallery-card">
              <Image src={src} alt={title+" conceptual illustration"} width={640} height={300} unoptimized className="nx-consultation-gallery-photo" />
              <div className="nx-consultation-gallery-copy">
                <span>Explore services</span>
                <h3>{title}</h3>
                <p>{subtitle}</p>
                <Link href={href}>{cta} <ArrowRight size={14} aria-hidden="true"/></Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

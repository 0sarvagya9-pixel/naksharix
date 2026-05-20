import Image from "next/image";
import Link from "next/link";

type OverlayLink = {
  label: string;
  href: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

const overlayLinks: OverlayLink[] = [
  { label: "Home", href: "/", left: 25, top: 2, width: 4, height: 4 },
  { label: "Kundli", href: "/kundli", left: 30, top: 2, width: 4, height: 4 },
  { label: "Match Making", href: "/kundli-matching", left: 35, top: 2, width: 7, height: 4 },
  { label: "Numerology", href: "/numerology", left: 43, top: 2, width: 6, height: 4 },
  { label: "AI Astrologer", href: "/talk-to-kundli", left: 50, top: 2, width: 7, height: 4 },
  { label: "Tarot", href: "/tarot", left: 58, top: 2, width: 4, height: 4 },
  { label: "Remedies", href: "/reports", left: 63, top: 2, width: 5, height: 4 },
  { label: "Start with Naksharix", href: "/signup", left: 91, top: 2, width: 7, height: 5 },
  { label: "Generate Kundli", href: "/kundli", left: 10, top: 39, width: 12, height: 5 },
  { label: "Talk to AI Astrologer", href: "/talk-to-kundli", left: 23, top: 39, width: 13, height: 5 },
  { label: "Kundli Generator feature", href: "/kundli", left: 10, top: 51, width: 11, height: 6 },
  { label: "AI Astrologer feature", href: "/talk-to-kundli", left: 23, top: 51, width: 11, height: 6 },
  { label: "Matching Compatibility feature", href: "/kundli-matching", left: 36, top: 51, width: 13, height: 6 },
  { label: "Premium Reports feature", href: "/reports", left: 51, top: 51, width: 12, height: 6 },
  { label: "Tarot Reading feature", href: "/tarot", left: 65, top: 51, width: 11, height: 6 },
  { label: "Consultation with Experts feature", href: "/consultation", left: 78, top: 51, width: 13, height: 6 },
  { label: "Unlock Full Report", href: "/reports/kundli-pro", left: 83, top: 78, width: 10, height: 5 },
  { label: "Browse astrologer consultation", href: "/astrologers", left: 7, top: 84, width: 86, height: 10 }
];

export function DesktopHomepageArtboard() {
  return (
    <section className="hidden min-h-screen bg-[#020817] px-0 py-0 lg:block" aria-labelledby="homepage-artboard-title">
      <div className="sr-only">
        <h1 id="homepage-artboard-title">Unlock Your Cosmic Destiny</h1>
        <p>अपनी कॉस्मिक नियति समझें</p>
        <p>
          Naksharix is a premium Vedic astrology, numerology, AI astrologer, Kundli, premium report, and consultation platform.
        </p>
        <ul>
          <li>Kundli Generator</li>
          <li>AI Astrologer</li>
          <li>Kundli Matching</li>
          <li>Numerology</li>
          <li>Tarot</li>
          <li>Premium Reports</li>
          <li>Astrologer Consultation</li>
        </ul>
      </div>

      <div className="mx-auto aspect-video w-full max-w-[1920px] bg-[#020817]">
        <div className="relative h-full w-full">
          <Image
            src="/design-reference/homepage-approved-reference-16x9.png"
            alt="Naksharix premium spiritual-tech homepage with Vedic astrology, numerology, AI astrologer, reports, and consultation previews"
            fill
            priority
            sizes="100vw"
            className="object-contain"
          />
          {overlayLinks.map((link) => (
            <Link
              key={`${link.label}-${link.href}`}
              href={link.href}
              aria-label={link.label}
              className="absolute rounded-md bg-transparent outline-none transition focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020817]"
              style={{
                left: `${link.left}%`,
                top: `${link.top}%`,
                width: `${link.width}%`,
                height: `${link.height}%`
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

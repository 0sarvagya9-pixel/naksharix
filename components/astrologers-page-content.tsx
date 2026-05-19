"use client";

import { AstrologerListing, type MarketplaceAstrologer } from "@/components/astrologer-listing";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";

export function AstrologersPageContent({ profiles }: { profiles: MarketplaceAstrologer[] }) {
  const { tr } = useLanguage();
  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">{tr("verifiedGuides")}</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">{tr("astrologersTitle")}</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">{tr("astrologersIntro")}</p>
        <AstrologerListing profiles={profiles} />
      </Section>
    </main>
  );
}

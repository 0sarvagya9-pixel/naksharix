"use client";

import Link from "next/link";

import { AstrologerListing, type MarketplaceAstrologer } from "@/components/astrologer-listing";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";

export function AstrologersPageContent({ profiles }: { profiles: MarketplaceAstrologer[] }) {
  const { tr } = useLanguage();
  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#735021]">{tr("verifiedGuides")}</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">{tr("astrologersTitle")}</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">{tr("astrologersIntro")}</p>
        <div className="my-6 rounded-2xl border border-[#e6d2b2] bg-white p-5 text-[#492d33]">
          <p className="font-semibold">Are you a practicing astrologer?</p>
          <p className="mt-2 text-sm">Apply to join our practitioner network. Profiles are reviewed before public listing.</p>
          <Link href="/join-astrologer" className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-[#793746] px-5 font-semibold text-white">Apply as an astrologer</Link>
        </div>
        <AstrologerListing profiles={profiles} />
      </Section>
    </main>
  );
}

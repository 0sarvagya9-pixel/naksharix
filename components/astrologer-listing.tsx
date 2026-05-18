"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Circle, MessageCircle, Phone, Star, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { featuredAstrologers } from "@/lib/astrologers";
import { useLanguage } from "@/components/language-provider";

export type MarketplaceAstrologer = {
  id: string;
  name: string;
  specialty: string;
  languages: string[];
  experienceYears: number;
  rating: number;
  reviewCount?: number;
  pricePerMinute: number;
  pricePerSession?: number | null;
  bio: string;
  introLine?: string | null;
  photoUrl?: string | null;
  city?: string | null;
  country?: string | null;
  status?: string;
  availableForChat?: boolean;
  availableForCall?: boolean;
  availableForVideo?: boolean;
};

export function AstrologerListing({ profiles = [] }: { profiles?: MarketplaceAstrologer[] }) {
  const { tr } = useLanguage();
  const [language, setLanguage] = useState("All");
  const [expertise, setExpertise] = useState("All");
  const [price, setPrice] = useState("All");
  const [rating, setRating] = useState("All");
  const demoAstrologers: MarketplaceAstrologer[] = featuredAstrologers.map((item) => ({ ...item, reviewCount: 0 }));
  const source = profiles.length ? profiles : demoAstrologers;

  const astrologers = useMemo(() => source.filter((astrologer) => {
    const languageOk = language === "All" || astrologer.languages.includes(language);
    const expertiseOk = expertise === "All" || astrologer.specialty.toLowerCase().includes(expertise.toLowerCase());
    const priceOk = price === "All" || astrologer.pricePerMinute <= Number(price);
    const ratingOk = rating === "All" || astrologer.rating >= Number(rating);
    return languageOk && expertiseOk && priceOk && ratingOk;
  }), [language, expertise, price, rating, source]);

  return (
    <>
      <div className="mt-8 grid gap-3 rounded-lg border border-[#F5C542]/20 bg-[#201037]/60 p-4 md:grid-cols-4">
        <select value={language} onChange={(event) => setLanguage(event.target.value)} className="h-10 rounded-md border border-[#F5C542]/20 bg-[#12051f] px-3 text-sm">
          <option value="All">{tr("all")}</option><option value="English">{tr("english")}</option><option value="Hindi">{tr("hindi")}</option><option value="Hinglish">Hinglish</option>
        </select>
        <select value={expertise} onChange={(event) => setExpertise(event.target.value)} className="h-10 rounded-md border border-[#F5C542]/20 bg-[#12051f] px-3 text-sm">
          <option value="All">{tr("all")}</option><option value="Vedic">{tr("vedic")}</option><option value="Tarot">{tr("tarotWord")}</option><option value="Numerology">{tr("numerologyWord")}</option><option value="Kundli">Kundli</option>
        </select>
        <select value={price} onChange={(event) => setPrice(event.target.value)} className="h-10 rounded-md border border-[#F5C542]/20 bg-[#12051f] px-3 text-sm">
          <option value="All">{tr("all")}</option><option value="40">{tr("upToInr40")}</option><option value="50">{tr("upToInr50")}</option><option value="60">{tr("upToInr60")}</option>
        </select>
        <select value={rating} onChange={(event) => setRating(event.target.value)} className="h-10 rounded-md border border-[#F5C542]/20 bg-[#12051f] px-3 text-sm">
          <option value="All">{tr("all")}</option><option value="4">4+ {tr("rating")}</option><option value="4.5">4.5+ {tr("rating")}</option><option value="4.8">4.8+ {tr("rating")}</option>
        </select>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {astrologers.map((astrologer) => (
          <Card key={astrologer.id} className="glass overflow-hidden">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-[#F5C542]/30 bg-[#12051f] text-xl font-bold text-[#FFD36A]">
                  {astrologer.photoUrl ? <Image src={astrologer.photoUrl} alt={astrologer.name} width={64} height={64} className="h-full w-full object-cover" /> : astrologer.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-2 font-cinzel text-lg">{astrologer.name}<BadgeCheck className="h-5 w-5 shrink-0 text-[#FFD36A]" /></CardTitle>
                  <p className="mt-1 text-sm naksh-muted-text">{astrologer.introLine || astrologer.specialty}</p>
                  {astrologer.city || astrologer.country ? <p className="mt-1 text-xs naksh-muted-text">{[astrologer.city, astrologer.country].filter(Boolean).join(", ")}</p> : null}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-[#FFD36A]">
                <Star className="h-4 w-4 fill-current" />
                {(astrologer.rating || 0).toFixed(1)} {tr("rating")} | {astrologer.experienceYears}+ {tr("years")} | INR {astrologer.pricePerMinute}/min
              </div>
              <p className="flex items-center gap-2 text-sm text-emerald-200"><Circle className="h-2 w-2 fill-current" /> {astrologer.status ?? tr("onlineForDemoBookings")}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {astrologer.availableForChat ? <span className="inline-flex items-center gap-1 rounded-full border border-[#F5C542]/20 px-2 py-1"><MessageCircle className="h-3 w-3" /> Chat</span> : null}
                {astrologer.availableForCall ? <span className="inline-flex items-center gap-1 rounded-full border border-[#F5C542]/20 px-2 py-1"><Phone className="h-3 w-3" /> Call</span> : null}
                {astrologer.availableForVideo ? <span className="inline-flex items-center gap-1 rounded-full border border-[#F5C542]/20 px-2 py-1"><Video className="h-3 w-3" /> Video</span> : null}
              </div>
              <p className="line-clamp-3 text-sm naksh-muted-text">{astrologer.bio}</p>
              <p className="text-sm">{tr("languages")}: {astrologer.languages.join(", ")}</p>
              <div className="flex flex-wrap gap-2">
                <Button asChild><Link href={`/astrologers/${astrologer.id}`}>{tr("viewProfile")}</Link></Button>
                <Button variant="outline" asChild><Link href={`/consultation/book/${astrologer.id}`}>{tr("bookConsultation")}</Link></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!astrologers.length ? <p className="mt-6 rounded-lg border border-[#F5C542]/20 bg-[#201037]/60 p-4 text-sm naksh-muted-text">{tr("noAstrologersMatch")}</p> : null}
    </>
  );
}

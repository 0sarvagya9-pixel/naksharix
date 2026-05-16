"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Circle, Star } from "lucide-react";
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
  pricePerMinute: number;
  bio: string;
  status?: string;
};

export function AstrologerListing({ profiles = [] }: { profiles?: MarketplaceAstrologer[] }) {
  const { tr } = useLanguage();
  const [language, setLanguage] = useState("All");
  const [expertise, setExpertise] = useState("All");
  const [price, setPrice] = useState("All");
  const [rating, setRating] = useState("All");
  const demoAstrologers: MarketplaceAstrologer[] = featuredAstrologers;
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
      <div className="mt-8 grid gap-3 rounded-lg border border-amber-200/15 bg-card/50 p-4 md:grid-cols-4">
        <select value={language} onChange={(event) => setLanguage(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="All">{tr("all")}</option><option value="English">{tr("english")}</option><option value="Hindi">{tr("hindi")}</option>
        </select>
        <select value={expertise} onChange={(event) => setExpertise(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="All">{tr("all")}</option><option value="Vedic">{tr("vedic")}</option><option value="Tarot">{tr("tarotWord")}</option><option value="Numerology">{tr("numerologyWord")}</option><option value="Panchang">{tr("panchangWord")}</option>
        </select>
        <select value={price} onChange={(event) => setPrice(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="All">{tr("all")}</option><option value="40">{tr("upToInr40")}</option><option value="50">{tr("upToInr50")}</option><option value="60">{tr("upToInr60")}</option>
        </select>
        <select value={rating} onChange={(event) => setRating(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="All">{tr("all")}</option><option value="4">4+ {tr("rating")}</option><option value="4.5">4.5+ {tr("rating")}</option><option value="4.8">4.8+ {tr("rating")}</option>
        </select>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {astrologers.map((astrologer) => (
          <Card key={astrologer.id} className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-cinzel">{astrologer.name}<BadgeCheck className="h-5 w-5 text-amber-200" /></CardTitle>
              <p className="text-sm text-muted-foreground">{astrologer.specialty}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-amber-200">
                <Star className="h-4 w-4 fill-current" />
                {astrologer.rating} {tr("rating")} | {astrologer.experienceYears}+ {tr("years")} | INR {astrologer.pricePerMinute}/min
              </div>
              <p className="flex items-center gap-2 text-sm text-emerald-200"><Circle className="h-2 w-2 fill-current" /> {astrologer.status ?? tr("onlineForDemoBookings")}</p>
              <p className="text-sm text-muted-foreground">{astrologer.bio}</p>
              <p className="text-sm">{tr("languages")}: {astrologer.languages.join(", ")}</p>
              <div className="flex flex-wrap gap-2">
                <Button asChild><Link href={`/astrologers/${astrologer.id}`}>{tr("viewProfile")}</Link></Button>
                <Button variant="outline" asChild><Link href={`/consultation?astrologer=${astrologer.id}`}>{tr("bookConsultation")}</Link></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!astrologers.length ? <p className="mt-6 rounded-lg border border-amber-200/15 bg-card/50 p-4 text-sm text-muted-foreground">{tr("noAstrologersMatch")}</p> : null}
    </>
  );
}

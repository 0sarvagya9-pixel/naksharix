"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RazorpayCheckoutButton } from "@/components/razorpay-checkout-button";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";
import { isAdmin as canOpenAdminPricing } from "@/lib/auth/permissions";
import { subscriptionPlans, type SubscriptionPlanId } from "@/lib/subscription-plans";

export function PricingContent() {
  const { tr } = useLanguage();
  const [role, setRole] = useState<string | null>(null);
  const isAdmin = canOpenAdminPricing({ role });
  const plans = [
    { id: "FREE", name: tr("free"), price: "INR 0", features: [tr("dailyHoroscope"), tr("basicNumerology"), tr("limitedAiChat")] },
    ...subscriptionPlans.map((plan) => ({
      id: plan.id,
      name: plan.id === "PREMIUM" ? tr("premium") : tr("vip"),
      price: plan.id === "PREMIUM" ? tr("monthlyPrice499") : tr("monthlyPrice1499"),
      features: plan.id === "PREMIUM"
        ? [tr("personalizedHoroscope"), tr("kundliPdfReports"), tr("tarotAiInterpretation"), tr("credits100")]
        : [tr("yearlyAiReport"), tr("consultationCredits"), tr("prioritySupport"), tr("advancedRemedies")]
    }))
  ];

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((json) => {
        if (mounted) setRole(json?.data?.user?.role ?? null);
      })
      .catch(() => {
        if (mounted) setRole(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Section>
      <h1 className="font-cinzel text-4xl font-black">{tr("pricingTitle")}</h1>
      <p className="mt-4 max-w-3xl naksh-muted-text">{tr("pricingSubtitle")}</p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {plans.map(({ id, name, price, features }) => (
          <Card key={`${id}-${name}`} className={id === "VIP" ? "relative overflow-hidden border-[#F5C542]/55 bg-[radial-gradient(circle_at_top,rgba(245,197,66,0.16),transparent_16rem),linear-gradient(145deg,rgba(40,20,63,0.96),rgba(18,5,31,0.9))] shadow-[0_24px_80px_rgba(245,197,66,0.12)]" : id === "PREMIUM" ? "relative overflow-hidden border-[#A855F7]/45 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_16rem),linear-gradient(145deg,rgba(32,16,55,0.94),rgba(18,5,31,0.9))]" : "bg-[#201037]/80"}>
            <CardHeader>
              <CardTitle>{name}</CardTitle>
              <p className="cosmic-gold-text text-3xl font-black">{price}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm naksh-muted-text">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="h-4 w-4 text-[#FFD36A]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {id === "FREE" ? (
                  <p className="text-sm naksh-muted-text">{tr("includedEveryAccount")}</p>
                ) : isAdmin ? (
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link href={`/report-request/new?plan=${id === "PREMIUM" ? "premium" : "vip"}&mode=admin`}>{id === "PREMIUM" ? tr("openPremiumAsAdmin") : tr("openVipAsAdmin")}</Link>
                    </Button>
                    <p className="text-sm naksh-muted-text">{tr("unlimitedAdminCredits")}</p>
                  </div>
                ) : (
                  <RazorpayCheckoutButton payload={{ purpose: "SUBSCRIPTION", plan: id as SubscriptionPlanId }} label={`${tr("subscribeTo")} ${name}`} />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}





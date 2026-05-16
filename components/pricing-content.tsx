"use client";

import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RazorpayCheckoutButton } from "@/components/razorpay-checkout-button";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";
import { subscriptionPlans, type SubscriptionPlanId } from "@/lib/subscription-plans";

export function PricingContent() {
  const { tr } = useLanguage();
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

  return (
    <Section>
      <h1 className="font-cinzel text-4xl font-black">{tr("pricingTitle")}</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">{tr("pricingSubtitle")}</p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {plans.map(({ id, name, price, features }) => (
          <Card key={`${id}-${name}`} className={name === "Premium" ? "border-primary" : ""}>
            <CardHeader>
              <CardTitle>{name}</CardTitle>
              <p className="text-3xl font-black">{price}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="h-4 w-4 text-secondary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {id === "FREE" ? (
                  <p className="text-sm text-muted-foreground">{tr("includedEveryAccount")}</p>
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

"use client";

import Link from "next/link";
import { Calculator, CalendarDays, Check, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";

const services = [
  {
    id: "free-tools",
    title: "Free Astrology Tools",
    price: "Free",
    description: "Use available Kundli, Panchang, horoscope, numerology, tarot, and calculator experiences.",
    features: ["Kundli generation", "Panchang and horoscope", "Numerology and tarot", "Free calculators"],
    href: "/free-calculators",
    cta: "Explore Free Tools",
    icon: Calculator
  },
  {
    id: "reports",
    title: "Premium Digital Reports",
    price: "Price shown per report",
    description: "Choose an available premium report and complete Razorpay checkout only from its report page.",
    features: ["Server-verified payment", "Secure report unlock", "Saved report access", "PDF download when available"],
    href: "/reports",
    cta: "View Reports",
    icon: FileText
  },
  {
    id: "consultations",
    title: "Astrologer Consultations",
    price: "Price shown per approved profile",
    description: "Review approved astrologer profiles, available slots, consultation modes, and the listed session price.",
    features: ["Approved profiles", "Availability slots", "Razorpay payment", "Booking dashboard"],
    href: "/consultation",
    cta: "View Consultations",
    icon: CalendarDays
  }
];

export function PricingContent() {
  return (
    <Section>
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00f5a0]">Active Services</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black text-[#FFD700]">Services and Pricing</h1>
        <p className="mt-4 naksh-muted-text">
          Naksharix does not currently sell public monthly AI subscriptions. Prices are displayed only on active report and approved astrologer pages.
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {services.map(({ id, title, price, description, features, href, cta, icon: Icon }) => (
          <Card key={id} className="relative overflow-hidden border-[#D4AF37]/25 bg-[#02112C]/82">
            <CardHeader>
              <Icon className="h-7 w-7 text-[#00f5a0]" />
              <CardTitle className="mt-4 font-cinzel">{title}</CardTitle>
              <p className="cosmic-gold-text text-xl font-black">{price}</p>
              <p className="text-sm leading-6 naksh-muted-text">{description}</p>
            </CardHeader>
            <CardContent className="flex h-full flex-col">
              <ul className="space-y-3 text-sm naksh-muted-text">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#01A361]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full">
                <Link href={href}><Sparkles className="h-4 w-4" />{cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-6 naksh-muted-text">
        AI Astrologer and Shop ecommerce remain unavailable until their separate reliability, safety, fulfilment, and legal readiness work is complete.
      </p>
    </Section>
  );
}

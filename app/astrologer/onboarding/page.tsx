import type { Metadata } from "next";
import { AstrologerOnboardingForm } from "@/components/astrologer-onboarding-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Astrologer Onboarding - Naksharix",
  description: "Apply to join Naksharix as an astrologer or consultant and start setting up your consultation marketplace profile.",
  path: "/astrologer/onboarding"
});

export default function AstrologerOnboardingPage() {
  return (
    <main className="star-field">
      <Section className="max-w-3xl">
        <Card className="glass">
          <CardHeader>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">Guide Portal</p>
            <CardTitle className="font-cinzel text-3xl">Apply as Astrologer / Consultant</CardTitle>
            <p className="text-sm naksh-muted-text">
              Create your professional account. Naksharix admins will review your profile before public approval.
            </p>
          </CardHeader>
          <CardContent>
            <AstrologerOnboardingForm />
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}

import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { env } from "@/lib/env";

export const metadata: Metadata = seo({
  title: "Create your Naksharix account",
  description: "Create a Naksharix account to unlock your cosmic destiny with horoscope, kundli, numerology, tarot reading, panchang, and AI guidance.",
  path: "/auth/signup"
});

export default function SignupPage() {
  const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

  return (
    <Section className="max-w-md">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-cinzel">Create your Naksharix account</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthForm mode="signup" googleEnabled={googleEnabled} />
          <p className="mt-4 text-sm text-muted-foreground">
            Already registered? <Link href="/auth/login" className="text-primary">Sign in</Link>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Want to consult on Naksharix? <Link href="/astrologer/onboarding" className="text-primary">Apply as Astrologer / Consultant</Link>
          </p>
        </CardContent>
      </Card>
    </Section>
  );
}

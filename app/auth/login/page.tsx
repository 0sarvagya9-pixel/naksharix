import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { env } from "@/lib/env";

export const metadata: Metadata = seo({
  title: "Sign in to Naksharix",
  description: "Sign in to your Naksharix account for horoscope, Kundli, numerology, tarot reflection, Panchang, reports, and dashboard access.",
  path: "/auth/login"
});

export default function LoginPage() {
  const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

  return (
    <Section className="max-w-md">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-cinzel">Sign in to Naksharix</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthForm mode="login" googleEnabled={googleEnabled} />
          <p className="mt-4 text-sm naksh-muted-text">
            New here? <Link href="/auth/signup" className="text-[#01A361]">Create an account</Link>
          </p>
          <p className="mt-2 text-sm naksh-muted-text">
            Are you an astrologer or consultant? <Link href="/auth/astrologer-login" className="text-[#01A361]">Login as Astrologer / Consultant</Link>
          </p>
        </CardContent>
      </Card>
    </Section>
  );
}

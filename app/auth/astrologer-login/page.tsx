import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { seo } from "@/lib/seo";
import { env } from "@/lib/env";

export const metadata: Metadata = seo({
  title: "Astrologer / Consultant Login - Naksharix",
  description: "Login to your Naksharix astrologer or consultant dashboard to manage profile, availability, bookings, and earnings.",
  path: "/auth/astrologer-login"
});

export default function AstrologerLoginPage() {
  const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

  return (
    <Section className="max-w-md">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-cinzel">Astrologer / Consultant Login</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthForm mode="login" googleEnabled={googleEnabled} />
          <p className="mt-4 text-sm text-muted-foreground">
            New guide on Naksharix? <Link href="/astrologer/onboarding" className="text-primary">Start onboarding</Link>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Looking for your personal dashboard? <Link href="/auth/login" className="text-primary">User login</Link>
          </p>
        </CardContent>
      </Card>
    </Section>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { env } from "@/lib/env";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
    title: "Login to Naksharix",
    description: "Login to Naksharix with Google or email to access saved Kundli reports, readings, bookings, and your account dashboard.",
    path: "/login"
  }),
  robots: { index: false, follow: true }
};

export default function LoginPage() {
  const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

  return (
    <Section className="max-w-md">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-cinzel">Login to Naksharix</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthForm mode="login" googleEnabled={googleEnabled} />
          <p className="mt-4 text-sm naksh-muted-text">
            New here? <Link href="/signup" className="text-[#01A361]">Create an account</Link>
          </p>
          <p className="mt-2 text-sm naksh-muted-text">
            Astrologer or consultant? <Link href="/auth/astrologer-login" className="text-[#01A361]">Use professional login</Link>
          </p>
        </CardContent>
      </Card>
    </Section>
  );
}

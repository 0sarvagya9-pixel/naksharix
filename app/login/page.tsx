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

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

  return (
    <Section className="max-w-md">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-cinzel">Login to Naksharix</CardTitle>
        </CardHeader>
        <CardContent>
          {error === "OAuthAccountNotLinked" ? (
            <div role="alert" className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm leading-6">
              This email is already associated with another sign-in method. If you previously registered with a password, sign in using your email and password below. Google accounts are not linked automatically for your security. Contact Naksharix support if you need help recovering access.
            </div>
          ) : null}
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

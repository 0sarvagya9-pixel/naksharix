import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { env } from "@/lib/env";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Create your Naksharix account",
  description: "Create a Naksharix account with Google or email to save readings, reports, and consultations.",
  path: "/signup"
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
            Already registered? <Link href="/login" className="text-primary">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </Section>
  );
}

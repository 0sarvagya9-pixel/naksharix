import Link from "next/link";
import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin-login-form";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { env } from "@/lib/env";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Login to Naksharix",
  description: "Login to Naksharix with Google or email to access your kundli reports, readings, and astrology dashboard.",
  path: "/login"
});

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
          <AdminLoginForm />
          <p className="mt-4 text-sm text-muted-foreground">
            New here? <Link href="/signup" className="text-primary">Create an account</Link>
          </p>
        </CardContent>
      </Card>
    </Section>
  );
}


import type { Metadata } from "next";
import Link from "next/link";
import { EmailVerificationForm } from "@/components/email-verification-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Section } from "@/components/section";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
    title: "Verify your email",
    description: "Verify your Naksharix account email address.",
    path: "/verify-email"
  }),
  robots: {
    index: false,
    follow: false
  }
};

export default function VerifyEmailPage() {
  return (
    <Section className="max-w-md">
      <Card className="glass">
        <CardHeader />
        <CardContent>
          <EmailVerificationForm />

          <p className="mt-5 text-center text-sm naksh-muted-text">
            Already verified?{" "}
            <Link href="/login" className="text-[#01A361]">
              Return to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </Section>
  );
}

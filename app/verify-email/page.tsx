import type { Metadata } from "next";
import { EmailVerificationForm } from "@/components/email-verification-form";
import { Card, CardContent } from "@/components/ui/card";
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
        <CardContent className="p-5">
          <EmailVerificationForm />
        </CardContent>
      </Card>
    </Section>
  );
}

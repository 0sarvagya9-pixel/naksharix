import { localizedAuthMetadata } from "@/lib/auth/page-metadata";
import type { Metadata } from "next";
import { EmailVerificationForm } from "@/components/email-verification-form";
import { AuthFrame } from "@/components/auth/auth-frame";
import { seo } from "@/lib/seo";

const englishMetadata: Metadata = {
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

export function generateMetadata() {
  return localizedAuthMetadata("verification", englishMetadata);
}

export default function VerifyEmailPage() {
  return (
    <AuthFrame><EmailVerificationForm /></AuthFrame>
  );
}

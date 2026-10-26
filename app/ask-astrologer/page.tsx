import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { GuidanceIntakeForm } from "@/components/guidance-intake-form";
import { getCurrentUser } from "@/lib/auth/jwt";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = seo({
  title: "Ask a Written Astrology Question | Private Enquiry",
  description: "Submit a private written astrology enquiry to Naksharix support for review. No expert response or delivery time is guaranteed.",
  path: "/ask-astrologer"
});

export default async function AskAstrologerPage() {
  const user = await getCurrentUser();
  return (
    <main className="star-field">
      <Section>
        <div className="mx-auto max-w-3xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Written Guidance</p>
          <h1 className="font-cinzel text-4xl font-black">Ask an Astrology Question</h1>
          <p className="naksh-muted-text">
            Have a question about career, relationships, or traditional astrology?
            Describe one focused question for the Naksharix support team to review.
            You can track updates and staff replies privately from your account.
          </p>
          <div className="rounded-xl border border-[#D4AF37]/20 p-5 text-sm leading-7 naksh-muted-text">
            This is a non-payment enquiry channel, not a live astrologer session. A
            qualified astrologer is not automatically assigned, a personalized answer is
            not guaranteed, and no response deadline is advertised. For approved
            appointment options, visit <Link className="font-semibold text-[#FFD700] underline" href="/consultation">consultations</Link>.
          </div>
          {user ? (
            <GuidanceIntakeForm kind="WRITTEN_GUIDANCE" />
          ) : (
            <div className="rounded-xl border border-[#D4AF37]/20 p-6">
              <p className="mb-4 text-sm naksh-muted-text">Sign in to submit and track a private request.</p>
              <Button asChild><Link href="/auth/login?next=%2Fask-astrologer">Sign in to ask</Link></Button>
            </div>
          )}
          <Link href="/support" className="inline-block text-sm font-semibold text-[#FFD700] underline">
            View existing support requests
          </Link>
        </div>
      </Section>
    </main>
  );
}

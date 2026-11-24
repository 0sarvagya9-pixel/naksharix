import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { EmailUpdatesForm } from "@/components/email-updates-form";
import { marketingConsentVersion } from "@/lib/marketing-consent";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Email updates | Naksharix", description: "Choose optional Naksharix report and Puja information by email." };

export default async function EmailUpdatesPage() {
  const user = await getCurrentUser();
  const account = user ? await prisma.user.findUnique({ where: { id: user.id }, select: { email: true, emailVerified: true, emailVerifiedAt: true, role: true, marketingConsent: { select: { interest: true, country: true, locale: true, emailAtConsent: true, revokedAt: true, consentVersion: true } } } }) : null;
  const existing = account?.marketingConsent;
  const active = Boolean(existing && !existing.revokedAt && existing.emailAtConsent === account?.email && existing.consentVersion === marketingConsentVersion);
  const eligible = Boolean(account && account.role === "USER" && !user?.isAdminLogin && (account.emailVerifiedAt || account.emailVerified));
  return <main className="mx-auto max-w-xl px-4 py-10 sm:py-16">
    <h1 className="font-cinzel text-3xl font-bold text-[#725022]">Naksharix email updates</h1>
    <p className="mt-4 leading-7">Choose which optional report offers or service updates you want to receive. There is no charge to subscribe, and your account or purchases do not require marketing consent.</p>
    {!user ? <div className="mt-6 rounded-xl border p-5 space-y-3"><p>Use your verified Naksharix account to confirm that the email address belongs to you.</p><Link className="block font-semibold underline" href="/login?redirectTo=%2Femail-updates">Sign in to subscribe</Link><Link className="block underline" href="/signup?redirectTo=%2Femail-updates">Create a free account</Link></div> :
    eligible || existing ? <EmailUpdatesForm eligible={eligible} initialSubscribed={active} initialInterest={existing?.interest ?? ""} initialCountry={existing?.country ?? ""} initialLocale={existing?.locale ?? "en"} /> : <p className="mt-6">A verified customer account is required to subscribe. Marketing preferences do not affect your other services.</p>}
    <p className="mt-6 text-sm">See our <Link href="/privacy-policy" className="underline">Privacy Policy</Link>. You can withdraw permission here at any time; promotional emails will also include an unsubscribe link.</p>
  </main>;
}

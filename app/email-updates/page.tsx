import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { EmailUpdatesForm } from "@/components/email-updates-form";
import { marketingConsentVersion, marketingPageCopy, normalizeMarketingLocale } from "@/lib/marketing-consent";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Email updates | Naksharix", description: "Choose optional Naksharix report and Puja information by email." };

export default async function EmailUpdatesPage() {
  const user = await getCurrentUser();
  const account = user ? await prisma.user.findUnique({ where: { id: user.id }, select: { email: true, locale: true, emailVerified: true, emailVerifiedAt: true, role: true, marketingConsent: { select: { interest: true, country: true, locale: true, emailAtConsent: true, revokedAt: true, consentVersion: true } } } }) : null;
  const existing = account?.marketingConsent;
  const cookieLocale = (await cookies()).get("naksharix-language")?.value;
  const uiLocale = normalizeMarketingLocale(cookieLocale ?? account?.locale ?? existing?.locale);
  const copy = marketingPageCopy[uiLocale];
  const eligible = Boolean(account && account.role === "USER" && !user?.isAdminLogin && (account.emailVerifiedAt || account.emailVerified));
  const active = Boolean(eligible && existing && !existing.revokedAt && existing.emailAtConsent === account?.email && existing.consentVersion === marketingConsentVersion);
  return <main lang={uiLocale === "hi" ? "hi" : uiLocale === "hinglish" ? "hi-Latn" : "en"} className="mx-auto max-w-xl px-4 py-10 sm:py-16">
    <h1 className="font-cinzel text-3xl font-bold text-[#725022]">{copy.title}</h1>
    <p className="mt-4 leading-7">{copy.intro}</p>
    {!user ? <div className="mt-6 rounded-xl border p-5 space-y-3"><p>{copy.verify}</p><Link className="block font-semibold underline" href="/login?redirectTo=%2Femail-updates">{copy.signIn}</Link><Link className="block underline" href="/signup?redirectTo=%2Femail-updates">{copy.signUp}</Link></div> :
    eligible || existing ? <EmailUpdatesForm eligible={eligible} initialSubscribed={active} initialInterest={existing?.interest ?? ""} initialCountry={existing?.country ?? ""} initialLocale={existing?.locale ?? uiLocale} /> : <p className="mt-6">{copy.ineligible}</p>}
    <p className="mt-6 text-sm">{copy.privacyBefore}<Link href="/privacy-policy" className="underline">{copy.privacyLink}</Link>{copy.privacyAfter}</p>
  </main>;
}

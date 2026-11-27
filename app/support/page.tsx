import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/jwt";
import { SupportTicketsContent } from "@/components/support-tickets-content";
import { seo } from "@/lib/seo";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";
import { supportCopy } from "@/lib/support/ui-copy";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const copy = supportCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));
  return {
  ...seo({
    title: copy.customerTitle + " - Naksharix",
    description: copy.customerMetadata,
    path: "/support"
  }),
  robots: { index: false, follow: false }
  };
}

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const params = await searchParams;
  const partnership = params.topic === "partnership";
  const user = await getCurrentUser();
  if (!user) {
    if (partnership) redirect("/login?redirectTo=" + encodeURIComponent("/support?topic=partnership"));
    redirect("/auth/login?next=%2Fsupport");
  }
  const copy = supportCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));
  return <SupportTicketsContent initialSubject={partnership ? copy.partnership : ""} />;
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/jwt";
import { SupportTicketsContent } from "@/components/support-tickets-content";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  ...seo({
    title: "Support Centre - Naksharix",
    description: "View and manage private customer support requests.",
    path: "/support"
  }),
  robots: { index: false, follow: false }
};

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const params = await searchParams;
  const partnership = params.topic === "partnership";
  const user = await getCurrentUser();
  if (!user) {
    if (partnership) redirect("/login?redirectTo=" + encodeURIComponent("/support?topic=partnership"));
    redirect("/auth/login?next=%2Fsupport");
  }
  return <SupportTicketsContent initialSubject={partnership ? "Partnership enquiry" : ""} />;
}

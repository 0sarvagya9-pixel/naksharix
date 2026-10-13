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

export default async function SupportPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=%2Fsupport");
  return <SupportTicketsContent />;
}

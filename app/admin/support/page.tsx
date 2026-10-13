import type { Metadata } from "next";
import { requireAdminRole } from "@/lib/auth/roles";
import { AdminSupportContent } from "@/components/admin-support-content";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  ...seo({
    title: "Support Desk - Naksharix Admin",
    description: "Authorized admin support ticket management.",
    path: "/admin/support"
  }),
  robots: { index: false, follow: false }
};

export default async function AdminSupportPage() {
  await requireAdminRole();
  return <AdminSupportContent />;
}

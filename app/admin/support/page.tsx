import type { Metadata } from "next";
import { requireAdminRole } from "@/lib/auth/roles";
import { AdminSupportContent } from "@/components/admin-support-content";
import { seo } from "@/lib/seo";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";
import { supportCopy } from "@/lib/support/ui-copy";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const copy = supportCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));
  return {
  ...seo({
    title: copy.adminTitle + " - Naksharix Admin",
    description: copy.adminMetadata,
    path: "/admin/support"
  }),
  robots: { index: false, follow: false }
  };
}

export default async function AdminSupportPage() {
  await requireAdminRole();
  return <AdminSupportContent />;
}

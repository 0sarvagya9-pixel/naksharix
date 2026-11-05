import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/jwt";
import { AdminPortalSidebar } from "@/components/admin-portal-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    if (user.role === "ASTROLOGER" || user.role === "CONSULTANT") redirect("/astrologer/dashboard");
    redirect("/dashboard");
  }
  return <div className="nx-admin-workspace">
    <AdminPortalSidebar />
    <div className="nx-admin-content">{children}</div>
  </div>;
}

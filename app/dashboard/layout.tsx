import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role === "ASTROLOGER" || user.role === "CONSULTANT") redirect("/astrologer/dashboard");
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "MODERATOR") redirect("/admin");
  return children;
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.effectiveRole === "ASTROLOGER" || user.effectiveRole === "CONSULTANT") redirect("/astrologer/dashboard");
  return children;
}



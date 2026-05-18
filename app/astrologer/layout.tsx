import { redirect } from "next/navigation";
import { AstrologerNavbar } from "@/components/astrologer-navbar";
import { getCurrentUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export default async function AstrologerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (!["ASTROLOGER", "CONSULTANT", "ADMIN", "SUPER_ADMIN"].includes(user.role)) redirect("/dashboard");
  return (
    <div className="astrologer-portal min-h-screen">
      <AstrologerNavbar />
      {children}
    </div>
  );
}
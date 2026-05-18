import { redirect } from "next/navigation";
import { AstrologerNavbar } from "@/components/astrologer-navbar";
import { getCurrentUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export default async function AstrologerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const effectiveRole = user.effectiveRole ?? "USER";
  if (!["ASTROLOGER", "CONSULTANT"].includes(effectiveRole)) redirect("/dashboard");
  return (
    <div className="astrologer-portal min-h-screen">
      <AstrologerNavbar />
      {children}
    </div>
  );
}
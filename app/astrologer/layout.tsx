import { redirect } from "next/navigation";
import "./portal.css";
import { AstrologerNavbar } from "@/components/astrologer-navbar";
import { getCurrentUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export default async function AstrologerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const effectiveRole = user.effectiveRole ?? "USER";
  if (!["ASTROLOGER", "CONSULTANT"].includes(effectiveRole)) redirect("/dashboard");
  return (
    <div className="astrologer-portal mx-auto flex min-h-screen w-full max-w-[1680px] flex-col lg:flex-row lg:items-start">
      <AstrologerNavbar />
      <div className="min-w-0 w-full flex-1">{children}</div>
    </div>
  );
}
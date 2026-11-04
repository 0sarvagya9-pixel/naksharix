import type { Metadata } from "next";
import { redirect } from "next/navigation";
import "./portal.css";
import { AstrologerNavbar } from "@/components/astrologer-navbar";
import { getCurrentUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

// Client workspace must never appear in public search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AstrologerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const effectiveRole = user.effectiveRole ?? "USER";
  if (!["ASTROLOGER", "CONSULTANT"].includes(effectiveRole)) redirect("/dashboard");
  return (
    <div className="astrologer-portal flex min-h-screen w-full flex-col lg:flex-row lg:items-start">
      <AstrologerNavbar />
      <div className="min-w-0 w-full flex-1">{children}</div>
    </div>
  );
}
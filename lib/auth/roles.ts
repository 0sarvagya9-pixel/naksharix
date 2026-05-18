import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/jwt";

export type AppRole = "USER" | "ASTROLOGER" | "CONSULTANT" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";

export async function requireRole(allowed: AppRole[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (!allowed.includes(user.role as AppRole)) redirect("/dashboard");
  return user;
}

export async function requireAstroRole() {
  return requireRole(["ASTROLOGER", "CONSULTANT"]);
}

export async function requireAdminRole() {
  return requireRole(["ADMIN", "SUPER_ADMIN"]);
}

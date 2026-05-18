import type { DefaultSession } from "next-auth";

export type NaksharixRole = "USER" | "ASTROLOGER" | "CONSULTANT" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
export type NaksharixEffectiveRole = "USER" | "ASTROLOGER" | "CONSULTANT" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: NaksharixRole;
      effectiveRole: NaksharixEffectiveRole;
      isAdminLogin: boolean;
      canBypassPayment: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: NaksharixRole;
    effectiveRole?: NaksharixEffectiveRole;
    isAdminLogin?: boolean;
    canBypassPayment?: boolean;
    avatarUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: NaksharixRole;
    effectiveRole?: NaksharixEffectiveRole;
    isAdminLogin?: boolean;
    canBypassPayment?: boolean;
  }
}
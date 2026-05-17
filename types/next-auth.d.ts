import type { DefaultSession } from "next-auth";

type NaksharixRole = "USER" | "ASTROLOGER" | "CONSULTANT" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: NaksharixRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: NaksharixRole;
    avatarUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: NaksharixRole;
  }
}

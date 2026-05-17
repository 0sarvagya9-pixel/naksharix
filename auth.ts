import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  pages: {
    signIn: "/login"
  },
  providers: googleEnabled
    ? [
        Google({
          clientId: env.GOOGLE_CLIENT_ID!,
          clientSecret: env.GOOGLE_CLIENT_SECRET!,
          profile(profile) {
            const email = profile.email as string | undefined;
            const name = (profile.name as string | undefined) ?? email?.split("@")[0] ?? "Naksharix User";
            return {
              id: profile.sub as string,
              name,
              email,
              image: profile.picture as string | undefined,
              emailVerified: profile.email_verified ? new Date() : null,
              role: "USER" as const
            };
          }
        })
      ]
    : [],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.name = user.name ?? session.user.name ?? "Naksharix User";
        session.user.image = user.image ?? user.avatarUrl ?? session.user.image ?? null;
      }
      return session;
    }
  }
});


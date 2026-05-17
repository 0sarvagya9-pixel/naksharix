import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Role } from "@prisma/client";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
const adminCredentialsEnabled = Boolean(env.ADMIN_EMAIL && env.ADMIN_PASSWORD);
const providers = [];

if (googleEnabled) {
  providers.push(
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
  );
}

if (adminCredentialsEnabled) {
  providers.push(
    Credentials({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminPassword = env.ADMIN_PASSWORD ?? "";
        if (!adminEmail || !adminPassword || email !== adminEmail || !constantTimeEqual(password, adminPassword)) return null;

        const user = await prisma.user.upsert({
          where: { email: adminEmail },
          update: { role: Role.ADMIN, name: "Naksharix Admin", emailVerified: new Date() },
          create: { email: adminEmail, name: "Naksharix Admin", role: Role.ADMIN, emailVerified: new Date() }
        });

        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
      }
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login"
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      if (token.email && (!token.id || !token.role)) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email }, select: { id: true, role: true } });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = (token.role as typeof session.user.role | undefined) ?? "USER";
        session.user.name = session.user.name ?? "Naksharix User";
      }
      return session;
    }
  }
});

function constantTimeEqual(value: string, expected: string) {
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

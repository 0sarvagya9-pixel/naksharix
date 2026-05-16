import { jwtVerify } from "jose";
import { authCookieName } from "@/lib/auth/constants";
import type { AuthUser } from "@/lib/auth/token";

function getSecret() {
  const value = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET or NEXTAUTH_SECRET is required in production");
  }
  return new TextEncoder().encode(value ?? "replace-this-development-secret-with-32-characters");
}

const secret = getSecret();

export { authCookieName };

export async function verifyEdgeAuthToken(token?: string): Promise<AuthUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as AuthUser;
  } catch {
    return null;
  }
}

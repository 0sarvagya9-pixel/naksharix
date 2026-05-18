import { SignJWT, jwtVerify } from "jose";
import { authCookieName } from "@/lib/auth/constants";

function getSecret() {
  const value = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET or NEXTAUTH_SECRET is required in production");
  }
  return new TextEncoder().encode(value ?? "replace-this-development-secret-with-32-characters");
}

const secret = getSecret();

export { authCookieName };

export type NaksharixRole = "USER" | "ASTROLOGER" | "CONSULTANT" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
export type EffectiveRole = "USER" | "ASTROLOGER" | "CONSULTANT" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: NaksharixRole;
  effectiveRole?: EffectiveRole;
  isAdminLogin?: boolean;
  canBypassPayment?: boolean;
};

export async function signAuthToken(user: AuthUser) {
  return new SignJWT({
    ...user,
    effectiveRole: user.effectiveRole ?? toEffectiveRole(user.role),
    isAdminLogin: Boolean(user.isAdminLogin),
    canBypassPayment: Boolean(user.isAdminLogin)
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAuthToken(token?: string): Promise<AuthUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as AuthUser;
  } catch {
    return null;
  }
}

export function toEffectiveRole(role: string): EffectiveRole {
  if (role === "ASTROLOGER" || role === "CONSULTANT" || role === "ADMIN") return role;
  return "USER";
}
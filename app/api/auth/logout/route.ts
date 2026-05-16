import { cookies } from "next/headers";
import { authCookieName, clearAuthCookie } from "@/lib/auth/jwt";
import { ok } from "@/lib/api";
import { revokeSession } from "@/lib/auth/session";

export async function POST() {
  const cookieStore = await cookies();
  await revokeSession(cookieStore.get(authCookieName)?.value);
  await clearAuthCookie();
  return ok({ loggedOut: true });
}

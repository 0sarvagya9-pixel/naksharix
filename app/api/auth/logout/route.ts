import { cookies } from "next/headers";
import { signOut } from "@/auth";
import { authCookieName, clearAuthCookie } from "@/lib/auth/jwt";
import { handleApiError, ok } from "@/lib/api";
import { revokeSession } from "@/lib/auth/session";

export async function POST() {
  try {
    const cookieStore = await cookies();
    await revokeSession(cookieStore.get(authCookieName)?.value);
    await clearAuthCookie();
    // A provider may have signed in through Google/Auth.js. Its secure/chunked
    // cookies must also be cleared before any caller receives a logout receipt.
    await signOut({ redirect: false });
    return ok({ loggedOut: true });
  } catch (error) {
    return handleApiError(error);
  }
}

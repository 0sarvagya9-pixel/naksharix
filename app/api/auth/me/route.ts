import { getCurrentUser } from "@/lib/auth/jwt";
import { ok, fail } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("Unauthenticated", 401);
  return ok({ user });
}

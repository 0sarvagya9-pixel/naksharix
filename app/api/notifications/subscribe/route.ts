import { fail } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";

// No durable push-subscription record or notification delivery provider is
// configured in the approved product. Do not echo a submitted push endpoint
// or falsely report that a subscription was registered.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return fail("Unauthenticated", 401);
  return fail("Push notifications are not available. No subscription was saved.", 503);
}

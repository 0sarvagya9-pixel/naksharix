import "server-only";
import { prisma } from "@/lib/db";

/** A verified owner login may trigger only the existing protected, idempotent
 * encrypted backup; ordinary users, staff and extra admins cannot.
 * If exactly one ADMIN exists (the initial owner), allow that account even
 * when the separate notification mailbox differs from the login email.
 */
export async function isOwnerRecoveryOperator(
  user: {role: string; email: string | null} | null | undefined
):Promise<boolean> {
  if (!user || !["ADMIN","SUPER_ADMIN"].includes(user.role)) return false;
  if (user.role === "SUPER_ADMIN") return true;
  const owner = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if(owner && user.email?.trim().toLowerCase() === owner) return true;
  const admins=await prisma.user.count({where:{role:{in:["ADMIN","SUPER_ADMIN"]}}});
  return admins===1;
}

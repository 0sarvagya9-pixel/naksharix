import "server-only";

/** Only the SUPER_ADMIN or the configured owner mailbox's admin may manually
 * run a resource-intensive production encrypted recovery.
 */
export function isOwnerRecoveryOperator(
  user: {role: string; email: string | null} | null | undefined
): boolean {
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) return false;
  if (user.role === "SUPER_ADMIN") return true;
  const owner = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(owner && user.email?.trim().toLowerCase() === owner);
}

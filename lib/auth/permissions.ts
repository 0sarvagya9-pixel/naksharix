type RoleCarrier =
  | {
      role?: string | null;
    }
  | {
      user?: {
        role?: string | null;
      } | null;
    }
  | null
  | undefined;

export type EffectivePlan = "FREE" | "PREMIUM" | "VIP";

function readRole(userOrSession: RoleCarrier) {
  if (!userOrSession) return null;
  if ("role" in userOrSession) return userOrSession.role ?? null;
  if ("user" in userOrSession) return userOrSession.user?.role ?? null;
  return null;
}

export function isAdmin(userOrSession: RoleCarrier) {
  const role = readRole(userOrSession);
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function canBypassPayment(userOrSession: RoleCarrier) {
  return isAdmin(userOrSession);
}

export function canAccessPremium(userOrSession: RoleCarrier) {
  return isAdmin(userOrSession);
}

export function canAccessVip(userOrSession: RoleCarrier) {
  return isAdmin(userOrSession);
}

export function getEffectivePlan(userOrSession: RoleCarrier): EffectivePlan {
  return isAdmin(userOrSession) ? "VIP" : "FREE";
}



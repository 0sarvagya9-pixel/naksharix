type UserShape = {
  role?: string | null;
  effectiveRole?: string | null;
  isAdminLogin?: boolean | null;
  canBypassPayment?: boolean | null;
};

type RoleCarrier = UserShape | { user?: UserShape | null } | null | undefined;

export type EffectivePlan = "FREE" | "PREMIUM" | "VIP";

function readUser(userOrSession: RoleCarrier): UserShape | null {
  if (!userOrSession) return null;
  if ("user" in userOrSession) return userOrSession.user ?? null;
  return userOrSession as UserShape;
}

function readRole(userOrSession: RoleCarrier) {
  return readUser(userOrSession)?.role ?? null;
}

export function isAdmin(userOrSession: RoleCarrier) {
  const role = readRole(userOrSession);
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isAdminLogin(userOrSession: RoleCarrier) {
  return Boolean(readUser(userOrSession)?.isAdminLogin);
}

export function canBypassPayment(userOrSession: RoleCarrier) {
  return isAdminLogin(userOrSession);
}

export function canAccessPremium(userOrSession: RoleCarrier) {
  return isAdminLogin(userOrSession);
}

export function canAccessVip(userOrSession: RoleCarrier) {
  return isAdminLogin(userOrSession);
}

export function getEffectivePlan(userOrSession: RoleCarrier): EffectivePlan {
  return isAdminLogin(userOrSession) ? "VIP" : "FREE";
}
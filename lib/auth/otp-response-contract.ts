/** Non-enumerating OTP request acknowledgement and explicit verification evidence. */
export function otpRequestAccepted(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  return (value as {data?: {accepted?: unknown}}).data?.accepted === true;
}

export function otpVerificationConfirmed(value: unknown, expectedEmail: string): boolean {
  if (!value || typeof value !== "object") return false;
  const {data} = value as {data?: {verified?: unknown; user?: {id?: unknown; email?: unknown; effectiveRole?: unknown}}};
  const user = data?.user;
  return data?.verified === true && !!user &&
    typeof user.id === "string" && user.id.trim().length > 0 &&
    typeof user.email === "string" && user.email.trim().toLowerCase() === expectedEmail.trim().toLowerCase() &&
    expectedEmail.trim().length > 0 &&
    typeof user.effectiveRole === "string" && ["USER","ASTROLOGER","CONSULTANT","ADMIN"].includes(user.effectiveRole);
}

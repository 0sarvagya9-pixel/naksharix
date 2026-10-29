/** Currency safe 30-minute consultation quote. Never guess a session total. */
export const CONSULTATION_SESSION_MINUTES = 30;
export function getConsultationSessionPrice(perMinute: number, perSession?: number | null) {
  const amount = perSession !== undefined && perSession !== null ? perSession : perMinute * CONSULTATION_SESSION_MINUTES;
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) return null;
  const paise = Math.round(amount * 100);
  if (!Number.isSafeInteger(paise) || Math.abs(amount * 100 - paise) > 0.000001) return null;
  return paise / 100;
}

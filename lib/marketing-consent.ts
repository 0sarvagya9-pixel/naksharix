export const marketingInterests = [
  ["kundli", "Kundli reports"], ["matching", "Couple Kundli and matching"],
  ["numerology", "Numerology reports"], ["career", "Career reports"],
  ["yearly", "Yearly horoscope reports"], ["puja", "Puja service information"],
  ["reports", "Other digital reports"]
] as const;
export const marketingConsentVersion = "email-updates-v1-20261124";
export const marketingConsentText = "I am 18 or older and agree to receive optional Naksharix email updates and offers about my selected interest. My subscription is voluntary, and I can unsubscribe at any time.";
export function marketingInterestLabel(id: string) {
  return marketingInterests.find(([value]) => value === id)?.[1] ?? "Unknown";
}
